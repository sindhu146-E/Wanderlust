import { Star, Clock, Users, Mountain, ArrowUpRight } from 'lucide-react';
import type { Tour } from '../lib/supabase';

const difficultyColor: Record<string, string> = {
  easy: 'text-brand-400 bg-brand-500/10',
  moderate: 'text-sand-400 bg-sand-500/10',
  challenging: 'text-coral-400 bg-coral-500/10',
};

export function TourCard({
  tour,
  onSelect,
}: {
  tour: Tour;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(tour.slug)}
      className="card group flex flex-col overflow-hidden text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink-600 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tour.image_url}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
        <div className="absolute left-4 top-4">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-sm ${difficultyColor[tour.difficulty] ?? 'text-ink-300 bg-ink-800/70'}`}
          >
            {tour.difficulty}
          </span>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
          {tour.rating}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-white">
          {tour.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-400 line-clamp-2">
          {tour.description}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            {tour.duration_days} days
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-brand-400" />
            Max {tour.group_size}
          </span>
          <span className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-brand-400" />
            {tour.difficulty}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-4">
          <div>
            <span className="text-xs text-ink-400">From</span>
            <p className="font-display text-xl font-bold text-white">
              ${tour.price}
              <span className="text-xs font-normal text-ink-400">
                {' '}
                /person
              </span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-brand-400">
            Details
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
