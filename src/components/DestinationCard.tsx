import { Star, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import type { Destination } from '../lib/supabase';

export function DestinationCard({
  destination,
  onSelect,
}: {
  destination: Destination;
  onSelect: (slug: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(destination.slug)}
      className="group relative overflow-hidden rounded-2xl border border-ink-800 text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink-600 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={destination.image_url}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-1.5">
          {destination.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
          {destination.rating}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1.5 text-xs text-ink-300">
            <MapPin className="h-3.5 w-3.5 text-brand-400" />
            {destination.country}
          </div>
          <h3 className="mt-1 font-display text-2xl font-bold text-white">
            {destination.name}
          </h3>
          <p className="mt-1 text-sm text-ink-300 line-clamp-1">
            {destination.tagline}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between bg-ink-900/80 px-5 py-4">
        <div>
          <span className="text-xs text-ink-400">From</span>
          <p className="font-display text-lg font-bold text-white">
            ${destination.price_from}
            <span className="text-xs font-normal text-ink-400"> /person</span>
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-400">
          <Clock className="h-3.5 w-3.5" />
          {destination.duration_days} days
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-brand-400">
          Explore
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </button>
  );
}
