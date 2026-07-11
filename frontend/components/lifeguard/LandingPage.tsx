'use client';

import { PageView } from '@/app/page';
import { useEffect, useRef, useState } from 'react';
import {
  Shield,
  FileText,
  Pill,
  Hospital,
  Camera,
  Zap,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  HeartPulse,
  Brain,
  Microscope,
  AlertCircle,
  MessageSquare,
  Languages,
  BookOpenText,
  PhoneCall,
  Stethoscope,
  Wallet,
  Activity,
  Ambulance,
  Baby,
  Syringe,
  Cross,
} from 'lucide-react';

interface LandingPageProps {
  setPage: (p: PageView) => void;
}

/* ────────────────────────────────────────────────────────────────
   Geography. The silhouette and every pin are projected from real
   WGS84 coordinates (equirectangular, cos-corrected at 23.7°N), so
   the map encodes true positions — same convention as the hospital
   dataset the app searches.
   ──────────────────────────────────────────────────────────────── */
const project = (lat: number, lng: number) => ({
  x: (lng - 87.95) * 55.2, // ≈ 60 px/° × cos(23.7°)
  y: (26.75 - lat) * 60,
});

// National border traced clockwise from the northern tip (Panchagarh):
// panhandle → Rangpur/Kurigram lobe → Meghalaya foot → Sylhet lobe →
// Tripura bite → Chittagong Hill Tracts → Teknaf tip → coast with the
// Meghna estuary → Sundarbans → western border back up to the tip.
const BORDER: [number, number][] = [
  [26.63, 88.42], [26.45, 88.58], [26.25, 88.70], [26.10, 88.95],
  [26.18, 89.18], [26.05, 89.45], [25.95, 89.62], [25.82, 89.82],
  [25.92, 89.98], [25.70, 90.00], [25.45, 90.02], [25.20, 90.25],
  [25.15, 90.65], [25.18, 91.10], [25.13, 91.50], [25.18, 91.85],
  [25.10, 92.10], [24.95, 92.35], [24.70, 92.38], [24.50, 92.22],
  [24.32, 92.12], [24.12, 91.92], [24.05, 91.65], [23.92, 91.42],
  [23.68, 91.25], [23.48, 91.15], [23.28, 91.18], [23.08, 91.35],
  [22.98, 91.55], [23.05, 91.75], [22.92, 92.02], [22.68, 92.28],
  [22.52, 92.60], [22.18, 92.60], [21.88, 92.58], [21.48, 92.38],
  [21.12, 92.28], [20.75, 92.28], [20.88, 92.15], [21.15, 92.08],
  [21.48, 92.00], [21.78, 91.90], [22.08, 91.82], [22.38, 91.72],
  [22.58, 91.60], [22.72, 91.48], [22.85, 91.32], [22.78, 91.05],
  [22.52, 90.92], [22.68, 90.78], [22.42, 90.72], [22.15, 90.65],
  [22.05, 90.42], [21.88, 90.22], [21.80, 90.02], [21.88, 89.82],
  [21.70, 89.52], [21.62, 89.18], [21.72, 89.02], [22.08, 88.98],
  [22.42, 88.92], [22.78, 88.88], [23.08, 88.78], [23.32, 88.72],
  [23.55, 88.58], [23.85, 88.62], [24.08, 88.72], [24.30, 88.65],
  [24.42, 88.28], [24.55, 88.05], [24.80, 88.18], [24.98, 88.22],
  [25.18, 88.42], [25.32, 88.20], [25.55, 88.05], [25.80, 88.10],
  [26.02, 88.15], [26.22, 88.22], [26.42, 88.32],
];

const VIEW_W = 264;
const VIEW_H = 366;
const PATH =
  BORDER.map(([lat, lng], i) => {
    const { x, y } = project(lat, lng);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ') + ' Z';

/* The photographic relief map (public/bd-map.png) is square, with the country
   occupying a sub-region of the frame. These four numbers are the % of the
   image covered by the country's lat/lng bounding box — nudge them if pins
   drift after swapping the artwork. */
const IMG_BOUNDS = { left: 12, right: 84, top: 7, bottom: 94 };
const imgPos = (lat: number, lng: number) => ({
  left: IMG_BOUNDS.left + ((lng - 88.0) / (92.7 - 88.0)) * (IMG_BOUNDS.right - IMG_BOUNDS.left),
  top: IMG_BOUNDS.top + ((26.65 - lat) / (26.65 - 20.7)) * (IMG_BOUNDS.bottom - IMG_BOUNDS.top),
});

/* Eight divisions — HQ coordinates, 2022 census population (millions),
   and the real referral hospital anchoring care there. */
type Tone = 'indigo' | 'mint' | 'amber' | 'coral';

const DIVISIONS: {
  en: string; bn: string; lat: number; lng: number; pop: number;
  note: string; icon: typeof HeartPulse; tone: Tone; cardBelow?: boolean;
}[] = [
  { en: 'Dhaka', bn: 'ঢাকা', lat: 23.8103, lng: 90.4125, pop: 44.2, note: 'DMCH — the country’s largest public hospital', icon: HeartPulse, tone: 'indigo' },
  { en: 'Chattogram', bn: 'চট্টগ্রাম', lat: 22.3569, lng: 91.7832, pop: 33.2, note: 'CMCH anchors care for the southeast coast', icon: Stethoscope, tone: 'mint' },
  { en: 'Rajshahi', bn: 'রাজশাহী', lat: 24.3745, lng: 88.6042, pop: 20.4, note: 'RMCH — referral hub for the northwest', icon: Pill, tone: 'amber' },
  { en: 'Khulna', bn: 'খুলনা', lat: 22.8456, lng: 89.5403, pop: 17.4, note: 'KMCH — care at the edge of the Sundarbans', icon: Activity, tone: 'coral' },
  { en: 'Rangpur', bn: 'রংপুর', lat: 25.7439, lng: 89.2752, pop: 17.6, note: 'RpMCH — the far north’s teaching hospital', icon: Syringe, tone: 'mint', cardBelow: true },
  { en: 'Mymensingh', bn: 'ময়মনসিংহ', lat: 24.7471, lng: 90.4203, pop: 12.2, note: 'MMCH — among the busiest wards anywhere', icon: Baby, tone: 'coral', cardBelow: true },
  { en: 'Sylhet', bn: 'সিলেট', lat: 24.8949, lng: 91.8687, pop: 11.0, note: 'MAG Osmani MCH serves the northeast valleys', icon: Ambulance, tone: 'indigo', cardBelow: true },
  { en: 'Barishal', bn: 'বরিশাল', lat: 22.701, lng: 90.3535, pop: 9.1, note: 'SBMCH — reached by river for many families', icon: Cross, tone: 'amber' },
];

const TONES: Record<Tone, { tile: string; ring: string; text: string }> = {
  indigo: { tile: 'bg-gradient-to-br from-[#6A74F0] to-[#4F5BE7]', ring: 'border-[#4F5BE7]', text: 'text-[#4F5BE7]' },
  mint:   { tile: 'bg-gradient-to-br from-[#2FC69C] to-[#12A17C]', ring: 'border-[#12A17C]', text: 'text-[#12A17C]' },
  amber:  { tile: 'bg-gradient-to-br from-[#F0B65C] to-[#E8A13D]', ring: 'border-[#E8A13D]', text: 'text-[#B87F24]' },
  coral:  { tile: 'bg-gradient-to-br from-[#EE7A7A] to-[#E05252]', ring: 'border-[#E05252]', text: 'text-[#E05252]' },
};

/* National numbers. Population: BBS census 2022. Physician density and
   out-of-pocket share: WHO / World Bank indicators. */
const POPULATION = 171_000_000;

const SORTED_DIVISIONS = [...DIVISIONS].sort((a, b) => b.pop - a.pop);
const MAX_POP = SORTED_DIVISIONS[0].pop;

const sora = { fontFamily: 'var(--font-sora), var(--font-inter), sans-serif' };
const bangla = { fontFamily: 'var(--font-bangla), var(--font-inter), sans-serif' };

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ── Content reused across sections ── */
const featureCards = [
  { icon: FileText, color: 'indigo', title: 'Prescription Analysis', desc: 'Upload a prescription and get each medicine explained — dose, timing, and what to watch for.' },
  { icon: Camera, color: 'amber', title: 'Injury Assessment', desc: 'Photograph a wound or injury for first-aid steps and a clear signal on when to see a doctor.' },
  { icon: Microscope, color: 'mint', title: 'Lab Report Insights', desc: 'Blood work and test reports explained in plain language, with values compared to normal ranges.' },
  { icon: Pill, color: 'teal', title: 'Medicine Identification', desc: 'Snap a photo of a pill or packet to identify it, learn its use, and spot counterfeit warning signs.' },
  { icon: Hospital, color: 'coral', title: 'Nearby Hospitals', desc: 'Find hospitals and clinics around you with distance, 24/7 status, and one-tap directions.' },
  { icon: Brain, color: 'purple', title: 'Symptom Checker', desc: 'Describe symptoms the way you speak. The AI maps them to possible conditions and next steps.' },
];

const featureTones: Record<string, { bg: string; icon: string; border: string }> = {
  indigo: { bg: 'bg-[#EAECFC]', icon: 'text-[#4F5BE7]', border: 'border-[#C9CDF5]' },
  amber: { bg: 'bg-[#FBF3E4]', icon: 'text-[#E8A13D]', border: 'border-[#F2DFB6]' },
  mint: { bg: 'bg-[#E9F7F2]', icon: 'text-[#12A17C]', border: 'border-[#CFEEE1]' },
  teal: { bg: 'bg-[#E9F7F2]', icon: 'text-[#0B7A5E]', border: 'border-[#CFEEE1]' },
  coral: { bg: 'bg-[#FDEEEE]', icon: 'text-[#E05252]', border: 'border-[#F5CFCF]' },
  purple: { bg: 'bg-[#F3EEFE]', icon: 'text-[#7C4FE0]', border: 'border-[#D4BEFC]' },
};

const capabilities = [
  { label: 'Diseases in knowledge base', value: '112', icon: BookOpenText },
  { label: 'Medical documents indexed', value: '1,232', icon: Microscope },
  { label: 'Languages understood', value: '৩', sub: 'Bangla · English · Banglish', icon: Languages },
  { label: 'Emergency aware', value: '৯৯৯', sub: 'Golden-hour guidance', icon: PhoneCall },
];

const banglishSamples = [
  'buker bampashe betha, ki korbo?',
  'bhat khete iccha kore na, sathe pete betha',
  'sape kamor dile ki korbo?',
  'জ্বর ও মাথাব্যথা দুই দিন ধরে',
];

const steps = [
  { n: '০১', title: 'Tell it your way', desc: 'Type in Bangla, English, or Banglish — or upload a photo, prescription, or report.' },
  { n: '০২', title: 'AI reads with local context', desc: 'Answers are grounded in a Bangladesh-specific medical knowledge base — dengue to arsenicosis.' },
  { n: '০৩', title: 'Act with confidence', desc: 'Get plain-language guidance, red-flag warnings, and the nearest hospital when it matters.' },
];

export default function LandingPage({ setPage }: LandingPageProps) {
  const people = useCountUp(POPULATION);
  const stageRef = useRef<HTMLDivElement>(null);
  const fine = useRef(false);
  // Photographic relief map, with the porcelain SVG as fallback until
  // public/bd-map.png exists. Probed from an effect rather than <img onError>:
  // with SSR the 404 fires before React attaches the handler, so the error
  // event would be lost and a broken-image icon shown.
  const [imgOk, setImgOk] = useState(false);
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setImgOk(true);
    probe.src = '/bd-map.png';
  }, []);

  useEffect(() => {
    fine.current =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fine.current || !stageRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    stageRef.current.style.transform =
      `perspective(1200px) rotateX(${(11 - y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
  };
  const handleLeave = () => {
    if (stageRef.current)
      stageRef.current.style.transform = 'perspective(1200px) rotateX(11deg) rotateY(0deg)';
  };

  return (
    <div className="min-h-screen bg-[#EEF1FA] overflow-y-auto">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E2E6F3] px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6A74F0] to-[#4F5BE7] flex items-center justify-center shadow-md shadow-indigo-200">
            <Shield size={18} className="text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-[#0F1E40] text-sm tracking-tight">
              LifeGuard <span className="text-[#4F5BE7]">NeXus</span>
            </div>
            <div className="text-[10px] text-[#8B98B5] font-medium" style={bangla}>আপনার স্বাস্থ্যের সঙ্গী</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage('hospitals')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#3D4E73] hover:text-[#4F5BE7] px-3 py-2 transition-colors"
          >
            <Hospital size={15} />
            Hospitals
          </button>
          <button
            onClick={() => setPage('chat')}
            className="flex items-center gap-2 bg-[#4F5BE7] hover:bg-[#3A44C4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 hover:shadow-lg active:scale-95"
          >
            <Zap size={14} />
            Open the app
          </button>
        </div>
      </header>

      {/* ── Hero: national health picture + porcelain Bangladesh ── */}
      <section
        className="relative overflow-x-clip px-6 md:px-10 pt-12 lg:pt-16 pb-10"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {/* Atmosphere */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-40 right-[8%] w-[34rem] h-[34rem] rounded-full bg-[radial-gradient(closest-side,#DDE2F6,transparent)] opacity-80" />
          <div className="absolute bottom-[-6rem] left-[-6rem] w-96 h-96 rounded-full bg-[radial-gradient(closest-side,#E4EFEA,transparent)] opacity-70" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-12 lg:gap-6 items-center">
          {/* Left rail — the statistics stack */}
          <div>
            <div className="bd-rise inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[#4F5BE7] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F5BE7]" />
              <span style={bangla} className="tracking-normal text-xs">জাতীয় স্বাস্থ্যচিত্র</span>
              · National health picture
            </div>

            <div className="bd-rise" style={{ animationDelay: '0.08s' }}>
              <div
                className="text-[2.9rem] md:text-6xl font-bold text-[#0F1E40] leading-none tracking-tight tabular-nums"
                style={sora}
              >
                {people.toLocaleString('en-US')}
              </div>
              <div className="mt-3 text-xl md:text-2xl font-semibold text-[#26355A]" style={bangla}>
                ১৭ কোটি মানুষ —{' '}
                <span className="text-[#4F5BE7]" style={sora}>one health companion.</span>
              </div>
            </div>

            <p
              className="bd-rise mt-5 text-[15px] leading-relaxed text-[#5B6B8C] max-w-md"
              style={{ animationDelay: '0.16s' }}
            >
              Bangladesh has 0.67 doctors for every 1,000 people, and three in four
              health takas are paid from family pockets. LifeGuard NeXus puts free,
              Bangla-first AI guidance in every hand — and the nearest open hospital
              when minutes matter.
            </p>

            {/* Two hard numbers, no varnish */}
            <div className="bd-rise grid grid-cols-2 gap-3 mt-6 max-w-md" style={{ animationDelay: '0.24s' }}>
              <div className="bg-white rounded-2xl border border-[#E2E6F3] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-lg bg-[#EAECFC] flex items-center justify-center">
                    <Stethoscope size={14} className="text-[#4F5BE7]" />
                  </span>
                  <span className="text-xl font-bold text-[#0F1E40] tabular-nums" style={sora}>0.67</span>
                </div>
                <div className="text-[11px] leading-snug text-[#8B98B5] font-medium">
                  doctors per 1,000 people <span className="text-[#B9C6E0]">· WHO</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E6F3] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-lg bg-[#FBF3E4] flex items-center justify-center">
                    <Wallet size={14} className="text-[#E8A13D]" />
                  </span>
                  <span className="text-xl font-bold text-[#0F1E40] tabular-nums" style={sora}>74%</span>
                </div>
                <div className="text-[11px] leading-snug text-[#8B98B5] font-medium">
                  of health costs paid out-of-pocket <span className="text-[#B9C6E0]">· WHO</span>
                </div>
              </div>
            </div>

            {/* Population by division — ties the numbers to the pins */}
            <div
              className="bd-rise mt-3 bg-white rounded-2xl border border-[#E2E6F3] p-4 shadow-sm max-w-md"
              style={{ animationDelay: '0.32s' }}
            >
              <div className="text-[11px] font-bold text-[#3D4E73] mb-3">
                <span style={bangla}>বিভাগ অনুযায়ী জনসংখ্যা</span>
                <span className="text-[#8B98B5] font-medium"> · population by division, millions (2022 census)</span>
              </div>
              <div className="space-y-1.5">
                {SORTED_DIVISIONS.map((d, i) => (
                  <div key={d.en} className="flex items-center gap-2">
                    <span className="w-20 text-[10px] font-semibold text-[#5B6B8C] truncate">{d.en}</span>
                    <span className="flex-1 h-2 rounded-full bg-[#F0F2FA] overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[#6A74F0] to-[#4F5BE7]"
                        style={{ width: `${(d.pop / MAX_POP) * 100}%`, opacity: 1 - i * 0.09 }}
                      />
                    </span>
                    <span className="w-8 text-right text-[10px] font-bold text-[#26355A] tabular-nums">{d.pop}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="bd-rise flex flex-col sm:flex-row gap-3 mt-7" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setPage('chat')}
                className="flex items-center justify-center gap-2 bg-[#4F5BE7] hover:bg-[#3A44C4] text-white font-bold px-7 py-3.5 rounded-2xl text-[15px] transition-all duration-200 shadow-xl shadow-indigo-200 hover:-translate-y-0.5 active:scale-95"
              >
                <MessageSquare size={17} />
                Ask about your health
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setPage('hospitals')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-[#F7F8FD] text-[#4F5BE7] font-bold px-7 py-3.5 rounded-2xl text-[15px] transition-all duration-200 border border-[#C9CDF5] shadow-md hover:-translate-y-0.5"
              >
                <Hospital size={17} />
                Find nearby hospitals
              </button>
            </div>
          </div>

          {/* Right — porcelain relief of Bangladesh with beeping division pins */}
          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[500px] select-none">
            {/* Dhono Dhanno Pushpo Bhora — D. L. Roy, 1905 */}
            <div className="bd-rise text-center mb-5" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm md:text-base lg:text-[17px] leading-[2.05] text-[#26355A] font-semibold" style={bangla}>
                ধনধান্য পুষ্প ভরা আমাদের এই বসুন্ধরা
                <br />
                তাহার মাঝে আছে দেশ এক সকল দেশের সেরা
                <br />
                ও সে স্বপ্ন দিয়ে তৈরি সে দেশ স্মৃতি দিয়ে ঘেরা
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="h-px w-8 bg-[#C9CDF5]" />
                <span className="text-[10px] font-semibold text-[#8B98B5]" style={bangla}>দ্বিজেন্দ্রলাল রায়</span>
                <span className="h-px w-8 bg-[#C9CDF5]" />
              </div>
            </div>
            <div className="bd-float">
              <div
                ref={stageRef}
                className="relative transition-transform duration-200 ease-out will-change-transform"
                style={{ transform: 'perspective(1200px) rotateX(11deg) rotateY(0deg)' }}
              >
                {imgOk ? (
                  <img
                    src="/bd-map.png"
                    alt="Relief map of Bangladesh"
                    draggable={false}
                    onError={() => setImgOk(false)}
                    className="w-full h-auto pointer-events-none select-none drop-shadow-[0_30px_45px_rgba(63,70,120,0.35)]"
                  />
                ) : (
                <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-auto" aria-hidden>
                  <defs>
                    <linearGradient id="bdFace" x1="0" y1="0" x2="0.9" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#E9EBF8" />
                    </linearGradient>
                    <filter id="bdShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="9" />
                    </filter>
                  </defs>
                  {/* ground shadow → extrusion → porcelain face */}
                  <g transform="translate(9 20)">
                    <path d={PATH} fill="#AEB6DE" opacity="0.5" filter="url(#bdShadow)" />
                  </g>
                  <g transform="translate(0 8)">
                    <path d={PATH} fill="#D6DAF1" />
                  </g>
                  <path d={PATH} fill="url(#bdFace)" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
                  {/* Jamuna · Padma · Surma–Meghna, engraved into the porcelain */}
                  <g fill="none" stroke="#DCE1F4" strokeLinecap="round">
                    <path d="M97 54 C 96 95, 98 140, 101 176" strokeWidth="5.5" />
                    <path d="M36 143 C 60 158, 84 170, 101 176" strokeWidth="4.5" />
                    <path d="M216 111 C 196 130, 176 146, 167 162 C 160 180, 154 196, 149 210" strokeWidth="3" opacity="0.9" />
                    <path d="M101 176 C 118 190, 138 198, 149 210 C 152 228, 148 244, 146 258" strokeWidth="7" />
                  </g>
                </svg>
                )}

                {/* Division pins — positioned by the same projection */}
                {DIVISIONS.map((d, i) => {
                  const { x, y } = project(d.lat, d.lng);
                  // Image and SVG frame the country differently, so each mode
                  // has its own lat/lng → % mapping.
                  const pos = imgOk
                    ? imgPos(d.lat, d.lng)
                    : { left: (x / VIEW_W) * 100, top: (y / VIEW_H) * 100 };
                  const t = TONES[d.tone];
                  const Icon = d.icon;
                  return (
                    <button
                      key={d.en}
                      onClick={() => setPage('hospitals')}
                      aria-label={`${d.en} division — ${d.note}. See hospitals.`}
                      className="group absolute -translate-x-1/2 -translate-y-full z-10 hover:z-30 focus-visible:z-30 outline-none"
                      style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    >
                      <span className="bd-pop flex flex-col items-center" style={{ animationDelay: `${0.55 + i * 0.09}s` }}>
                        <span
                          className={`w-8 h-8 md:w-9 md:h-9 rounded-xl ${t.tile} shadow-lg flex items-center justify-center ring-2 ring-white transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110`}
                        >
                          <Icon size={15} className="text-white" />
                        </span>
                        {/* the beeping point */}
                        <span className="relative mt-1 flex items-center justify-center w-3 h-3">
                          <span className={`absolute w-3 h-3 rounded-full border-2 ${t.ring} bd-ping`} style={{ animationDelay: `${i * 0.3}s` }} />
                          <span className={`absolute w-3 h-3 rounded-full border-2 ${t.ring} bd-ping`} style={{ animationDelay: `${i * 0.3 + 1.2}s` }} />
                          <span className={`w-2.5 h-2.5 rounded-full bg-white border-2 ${t.ring}`} />
                        </span>
                      </span>

                      {/* hover / focus fact card */}
                      <span
                        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 w-52 opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 ${
                          d.cardBelow ? 'top-full mt-2' : 'bottom-full mb-2'
                        }`}
                      >
                        <span className="block bg-white/95 backdrop-blur rounded-xl border border-[#E2E6F3] shadow-xl p-3 text-left">
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-[#0F1E40]" style={bangla}>{d.bn}</span>
                            <span className="text-[10px] font-semibold text-[#8B98B5] uppercase tracking-wide">{d.en}</span>
                          </span>
                          <span className="block text-[11px] text-[#5B6B8C] leading-snug mt-1">{d.note}</span>
                          <span className={`flex items-center justify-between mt-1.5 text-[10px] font-bold ${t.text}`}>
                            <span className="tabular-nums">{d.pop}M people</span>
                            <span className="flex items-center gap-0.5">hospitals <ArrowRight size={9} /></span>
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live guidance card — flat, floating over the scene */}
            <div className="bd-rise absolute -bottom-4 right-0 sm:right-2 bg-white/90 backdrop-blur rounded-2xl border border-[#E2E6F3] shadow-xl px-4 py-3" style={{ animationDelay: '0.9s' }}>
              <div className="flex items-center gap-2">
                <span className="relative flex w-2.5 h-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-[#12A17C] opacity-60 animate-ping" />
                  <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#12A17C]" />
                </span>
                <span className="text-xs font-bold text-[#0F1E40]">AI guidance — online now</span>
              </div>
              <div className="text-[10px] text-[#8B98B5] font-medium mt-1 pl-[18px]">
                <span style={bangla}>৯৯৯</span> national emergency · <span style={bangla}>১৬২৬৩</span> Shastho Batayon
              </div>
            </div>
          </div>
        </div>

        {/* Ask exactly how you speak */}
        <div className="relative z-10 max-w-6xl mx-auto mt-16 text-center">
          <div className="text-xs font-semibold text-[#8B98B5] uppercase tracking-widest mb-3">
            Ask exactly how you speak
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {banglishSamples.map(q => (
              <button
                key={q}
                onClick={() => setPage('chat')}
                className="group flex items-center gap-2 bg-white border border-[#E2E6F3] text-[#3D4E73] hover:border-[#4F5BE7] hover:text-[#4F5BE7] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span className="italic">&ldquo;{q}&rdquo;</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Honest capability strip */}
      <section className="px-6 md:px-10 py-14">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="bg-white border border-[#E2E6F3] rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#EAECFC] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-[#4F5BE7]" />
              </div>
              <div className="text-2xl font-bold text-[#0F1E40]" style={sora}>{value}</div>
              <div className="text-xs text-[#8B98B5] font-medium mt-1">{label}</div>
              {sub && <div className="text-[10px] text-[#B9C6E0] mt-0.5">{sub}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F1E40] mb-3" style={sora}>
              One agent, <span className="text-[#4F5BE7]">six ways to help</span>
            </h2>
            <p className="text-[#5B6B8C] max-w-xl mx-auto">
              Everything runs in the same chat — upload a file or just describe what&rsquo;s wrong.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map(({ icon: Icon, color, title, desc }) => {
              const c = featureTones[color];
              return (
                <div
                  key={title}
                  onClick={() => setPage('chat')}
                  className={`bg-white rounded-2xl p-6 border ${c.border} shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={22} className={c.icon} />
                  </div>
                  <h3 className="text-[#0F1E40] font-bold text-base mb-2">{title}</h3>
                  <p className="text-[#5B6B8C] text-sm leading-relaxed">{desc}</p>
                  <div className={`flex items-center gap-1 mt-4 text-xs font-semibold ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Try it now <ArrowRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F1E40] mb-3" style={sora}>
              How <span className="text-[#4F5BE7]">LifeGuard NeXus</span> works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative bg-white rounded-2xl p-6 border border-[#E2E6F3] shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6A74F0] to-[#4F5BE7] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-200" style={bangla}>
                  {n}
                </div>
                <h3 className="font-bold text-[#0F1E40] mb-2">{title}</h3>
                <p className="text-[#5B6B8C] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#171A33] via-[#31379E] to-[#4F5BE7] rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={bangla}>স্বাস্থ্য নিয়ে প্রশ্ন? এখনই জিজ্ঞেস করুন।</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            Free health guidance in your own words — with hospital directions when you need them most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPage('chat')}
              className="flex items-center justify-center gap-2 bg-white text-[#31379E] font-bold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Zap size={18} />
              Start now — it&rsquo;s free
            </button>
            <button
              onClick={() => setPage('hospitals')}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <Hospital size={18} />
              Nearby hospitals
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-indigo-200">
            {['Free to use', 'Files are not stored', 'বাংলা · English · Banglish', '999 emergency aware'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#2FC69C]" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mx-6 md:mx-10 mb-10 p-4 bg-[#FBF3E4] border border-[#F2DFB6] rounded-2xl flex gap-3 max-w-4xl lg:mx-auto">
        <AlertCircle size={18} className="text-[#E8A13D] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#8A6414]">
          <strong>Medical disclaimer:</strong> LifeGuard NeXus provides AI-generated health information for educational purposes only — it is not a diagnosis. Always consult a qualified doctor. In an emergency, call <a href="tel:999" className="font-bold underline">999</a>.
        </p>
      </div>
    </div>
  );
}
