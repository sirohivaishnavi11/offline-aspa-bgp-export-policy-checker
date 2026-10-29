import type { HistoryEntry } from '@/lib/types';
import { ResultBadge } from './ResultBadge';
import { downloadCSV } from '@/lib/csv';
import { clearHistory as clearStorageHistory } from '@/lib/history';
import { Download, Trash2, History as HistoryIcon } from 'lucide-react';

interface HistoryPageProps {
  history: HistoryEntry[];
  onClear: () => void;
}

export function HistoryPage({ history, onClear }: HistoryPageProps) {
  const handleDownload = () => {
    if (history.length === 0) return;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadCSV(history, `exportguard-history-${ts}.csv`);
  };

  const handleClear = () => {
    clearStorageHistory();
    onClear();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Validation History</h2>
          <p className="mt-1 text-sm text-slate-500">
            All validations from this session are saved locally in your browser.
            Download a CSV report for your records.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={history.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
          <button
            onClick={handleClear}
            disabled={history.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16">
          <HistoryIcon className="h-10 w-10 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">
            No validations yet. Run a route check to start building your history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <ResultBadge result={entry.result} />
                  <span className="font-mono text-sm text-slate-700">
                    AS_PATH: {entry.input.asPath.join(' → ')}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {entry.summary}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>Origin: {entry.input.originAS}</span>
                <span>Neighbor: {entry.input.neighborAS}</span>
                <span>Relationship: {entry.input.relationship}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
