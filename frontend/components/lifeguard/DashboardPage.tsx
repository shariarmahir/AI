'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageView } from '@/app/page';
import {
  MessageSquare,
  FileText,
  Camera,
  Microscope,
  Hospital,
  PhoneCall,
  Navigation,
  MapPin,
  Clock,
  CheckCircle,
  ChevronRight,
  BookOpenText,
  Loader2,
  RefreshCw,
  Sparkles,
  Phone,
  Search,
  Languages,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { listSessions, timeAgo, type ChatSession } from '@/lib/chatHistory';
import { findHospitals, listDiseases, type Hospital as HospitalT } from '@/lib/api';

interface DashboardPageProps {
  setPage: (p: PageView) => void;
  onSelectChat: (id: string) => void;
}

// Same default the hospitals page uses when geolocation is unavailable.
const DHAKA = { lat: 23.8103, lng: 90.4125 };

function greeting(): { bn: string; en: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { bn: 'শুভ সকাল', en: 'Good morning' };
  if (h >= 12 && h < 17) return { bn: 'শুভ অপরাহ্ন', en: 'Good afternoon' };
  if (h >= 17 && h < 20) return { bn: 'শুভ সন্ধ্যা', en: 'Good evening' };
  return { bn: 'শুভ রাত্রি', en: 'Good night' };
}

const quickActions = [
  { icon: MessageSquare, title: 'Describe symptoms', desc: 'জ্বর, ব্যথা — বাংলা বা Banglish-এ লিখুন', tone: { bg: 'bg-[#EAF1FE]', text: 'text-[#2E6BE6]', border: 'border-[#C9D9F5]' } },
  { icon: FileText, title: 'Analyze prescription', desc: 'Every medicine, dose, and warning explained', tone: { bg: 'bg-[#E9F7F2]', text: 'text-[#12A17C]', border: 'border-[#CFEEE1]' } },
  { icon: Camera, title: 'Assess injury photo', desc: 'First-aid steps and when to see a doctor', tone: { bg: 'bg-[#FBF3E4]', text: 'text-[#E8A13D]', border: 'border-[#F2DFB6]' } },
  { icon: Microscope, title: 'Explain lab report', desc: 'Values compared to normal ranges', tone: { bg: 'bg-[#F3EEFE]', text: 'text-[#7C4FE0]', border: 'border-[#D4BEFC]' } },
];

const bangla = { fontFamily: 'var(--font-bangla), var(--font-inter), sans-serif' };

export default function DashboardPage({ setPage, onSelectChat }: DashboardPageProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [hospitals, setHospitals] = useState<HospitalT[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);
  const [hospitalsError, setHospitalsError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [usingRealLocation, setUsingRealLocation] = useState(false);
  const [diseaseTotal, setDiseaseTotal] = useState<number | null>(null);
  const [diseaseCats, setDiseaseCats] = useState<[string, number][]>([]);
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { id: string; name_en: string; name_bn: string; category: string; summary: string }[]
  >([]);

  // Live lookup against /api/diseases — free-text uses ?search= (matches
  // names/summaries), chips use ?category= (exact backend field). Debounced.
  useEffect(() => {
    const text = q.trim();
    if (!catFilter && text.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      listDiseases(catFilter ? { category: catFilter } : { search: text })
        .then((list: unknown) => setSearchResults(Array.isArray(list) ? list.slice(0, 5) : []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [q, catFilter]);

  const loadHospitals = useCallback(async (pos: { lat: number; lng: number }) => {
    setHospitalsLoading(true);
    setHospitalsError(false);
    try {
      const results = await findHospitals(pos.lat, pos.lng);
      setHospitals(results.slice(0, 4));
    } catch {
      setHospitalsError(true);
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSessions(listSessions());
    loadHospitals(DHAKA);
    // Disease knowledge base — shape checked defensively since the endpoint
    // returns a plain array.
    listDiseases()
      .then((list: unknown) => {
        if (!Array.isArray(list)) return;
        setDiseaseTotal(list.length);
        const counts = new Map<string, number>();
        for (const d of list) {
          const cat = typeof d?.category === 'string' ? d.category : null;
          if (cat) counts.set(cat, (counts.get(cat) ?? 0) + 1);
        }
        setDiseaseCats([...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6));
      })
      .catch(() => setDiseaseTotal(null));
  }, [loadHospitals]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        setUsingRealLocation(true);
        loadHospitals({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setUsingRealLocation(false);
        loadHospitals(DHAKA);
      },
      { timeout: 10000 }
    );
  };

  const g = greeting();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E3EAF6] px-6 md:px-8 py-4">
        <div className="pl-10 md:pl-0 flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-extrabold text-[#0F1E40]">
              <span style={bangla}>{g.bn}</span> · {g.en}
            </h1>
            <p className="text-xs text-[#8B98B5]">{today} — your health, in one place</p>
          </div>
          <button
            onClick={() => setPage('chat')}
            className="flex items-center gap-2 bg-[#2E6BE6] hover:bg-[#1E4FC0] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            <MessageSquare size={14} />
            Open AI chat
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Health snapshot — every number is live, none are decorative */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0F1E40] via-[#163898] to-[#1E4FC0] rounded-3xl px-6 md:px-8 py-6 text-white shadow-xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" aria-hidden />
          <div className="absolute -bottom-20 right-24 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
            {[
              { icon: MessageSquare, value: String(sessions.length), label: 'conversations on this device' },
              { icon: BookOpenText, value: diseaseTotal === null ? '—' : String(diseaseTotal), label: 'conditions in knowledge base' },
              { icon: Hospital, value: hospitalsLoading ? '…' : String(hospitals.filter(h => h.emergency_24_7).length), label: '24/7 emergency wards nearby' },
              { icon: Languages, value: '৩', label: 'languages — বাংলা · English · Banglish' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-white" />
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-2xl font-bold leading-none tabular-nums"
                    style={{ fontFamily: 'var(--font-sora), var(--font-inter), sans-serif' }}
                  >
                    {value}
                  </span>
                  <span className="block text-[10px] text-blue-200 font-medium mt-1 leading-snug">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions — each one opens the working AI chat */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, title, desc, tone }) => (
            <button
              key={title}
              onClick={() => setPage('chat')}
              className={`text-left bg-white rounded-2xl border ${tone.border} p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group`}
            >
              <div className={`w-10 h-10 ${tone.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={tone.text} />
              </div>
              <div className="text-sm font-bold text-[#0F1E40] leading-tight">{title}</div>
              <div className="text-[11px] text-[#8B98B5] mt-1 leading-snug">{desc}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          {/* Recent conversations — real device-local history */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F3FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#2E6BE6]" />
                <h2 className="text-sm font-bold text-[#0F1E40]">Recent conversations</h2>
              </div>
              <span className="text-[10px] font-semibold text-[#B9C6E0] uppercase tracking-wide">
                saved on this device
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-[#EAF1FE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-[#2E6BE6]" />
                </div>
                <h3 className="text-sm font-bold text-[#0F1E40] mb-1.5">Your dashboard starts with a conversation</h3>
                <p className="text-xs text-[#8B98B5] max-w-xs mx-auto mb-4 leading-relaxed">
                  Describe symptoms or upload a prescription, report, or photo — in Bangla,
                  English, or Banglish.
                </p>
                <button
                  onClick={() => setPage('chat')}
                  className="inline-flex items-center gap-1.5 bg-[#2E6BE6] hover:bg-[#1E4FC0] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  Start your first chat <ChevronRight size={12} />
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#F0F3FA]">
                {sessions.slice(0, 6).map(s => (
                  <button
                    key={s.id}
                    onClick={() => onSelectChat(s.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F8FE] transition-colors text-left group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#EAF1FE] flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={13} className="text-[#2E6BE6]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#26355A] truncate">{s.title}</span>
                      <span className="block text-[11px] text-[#8B98B5]">
                        {s.messages.length} message{s.messages.length === 1 ? '' : 's'} · {timeAgo(s.updatedAt)} ago
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#2E6BE6] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      Resume <ChevronRight size={11} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right rail: nearby hospitals + emergency */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F0F3FA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hospital size={15} className="text-[#E05252]" />
                  <h2 className="text-sm font-bold text-[#0F1E40]">Nearby hospitals</h2>
                </div>
                <button
                  onClick={handleLocate}
                  title="Use my location"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#2E6BE6] bg-[#EAF1FE] hover:bg-[#DCE8FC] px-2 py-1 rounded-lg transition-colors"
                >
                  {locating ? <Loader2 size={11} className="animate-spin" /> : <Navigation size={11} />}
                  {usingRealLocation ? 'My area' : 'Locate me'}
                </button>
              </div>

              {hospitalsLoading ? (
                <div className="p-6 text-center">
                  <Loader2 size={20} className="text-[#2E6BE6] animate-spin mx-auto mb-2" />
                  <p className="text-[11px] text-[#8B98B5]">Finding facilities…</p>
                </div>
              ) : hospitalsError ? (
                <div className="p-5 text-center">
                  <p className="text-xs text-[#A33B3B] mb-2">Could not reach the hospital service.</p>
                  <button
                    onClick={() => loadHospitals(DHAKA)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E6BE6]"
                  >
                    <RefreshCw size={11} /> Try again
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F3FA]">
                  {hospitals.map(h => (
                    <div key={h.place_id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#26355A] truncate">{h.name}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8B98B5]">
                            {h.distance_meters != null && (
                              <span className="flex items-center gap-0.5 font-semibold">
                                <MapPin size={9} />
                                {h.distance_meters < 1000
                                  ? `${h.distance_meters} m`
                                  : `${(h.distance_meters / 1000).toFixed(1)} km`}
                              </span>
                            )}
                            {h.open_now != null && (
                              <span className={cn('flex items-center gap-0.5 font-semibold', h.open_now ? 'text-[#12A17C]' : 'text-[#E05252]')}>
                                {h.open_now ? <CheckCircle size={9} /> : <Clock size={9} />}
                                {h.open_now ? (h.emergency_24_7 ? 'Open 24/7' : 'Open') : 'Closed'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {h.phone && (
                            <a
                              href={`tel:${h.phone.replace(/\s/g, '')}`}
                              title={`Call ${h.name}`}
                              className="w-7 h-7 rounded-lg bg-[#E9F7F2] text-[#12A17C] hover:bg-[#CFEEE1] flex items-center justify-center transition-colors"
                            >
                              <Phone size={12} />
                            </a>
                          )}
                          <a
                            href={h.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Directions"
                            className="w-7 h-7 rounded-lg bg-[#EAF1FE] text-[#2E6BE6] hover:bg-[#DCE8FC] flex items-center justify-center transition-colors"
                          >
                            <Navigation size={12} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setPage('hospitals')}
                    className="w-full px-5 py-3 text-[12px] font-bold text-[#2E6BE6] hover:bg-[#F5F8FE] transition-colors flex items-center justify-center gap-1"
                  >
                    View all hospitals <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Emergency — always-true utility */}
            <div className="bg-gradient-to-br from-[#FDEEEE] to-[#FBF3E4] rounded-2xl border border-[#F5CFCF] p-5">
              <div className="flex items-center gap-2 mb-2">
                <PhoneCall size={14} className="text-[#E05252]" />
                <span className="text-xs font-bold text-[#A33B3B] uppercase tracking-wide">Emergency lines</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:999"
                  className="bg-[#E05252] hover:bg-[#A33B3B] text-white rounded-xl px-3 py-2.5 text-center transition-colors"
                >
                  <span className="block text-base font-extrabold leading-none" style={bangla}>৯৯৯</span>
                  <span className="block text-[9px] font-semibold mt-1 opacity-90">National emergency</span>
                </a>
                <a
                  href="tel:16263"
                  className="bg-white border border-[#F5CFCF] text-[#E05252] hover:bg-[#FDEEEE] rounded-xl px-3 py-2.5 text-center transition-colors"
                >
                  <span className="block text-base font-extrabold leading-none" style={bangla}>১৬২৬৩</span>
                  <span className="block text-[9px] font-semibold mt-1 opacity-80">Shastho Batayon</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Health library — live counts from the knowledge base */}
        <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BookOpenText size={15} className="text-[#2E6BE6]" />
              <h2 className="text-sm font-bold text-[#0F1E40]">
                Health library
                {diseaseTotal !== null && (
                  <span className="text-[#8B98B5] font-medium"> — {diseaseTotal} conditions, explained simply</span>
                )}
              </h2>
            </div>
            <button
              onClick={() => setPage('chat')}
              className="flex items-center gap-1 text-[12px] font-bold text-[#2E6BE6] hover:text-[#1E4FC0] transition-colors"
            >
              Ask about a condition <ChevronRight size={12} />
            </button>
          </div>
          {diseaseTotal === null ? (
            <p className="text-xs text-[#8B98B5]">
              The knowledge base is offline right now — you can still ask anything in the chat.
            </p>
          ) : (
            <>
              {/* Live search against the disease database */}
              <div className="flex items-center gap-2 bg-[#F5F8FE] border border-[#E3EAF6] rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-[#2E6BE6] focus-within:ring-2 focus-within:ring-[#EAF1FE] transition-all">
                {searching ? (
                  <Loader2 size={14} className="text-[#2E6BE6] animate-spin flex-shrink-0" />
                ) : (
                  <Search size={14} className="text-[#8B98B5] flex-shrink-0" />
                )}
                <input
                  type="text"
                  value={q}
                  onChange={e => {
                    setQ(e.target.value);
                    setCatFilter(null);
                  }}
                  placeholder="Search a condition — dengue, ডায়াবেটিস, gastric…"
                  className="flex-1 bg-transparent outline-none text-sm text-[#0F1E40] placeholder:text-[#B9C6E0] font-medium"
                />
              </div>

              {(catFilter !== null || q.trim().length >= 2) && !searching && (
                searchResults.length === 0 ? (
                  <p className="text-xs text-[#8B98B5] mb-3 px-1">
                    Nothing matched — try another spelling, or ask the AI chat directly.
                  </p>
                ) : (
                  <div className="divide-y divide-[#F0F3FA] border border-[#E3EAF6] rounded-xl overflow-hidden mb-3">
                    {searchResults.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setPage('chat')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F8FE] text-left transition-colors group"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="flex items-baseline gap-2">
                            <span className="text-[13px] font-bold text-[#26355A]">{d.name_en}</span>
                            <span className="text-xs text-[#8B98B5]" style={bangla}>{d.name_bn}</span>
                          </span>
                          <span className="block text-[11px] text-[#8B98B5] truncate">{d.summary}</span>
                        </span>
                        <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide text-[#2E6BE6] bg-[#EAF1FE] px-2 py-0.5 rounded-full capitalize">
                          {d.category.replace(/_/g, ' ')}
                        </span>
                        <ChevronRight size={12} className="flex-shrink-0 text-[#B9C6E0] group-hover:text-[#2E6BE6]" />
                      </button>
                    ))}
                  </div>
                )
              )}

              <div className="flex flex-wrap gap-2">
                {diseaseCats.map(([cat, n]) => {
                  const active = catFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setQ('');
                        setCatFilter(active ? null : cat);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors',
                        active
                          ? 'bg-[#2E6BE6] border-[#2E6BE6] text-white shadow-md shadow-blue-200'
                          : 'bg-[#F5F8FE] hover:bg-[#EAF1FE] border-[#E3EAF6] hover:border-[#A8C3F5] text-[#3D4E73] hover:text-[#2E6BE6]'
                      )}
                    >
                      {cat.replace(/_/g, ' ')}
                      <span className={cn('text-[10px] font-bold tabular-nums', active ? 'text-blue-100' : 'text-[#8B98B5]')}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#B9C6E0] pt-1">
          Records are private to this device. Nothing is uploaded or stored without your action.
        </p>
      </div>
    </div>
  );
}
