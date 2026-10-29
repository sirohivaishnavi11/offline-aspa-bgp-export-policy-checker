import type { HistoryEntry, ValidationResult } from './types';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function historyToCSV(entries: HistoryEntry[]): string {
  const headers = [
    'ID',
    'Timestamp',
    'Result',
    'AS_PATH',
    'Origin AS',
    'Neighbor AS',
    'Relationship',
    'Summary',
  ];

  const rows = entries.map((e) =>
    [
      e.id,
      e.timestamp,
      e.result,
      e.input.asPath.join(' '),
      String(e.input.originAS),
      String(e.input.neighborAS),
      e.input.relationship,
      e.summary,
    ]
      .map(escapeCSV)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(entries: HistoryEntry[], filename: string): void {
  const csv = historyToCSV(entries);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function resultColor(result: ValidationResult): string {
  switch (result) {
    case 'PASS':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'FAIL':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'WARNING':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'UNKNOWN':
      return 'text-slate-700 bg-slate-100 border-slate-300';
    default:
      return 'text-gray-700 bg-gray-100 border-gray-300';
  }
}
