'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartPulse, MessageCircle, Stethoscope, Image as ImageIcon, MapPin } from 'lucide-react';

const nav = [
  { href: '/', label: 'Home', icon: HeartPulse },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/triage', label: 'Triage', icon: Stethoscope },
  { href: '/image-analysis', label: 'Image Scan', icon: ImageIcon },
  { href: '/hospitals', label: 'Hospitals', icon: MapPin },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-ink-100 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 bg-ink-950 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
            <HeartPulse className="w-5 h-5 text-brand-400" strokeWidth={2.25} />
          </div>
          <div>
            <div className="font-display font-semibold text-ink-900 leading-tight text-[15px]">LifeGuard Nexus</div>
            <div className="text-[10px] text-ink-400 leading-tight tracking-wide">by CJP Healthtech</div>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-1 bg-ink-50/80 rounded-full p-1 border border-ink-100">
          {nav.slice(1).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-white text-ink-900 shadow-soft'
                    : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.25} /> {label}
              </Link>
            );
          })}
        </div>
        <Link href="/triage" className="hidden md:inline-flex btn-accent !px-4 !py-2 text-[13px]">
          Start triage
        </Link>
      </div>
    </nav>
  );
}
