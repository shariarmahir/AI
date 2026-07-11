'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Star,
  Phone,
  Clock,
  Navigation,
  Search,
  AlertCircle,
  Stethoscope,
  CheckCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { findHospitals, type Hospital } from '@/lib/api';

type FilterType = 'all' | 'emergency' | 'specialist' | 'clinic' | 'pharmacy';

// Default to central Dhaka when geolocation is unavailable/denied
const DHAKA = { lat: 23.8103, lng: 90.4125 };

const filterToSpecialty: Record<FilterType, string> = {
  all: 'hospital',
  emergency: 'emergency hospital',
  specialist: 'specialized hospital',
  clinic: 'clinic',
  pharmacy: 'pharmacy',
};

const filterLabels: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Facilities' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'specialist', label: 'Specialist' },
  { id: 'clinic', label: 'Clinics' },
  { id: 'pharmacy', label: 'Pharmacy' },
];

const cardColors = ['blue', 'green', 'orange', 'teal', 'red'];

const colorMap: Record<string, { bg: string; border: string; text: string; light: string }> = {
  blue:   { bg: 'bg-[#EAF1FE]', border: 'border-[#C9D9F5]', text: 'text-[#2E6BE6]', light: 'bg-[#F5F8FE]' },
  green:  { bg: 'bg-[#E9F7F2]', border: 'border-[#CFEEE1]', text: 'text-[#12A17C]', light: 'bg-[#F2FBF8]' },
  orange: { bg: 'bg-[#FBF3E4]', border: 'border-[#F2DFB6]', text: 'text-[#E8A13D]', light: 'bg-[#FDF9F2]' },
  teal:   { bg: 'bg-[#E9F7F2]', border: 'border-[#CFEEE1]', text: 'text-[#0B7A5E]', light: 'bg-[#F2FBF8]' },
  red:    { bg: 'bg-[#FDEEEE]', border: 'border-[#F5CFCF]', text: 'text-[#E05252]', light: 'bg-[#FEF8F8]' },
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export default function HospitalsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [coords, setCoords] = useState(DHAKA);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (pos: { lat: number; lng: number }, f: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const results = await findHospitals(pos.lat, pos.lng, filterToSpecialty[f]);
      setHospitals(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospitals.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(coords, filter);
  }, [coords, filter, load]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        setUsingRealLocation(true);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setUsingRealLocation(false);
        setCoords({ ...DHAKA });
      },
      { timeout: 10000 }
    );
  };

  const filtered = hospitals.filter(h => {
    if (!query) return true;
    const q = query.toLowerCase();
    return h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E3EAF6] px-6 md:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="pl-10 md:pl-0">
            <h1 className="text-xl font-extrabold text-[#0F1E40]">Nearby Hospitals</h1>
            <p className="text-xs text-[#8B98B5]">
              {loading ? 'Searching…' : `${filtered.length} facilities found near ${usingRealLocation ? 'your location' : 'Dhaka (default)'}`}
            </p>
          </div>
          <button
            onClick={handleLocate}
            className="flex items-center gap-2 bg-[#2E6BE6] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-200 hover:bg-[#1E4FC0] transition-all"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
            <span className="hidden sm:inline">{locating ? 'Locating…' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[#F5F8FE] border border-[#E3EAF6] rounded-xl px-4 py-2.5 focus-within:border-[#2E6BE6] focus-within:ring-2 focus-within:ring-[#EAF1FE] transition-all">
            <Search size={15} className="text-[#8B98B5] flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or address…"
              className="flex-1 bg-transparent outline-none text-sm text-[#0F1E40] placeholder:text-[#B9C6E0] font-medium"
            />
          </div>
          <button
            onClick={() => load(coords, filter)}
            className="flex items-center gap-2 bg-white border border-[#E3EAF6] text-[#5B6B8C] hover:border-[#A8C3F5] hover:text-[#2E6BE6] text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-5 max-w-5xl mx-auto">
        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap">
          {filterLabels.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-150',
                filter === id
                  ? 'bg-[#2E6BE6] text-white border-[#2E6BE6] shadow-md shadow-blue-200'
                  : 'bg-white text-[#5B6B8C] border-[#E3EAF6] hover:border-[#A8C3F5] hover:text-[#2E6BE6]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 size={32} className="text-[#2E6BE6] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#8B98B5]">Searching for medical facilities near you…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-[#FDEEEE] border border-[#F5CFCF] rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle size={22} className="text-[#E05252] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#A33B3B] mb-1">Could not load hospitals</h3>
              <p className="text-sm text-[#A33B3B]/80 mb-3">{error}</p>
              <button
                onClick={() => load(coords, filter)}
                className="flex items-center gap-1.5 bg-[#E05252] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#A33B3B] transition-colors"
              >
                <RefreshCw size={13} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Hospital cards */}
        {!loading && !error && (
          <div className="space-y-4">
            {filtered.map((hospital, idx) => {
              const c = colorMap[cardColors[idx % cardColors.length]];
              // The backend measures against the coords it actually searched, which
              // can drift from `coords` if the user relocates mid-request. Trust it.
              const distance =
                hospital.distance_meters != null
                  ? hospital.distance_meters / 1000
                  : haversineKm(coords, hospital.location);
              return (
                <div
                  key={hospital.place_id}
                  className={`bg-white rounded-2xl border ${c.border} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center border ${c.border}`}>
                        <Stethoscope size={24} className={c.text} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-[#0F1E40] truncate">{hospital.name}</h3>
                          </div>
                          {hospital.rating !== null && (
                            <div className="flex items-center gap-1 bg-[#FBF3E4] border border-[#F2DFB6] px-2 py-1 rounded-lg flex-shrink-0">
                              <Star size={11} className="text-[#E8A13D] fill-[#E8A13D]" />
                              <span className="text-xs font-bold text-[#8A6414]">{hospital.rating}</span>
                              <span className="text-[10px] text-[#8B98B5]">({hospital.total_ratings.toLocaleString()})</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[#8B98B5] mb-3 mt-1">
                          <MapPin size={11} className="flex-shrink-0" />
                          <span className="truncate">{hospital.address}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-[#5B6B8C] font-medium">
                            <Navigation size={11} />
                            {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
                          </span>
                          {hospital.open_now !== null && (
                            <span className={cn('flex items-center gap-1 font-semibold', hospital.open_now ? 'text-[#12A17C]' : 'text-[#E05252]')}>
                              {hospital.open_now ? <CheckCircle size={11} /> : <Clock size={11} />}
                              {hospital.open_now ? 'Open now' : 'Closed now'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className={`border-t ${c.border} ${c.light} px-5 py-3 flex items-center justify-end gap-2`}>
                    {hospital.phone && (
                      <a
                        href={`tel:${hospital.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-1.5 mr-auto bg-white border border-[#E3EAF6] text-[#5B6B8C] hover:text-[#12A17C] hover:border-[#CFEEE1] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Phone size={11} />
                        {hospital.phone}
                      </a>
                    )}
                    <a
                      href={hospital.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white border border-[#E3EAF6] text-[#5B6B8C] hover:text-[#2E6BE6] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ExternalLink size={11} />
                      View on Maps
                    </a>
                    <a
                      href={hospital.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#2E6BE6] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1E4FC0] transition-colors shadow-sm shadow-blue-200"
                    >
                      <Navigation size={11} />
                      Directions
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#EAF1FE] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-[#2E6BE6]" />
            </div>
            <h3 className="text-base font-bold text-[#0F1E40] mb-2">No facilities found</h3>
            <p className="text-sm text-[#8B98B5]">Try a different search term or filter.</p>
          </div>
        )}

        {/* Emergency strip */}
        <div className="bg-[#FDEEEE] border border-[#F5CFCF] rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 bg-[#E05252] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-red-200">
            <AlertCircle size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#A33B3B] mb-1">Medical Emergency?</h3>
            <p className="text-sm text-[#A33B3B]/80 mb-3">Call emergency services immediately. Do not drive yourself.</p>
            <div className="flex flex-wrap gap-2">
              <a href="tel:999" className="flex items-center gap-1.5 bg-[#E05252] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#A33B3B] transition-colors shadow-md shadow-red-200">
                <Phone size={14} />
                999 — National Emergency (Bangladesh)
              </a>
              <a href="tel:16263" className="flex items-center gap-1.5 bg-white border border-[#F5CFCF] text-[#E05252] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#FDEEEE] transition-colors">
                <Phone size={14} />
                16263 — Shastho Batayon Health Line
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
