# Project memory

## Product intent & audience

- Node.js starter project using Vite + React for the frontend.
- Integrates Supabase (auth, database, edge functions) and Bolna AI for a callback/call-request feature.
- Audience: site visitors who can request a callback via a popup form; calls are placed through Bolna's telephony API.

## Brand personality & voice

- Production-grade, beautiful, non-cookie-cutter designs (per `.bolt/prompt`).

## Visual design & UX direction

- JSX + Tailwind CSS for styling; React hooks for state/logic.
- Lucide React icons used throughout (no other icon/theme packages unless explicitly requested).
- A `CallbackPopup` component exists in the frontend for call-request form submission.
- No design changes were made during edge function verification/deployment.

## Decisions, constraints & rationale

- **Edge function name:** `request-call` (Supabase edge function, Deno runtime).
- Deployed and **ACTIVE** at `/functions/v1/request-call` endpoint.
- Secrets `BOLNA_API_KEY` and `BOLNA_API_URL` are read server-side via `Deno.env.get()` — never exposed to frontend.
- `call_requests` table exists in the Supabase database for persisting callback requests.
- Function checks for `BOLNA_API_KEY` first (line 29); returns 503 if missing, preventing calls when unconfigured.
- `supabase/config.toml` has the correct entry for the function.
- **Known issue:** `BOLNA_API_KEY` is not visible in Supabase edge function secrets list — needs to be re-added (case-sensitive name) via Supabase dashboard > Edge Functions > Secrets.
- No real phone calls made during testing (function refuses to proceed without the key).

## Open questions & assumptions

- Was `BOLNA_API_KEY` saved under a different name, or did the save fail entirely? User must verify in dashboard.
- Is `BOLNA_API_URL` using the default Bolna endpoint, or does it need to be set explicitly?