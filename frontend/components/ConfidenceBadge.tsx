import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface Props {
  confidence: 'high' | 'medium' | 'low';
  score?: number;
}

const CONFIG = {
  high: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', Icon: ShieldCheck, label: 'High confidence' },
  medium: { color: 'bg-amber-50 text-amber-700 border-amber-200/70', Icon: Shield, label: 'Moderate confidence' },
  low: { color: 'bg-rose-50 text-rose-700 border-rose-200/70', Icon: ShieldAlert, label: 'Low confidence' },
} as const;

function normalize(confidence: unknown): keyof typeof CONFIG {
  if (confidence === 'high' || confidence === 'medium' || confidence === 'low') return confidence;
  if (typeof confidence === 'number') {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }
  return 'medium';
}

export default function ConfidenceBadge({ confidence, score }: Props) {
  const config = CONFIG[normalize(confidence)];
  const { Icon } = config;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
      {config.label}
      {typeof score === 'number' && <span className="opacity-60">({Math.round(score * 100)}%)</span>}
    </span>
  );
}
