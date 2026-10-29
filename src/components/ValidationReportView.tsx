import type { ValidationReport, ValidationStep } from '@/lib/types';
import { ResultBadge } from './ResultBadge';
import { FileText, Globe } from 'lucide-react';

function StepRow({ step }: { step: ValidationStep }) {
  return (
    <div className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="mt-0.5 flex-shrink-0">
        <ResultBadge result={step.status} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{step.rule}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          {step.detail}
        </p>
      </div>
    </div>
  );
}

export function ValidationReportView({ report }: { report: ValidationReport }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">
              Validation Report
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <ResultBadge result={report.result} />
          <p className="text-sm text-slate-500">
            AS_PATH: <span className="font-mono font-medium text-slate-700">{report.input.asPath.join(' → ')}</span>
          </p>
        </div>
      </div>

      <div className="p-5">
        <div
          className={`mb-5 rounded-lg border p-4 ${
            report.result === 'PASS'
              ? 'border-green-200 bg-green-50'
              : report.result === 'FAIL'
                ? 'border-red-200 bg-red-50'
                : report.result === 'WARNING'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-slate-300 bg-slate-50'
          }`}
        >
          <p className="text-sm font-medium leading-relaxed text-slate-700">
            {report.summary}
          </p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Detailed Breakdown
          </span>
        </div>
        <div>
          {report.steps.map((step, i) => (
            <StepRow key={i} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}
