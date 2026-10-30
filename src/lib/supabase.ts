import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Destination = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  description: string;
  image_url: string;
  price_from: number;
  duration_days: number;
  rating: number;
  tags: string[];
  highlights: string[];
  sort_order: number;
};

export type TourItineraryDay = {
  day: number;
  title: string;
  detail: string;
};

export type Tour = {
  id: string;
  slug: string;
  title: string;
  destination_slug: string;
  description: string;
  image_url: string;
  price: number;
  duration_days: number;
  group_size: number;
  difficulty: string;
  includes: string[];
  itinerary: TourItineraryDay[];
  rating: number;
  sort_order: number;
};

export type ConversationTurn = {
  role: 'user' | 'assistant';
  text: string;
  ts: number;
};

export type BookingInquiry = {
  name: string;
  email: string;
  phone?: string;
  destination_slug?: string;
  travel_date?: string;
  travelers?: number;
  budget?: string;
  message: string;
};
