import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BOLNA_API_KEY = Deno.env.get('BOLNA_API_KEY') ?? '';
const BOLNA_API_URL = Deno.env.get('BOLNA_API_URL') ?? 'https://api.bolna.ai';

type CallPayload = {
  name: string;
  phone_number: string;
  destination_slug?: string;
  consent: boolean;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // --- If Bolna is not configured, tell the frontend clearly ---
  if (!BOLNA_API_KEY) {
    return json(
      {
        error: 'not_configured',
        message:
          'The AI calling service is not yet available. Please check back soon.',
      },
      503,
    );
  }

  let body: CallPayload;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  // --- Server-side validation ---
  const name = (body.name ?? '').trim();
  const phone = (body.phone_number ?? '').trim();
  const consent = body.consent === true;

  if (!name || !phone || !consent) {
    return json(
      { error: 'validation', message: 'Name, phone number, and consent are required.' },
      400,
    );
  }

  // --- Persist the request regardless of call outcome ---
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: inserted, error: insertError } = await supabase
    .from('call_requests')
    .insert({
      name,
      phone_number: phone,
      destination_slug: body.destination_slug ?? null,
      consent,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    return json({ error: 'database', message: 'Could not save your request.' }, 500);
  }

  const callRequestId = inserted.id;

  // --- Attempt the Bolna outbound call ---
  try {
    const destinationContext = body.destination_slug
      ? `interested in ${body.destination_slug}`
      : 'interested in travel planning';

    const bolnaRes = await fetch(`${BOLNA_API_URL}/v1/calls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BOLNA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Bolna expects a phone number in E.164-ish format.
        // The caller's number is passed through; ensure it starts with "+".
        to_number: phone.startsWith('+') ? phone : `+${phone}`,
        // Context the AI agent uses to personalise the conversation.
        agent_context: `You are a travel assistant for Wanderlust Travel. The customer's name is ${name}. They are ${destinationContext}. Help them plan their trip and offer to connect them with a human agent if needed.`,
      }),
    });

    if (!bolnaRes.ok) {
      const bolnaErr = await bolnaRes.text().catch(() => 'Unknown error');
      // Update the row so we have an audit trail, then return a failure
      // so the frontend shows the error (not a fake success).
      await supabase
        .from('call_requests')
        .update({ status: 'failed', error_message: bolnaErr.slice(0, 500) })
        .eq('id', callRequestId);

      return json(
        {
          error: 'bolna_error',
          message: 'We could not place the call right now. Please try again later.',
        },
        502,
      );
    }

    const bolnaData = await bolnaRes.json().catch(() => ({}));

    // Mark as initiated and store Bolna's call id for traceability.
    await supabase
      .from('call_requests')
      .update({
        status: 'initiated',
        bolna_call_id: bolnaData.call_id ?? bolnaData.id ?? null,
      })
      .eq('id', callRequestId);

    // --- Only now do we return success to the frontend ---
    return json({ call_request_id: callRequestId }, 200);
  } catch (err) {
    await supabase
      .from('call_requests')
      .update({ status: 'failed', error_message: String(err).slice(0, 500) })
      .eq('id', callRequestId);

    return json(
      { error: 'bolna_unreachable', message: 'The calling service is temporarily unavailable.' },
      502,
    );
  }
});

function json(data: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
