import type { HistoryEntry, ValidationResult } from '@/lib/types';
import { ResultBadge } from './ResultBadge';
import { SAMPLE_CASES } from '@/lib/samples';
import {
  ShieldCheck,
  Network,
  FileCheck,
  Beaker,
  Layers,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface DashboardProps {
  history: HistoryEntry[];
  onNavigate: (page: string) => void;
  onLoadSample: (caseId: string) => void;
}

export function Dashboard({ history, onNavigate, onLoadSample }: DashboardProps) {
  const stats = useMemoStats(history);

  const statCards = [
    {
      label: 'Total Validations',
      value: stats.total,
      icon: FileCheck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Passed',
      value: stats.pass,
      icon: ShieldCheck,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Failed',
      value: stats.fail,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Needs Review',
      value: stats.unknown + stats.warning,
      icon: HelpCircle,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-lg sm:p-10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-2.5 backdrop-blur">
            <ShieldCheck className="h-7 w-7 text-blue-300" />
          </div>
          <span className="text-sm font-medium uppercase tracking-wider text-blue-200">
            PS-031 · Offline ASPA-based BGP Export Policy Checker
          </span>
        </div>
        <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
          ExportGuard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
          An offline tool that checks BGP export policies and validates AS_PATHs
          against ASPA records. Every result is explained in plain language, with
          clear distinction between export-policy checks and ASPA-based path
          validation. Missing ASPA data always produces UNKNOWN — never an
          automatic pass.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('checker')}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
          >
            <Network className="h-4 w-4" />
            Check a Route
          </button>
          <button
            onClick={() => onNavigate('aspa')}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Layers className="h-4 w-4" />
            View ASPA Data
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {card.label}
                </span>
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Feature overview */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FeatureCard
          icon={FileCheck}
          title="Export Policy Check"
          desc="Validates whether a route can be exported to a customer, peer, or provider based on Gao-Rexford valley-free routing rules."
        />
        <FeatureCard
          icon={Layers}
          title="ASPA Path Validation"
          desc="Walks each AS_PATH transition and checks it against sample ASPA records. Missing data yields UNKNOWN, not a pass."
        />
        <FeatureCard
          icon={Beaker}
          title="Sample Test Cases"
          desc="Pre-loaded scenarios for valid, invalid, and unknown routes to demonstrate every result type."
        />
      </div>

      {/* Sample test cases */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Beaker className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">Sample Test Cases</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_CASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onLoadSample(sc.id)}
              className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900">
                  {sc.title}
                </span>
                <ResultBadge result={sc.expected} />
              </div>
              <p className="text-sm leading-relaxed text-slate-500">
                {sc.description}
              </p>
              <p className="mt-3 font-mono text-xs text-slate-400">
                AS_PATH: {sc.input.asPath.join(' → ')}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {history.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Activity</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <ResultBadge result={entry.result} />
                <span className="flex-1 font-mono text-sm text-slate-600">
                  {entry.input.asPath.join(' → ')}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof FileCheck;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 rounded-lg bg-slate-100 p-2.5">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}

function useMemoStats(history: HistoryEntry[]) {
  const total = history.length;
  const pass = history.filter((h) => h.result === 'PASS').length;
  const fail = history.filter((h) => h.result === 'FAIL').length;
  const warning = history.filter((h) => h.result === 'WARNING').length;
  const unknown = history.filter((h) => h.result === 'UNKNOWN').length;
  return { total, pass, fail, warning, unknown };
}

export type { ValidationResult };
