import { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Mic,
  Star,
  Globe2,
  ShieldCheck,
  Heart,
  MapPin,
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  Send,
  Quote,
  Plane,
  Calendar,
  Users,
} from 'lucide-react';
import type { Destination, Tour } from './lib/supabase';
import { supabase } from './lib/supabase';
import { DESTINATIONS, TOURS } from './lib/travelData';
import { TravelVoiceAssistant } from './components/TravelVoiceAssistant';
import { DestinationCard } from './components/DestinationCard';
import { TourCard } from './components/TourCard';
import { TourModal } from './components/TourModal';
import { BookingForm } from './components/BookingForm';
import { CallbackPopup } from './components/CallbackPopup';

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS);
  const [tours, setTours] = useState<Tour[]>(TOURS);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [bookingSlug, setBookingSlug] = useState<string | undefined>();
  const [mobileNav, setMobileNav] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  const bookingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: destData }, { data: tourData }] = await Promise.all([
          supabase.from('destinations').select('*').order('sort_order', { ascending: true }),
          supabase.from('tours').select('*').order('sort_order', { ascending: true }),
        ]);
        if (destData && destData.length > 0) setDestinations(destData as Destination[]);
        if (tourData && tourData.length > 0) setTours(tourData as Tour[]);
      } catch {
        // keep static fallback
      }
    })();
  }, []);

  function scrollToDemo() {
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function scrollToBooking(slug?: string) {
    if (slug) setBookingSlug(slug);
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Nav
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        onDemo={scrollToDemo}
        onBook={() => scrollToBooking()}
      />

      <Hero onDemo={scrollToDemo} onBook={() => scrollToBooking()} />

      <Stats />

      <DestinationsSection
        destinations={destinations}
        onBook={scrollToBooking}
      />

      {/* Voice AI Demo */}
      <section ref={demoRef} className="relative overflow-hidden py-24">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/8 blur-[120px]" />
        <div className="container-x relative">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="chip mb-4">
              <span className="flex h-2 w-2">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="h-2 w-2 rounded-full bg-brand-400" />
              </span>
              AI Travel Assistant
            </span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Talk to your travel agent
            </h2>
            <p className="mt-4 text-ink-400">
              Meet your AI travel companion. Tap the mic and ask about
              destinations, prices, itineraries, or the best time to visit —
              just like talking to a real travel agent. No sign-up required.
            </p>
          </div>
          <div className="mx-auto max-w-2xl">
            <TravelVoiceAssistant onDestinationMatch={() => {}} />
            <p className="mt-4 text-center text-xs text-ink-500">
              Voice input uses your browser's Web Speech API (best in Chrome
              and Edge). Try saying "I want a beach vacation" or "How much is
              Iceland?"
            </p>
          </div>
        </div>
      </section>

      <ToursSection tours={tours} onSelect={setActiveTour} />

      <WhyUs />

      <Testimonials />

      {/* Booking */}
      <section ref={bookingRef} className="py-24">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="chip mb-4">Plan your trip</span>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Start your adventure
              </h2>
              <p className="mt-4 max-w-md text-ink-400">
                Tell us where you want to go and what you are dreaming of. A
                travel specialist will craft a personalized itinerary and
                reach out within 24 hours.
              </p>
              <div className="mt-8 space-y-4">
                <ContactRow icon={Mail} label="hello@wanderlust.travel" />
                <ContactRow icon={Phone} label="+1 (415) 555-0192" />
                <ContactRow icon={MapPin} label="San Francisco · Worldwide" />
              </div>
            </div>
            <BookingForm
              destinations={destinations}
              preselectedSlug={bookingSlug}
            />
          </div>
        </div>
      </section>

      <Footer />

      <TourModal
        tour={activeTour}
        onClose={() => setActiveTour(null)}
        onBook={(slug) => scrollToBooking(slug)}
      />

      <CallbackPopup />
    </div>
  );
}

/* ---------------- Nav ---------------- */

function Nav({
  mobileNav,
  setMobileNav,
  onDemo,
  onBook,
}: {
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
  onDemo: () => void;
  onBook: () => void;
}) {
  const links = [
    { label: 'Destinations', href: '#destinations' },
    { label: 'AI Assistant', href: '#demo' },
    { label: 'Tours', href: '#tours' },
    { label: 'Why Us', href: '#why' },
    { label: 'Book', href: '#booking' },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/60 bg-ink-950/80 backdrop-blur-lg">
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-white">
            Wanderlust
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink-300 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onDemo}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-200 transition-colors hover:text-white"
          >
            <Mic className="h-4 w-4 text-brand-400" />
            Ask AI
          </button>
          <button onClick={onBook} className="btn-primary">
            Book now
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setMobileNav(!mobileNav)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-200 md:hidden"
        >
          {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileNav && (
        <div className="border-t border-ink-800 bg-ink-950 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNav(false)}
                className="text-sm font-medium text-ink-300 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileNav(false);
                onBook();
              }}
              className="btn-primary mt-2"
            >
              Book now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({
  onDemo,
  onBook,
}: {
  onDemo: () => void;
  onBook: () => void;
}) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Travel landscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      <div className="container-x relative py-28 sm:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/20 bg-ink-950/40 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <span className="flex h-2 w-2">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="h-2 w-2 rounded-full bg-brand-400" />
            </span>
            Now with AI voice assistant
          </div>

          <h1
            className="animate-fade-up font-display text-4xl font-extrabold leading-[1.1] text-white text-balance sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '0.05s' }}
          >
            Your next adventure
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-ocean-400 bg-clip-text text-transparent">
              starts with a conversation
            </span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-ink-200 text-balance"
            style={{ animationDelay: '0.1s' }}
          >
            Discover handcrafted tours to the world's most breathtaking
            destinations. Ask our AI travel assistant for recommendations,
            compare itineraries, and book your dream trip — all in one place.
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '0.15s' }}
          >
            <button onClick={onDemo} className="btn-primary">
              <Mic className="h-4 w-4" />
              Talk to the AI assistant
            </button>
            <button
              onClick={onBook}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-95"
            >
              Browse destinations
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div
            className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-300"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-400" /> Best price
              guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-400" /> 4.8 average rating
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-brand-400" /> 50+ countries
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */

function Stats() {
  const stats = [
    { value: '50+', label: 'Destinations' },
    { value: '12K+', label: 'Happy travelers' },
    { value: '4.8', label: 'Average rating' },
    { value: '24/7', label: 'AI assistant' },
  ];
  return (
    <section className="border-y border-ink-800/60 bg-ink-900/30">
      <div className="container-x grid grid-cols-2 gap-px sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-8 text-center">
            <div className="font-display text-3xl font-bold text-white sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-400">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Destinations ---------------- */

function DestinationsSection({
  destinations,
  onBook,
}: {
  destinations: Destination[];
  onBook: (slug: string) => void;
}) {
  return (
    <section id="destinations" className="py-24">
      <div className="container-x">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="chip mb-4">Featured destinations</span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Where will you go next?
          </h2>
          <p className="mt-4 text-ink-400">
            From tropical beaches to wild wilderness, each destination is
            curated by local experts and ready to book. Tap a card to learn
            more.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard
              key={d.slug}
              destination={d}
              onSelect={onBook}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Tours ---------------- */

function ToursSection({
  tours,
  onSelect,
}: {
  tours: Tour[];
  onSelect: (tour: Tour) => void;
}) {
  return (
    <section id="tours" className="border-t border-ink-800/60 bg-ink-900/20 py-24">
      <div className="container-x">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="chip mb-4">Curated tours</span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Small-group tours, big experiences
          </h2>
          <p className="mt-4 text-ink-400">
            Every tour includes expert local guides, handpicked stays, and
            the kind of moments you cannot put on a checklist. Click any tour
            for the full day-by-day itinerary.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t) => (
            <TourCard key={t.slug} tour={t} onSelect={() => onSelect(t)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why Us ---------------- */

function WhyUs() {
  const features = [
    {
      icon: Mic,
      title: 'AI travel assistant',
      body: 'Ask about destinations, prices, and itineraries by voice — get instant answers 24/7, no waiting for a callback.',
    },
    {
      icon: Compass,
      title: 'Expert-crafted itineraries',
      body: 'Every tour is designed by local specialists who know the hidden gems, the best guides, and the shortcuts that matter.',
    },
    {
      icon: Users,
      title: 'Small groups',
      body: 'No 40-person buses. Our groups cap at 8 to 12 travelers, so you get real connections and flexible days.',
    },
    {
      icon: ShieldCheck,
      title: 'Worry-free booking',
      body: 'Best price guarantee, flexible cancellation, and 24/7 support from real humans when you need them.',
    },
    {
      icon: Heart,
      title: 'Responsible travel',
      body: 'We partner with local businesses, offset carbon for every trip, and leave places better than we found them.',
    },
    {
      icon: Globe2,
      title: 'Worldwide coverage',
      body: 'From the Sahara to Patagonia, our network spans 50+ countries with on-the-ground teams in every region.',
    },
  ];
  return (
    <section id="why" className="py-24">
      <div className="container-x">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="chip mb-4">Why Wanderlust</span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Travel made effortless
          </h2>
          <p className="mt-4 text-ink-400">
            We combine AI-powered planning with human expertise, so you get
            the perfect trip without the planning stress.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ink-600"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

function Testimonials() {
  const reviews = [
    {
      name: 'Sarah & Tom',
      trip: 'Bali Cultural Immersion',
      text: 'The AI assistant recommended Bali for our honeymoon and was spot on. The sunrise hike up Mount Batur was the highlight of our lives.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Marcus L.',
      trip: 'Patagonia W Trek',
      text: 'I asked the voice assistant for an adventure trip and it nailed it. Ten days of the most dramatic hiking I have ever done. Worth every penny.',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Yuki T.',
      trip: 'Kyoto Zen Journey',
      text: 'The tea ceremony and Fushimi Inari at dawn were magical. The itinerary was perfectly paced — never rushed, never bored.',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];
  return (
    <section className="border-t border-ink-800/60 bg-ink-900/20 py-24">
      <div className="container-x">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="chip mb-4">Traveler stories</span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Loved by 12,000+ travelers
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.name} className="card p-6">
              <Quote className="h-8 w-8 text-brand-500/30" />
              <p className="mt-3 text-sm leading-relaxed text-ink-200">
                {r.text}
              </p>
              <div className="mt-5 flex items-center gap-3 border-t border-ink-800 pt-4">
                <img
                  src={r.avatar}
                  alt={r.name}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.trip}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-brand-400 text-brand-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact Row ---------------- */

function ContactRow({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink-300">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-brand-400">
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </div>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="border-t border-ink-800/60 bg-ink-950">
      <div className="container-x py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
                <Compass className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-bold text-white">
                Wanderlust
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-400">
              Handcrafted tours and AI-powered travel planning for people who
              want real adventures.
            </p>
          </div>
          <FooterCol
            title="Explore"
            links={['Destinations', 'Tours', 'AI Assistant', 'Special offers']}
          />
          <FooterCol
            title="Company"
            links={['About us', 'Our guides', 'Sustainability', 'Careers']}
          />
          <FooterCol
            title="Support"
            links={['Contact', 'FAQ', 'Booking terms', 'Travel insurance']}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-800/60 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} Wanderlust Travel. Crafted for
            travelers, powered by AI.
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <Plane className="h-4 w-4 text-brand-400" />
            <Calendar className="h-4 w-4 text-brand-400" />
            <Send className="h-4 w-4 text-brand-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-sm text-ink-400 transition-colors hover:text-white"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
