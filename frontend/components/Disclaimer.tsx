import { ShieldAlert } from 'lucide-react';

export default function Disclaimer() {
  return (
    <div className="bg-ink-950 px-4 py-2 text-[12px] text-ink-200 flex items-center justify-center gap-2 text-center">
      <ShieldAlert className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
      <p>
        <span className="font-semibold text-white">LifeGuard Nexus</span> provides health information, not medical diagnosis.
        Emergency? Call <span className="font-semibold text-white">999</span>.
      </p>
    </div>
  );
}
