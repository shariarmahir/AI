import { AlertOctagon, PhoneCall } from 'lucide-react';

export default function EmergencyAlert({ message }: { message?: string }) {
  return (
    <div className="relative bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 overflow-hidden">
      <div className="relative flex-shrink-0">
        <span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring" />
        <div className="relative w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
          <AlertOctagon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <div className="font-semibold text-red-900 mb-1">Possible emergency</div>
        <p className="text-sm text-red-800/90 mb-3 leading-relaxed">
          {message || 'Your symptoms may require immediate medical attention.'}
        </p>
        <a
          href="tel:999"
          className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-soft"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call 999 now
        </a>
      </div>
    </div>
  );
}
