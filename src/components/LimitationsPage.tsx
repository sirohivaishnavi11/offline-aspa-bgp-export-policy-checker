import { AlertTriangle, XCircle, Info } from 'lucide-react';

export function LimitationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Limitations</h2>
        <p className="mt-1 text-sm text-slate-500">
          An honest assessment of what ExportGuard does and does not do.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              Not RFC-compliant
            </p>
            <p className="mt-1 text-sm leading-relaxed text-amber-800">
              ExportGuard is a simplified, offline demonstrator. It does NOT
              implement the full ASPA verification procedure specified in
              draft-ietf-sidrops-aspa-verification or any RFC. We do not claim
              RFC compliance. The validation logic is a pedagogical
              approximation of the real algorithm.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LimitationCard
          icon={XCircle}
          title="Sample Data Only"
          items={[
            'All ASPA records are hand-curated sample data, not real RPKI records.',
            'AS numbers use the private documentation range (64512–64521, RFC 5398).',
            'No live RPKI repository is queried.',
          ]}
        />
        <LimitationCard
          icon={XCircle}
          title="Simplified Export Policy"
          items={[
            'The Gao-Rexford check is a simplified approximation, not full BGP policy grammar.',
            'Local AS context (which AS we are) is not modelled — the local AS is assumed to be the last hop in the path.',
            'Route learning source (customer vs. peer vs. provider) is inferred, not definitively known.',
          ]}
        />
        <LimitationCard
          icon={XCircle}
          title="No Cryptographic Verification"
          items={[
            'ASPA records are stored as plain data, not cryptographically signed objects.',
            'No RPKI validation, no ROA/RSC checks.',
            'No signature verification or trust chain validation.',
          ]}
        />
        <LimitationCard
          icon={XCircle}
          title="Path Preprocessing Not Supported"
          items={[
            'AS_PATH prepending (repeated ASNs) is not normalized.',
            'AS_SET and AS_CONFED_SEQUENCE are not handled.',
            'Route aggregation effects are not modelled.',
          ]}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900">
            What ExportGuard Does Well
          </h3>
        </div>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Clearly separates BGP export-policy checks from ASPA-based path validation.
          </li>
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Missing ASPA data always produces UNKNOWN, never an automatic pass.
          </li>
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Explains every result in plain language with the specific rule that caused it.
          </li>
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Labels all demonstration data as sample data throughout the app.
          </li>
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Keeps validation logic separate from the UI, with automated tests.
          </li>
          <li className="flex gap-2">
            <span className="text-green-600">✓</span>
            Provides CSV export and persistent validation history.
          </li>
        </ul>
      </div>
    </div>
  );
}

function LimitationCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof XCircle;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-red-400" />
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-500">
            <span className="text-slate-300">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
