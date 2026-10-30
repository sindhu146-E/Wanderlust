-- Destinations catalog
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  country text NOT NULL,
  region text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price_from numeric NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 7,
  rating numeric NOT NULL DEFAULT 4.5,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tours / packages
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  destination_slug text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  duration_days int NOT NULL DEFAULT 7,
  group_size int NOT NULL DEFAULT 12,
  difficulty text NOT NULL DEFAULT 'moderate',
  includes jsonb NOT NULL DEFAULT '[]'::jsonb,
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  rating numeric NOT NULL DEFAULT 4.5,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Voice assistant conversations
CREATE TABLE IF NOT EXISTS voice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  user_input text,
  assistant_response text,
  intent text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Booking inquiries from the site
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  destination_slug text,
  travel_date date,
  travelers int,
  budget text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- Destinations & tours: public read
CREATE POLICY "read_destinations" ON destinations FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "read_tours" ON tours FOR SELECT
  TO anon, authenticated USING (true);

-- Voice conversations: anyone can insert, no public read
CREATE POLICY "insert_voice_conversations" ON voice_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Booking inquiries: anyone can submit, no public read
CREATE POLICY "insert_booking_inquiries" ON booking_inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_slug);
CREATE INDEX IF NOT EXISTS idx_voice_conversations_created ON voice_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_created ON booking_inquiries(created_at DESC);

-- Seed destinations
INSERT INTO destinations (slug, name, country, region, tagline, description, image_url, price_from, duration_days, rating, tags, highlights, sort_order) VALUES
(
  'bali',
  'Bali',
  'Indonesia',
  'Southeast Asia',
  'Island of the Gods — temples, rice terraces, and surf',
  'From the artistic heart of Ubud to the beach clubs of Seminyak, Bali blends spiritual heritage with tropical indulgence. Visit ancient water temples, hike Mount Batur at dawn, and unwind on hidden beaches.',
  'https://images.pexels.com/photos/1802255/pexels-photo-1802255.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1290, 8, 4.8,
  '["Beach","Culture","Adventure","Wellness"]',
  '["Sunrise hike up Mount Batur","Tegallalang Rice Terraces","Uluwatu Temple at sunset","Ubud monkey forest"]',
  1
),
(
  'santorini',
  'Santorini',
  'Greece',
  'Mediterranean',
  'Whitewashed cliffs above the Aegean Sea',
  'The crescent-shaped island born from a volcanic caldera. Watch legendary sunsets from Oia, sail to hot springs, and taste Assyrtiko wine grown in volcanic soil. Every corner is a postcard.',
  'https://images.pexels.com/photos/161901/santorini-thira-greece-161901.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1690, 6, 4.9,
  '["Beach","Culture","Romance","Food"]',
  '["Oia sunset cruise","Caldera hot springs","Akrotiri archaeological site","Assyrtiko wine tasting"]',
  2
),
(
  'kyoto',
  'Kyoto',
  'Japan',
  'East Asia',
  'Ancient capital of temples, tea, and tradition',
  'Walk through 1,000 torii gates at Fushimi Inari, meditate in Zen rock gardens, and witness geisha in Gion. Kyoto is where Japan''s soul lives — quiet, deliberate, and breathtaking in every season.',
  'https://images.pexels.com/photos/161251/kyoto-temple-japan-161251.jpeg?auto=compress&cs=tinysrgb&w=1200',
  2100, 7, 4.9,
  '["Culture","Food","Wellness","City"]',
  '["Fushimi Inari shrine at dawn","Arashiyama bamboo grove","Tea ceremony in Gion","Kinkaku-ji golden pavilion"]',
  3
),
(
  'patagonia',
  'Patagonia',
  'Chile & Argentina',
  'South America',
  'Wild wilderness at the end of the world',
  'Trek past towering granite spires, brilliant blue glaciers, and windswept steppe. Torres del Paine and El Chalten offer the most dramatic hiking on the planet, with condors circling overhead.',
  'https://images.pexels.com/photos/191795/pexels-photo-191795.jpeg?auto=compress&cs=tinysrgb&w=1200',
  2890, 10, 4.8,
  '["Adventure","Nature","Hiking","Wildlife"]',
  '["Torres del Paine W trek","Perito Moreno glacier walk","Pehoe Lake sunrise","Estancia gaucho experience"]',
  4
),
(
  'marrakech',
  'Marrakech',
  'Morocco',
  'North Africa',
  'Spice-scented souks and desert nights',
  'Lose yourself in the labyrinth of the medina, bargain in the souks, and ride camels into the Sahara at sunset. Stay in a traditional riad and feast on tagine under the stars.',
  'https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1190, 7, 4.7,
  '["Culture","Adventure","Food","Desert"]',
  '["Jemaa el-Fnaa square at night","Sahara camel trek and camp","Majorelle Garden","Atlas Mountains day trip"]',
  5
),
(
  'iceland',
  'Iceland',
  'Iceland',
  'Nordic',
  'Fire, ice, and the Northern Lights',
  'Chase the aurora across black-sand deserts, soak in geothermal lagoons, and walk behind waterfalls. The Ring Road packs waterfalls, glaciers, geysers, and volcanic beaches into one unforgettable loop.',
  'https://images.pexels.com/photos/2086361/pexels-photo-2086361.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1990, 8, 4.8,
  '["Adventure","Nature","Wellness","Road Trip"]',
  '["Northern Lights hunt","Blue Lagoon geothermal spa","Golden Circle day tour","Glacier hike on Solheimajokull"]',
  6
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  region = EXCLUDED.region,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price_from = EXCLUDED.price_from,
  duration_days = EXCLUDED.duration_days,
  rating = EXCLUDED.rating,
  tags = EXCLUDED.tags,
  highlights = EXCLUDED.highlights,
  sort_order = EXCLUDED.sort_order;

-- Seed tours
INSERT INTO tours (slug, title, destination_slug, description, image_url, price, duration_days, group_size, difficulty, includes, itinerary, rating, sort_order) VALUES
(
  'bali-cultural-immersion',
  'Bali Cultural Immersion',
  'bali',
  'Eight days through Bali''s spiritual heart — temples, rice terraces, traditional cooking, and a sunrise volcano hike.',
  'https://images.pexels.com/photos/1802255/pexels-photo-1802255.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1290, 8, 10, 'moderate',
  '["Boutique hotels","Daily breakfast","Local guides","All temple entrance fees","Cooking class","Mount Batur sunrise hike"]',
  '[{"day":1,"title":"Arrival in Denpasar","detail":"Airport pickup and transfer to Ubud. Welcome dinner."},{"day":2,"title":"Ubud temples & rice terraces","detail":"Tirta Empul water temple, Tegallalang terraces, monkey forest."},{"day":3,"title":"Balinese cooking class","detail":"Market visit and hands-on cooking with a local family."},{"day":4,"title":"Mount Batur sunrise","detail":"2 AM departure for the volcanic summit hike. Afternoon hot springs."},{"day":5,"title":"Transfer to Seminyak","detail":"Move to the coast. Free afternoon at the beach."},{"day":6,"title":"Uluwatu & Kecak dance","detail":"Cliffside temple visit and traditional fire dance at sunset."},{"day":7,"title":"Free day","detail":"Optional surf lesson, spa, or beach club day."},{"day":8,"title":"Departure","detail":"Transfer to airport."}]',
  4.8, 1
),
(
  'santorini-island-hopping',
  'Santorini & Aegean Islands',
  'santorini',
  'Six days of caldera views, volcanic hot springs, wine country, and the famous Oia sunset cruise.',
  'https://images.pexels.com/photos/161901/santorini-thira-greece-161901.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1690, 6, 12, 'easy',
  '["Cliffside hotels","Daily breakfast","Sunset cruise","Wine tasting","Caldera hot springs swim","Akrotiri archaeological site"]',
  '[{"day":1,"title":"Arrival in Santorini","detail":"Transfer to cliffside hotel in Imerovigli. Welcome dinner."},{"day":2,"title":"Caldera cruise","detail":"Sail to the volcano, swim in hot springs, sunset on board."},{"day":3,"title":"Akrotiri & wine","detail":"Minoan ruins visit, then Assyrtiko tasting at a volcanic vineyard."},{"day":4,"title":"Oia exploration","detail":"Walk the caldera path to Oia. Free afternoon for shopping and cafes."},{"day":5,"title":"Beach day","detail":"Red Beach and Perissa Black Beach. Optional snorkeling."},{"day":6,"title":"Departure","detail":"Transfer to airport."}]',
  4.9, 2
),
(
  'kyoto-zen-journey',
  'Kyoto Zen Journey',
  'kyoto',
  'Seven days through Japan''s ancient capital — shrines, tea ceremonies, bamboo groves, and a day trip to Nara.',
  'https://images.pexels.com/photos/161251/kyoto-temple-japan-161251.jpeg?auto=compress&cs=tinysrgb&w=1200',
  2100, 7, 8, 'easy',
  '["Ryokan & hotels","Some meals","JR pass","Tea ceremony","All temple entrance fees","Nara day trip"]',
  '[{"day":1,"title":"Arrival in Kyoto","detail":"Check in to your ryokan. Evening stroll in Gion."},{"day":2,"title":"Eastern temples","detail":"Kiyomizu-dera, Yasaka shrine, and the Higashiyama district."},{"day":3,"title":"Fushimi Inari & tea","detail":"Dawn visit to the thousand torii gates. Afternoon tea ceremony."},{"day":4,"title":"Arashiyama","detail":"Bamboo grove, Tenryu-ji, and the monkey park."},{"day":5,"title":"Nara day trip","detail":"Todai-ji''s Great Buddha and the deer park."},{"day":6,"title":"Golden Pavilion & Zen","detail":"Kinkaku-ji and Ryoan-ji rock garden. Free evening."},{"day":7,"title":"Departure","detail":"Transfer to Kansai airport."}]',
  4.9, 3
),
(
  'patagonia-w-trek',
  'Patagonia W Trek',
  'patagonia',
  'Ten days of the iconic W trek through Torres del Paine, plus a glacier walk on Perito Moreno.',
  'https://images.pexels.com/photos/191795/pexels-photo-191795.jpeg?auto=compress&cs=tinysrgb&w=1200',
  2890, 10, 8, 'challenging',
  '["Refugios & hotels","All meals on trek","Expert trekking guide","Park entrance fees","Glacier walk","Transfers"]',
  '[{"day":1,"title":"Arrival in Punta Arenas","detail":"Transfer to Puerto Natales. Trek briefing and gear check."},{"day":2,"title":"To Torres base","detail":"Hike to the base of the granite towers. 8 hours."},{"day":3,"title":"To Refugio Cuernos","detail":"Coastal trail along Lake Nordenskjold. 5 hours."},{"day":4,"title":"French Valley","detail":"Hike into the hanging valley of the French River. 8 hours."},{"day":5,"title":"Grey Glacier","detail":"Trek to Refugio Grey and lake-side views of the glacier."},{"day":6,"title":"Boat & transfer","detail":"Boat across Lago Grey, transfer to El Calafate, Argentina."},{"day":7,"title":"Perito Moreno","detail":"Guided glacier walk with crampons. Evening in El Calafate."},{"day":8,"title":"El Chalten","detail":"Transfer to El Chalten. Short hike to Laguna Capri."},{"day":9,"title":"Laguna de los Tres","detail":"The classic Fitz Roy day hike. 9 hours."},{"day":10,"title":"Departure","detail":"Transfer to El Calafate airport."}]',
  4.8, 4
),
(
  'marrakech-sahara-adventure',
  'Marrakech & Sahara Adventure',
  'marrakech',
  'Seven days from the souks of Marrakech to a camel trek and overnight camp in the Sahara dunes.',
  'https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1190, 7, 12, 'moderate',
  '["Riad & desert camp","Daily breakfast","Camel trek","Desert camp dinner","Local guides","Atlas Mountains day trip"]',
  '[{"day":1,"title":"Arrival in Marrakech","detail":"Check in to your riad in the medina. Welcome tea."},{"day":2,"title":"Medina & souks","detail":"Guided walk through the souks, Bahia Palace, and Jemaa el-Fnaa."},{"day":3,"title":"Atlas Mountains","detail":"Day trip to the Ourika Valley and Berber villages."},{"day":4,"title":"Drive to the Sahara","detail":"Over the High Atlas to Dades Gorge and Todra."},{"day":5,"title":"Camel trek & camp","detail":"Camel ride into the Erg Chebbi dunes. Berber dinner and music at camp."},{"day":6,"title":"Return to Marrakech","detail":"Sunrise in the dunes, then the long drive back."},{"day":7,"title":"Departure","detail":"Free morning, transfer to airport."}]',
  4.7, 5
),
(
  'iceland-ring-road',
  'Iceland Ring Road Explorer',
  'iceland',
  'Eight days circling the island — waterfalls, glaciers, black beaches, geysers, and a Northern Lights hunt.',
  'https://images.pexels.com/photos/2086361/pexels-photo-2086361.jpeg?auto=compress&cs=tinysrgb&w=1200',
  1990, 8, 10, 'moderate',
  '["Comfort hotels","Daily breakfast","4x4 rental","Blue Lagoon entry","Glacier hike","Northern Lights tour"]',
  '[{"day":1,"title":"Arrival & Blue Lagoon","detail":"Pick up your 4x4, soak in the Blue Lagoon, overnight in Reykjavik."},{"day":2,"title":"Golden Circle","detail":"Thingvellir, Geysir, and Gullfoss waterfall. South coast overnight."},{"day":3,"title":"South coast","detail":"Seljalandsfoss, Skogafoss, and Reynisfjara black beach."},{"day":4,"title":"Glacier lagoon","detail":"Jokulsarlon iceberg lagoon and Diamond Beach."},{"day":5,"title":"East fjords","detail":"Scenic drive through the fjords to Egilsstadir."},{"day":6,"title":"North Iceland","detail":"Dettifoss waterfall and Lake Myvatn geothermal area."},{"day":7,"title":"West fjords & return","detail":"Drive through the west, optional glacier hike on the way."},{"day":8,"title":"Departure","detail":"Return to Keflavik airport."}]',
  4.8, 6
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  destination_slug = EXCLUDED.destination_slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  group_size = EXCLUDED.group_size,
  difficulty = EXCLUDED.difficulty,
  includes = EXCLUDED.includes,
  itinerary = EXCLUDED.itinerary,
  rating = EXCLUDED.rating,
  sort_order = EXCLUDED.sort_order;
