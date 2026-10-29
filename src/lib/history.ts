import type { HistoryEntry } from './types';

const STORAGE_KEY = 'exportguard_history_v1';
const MAX_ENTRIES = 100;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    const trimmed = entries.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage may be full or unavailable — silently ignore
  }
}

export function addHistory(
  existing: HistoryEntry[],
  report: HistoryEntry,
): HistoryEntry[] {
  const updated = [report, ...existing].slice(0, MAX_ENTRIES);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
