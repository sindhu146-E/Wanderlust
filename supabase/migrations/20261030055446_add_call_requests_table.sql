-- Call request records from the "Get a Call from AI Agent" feature
CREATE TABLE IF NOT EXISTS call_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_number text NOT NULL,
  destination_slug text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  bolna_call_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE call_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a call request; no public read
CREATE POLICY "insert_call_requests" ON call_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_call_requests_created ON call_requests(created_at DESC);
