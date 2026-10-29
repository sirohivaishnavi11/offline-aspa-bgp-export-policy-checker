import { SAMPLE_ASPA_DATA } from '@/lib/aspaData';
import { Database, AlertCircle } from 'lucide-react';

export function AspaDataViewer() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">ASPA Data Viewer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Browse the sample ASPA (Autonomous System Provider Authorization)
          records used for offline path validation.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            Sample / demonstration data
          </p>
          <p className="mt-1 text-sm leading-relaxed text-amber-700">
            These records are hand-curated sample data, NOT real RPKI ASPA
            records. In production, ASPA records would be fetched live from the
            RPKI repository. The AS numbers (64512–64521 range) are private
            documentation ASNs per RFC 5398.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <Database className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Sample ASPA Registry
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-5 py-3 font-semibold text-slate-600">
                  Customer AS
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600">
                  Authorized Provider ASNs
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600">
                  Source
                </th>
                <th className="px-5 py-3 font-semibold text-slate-600">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ASPA_DATA.map((record) => (
                <tr
                  key={record.customerASN}
                  className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-mono font-medium text-slate-800">
                    {record.customerASN}
                  </td>
                  <td className="px-5 py-3">
                    {record.providerASNs.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {record.providerASNs.map((asn) => (
                          <span
                            key={asn}
                            className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700"
                          >
                            {asn}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">— (no providers)</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {record.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {record.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700">
          How ASPA Records Work
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          An ASPA record says: <em>Customer AS X authorizes Provider AS Y to
          appear immediately after X in the AS_PATH</em>. When validating a
          route, ExportGuard walks each adjacent pair in the AS_PATH and looks up
          the ASPA record for the customer (left-hand) AS. If the next AS in the
          path is listed as a provider, the transition is valid. If the ASPA
          record exists but the provider is not listed, the transition is
          invalid. If no ASPA record exists at all, the result is UNKNOWN —
          missing data never counts as a pass.
        </p>
      </div>
    </div>
  );
}
