-- Sectors catalog (reference data, readable by all)
CREATE TABLE IF NOT EXISTS sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  accent_color text NOT NULL,
  use_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_queries jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Demo conversations captured from the voice assistant widget
CREATE TABLE IF NOT EXISTS demo_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_slug text NOT NULL,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_input text,
  assistant_response text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Contact / lead submissions from the site
CREATE TABLE IF NOT EXISTS contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  sector_slug text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed sector reference data
INSERT INTO sectors (slug, name, tagline, description, icon_name, accent_color, sort_order, use_cases, sample_queries, sample_responses) VALUES
(
  'healthcare',
  'Healthcare',
  'Triage, scheduling, and patient support — 24/7',
  'A HIPAA-aware voice assistant that handles appointment booking, symptom triage, prescription reminders, and FAQ for clinics and hospitals. Reduces front-desk load while keeping a human in the loop for anything urgent.',
  'Stethoscope',
  '#0ea5a4',
  1,
  '["Appointment scheduling & rescheduling","Symptom triage & routing","Prescription refill reminders","Insurance & billing FAQs","Post-visit follow-up"]',
  '["I need to book an appointment with Dr. Patel","What are your urgent care hours?","Can I get a refill on my prescription?","Do you accept Aetna insurance?"]',
  '["I can help you book with Dr. Patel. Are you an existing patient, and do you have a preferred day this week?","Our urgent care is open Monday through Friday, 8 AM to 8 PM, and weekends 9 to 5. Would you like me to hold a spot?","I can send a refill request to your pharmacy on file. Which medication was it, and which pharmacy?","Yes, we accept Aetna PPO and POS plans. Would you like me to verify coverage for a specific visit type?"]'
),
(
  'retail',
  'Retail & E-commerce',
  'Order tracking, product Q&A, and returns — hands-free',
  'A voice assistant for online and in-store retail that answers product questions, tracks orders, processes returns, and surfaces personalized recommendations without making the customer tap through menus.',
  'ShoppingBag',
  '#f59e0b',
  2,
  '["Order status & tracking","Product availability & specs","Returns & exchanges","Loyalty program balance","Store locator & hours"]',
  '["Where is my order?","Do you have the blue running shoes in size 9?","I want to return a jacket","How many points do I have on my rewards?"]',
  '["Happy to help. Can you share your order number, or the email you used at checkout?","The Trail Runner in blue is in stock in size 9. Would you like me to add it to your cart or hold it at your nearest store?","I can start a return for the jacket. What is the reason, and would you prefer a refund to your original payment method or store credit?","You have 1,240 rewards points — that is $12.40 toward your next purchase. Want me to apply them at checkout?"]'
),
(
  'finance',
  'Banking & Finance',
  'Account balance, transfers, and fraud alerts by voice',
  'A secure voice assistant for banks and fintechs that handles balance inquiries, transfers, card management, and fraud alerts with strong authentication and a clear escalation path to a human agent.',
  'Landmark',
  '#3b82f6',
  3,
  '["Balance & recent transactions","Fund transfers & bill pay","Card lock & replacement","Fraud alert confirmation","Branch & ATM locator"]',
  '["What is my checking balance?","Transfer $200 to savings","I lost my debit card","Did I make a charge at Acme Corp?"]',
  '["Your checking balance is $4,318.22. Would you like to hear your last five transactions?","I can move $200 from checking to savings. Please confirm: from checking ending 4471 to savings ending 8890. Say yes to confirm.","I am sorry to hear that. I can lock your debit card immediately. Would you also like me to order a replacement?","There is a pending charge of $89.99 at Acme Corp from today. Do you recognize this transaction?"]'
),
(
  'hospitality',
  'Hospitality & Travel',
  'Reservations, concierge, and guest requests — anytime',
  'A voice concierge for hotels, airlines, and travel platforms that handles bookings, room upgrades, local recommendations, and guest requests, freeing staff to focus on in-person hospitality.',
  'Plane',
  '#ec4899',
  4,
  '["Reservations & modifications","Room upgrades & late checkout","Concierge & local recommendations","Loyalty status & benefits","Flight status & gate info"]',
  '["I want to book a room for next weekend","Can I get a late checkout?","Recommend a good Italian restaurant nearby","What are my platinum benefits?"]',
  '["I would love to help. For next weekend, how many nights, and do you prefer a king or two queens?","I can request a 2 PM late checkout for you. Would you also like housekeeping to skip your room that morning?","There is a lovely Italian spot two blocks away called Bella Tavola — reservations recommended. Shall I book a table for you?","As a Platinum member you enjoy free breakfast, room upgrades when available, and 4 PM late checkout. Anything specific I can arrange?"]'
),
(
  'education',
  'Education',
  'Admissions, tutoring help, and campus info by voice',
  'A voice assistant for schools, universities, and EdTech platforms that answers admissions questions, helps students navigate courses and deadlines, and provides on-demand tutoring prompts.',
  'GraduationCap',
  '#8b5cf6',
  5,
  '["Admissions & enrollment FAQs","Course & schedule info","Deadline & exam reminders","Campus services & hours","Tutoring & study prompts"]',
  '["When is the application deadline?","What time is my biology final?","How do I reset my student portal password?","Where is the writing center?"]',
  '["The fall application deadline is June 15. Would you like me to send you a checklist of required documents?","Your biology final is Tuesday at 10 AM in Hall C. Would you like a reminder the night before?","You can reset your portal password from the login page using your student ID, or I can connect you to IT support. Which would you prefer?","The writing center is on the second floor of the library, open Monday to Thursday 10 to 6. Want me to book a session?"]'
),
(
  'realestate',
  'Real Estate',
  'Property search, tour booking, and agent handoff',
  'A voice assistant for brokerages and property platforms that helps buyers and renters search listings, book tours, answer financing questions, and warm-transfer to the right agent.',
  'Home',
  '#10b981',
  6,
  '["Property search & filters","Tour & showing scheduling","Mortgage & affordability Q&A","Neighborhood & school info","Agent routing & follow-up"]',
  '["Show me 2-bedroom apartments under $2500","Book a tour for the Maple Street listing","How much down payment do I need?","Tell me about schools near downtown"]',
  '["I found 14 two-bedroom apartments under $2,500. Would you like to filter by neighborhood or pet policy?","I can book a tour at 123 Maple Street. Do you prefer this Saturday morning or a weekday evening?","For a conventional loan, plan on 5 to 20 percent down. Would you like me to connect you with a preferred lender?","Downtown is served by Lincoln Elementary and Roosevelt High, both rated above average. Want me to send you the full report?"]'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  accent_color = EXCLUDED.accent_color,
  use_cases = EXCLUDED.use_cases,
  sample_queries = EXCLUDED.sample_queries,
  sample_responses = EXCLUDED.sample_responses,
  sort_order = EXCLUDED.sort_order;

-- Enable RLS on all tables
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

-- Sectors: public read (reference data)
CREATE POLICY "read_sectors" ON sectors FOR SELECT
  TO anon, authenticated USING (true);

-- Demo conversations: anyone can insert (anonymous demo), no read
CREATE POLICY "insert_demo_conversations" ON demo_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Contact leads: anyone can submit, no public read
CREATE POLICY "insert_contact_leads" ON contact_leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_demo_conversations_sector ON demo_conversations(sector_slug);
CREATE INDEX IF NOT EXISTS idx_demo_conversations_created ON demo_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created ON contact_leads(created_at DESC);
