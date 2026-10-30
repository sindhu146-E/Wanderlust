// Frontend service that submits the callback form to the secure
// /api/request-call endpoint (a Supabase Edge Function). The Bolna
// API key is NEVER referenced here — it lives only in the edge
// function's server-side secrets.

export type CallRequestPayload = {
  name: string;
  phone_number: string;
  destination_slug?: string;
  consent: boolean;
};

export type CallRequestResult =
  | { ok: true; callRequestId: string }
  | { ok: false; reason: 'not_configured' | 'validation' | 'server'; message: string };

function getEndpoint(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  return `${supabaseUrl}/functions/v1/request-call`;
}

export async function submitCallRequest(
  payload: CallRequestPayload,
): Promise<CallRequestResult> {
  if (!payload.consent) {
    return {
      ok: false,
      reason: 'validation',
      message: 'Please confirm you agree to receive an AI-generated phone call.',
    };
  }
  if (!payload.name.trim() || !payload.phone_number.trim()) {
    return {
      ok: false,
      reason: 'validation',
      message: 'Please provide your name and mobile number.',
    };
  }

  try {
    const res = await fetch(getEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    // 503 with code "not_configured" means Bolna is not set up yet.
    if (res.status === 503) {
      return {
        ok: false,
        reason: 'not_configured',
        message:
          data.message ??
          'The AI calling service is not yet available. Please check back soon.',
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        reason: 'server',
        message: data.message ?? 'Something went wrong. Please try again.',
      };
    }

    // Only return success when the backend explicitly confirms acceptance.
    return { ok: true, callRequestId: data.call_request_id ?? '' };
  } catch {
    return {
      ok: false,
      reason: 'server',
      message: 'Could not reach the calling service. Please try again later.',
    };
  }
}
