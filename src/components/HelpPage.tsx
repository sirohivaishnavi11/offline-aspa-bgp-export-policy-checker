import {
  HelpCircle,
  Network,
  Layers,
  ShieldCheck,
  AlertTriangle,
  HelpCircle as UnknownIcon,
  FileDown,
  Clock,
} from 'lucide-react';

export function HelpPage() {
  const faqs = [
    {
      q: 'What is ASPA?',
      a: 'ASPA stands for Autonomous System Provider Authorization. It is an RPKI-based mechanism where an AS (customer) cryptographically signs a list of ASNs it authorizes as its providers. When validating a BGP route, each adjacent pair in the AS_PATH is checked: the left AS must have an ASPA record authorizing the right AS as a provider.',
    },
    {
      q: 'What is BGP export policy?',
      a: 'BGP export policy determines which routes an AS announces to each neighbor. The valley-free (Gao-Rexford) model says: routes learned from customers can be exported to customers, peers, and providers; routes learned from peers can be exported to customers only; routes learned from providers can be exported to customers only. This prevents "valleys" in the path.',
    },
    {
      q: 'Why are export-policy checks and ASPA path validation separate?',
      a: 'Export policy checks whether the local AS is allowed to announce a route to a given neighbor based on commercial relationships. ASPA path validation checks whether the AS_PATH itself is structurally valid — each transition is authorized by an ASPA record. They are complementary but independent: a route can pass one and fail the other.',
    },
    {
      q: 'Why does missing ASPA data produce UNKNOWN instead of PASS?',
      a: 'In ASPA validation, absence of evidence is not evidence of absence. If an AS has no ASPA record, we simply cannot verify its provider relationships. Automatically passing such routes would defeat the purpose of ASPA — they are flagged as UNKNOWN / needs review so a human can investigate.',
    },
    {
      q: 'Is this RFC-compliant?',
      a: 'No. ExportGuard implements a simplified, offline demonstrator based on the ASPA concept and Gao-Rexford export rules. It does NOT claim full compliance with any RFC. See the Limitations page for details.',
    },
    {
      q: 'Is the ASPA data real?',
      a: 'No. All ASPA records are hand-curated sample data using private documentation ASNs (64512–64521 per RFC 5398). They are clearly labelled as sample data throughout the app.',
    },
  ];

  const resultTypes = [
    {
      icon: ShieldCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      label: 'PASS',
      desc: 'The export policy is satisfied and all applicable ASPA transitions are authorized.',
    },
    {
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      label: 'FAIL',
      desc: 'An ASPA transition is not authorized, or the export policy explicitly disallows the announcement.',
    },
    {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      label: 'WARNING',
      desc: 'The route may be acceptable, but the export policy check could not fully confirm the learning relationship. Manual review is recommended.',
    },
    {
      icon: UnknownIcon,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      label: 'UNKNOWN',
      desc: 'ASPA data is missing for at least one AS in the path. The route cannot be fully validated and needs review.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-slate-400" />
          <h2 className="text-2xl font-bold text-slate-900">Help & Documentation</h2>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Everything you need to understand and use ExportGuard.
        </p>
      </div>

      {/* Result types */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900">Result Types</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {resultTypes.map((rt) => {
            const Icon = rt.icon;
            return (
              <div
                key={rt.label}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className={`rounded-lg p-3 ${rt.bg}`}>
                  <Icon className={`h-6 w-6 ${rt.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{rt.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {rt.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">How It Works</h3>
        <div className="space-y-4">
          <Step
            icon={Network}
            title="1. Enter Route Details"
            desc="Provide the AS_PATH, origin AS, neighbor AS (export target), and the commercial relationship with the neighbor."
          />
          <Step
            icon={ShieldCheck}
            title="2. Export Policy Check"
            desc="ExportGuard checks whether announcing this route to the neighbor is allowed under Gao-Rexford valley-free routing rules."
          />
          <Step
            icon={Layers}
            title="3. ASPA Path Validation"
            desc="Each adjacent AS pair in the AS_PATH is checked against the ASPA registry. Authorized transitions pass; unauthorized ones fail; missing data yields UNKNOWN."
          />
          <Step
            icon={FileDown}
            title="4. Review & Export"
            desc="Read the plain-language explanation, see which rule caused the result, then download a CSV report from the History page."
          />
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900">FAQ</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-slate-200 bg-white shadow-sm [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between p-5 text-sm font-semibold text-slate-800">
                {faq.q}
                <span className="ml-4 text-slate-400 transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h4 className="text-sm font-bold text-blue-900">Quick Tip</h4>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-blue-800">
          Start by loading a sample test case on the Route Checker page. Each
          case demonstrates a different result type (PASS, FAIL, WARNING, or
          UNKNOWN). Then try entering your own routes to see how the validation
          engine explains its reasoning step by step.
        </p>
      </div>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Network;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 rounded-lg bg-slate-100 p-2.5">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
