import Link from 'next/link';
import { MessageCircle, Stethoscope, Image as ImageIcon, MapPin, Sparkles, ShieldCheck, Languages, ArrowRight, ChevronRight } from 'lucide-react';

const features = [
  {
    href: '/triage',
    icon: Stethoscope,
    title: 'AI Triage',
    desc: 'Describe symptoms — get the right specialty, urgency, and nearby hospitals in seconds.',
    badge: 'Most popular',
  },
  {
    href: '/chat',
    icon: MessageCircle,
    title: 'Ask LifeGuard Nexus',
    desc: "Bangla or English chat. Ask about symptoms, prescriptions, women's health.",
  },
  {
    href: '/image-analysis',
    icon: ImageIcon,
    title: 'Image Analysis',
    desc: 'Scan prescriptions, lab reports, or injury photos for structured insights.',
  },
  {
    href: '/hospitals',
    icon: MapPin,
    title: 'Hospital Finder',
    desc: 'Find specialist hospitals near you, ranked by rating and distance.',
  },
];

const trust = [
  {
    icon: ShieldCheck,
    title: 'Safety guardrails',
    desc: 'Emergency detection, confidence scores, doctor referral on every response.',
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Languages,
    title: 'Bangla-first',
    desc: 'Trained on 100 conditions common in Bangladesh, with multilingual embeddings.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Sparkles,
    title: 'RAG-grounded',
    desc: '1,000+ medical Q&As indexed, retrieved per query to keep answers accurate.',
    accent: 'text-violet-600 bg-violet-50',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center pt-6 pb-4 md:pt-14 animate-fade-up">
        <div className="eyebrow bg-brand-50 border border-brand-200/60 px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Claude Sonnet&nbsp;4.6 + RAG
        </div>
        <h1 className="text-[2.75rem] leading-[1.08] md:text-6xl font-bold text-ink-950 mb-5 text-balance">
          Clinical-grade guidance,<br className="hidden md:block" /> built for women in Bangladesh
        </h1>
        <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
          LifeGuard Nexus helps you understand symptoms, decode prescriptions,
          and find the right doctor — grounded in trusted medical knowledge, in Bangla or English.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/triage" className="btn-accent inline-flex items-center gap-2">
            Start triage <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/chat" className="btn-secondary">Ask a question</Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10 text-ink-400 text-xs">
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 1,000+ Q&As indexed</div>
          <div className="w-px h-3 bg-ink-200" />
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 100 conditions covered</div>
          <div className="w-px h-3 bg-ink-200 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Bangla + English</div>
        </div>
      </section>

      {/* Feature grid */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-semibold text-ink-900">Everything you need, in one place</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map(({ href, icon: Icon, title, desc, badge }) => (
            <Link
              key={href}
              href={href}
              className="card group hover:shadow-lift hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ink-950 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 transition-colors">
                  <Icon className="w-5.5 h-5.5 text-brand-400 group-hover:text-white transition-colors" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-ink-900">{title}</h3>
                    {badge && (
                      <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full font-medium tracking-wide">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="card-flat bg-ink-950 border-ink-900 !p-8 md:!p-10">
        <div className="grid md:grid-cols-3 gap-8">
          {trust.map(({ icon: Icon, title, desc, accent }) => (
            <div key={title} className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
                <Icon className="w-4.5 h-4.5" strokeWidth={2.25} />
              </div>
              <div>
                <div className="font-medium text-white text-sm mb-1">{title}</div>
                <div className="text-ink-400 text-sm leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
