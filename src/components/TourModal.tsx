import { useEffect } from 'react';
import {
  X,
  Check,
  Clock,
  Users,
  Mountain,
  Star,
  Calendar,
  Sparkles,
} from 'lucide-react';
import type { Tour } from '../lib/supabase';
import { getDestination } from '../lib/travelData';

export function TourModal({
  tour,
  onClose,
  onBook,
}: {
  tour: Tour | null;
  onClose: () => void;
  onBook: (slug: string) => void;
}) {
  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [tour, onClose]);

  if (!tour) return null;
  const dest = getDestination(tour.destination_slug);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-3xl animate-scale-in overflow-y-auto scrollbar-thin rounded-t-2xl border border-ink-800 bg-ink-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-56 overflow-hidden sm:h-64">
          <img
            src={tour.image_url}
            alt={tour.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink-950/60 text-white backdrop-blur-sm transition-colors hover:bg-ink-950/80"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 text-xs text-ink-300">
              <Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
              {tour.rating} rating
              <span className="text-ink-600">•</span>
              {dest?.name}, {dest?.country}
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white">
              {tour.title}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <Stat
              icon={Clock}
              label="Duration"
              value={`${tour.duration_days} days`}
            />
            <Stat
              icon={Users}
              label="Group size"
              value={`Max ${tour.group_size}`}
            />
            <Stat
              icon={Mountain}
              label="Difficulty"
              value={tour.difficulty}
            />
          </div>

          <p className="mt-6 text-sm leading-relaxed text-ink-300">
            {tour.description}
          </p>

          {/* What's included */}
          <h4 className="mt-7 mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
            What is included
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {tour.includes.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 rounded-lg bg-ink-800/50 px-3 py-2.5 text-sm text-ink-200"
              >
                <Check className="h-4 w-4 shrink-0 text-brand-400" />
                {item}
              </div>
            ))}
          </div>

          {/* Itinerary */}
          <h4 className="mt-7 mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-400">
            <Calendar className="h-4 w-4" /> Day-by-day itinerary
          </h4>
          <div className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-ink-700">
            {tour.itinerary.map((day) => (
              <div key={day.day} className="relative flex gap-4 pl-0">
                <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand-500 bg-ink-900 text-xs font-bold text-brand-400">
                  {day.day}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-semibold text-white">
                    {day.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-400">
                    {day.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-ink-800 bg-ink-950/40 p-5 sm:flex-row">
            <div>
              <span className="text-xs text-ink-400">Starting from</span>
              <p className="font-display text-3xl font-bold text-white">
                ${tour.price}
                <span className="text-sm font-normal text-ink-400">
                  {' '}
                  /person
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                onBook(tour.destination_slug);
                onClose();
              }}
              className="btn-primary w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Book this trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-950/40 px-3 py-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-brand-400" />
      <p className="mt-1.5 text-xs text-ink-400">{label}</p>
      <p className="text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}
