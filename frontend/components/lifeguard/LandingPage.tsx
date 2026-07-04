'use client';

import { PageView } from '@/app/page';
import {
  Shield,
  FileText,
  Stethoscope,
  Pill,
  Hospital,
  Camera,
  Upload,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Users,
  TrendingUp,
  Activity,
  ChevronRight,
  HeartPulse,
  Brain,
  Microscope,
  AlertCircle,
} from 'lucide-react';

interface LandingPageProps {
  setPage: (p: PageView) => void;
}

const featureCards = [
  {
    icon: FileText,
    color: 'blue',
    title: 'Prescription Analysis',
    desc: 'Upload your prescriptions and get instant AI-powered explanations of medicines, dosages, and interactions.',
    badge: 'Most Used',
    badgeColor: 'blue',
  },
  {
    icon: Camera,
    color: 'orange',
    title: 'Injury Assessment',
    desc: 'Photograph physical injuries for immediate AI triage, severity assessment, and first-aid guidance.',
    badge: 'Quick Scan',
    badgeColor: 'orange',
  },
  {
    icon: Microscope,
    color: 'green',
    title: 'Lab Report Insights',
    desc: 'Understand complex blood work, X-rays, and diagnostic reports in plain language.',
    badge: 'Deep Analysis',
    badgeColor: 'green',
  },
  {
    icon: Pill,
    color: 'teal',
    title: 'Medicine Identification',
    desc: 'Snap a photo of any pill or packaging for comprehensive drug information, side effects, and warnings.',
    badge: 'Instant ID',
    badgeColor: 'teal',
  },
  {
    icon: Hospital,
    color: 'red',
    title: 'Nearby Hospitals',
    desc: 'Locate verified hospitals, clinics, and specialists near you with real-time availability and ratings.',
    badge: 'GPS Enabled',
    badgeColor: 'red',
  },
  {
    icon: Brain,
    color: 'purple',
    title: 'Symptom Checker',
    desc: 'Describe your symptoms in natural language. The AI maps them to possible conditions and next steps.',
    badge: 'AI Powered',
    badgeColor: 'purple',
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; badge: string; badgeTxt: string }> = {
  blue: { bg: 'bg-[#EAF1FE]', icon: 'text-[#2E6BE6]', border: 'border-[#A8C3F5]', badge: 'bg-[#EAF1FE]', badgeTxt: 'text-[#1E4FC0]' },
  orange: { bg: 'bg-[#FBF3E4]', icon: 'text-[#E8A13D]', border: 'border-[#F2DFB6]', badge: 'bg-[#FBF3E4]', badgeTxt: 'text-[#8A6414]' },
  green: { bg: 'bg-[#E9F7F2]', icon: 'text-[#12A17C]', border: 'border-[#CFEEE1]', badge: 'bg-[#E9F7F2]', badgeTxt: 'text-[#0B7A5E]' },
  teal: { bg: 'bg-[#E9F7F2]', icon: 'text-[#0B7A5E]', border: 'border-[#CFEEE1]', badge: 'bg-[#E9F7F2]', badgeTxt: 'text-[#0B7A5E]' },
  red: { bg: 'bg-[#FDEEEE]', icon: 'text-[#E05252]', border: 'border-[#F5CFCF]', badge: 'bg-[#FDEEEE]', badgeTxt: 'text-[#A33B3B]' },
  purple: { bg: 'bg-[#F3EEFE]', icon: 'text-[#7C4FE0]', border: 'border-[#D4BEFC]', badge: 'bg-[#F3EEFE]', badgeTxt: 'text-[#5A33B8]' },
};

const stats = [
  { label: 'Analyses Completed', value: '2.4M+', icon: Activity },
  { label: 'Satisfied Patients', value: '98.7%', icon: Star },
  { label: 'Hospitals Listed', value: '50,000+', icon: Hospital },
  { label: 'Avg. Response Time', value: '< 3s', icon: Clock },
];

const steps = [
  { n: '01', title: 'Upload Your Files', desc: 'Securely upload prescriptions, photos, lab reports, or medicine images.' },
  { n: '02', title: 'AI Processes Instantly', desc: 'LifeGuard NeXus analyzes with medical-grade AI in seconds.' },
  { n: '03', title: 'Get Clear Insights', desc: 'Receive plain-language explanations, recommendations, and next steps.' },
];

export default function LandingPage({ setPage }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E3EAF6] px-6 md:px-10 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:hidden pl-10">
          <Shield size={18} className="text-[#2E6BE6]" />
          <span className="font-bold text-[#0F1E40] text-sm">LifeGuard <span className="text-[#2E6BE6]">NeXus</span></span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-sm text-[#5B6B8C] font-medium">
          <HeartPulse size={16} className="text-[#E05252]" />
          <span>Your Trusted Health Companion</span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#12A17C] bg-[#E9F7F2] px-3 py-1.5 rounded-full border border-[#CFEEE1]">
            <span className="w-1.5 h-1.5 bg-[#12A17C] rounded-full animate-pulse" />
            AI Online
          </span>
          <button
            onClick={() => setPage('chat')}
            className="flex items-center gap-2 bg-[#2E6BE6] hover:bg-[#1E4FC0] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 active:scale-95"
          >
            <Zap size={14} />
            Start Analysis
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 md:px-10 pt-16 pb-20">
        {/* Background decoration */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-radial from-[#EAF1FE] to-transparent opacity-70 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-radial from-[#E9F7F2] to-transparent opacity-60 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* AI badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#A8C3F5] text-[#1E4FC0] text-xs font-bold px-4 py-2 rounded-full shadow-sm mb-8 animate-fade-in-up">
            <Shield size={12} />
            Medical-Grade AI — HIPAA Compliant
            <span className="ml-1 bg-[#2E6BE6] text-white text-[10px] px-2 py-0.5 rounded-full">v2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F1E40] leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            Your Personal
            <span className="block bg-gradient-to-r from-[#2E6BE6] to-[#12A17C] bg-clip-text text-transparent">
              AI Health Agent
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#5B6B8C] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
            Upload prescriptions, injury photos, lab reports, and medicine images.
            LifeGuard NeXus analyzes them instantly and connects you with nearby hospitals.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
            <button
              onClick={() => setPage('chat')}
              className="flex items-center justify-center gap-2 bg-[#2E6BE6] hover:bg-[#1E4FC0] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95"
            >
              <Upload size={18} />
              Upload & Analyze Now
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage('hospitals')}
              className="flex items-center justify-center gap-2 bg-white hover:bg-[#F5F8FE] text-[#2E6BE6] font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 border border-[#A8C3F5] shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Hospital size={18} />
              Find Nearby Hospitals
            </button>
          </div>

          {/* Upload quick-action pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
            {[
              { icon: FileText, label: 'Prescription', color: '#2E6BE6' },
              { icon: Camera, label: 'Injury Photo', color: '#E8A13D' },
              { icon: Microscope, label: 'Lab Report', color: '#12A17C' },
              { icon: Pill, label: 'Medicine', color: '#0B7A5E' },
              { icon: Hospital, label: 'Hospital Search', color: '#E05252' },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                onClick={() => setPage('chat')}
                className="flex items-center gap-1.5 bg-white border border-[#E3EAF6] text-[#3D4E73] hover:border-[#A8C3F5] hover:text-[#2E6BE6] px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Icon size={12} style={{ color }} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-[#E3EAF6] rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#EAF1FE] rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-[#2E6BE6]" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F1E40] mb-1">{value}</div>
              <div className="text-xs text-[#8B98B5] font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F1E40] mb-3">
              Everything You Need for <span className="text-[#2E6BE6]">Better Health</span>
            </h2>
            <p className="text-[#5B6B8C] max-w-xl mx-auto">
              Six powerful AI capabilities, one unified health platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureCards.map(({ icon: Icon, color, title, desc, badge }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  onClick={() => setPage('chat')}
                  className={`bg-white rounded-2xl p-6 border ${c.border} shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={22} className={c.icon} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.badge} ${c.badgeTxt}`}>{badge}</span>
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F1E40] mb-3">
              How <span className="text-[#2E6BE6]">LifeGuard NeXus</span> Works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="relative bg-white rounded-2xl p-6 border border-[#E3EAF6] shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2E6BE6] to-[#1E4FC0] text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-200">
                  {n}
                </div>
                <h3 className="font-bold text-[#0F1E40] mb-2">{title}</h3>
                <p className="text-[#5B6B8C] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="px-6 md:px-10 pb-16">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0F1E40] via-[#163898] to-[#1E4FC0] rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Ready to Take Control of Your Health?</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">
            Join millions of patients who trust LifeGuard NeXus for instant, AI-powered medical insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPage('chat')}
              className="flex items-center justify-center gap-2 bg-white text-[#1E4FC0] font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Zap size={18} />
              Start Free Analysis
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-200"
            >
              <TrendingUp size={18} />
              View Dashboard
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-blue-200">
            {['HIPAA Compliant', 'End-to-End Encrypted', '24/7 AI Support', 'No Data Sold'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle size={13} className="text-[#12A17C]" />{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Alert banner */}
      <div className="mx-6 md:mx-10 mb-8 p-4 bg-[#FBF3E4] border border-[#F2DFB6] rounded-2xl flex gap-3">
        <AlertCircle size={18} className="text-[#E8A13D] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#8A6414]">
          <strong>Medical Disclaimer:</strong> LifeGuard NeXus provides AI-generated health insights for informational purposes only. Always consult a qualified medical professional for diagnosis and treatment decisions.
        </p>
      </div>
    </div>
  );
}
