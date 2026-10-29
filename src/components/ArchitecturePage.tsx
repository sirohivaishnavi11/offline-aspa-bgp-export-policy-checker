import {
  Network,
  ShieldCheck,
  Layers,
  Database,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

export function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Architecture</h2>
        <p className="mt-1 text-sm text-slate-500">
          How ExportGuard is structured — from user input to validated result.
        </p>
      </div>

      {/* Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-900">System Flow</h3>

        <div className="space-y-4">
          {/* Layer 1: Input */}
          <ArchBox
            icon={Network}
            title="Route Input"
            subtitle="User enters AS_PATH, origin AS, neighbor AS, relationship"
            color="border-blue-200 bg-blue-50"
          />
          <Arrow />

          {/* Layer 2: Two parallel checks */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ArchBox
              icon={ShieldCheck}
              title="Export Policy Check"
              subtitle="Gao-Rexford valley-free rules: is this route allowed to be exported to this neighbor?"
              color="border-green-200 bg-green-50"
            />
            <ArchBox
              icon={Layers}
              title="ASPA Path Validation"
              subtitle="Walks each AS_PATH pair. Looks up ASPA record for the customer AS."
              color="border-indigo-200 bg-indigo-50"
            />
          </div>
          <Arrow />

          {/* Layer 3: ASPA Database */}
          <ArchBox
            icon={Database}
            title="Sample ASPA Registry"
            subtitle="Offline, hand-curated sample data (labelled). Returns: authorized / not authorized / not found."
            color="border-slate-300 bg-slate-50"
          />
          <Arrow />

          {/* Layer 4: Result combination */}
          <ArchBox
            icon={FileCheck}
            title="Result Combination & Explanation"
              subtitle="Combines export-policy + ASPA results. Produces PASS / FAIL / WARNING / UNKNOWN with plain-language explanation."
            color="border-slate-900 bg-slate-900 text-white"
          />
          <Arrow />

          {/* Layer 5: Output */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ArchBox
              icon={FileCheck}
              title="Validation Report"
              subtitle="Step-by-step breakdown shown in the UI"
              color="border-slate-200 bg-white"
            />
            <ArchBox
              icon={FileCheck}
              title="History & CSV Export"
              subtitle="Saved to localStorage, downloadable as CSV"
              color="border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Module separation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          Logic / UI Separation
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Validation logic lives entirely in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">src/lib/</code>,
          completely decoupled from the React UI. This makes the engine testable
          in isolation and easy to swap out for a production backend.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ModuleCard
            name="types.ts"
            desc="Shared TypeScript types — RouteInput, ValidationReport, AspaRecord, etc."
          />
          <ModuleCard
            name="aspaData.ts"
            desc="Sample ASPA registry and lookup function."
          />
          <ModuleCard
            name="validator.ts"
            desc="Core engine — export-policy check + ASPA path validation + result combination."
          />
          <ModuleCard
            name="samples.ts"
            desc="Pre-built test cases for valid, invalid, and unknown routes."
          />
          <ModuleCard
            name="history.ts"
            desc="localStorage persistence for validation history."
          />
          <ModuleCard
            name="csv.ts"
            desc="CSV generation and download utilities."
          />
        </div>
      </div>
    </div>
  );
}

function ArchBox({
  icon: Icon,
  title,
  subtitle,
  color,
}: {
  icon: typeof Network;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-6 w-6 flex-shrink-0 opacity-70" />
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center">
      <ArrowRight className="h-5 w-5 rotate-90 text-slate-300" />
    </div>
  );
}

function ModuleCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <code className="text-xs font-mono font-semibold text-slate-800">
        {name}
      </code>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{desc}</p>
    </div>
  );
}
