import type { ValidationResult } from '@/lib/types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Info } from 'lucide-react';

export function ResultBadge({ result }: { result: ValidationResult | 'INFO' }) {
  const config: Record<
    string,
    { className: string; icon: typeof CheckCircle2; label: string }
  > = {
    PASS: {
      className: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle2,
      label: 'PASS',
    },
    FAIL: {
      className: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      label: 'FAIL',
    },
    WARNING: {
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      label: 'WARNING',
    },
    UNKNOWN: {
      className: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: HelpCircle,
      label: 'UNKNOWN',
    },
    INFO: {
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info,
      label: 'INFO',
    },
  };

  const c = config[result] || config.INFO;
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${c.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {c.label}
    </span>
  );
}
