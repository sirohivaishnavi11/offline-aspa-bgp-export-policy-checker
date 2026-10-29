import { useMemo, useState } from 'react';
import type {
  HistoryEntry,
  Relationship,
  RouteInput,
  ValidationReport,
} from '@/lib/types';
import { validateRoute } from '@/lib/validator';
import { ValidationReportView } from './ValidationReportView';
import { SAMPLE_CASES } from '@/lib/samples';
import { Beaker, Play, RotateCcw } from 'lucide-react';

const RELATIONSHIPS: Array<{ value: Relationship; label: string }> = [
  { value: 'customer', label: 'Customer' },
  { value: 'peer', label: 'Peer' },
  { value: 'provider', label: 'Provider' },
  { value: 'unknown', label: 'Unknown' },
];

function parseAsPath(raw: string): number[] | null {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const asns = tokens.map(Number);
  if (asns.some((n) => !Number.isInteger(n) || n <= 0)) return null;
  return asns;
}

interface RouteCheckerProps {
  onValidate: (report: ValidationReport) => void;
  initialSampleId?: string | null;
}

export function RouteChecker({ onValidate, initialSampleId }: RouteCheckerProps) {
  const initialSample = initialSampleId
    ? SAMPLE_CASES.find((s) => s.id === initialSampleId)
    : undefined;

  const [asPath, setAsPath] = useState(
    initialSample ? initialSample.input.asPath.join(' ') : '64512',
  );
  const [originAS, setOriginAS] = useState(
    initialSample ? String(initialSample.input.originAS) : '64512',
  );
  const [neighborAS, setNeighborAS] = useState(
    initialSample ? String(initialSample.input.neighborAS) : '64513',
  );
  const [relationship, setRelationship] = useState<Relationship>(
    initialSample ? initialSample.input.relationship : 'customer',
  );
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);

  const handleValidate = () => {
    const parsedPath = parseAsPath(asPath);
    if (!parsedPath) {
      setError('AS_PATH must contain one or more positive integer AS numbers separated by spaces.');
      setReport(null);
      return;
    }
    const origin = Number(originAS);
    const neighbor = Number(neighborAS);
    if (!Number.isInteger(origin) || origin <= 0) {
      setError('Origin AS must be a positive integer.');
      setReport(null);
      return;
    }
    if (!Number.isInteger(neighbor) || neighbor <= 0) {
      setError('Neighbor AS must be a positive integer.');
      setReport(null);
      return;
    }
    if (!parsedPath.includes(origin)) {
      setError('Origin AS must appear somewhere in the AS_PATH.');
      setReport(null);
      return;
    }

    setError(null);
    const input: RouteInput = {
      asPath: parsedPath,
      originAS: origin,
      neighborAS: neighbor,
      relationship,
    };
    const rpt = validateRoute(input);
    setReport(rpt);
    onValidate(rpt);
  };

  const loadSample = (caseId: string) => {
    const sample = SAMPLE_CASES.find((s) => s.id === caseId);
    if (!sample) return;
    setAsPath(sample.input.asPath.join(' '));
    setOriginAS(String(sample.input.originAS));
    setNeighborAS(String(sample.input.neighborAS));
    setRelationship(sample.input.relationship);
    setError(null);
    setReport(null);
  };

  const reset = () => {
    setAsPath('64512');
    setOriginAS('64512');
    setNeighborAS('64513');
    setRelationship('customer');
    setError(null);
    setReport(null);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">BGP Route Checker</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the route details below. ExportGuard runs a BGP export-policy
          check and an ASPA-based path validation, then explains each result in
          plain language.
        </p>
      </div>

      {/* Sample cases */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Beaker className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">
            Load a sample test case
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_CASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => loadSample(sc.id)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              {sc.title}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          All sample data is clearly labelled demonstration data — not real RPKI/ASPA records.
        </p>
      </div>

      {/* Input form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              AS_PATH <span className="text-slate-400">(space-separated, left = origin)</span>
            </label>
            <input
              className={inputClass}
              value={asPath}
              onChange={(e) => setAsPath(e.target.value)}
              placeholder="e.g. 64515 64514 64513"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Origin AS
            </label>
            <input
              className={inputClass}
              value={originAS}
              onChange={(e) => setOriginAS(e.target.value)}
              placeholder="e.g. 64512"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Neighbor AS <span className="text-slate-400">(export target)</span>
            </label>
            <input
              className={inputClass}
              value={neighborAS}
              onChange={(e) => setNeighborAS(e.target.value)}
              placeholder="e.g. 64513"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Relationship to Neighbor
            </label>
            <select
              className={inputClass}
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as Relationship)}
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleValidate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            Validate Route
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Report */}
      {report && <ValidationReportView report={report} />}
    </div>
  );
}

export type { HistoryEntry };
