import { Star, MapPin, ExternalLink, Clock } from 'lucide-react';
import type { Hospital } from '@/lib/api';

export default function HospitalList({ hospitals, title = 'Nearby hospitals' }: { hospitals: Hospital[]; title?: string }) {
  if (!hospitals?.length) return null;
  return (
    <div>
      <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-600" /> {title}
      </h3>
      <div className="space-y-2">
        {hospitals.map((h) => (
          <a
            key={h.place_id}
            href={h.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-ink-100 rounded-xl p-3.5 hover:border-brand-300 hover:shadow-soft transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink-900 flex items-center gap-1.5">
                  {h.name}
                  <ExternalLink className="w-3 h-3 text-ink-300 group-hover:text-brand-500 transition-colors" />
                </div>
                <div className="text-xs text-ink-500 mt-0.5 truncate">{h.address}</div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {h.rating !== null && (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <Star className="w-3 h-3 fill-current" /> {h.rating} <span className="text-ink-400 font-normal">({h.total_ratings})</span>
                    </span>
                  )}
                  {h.open_now !== null && (
                    <span className={`flex items-center gap-1 font-medium ${h.open_now ? 'text-emerald-600' : 'text-ink-400'}`}>
                      <Clock className="w-3 h-3" /> {h.open_now ? 'Open now' : 'Closed'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
