import { useEffect, useState } from 'react';
import type { HistoryEntry, ValidationReport } from '@/lib/types';
import { loadHistory, addHistory, clearHistory } from '@/lib/history';
import { SAMPLE_CASES } from '@/lib/samples';
import { Dashboard } from '@/components/Dashboard';
import { RouteChecker } from '@/components/RouteChecker';
import { AspaDataViewer } from '@/components/AspaDataViewer';
import { HistoryPage } from '@/components/HistoryPage';
import { HelpPage } from '@/components/HelpPage';
import { ArchitecturePage } from '@/components/ArchitecturePage';
import { LimitationsPage } from '@/components/LimitationsPage';
import { ShieldCheck, Menu, X } from 'lucide-react';

type Page =
  | 'dashboard'
  | 'checker'
  | 'aspa'
  | 'history'
  | 'help'
  | 'architecture'
  | 'limitations';

const NAV_ITEMS: Array<{ id: Page; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'checker', label: 'Route Checker' },
  { id: 'aspa', label: 'ASPA Data' },
  { id: 'history', label: 'History' },
  { id: 'help', label: 'Help' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'limitations', label: 'Limitations' },
];

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingSample, setPendingSample] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleValidate = (report: ValidationReport) => {
    setHistory((prev) => addHistory(prev, report));
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleLoadSample = (caseId: string) => {
    setPendingSample(caseId);
    setPage('checker');
    setMobileOpen(false);
  };

  const navigate = (target: string) => {
    setPage(target as Page);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => navigate('dashboard')}
            className="flex items-center gap-2.5"
          >
            <div className="rounded-lg bg-slate-900 p-2">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-slate-900">
                ExportGuard
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-400">
                PS-031
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  page === item.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`block w-full rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    page === item.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {page === 'dashboard' && (
          <Dashboard
            history={history}
            onNavigate={navigate}
            onLoadSample={handleLoadSample}
          />
        )}
        {page === 'checker' && (
          <RouteChecker
            key={pendingSample || 'default'}
            onValidate={handleValidate}
            initialSampleId={pendingSample}
          />
        )}
        {page === 'aspa' && <AspaDataViewer />}
        {page === 'history' && (
          <HistoryPage history={history} onClear={handleClearHistory} />
        )}
        {page === 'help' && <HelpPage />}
        {page === 'architecture' && <ArchitecturePage />}
        {page === 'limitations' && <LimitationsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
            <span>
              ExportGuard · Offline ASPA-based BGP Export Policy Checker · PS-031
            </span>
            <span>
              Sample data only — not RFC-compliant — for demonstration purposes
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
