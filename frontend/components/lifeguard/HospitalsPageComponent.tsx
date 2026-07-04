'use client';

import { useState } from 'react';
import {
  MapPin,
  Star,
  Phone,
  Clock,
  Navigation,
  Search,
  Filter,
  ChevronRight,
  Heart,
  AlertCircle,
  Stethoscope,
  Activity,
  Baby,
  Eye,
  Bone,
  Brain,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'emergency' | 'specialist' | 'clinic' | 'pharmacy';

interface Hospital {
  id: string;
  name: string;
  type: FilterType;
  specialty: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  open24: boolean;
  waitTime: string;
  phone: string;
  available: boolean;
  tags: string[];
  color: string;
}

const hospitals: Hospital[] = [
  {
    id: '1',
    name: 'City Medical Center',
    type: 'emergency',
    specialty: 'Multi-Specialty',
    address: '14 Central Avenue, Downtown',
    distance: '1.2 km',
    rating: 4.8,
    reviews: 2341,
    open24: true,
    waitTime: '~15 min',
    phone: '+91 98765 43210',
    available: true,
    tags: ['Emergency', 'ICU', 'Surgery', 'Pediatrics'],
    color: 'blue',
  },
  {
    id: '2',
    name: 'Apollo Hospitals',
    type: 'emergency',
    specialty: 'Super-Specialty',
    address: '21 Park Road, Banjara Hills',
    distance: '2.4 km',
    rating: 4.9,
    reviews: 5820,
    open24: true,
    waitTime: '~25 min',
    phone: '+91 40 2360 7777',
    available: true,
    tags: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics'],
    color: 'green',
  },
  {
    id: '3',
    name: 'Fortis Healthcare',
    type: 'specialist',
    specialty: 'Cardiac & Neuro',
    address: '8 Jubilee Hills Road',
    distance: '3.1 km',
    rating: 4.7,
    reviews: 3102,
    open24: true,
    waitTime: '~10 min',
    phone: '+91 40 4477 4477',
    available: true,
    tags: ['Cardiology', 'Neurology', 'Transplant'],
    color: 'orange',
  },
  {
    id: '4',
    name: 'QuickCare Urgent Clinic',
    type: 'clinic',
    specialty: 'General & Urgent Care',
    address: '3 MG Road, Secunderabad',
    distance: '0.8 km',
    rating: 4.6,
    reviews: 987,
    open24: false,
    waitTime: 'No wait',
    phone: '+91 98123 45678',
    available: true,
    tags: ['Walk-in', 'Lab Tests', 'Vaccinations'],
    color: 'teal',
  },
  {
    id: '5',
    name: 'CARE Hospitals',
    type: 'specialist',
    specialty: 'Multi-Specialty',
    address: '47 Nampally Station Road',
    distance: '4.2 km',
    rating: 4.7,
    reviews: 4120,
    open24: true,
    waitTime: '~20 min',
    phone: '+91 40 2272 2272',
    available: true,
    tags: ['Renal', 'Gastro', 'Oncology'],
    color: 'blue',
  },
  {
    id: '6',
    name: 'MedPlus Pharmacy & Diagnostics',
    type: 'pharmacy',
    specialty: 'Pharmacy & Lab',
    address: '56 Himayat Nagar',
    distance: '1.5 km',
    rating: 4.5,
    reviews: 632,
    open24: false,
    waitTime: 'Immediate',
    phone: '+91 40 4466 0000',
    available: true,
    tags: ['Pharmacy', 'Blood Tests', 'ECG'],
    color: 'red',
  },
  {
    id: '7',
    name: 'Rainbow Children\'s Hospital',
    type: 'specialist',
    specialty: 'Pediatrics',
    address: '22 Banjara Hills, Road No. 10',
    distance: '3.8 km',
    rating: 4.9,
    reviews: 2890,
    open24: true,
    waitTime: '~30 min',
    phone: '+91 40 6600 0000',
    available: true,
    tags: ['Neonatal ICU', 'Pediatric Surgery', 'Child Neurology'],
    color: 'teal',
  },
  {
    id: '8',
    name: 'L.V. Prasad Eye Institute',
    type: 'specialist',
    specialty: 'Ophthalmology',
    address: 'Road No. 2, Banjara Hills',
    distance: '2.9 km',
    rating: 4.8,
    reviews: 3455,
    open24: false,
    waitTime: '~45 min',
    phone: '+91 40 3061 2345',
    available: false,
    tags: ['Cataract', 'LASIK', 'Retina'],
    color: 'blue',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; light: string }> = {
  blue:   { bg: 'bg-[#EAF1FE]', border: 'border-[#C9D9F5]', text: 'text-[#2E6BE6]', light: 'bg-[#F5F8FE]' },
  green:  { bg: 'bg-[#E9F7F2]', border: 'border-[#CFEEE1]', text: 'text-[#12A17C]', light: 'bg-[#F2FBF8]' },
  orange: { bg: 'bg-[#FBF3E4]', border: 'border-[#F2DFB6]', text: 'text-[#E8A13D]', light: 'bg-[#FDF9F2]' },
  teal:   { bg: 'bg-[#E9F7F2]', border: 'border-[#CFEEE1]', text: 'text-[#0B7A5E]', light: 'bg-[#F2FBF8]' },
  red:    { bg: 'bg-[#FDEEEE]', border: 'border-[#F5CFCF]', text: 'text-[#E05252]', light: 'bg-[#FEF8F8]' },
};

const specialtyIcons: Record<string, React.ElementType> = {
  'Cardiology': Heart,
  'Neurology': Brain,
  'Pediatrics': Baby,
  'Ophthalmology': Eye,
  'Orthopedics': Bone,
  'Multi-Specialty': Stethoscope,
  'General': Activity,
};

const filterLabels: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Facilities' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'specialist', label: 'Specialist' },
  { id: 'clinic', label: 'Clinics' },
  { id: 'pharmacy', label: 'Pharmacy' },
];

export default function HospitalsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [locating, setLocating] = useState(false);
  const [locating2, setLocating2] = useState(false);

  const filtered = hospitals.filter(h => {
    const matchQuery = !query || h.name.toLowerCase().includes(query.toLowerCase()) || h.specialty.toLowerCase().includes(query.toLowerCase()) || h.address.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === 'all' || h.type === filter;
    return matchQuery && matchFilter;
  });

  const handleLocate = () => {
    setLocating(true);
    setTimeout(() => setLocating(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E3EAF6] px-6 md:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="pl-10 md:pl-0">
            <h1 className="text-xl font-extrabold text-[#0F1E40]">Nearby Hospitals</h1>
            <p className="text-xs text-[#8B98B5]">{filtered.length} facilities found near you</p>
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
              placeholder="Search by name, specialty, or location…"
              className="flex-1 bg-transparent outline-none text-sm text-[#0F1E40] placeholder:text-[#B9C6E0] font-medium"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-[#E3EAF6] text-[#5B6B8C] hover:border-[#A8C3F5] hover:text-[#2E6BE6] text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Filter size={15} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-5 max-w-5xl mx-auto">
        {/* Map placeholder */}
        <div className="relative bg-gradient-to-br from-[#EAF1FE] via-[#E9F7F2] to-[#F5F8FE] rounded-2xl border border-[#C9D9F5] overflow-hidden h-48 md:h-64 flex items-center justify-center">
          {/* Simulated map grid */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute w-full h-px bg-[#2E6BE6]" style={{ top: `${i * 14}%` }} />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute h-full w-px bg-[#2E6BE6]" style={{ left: `${i * 14}%` }} />
            ))}
          </div>
          {/* Map pins */}
          {[
            { x: '20%', y: '40%', label: 'QuickCare', color: 'bg-[#12A17C]' },
            { x: '35%', y: '55%', label: 'City Medical', color: 'bg-[#2E6BE6]' },
            { x: '55%', y: '30%', label: 'Apollo', color: 'bg-[#2E6BE6]' },
            { x: '70%', y: '60%', label: 'Fortis', color: 'bg-[#E8A13D]' },
            { x: '50%', y: '70%', label: 'MedPlus', color: 'bg-[#E05252]' },
          ].map(({ x, y, label, color }) => (
            <div key={label} className="absolute flex flex-col items-center" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
              <div className={`w-7 h-7 ${color} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                <MapPin size={13} className="text-white" />
              </div>
              <span className="text-[9px] font-bold text-[#26355A] bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm mt-1 whitespace-nowrap">{label}</span>
            </div>
          ))}
          {/* You are here */}
          <div className="absolute" style={{ left: '42%', top: '50%', transform: 'translate(-50%,-50%)' }}>
            <div className="w-5 h-5 bg-[#2E6BE6] rounded-full border-2 border-white shadow-xl animate-pulse-glow" />
            <span className="text-[9px] font-bold text-[#2E6BE6] absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">You</span>
          </div>
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-[#E3EAF6] rounded-xl px-3 py-2 text-xs font-semibold text-[#5B6B8C] flex items-center gap-1.5 shadow-sm">
            <MapPin size={12} className="text-[#2E6BE6]" />
            Hyderabad, Telangana
          </div>
        </div>

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

        {/* Hospital cards */}
        <div className="space-y-4">
          {filtered.map(hospital => {
            const c = colorMap[hospital.color];
            return (
              <div
                key={hospital.id}
                className={`bg-white rounded-2xl border ${c.border} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center border ${c.border}`}>
                      <Stethoscope size={24} className={c.text} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-[#0F1E40] truncate">{hospital.name}</h3>
                          <p className={`text-xs font-semibold ${c.text} mb-1`}>{hospital.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#FBF3E4] border border-[#F2DFB6] px-2 py-1 rounded-lg flex-shrink-0">
                          <Star size={11} className="text-[#E8A13D] fill-[#E8A13D]" />
                          <span className="text-xs font-bold text-[#8A6414]">{hospital.rating}</span>
                          <span className="text-[10px] text-[#8B98B5]">({hospital.reviews.toLocaleString()})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-[#8B98B5] mb-3">
                        <MapPin size={11} className="flex-shrink-0" />
                        <span className="truncate">{hospital.address}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {hospital.tags.map(tag => (
                          <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{tag}</span>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1 text-[#5B6B8C] font-medium">
                          <Navigation size={11} />
                          {hospital.distance}
                        </span>
                        <span className={cn('flex items-center gap-1 font-semibold', hospital.open24 ? 'text-[#12A17C]' : 'text-[#E8A13D]')}>
                          <Clock size={11} />
                          {hospital.open24 ? '24/7 Open' : 'Check hours'}
                        </span>
                        <span className="flex items-center gap-1 text-[#5B6B8C] font-medium">
                          <Activity size={11} />
                          Wait: {hospital.waitTime}
                        </span>
                        <span className={cn('flex items-center gap-1 font-semibold', hospital.available ? 'text-[#12A17C]' : 'text-[#E05252]')}>
                          {hospital.available ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                          {hospital.available ? 'Accepting patients' : 'Full currently'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action bar */}
                <div className={`border-t ${c.border} ${c.light} px-5 py-3 flex items-center justify-between gap-3`}>
                  <div className="flex items-center gap-1 text-xs text-[#5B6B8C]">
                    <Phone size={11} />
                    <span>{hospital.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className={`flex items-center gap-1.5 ${c.bg} border ${c.border} ${c.text} text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity`}>
                      <Phone size={11} />
                      Call
                    </button>
                    <button className="flex items-center gap-1.5 bg-[#2E6BE6] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1E4FC0] transition-colors shadow-sm shadow-blue-200">
                      <Navigation size={11} />
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
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
              <a href="tel:108" className="flex items-center gap-1.5 bg-[#E05252] text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#A33B3B] transition-colors shadow-md shadow-red-200">
                <Phone size={14} />
                108 — Ambulance (India)
              </a>
              <a href="tel:102" className="flex items-center gap-1.5 bg-white border border-[#F5CFCF] text-[#E05252] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#FDEEEE] transition-colors">
                <Phone size={14} />
                102 — Emergency
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
