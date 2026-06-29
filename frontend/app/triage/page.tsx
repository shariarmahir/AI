'use client';
import { useState } from 'react';
import { Loader2, AlertTriangle, Stethoscope, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { triage, type TriageResponse } from '@/lib/api';
import ConfidenceBadge from '@/components/ConfidenceBadge';
import EmergencyAlert from '@/components/EmergencyAlert';
import HospitalList from '@/components/HospitalList';

const URGENCY_STYLES = {
  emergency: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
} as const;

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [useLocation, setUseLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [error, setError] = useState('');

  async function getLocation(): Promise<{ lat: number; lng: number } | null> {
    if (!useLocation || !navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 23.8103, lng: 90.4125 }), // Dhaka fallback
        { timeout: 5000 }
      );
    });
  }

  async function handleSubmit() {
    if (!symptoms.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const loc = await getLocation();
      const res = await triage({
        symptoms,
        age: age ? parseInt(age) : undefined,
        gender,
        lat: loc?.lat,
        lng: loc?.lng,
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="eyebrow mb-2"><Sparkles className="w-3 h-3" /> Most popular</div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">AI Triage</h1>
        <p className="text-sm text-ink-500">
          Describe your symptoms — get specialty, urgency, possible conditions, and nearby hospitals.
        </p>
      </div>

      <div className="card mb-6">
        <label className="label">Describe your symptoms (Bangla or English)</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={4}
          placeholder="Example: 3 din dhore boker bame chap chap betha, siri uthte koshto, mathar betha"
          className="input mb-4 resize-none"
        />
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="text-xs font-medium text-ink-500 mb-1 block">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 32" className="input" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500 mb-1 block">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="input">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500 mb-1 block">Location</label>
            <label className="flex items-center gap-2 mt-2.5 text-sm text-ink-700 cursor-pointer">
              <input type="checkbox" checked={useLocation} onChange={(e) => setUseLocation(e.target.checked)} className="rounded accent-brand-600" />
              Use my location
            </label>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading || !symptoms.trim()} className="btn-accent w-full sm:w-auto">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Analyzing…</> : 'Run Triage'}
        </button>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </div>

      {result && (
        <div className="space-y-4 animate-fade-up">
          {result.urgency === 'emergency' && (
            <EmergencyAlert message={result.summary} />
          )}

          <div className="card">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wide text-ink-400 mb-1.5 font-medium">Recommended specialty</div>
                <div className="text-2xl font-bold text-ink-950 flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-ink-950 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-4.5 h-4.5 text-brand-400" />
                  </div>
                  {result.specialty}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${URGENCY_STYLES[result.urgency]}`}>
                  {result.urgency} urgency
                </span>
                <ConfidenceBadge confidence={result.confidence} />
              </div>
            </div>
            <p className="text-ink-700 leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {result.possible_conditions?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-ink-900 mb-3">Possible conditions <span className="text-ink-400 font-normal text-xs">(not a diagnosis)</span></h3>
                <ul className="space-y-2 text-sm">
                  {result.possible_conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> <span className="text-ink-700">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.red_flags?.length > 0 && (
              <div className="card bg-red-50/50 border-red-200">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Red flags — go to ER
                </h3>
                <ul className="space-y-2 text-sm text-red-800">
                  {result.red_flags.map((c, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span>{c}</li>)}
                </ul>
              </div>
            )}
            {result.risk_factors?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-ink-900 mb-3">Risk factors</h3>
                <ul className="space-y-2 text-sm text-ink-700">
                  {result.risk_factors.map((c, i) => <li key={i} className="flex gap-2"><span className="text-ink-300">•</span>{c}</li>)}
                </ul>
              </div>
            )}
            {result.self_care?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-ink-900 mb-3">Safe self-care while you wait</h3>
                <ul className="space-y-2 text-sm text-ink-700">
                  {result.self_care.map((c, i) => <li key={i} className="flex gap-2"><span className="text-ink-300">•</span>{c}</li>)}
                </ul>
              </div>
            )}
          </div>

          {result.questions_for_doctor?.length > 0 && (
            <div className="card bg-blue-50/40 border-blue-200">
              <h3 className="font-semibold text-ink-900 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" /> Questions to ask your doctor
              </h3>
              <ul className="space-y-2 text-sm text-ink-700">
                {result.questions_for_doctor.map((c, i) => <li key={i} className="flex gap-2"><span className="text-blue-400">•</span>{c}</li>)}
              </ul>
            </div>
          )}

          {result.matched_diseases && result.matched_diseases.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-ink-900 mb-3">Knowledge base matches</h3>
              <div className="flex flex-wrap gap-2">
                {result.matched_diseases.map((d, i) => (
                  <span key={i} className="text-xs bg-ink-50 text-ink-700 border border-ink-100 px-2.5 py-1 rounded-full">
                    {d.name_en} {d.name_bn && <span className="opacity-60">· {d.name_bn}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.hospitals?.length > 0 && (
            <div className="card">
              <HospitalList hospitals={result.hospitals} title={`${result.specialty} hospitals near you`} />
            </div>
          )}

          <div className="text-xs text-ink-400 italic px-1">{result.disclaimer}</div>
        </div>
      )}
    </div>
  );
}
