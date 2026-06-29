'use client';
import { useState } from 'react';
import { Loader2, MapPin, Search, Sparkles } from 'lucide-react';
import { findHospitals, type Hospital } from '@/lib/api';
import HospitalList from '@/components/HospitalList';

const COMMON_SPECIALTIES = [
  'general medicine', 'cardiology', 'gynecology', 'pediatrics', 'orthopedics',
  'neurology', 'dermatology', 'oncology', 'ENT', 'ophthalmology', 'psychiatry', 'urology',
];

export default function HospitalsPage() {
  const [specialty, setSpecialty] = useState('general medicine');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function search() {
    setLoading(true);
    setError('');
    try {
      let location = coords;
      if (!location) {
        location = await new Promise<{ lat: number; lng: number }>((resolve) => {
          if (!navigator.geolocation) return resolve({ lat: 23.8103, lng: 90.4125 });
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: 23.8103, lng: 90.4125 }),
            { timeout: 5000 }
          );
        });
        setCoords(location);
      }
      const results = await findHospitals(location.lat, location.lng, specialty);
      setHospitals(results);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="eyebrow mb-2"><Sparkles className="w-3 h-3" /> Live results</div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">Find a Hospital</h1>
        <p className="text-sm text-ink-500">Find specialist hospitals near your location.</p>
      </div>

      <div className="card mb-6">
        <label className="label">Specialty</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="e.g. cardiology"
            className="input"
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button onClick={search} disabled={loading} className="btn-accent !px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {COMMON_SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-all ${
                specialty === s
                  ? 'bg-ink-950 border-ink-950 text-white font-medium'
                  : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {coords && (
          <p className="text-xs text-ink-400 mt-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Searching near {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {hospitals.length > 0 && (
        <div className="card animate-fade-up">
          <HospitalList hospitals={hospitals} title={`${specialty} hospitals nearby`} />
        </div>
      )}

      {!loading && searched && hospitals.length === 0 && !error && (
        <div className="card flex flex-col items-center text-center py-10">
          <div className="w-12 h-12 bg-ink-50 rounded-xl flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5 text-ink-300" />
          </div>
          <p className="text-sm text-ink-500">No hospitals found for "{specialty}" nearby. Try a broader specialty.</p>
        </div>
      )}

      {!loading && !searched && hospitals.length === 0 && (
        <p className="text-center text-sm text-ink-400 py-8">
          Search for a specialty to see nearby hospitals.
        </p>
      )}
    </div>
  );
}
