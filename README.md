# ExportGuard

### Offline ASPA-based BGP Export Policy Checker — Hackathon PS-031

ExportGuard is a web application that checks BGP export policies and validates
AS_PATHs against ASPA (Autonomous System Provider Authorization) records. It
runs entirely offline using clearly-labelled sample data, explains every
result in plain language, and keeps the validation logic separate from the UI.

---

## Features

- **Professional dashboard** with project overview and live statistics
  (total validations, pass/fail/unknown counts).
- **BGP Route Checker** with inputs for AS_PATH, origin AS, neighbor AS, and
  relationship type (customer / peer / provider / unknown).
- **ASPA data viewer** displaying the sample ASPA registry in a searchable
  table, clearly labelled as demonstration data.
- **Export policy validation** producing PASS, FAIL, WARNING, and UNKNOWN
  results — each explained in simple language with the specific rule that
  caused it.
- **Sample test cases** for valid, invalid, and unknown routes, loadable with
  one click.
- **Validation history** persisted in the browser (localStorage) with
  **CSV report download**.
- **Responsive navigation** (desktop horizontal menu + mobile hamburger).
- **Help section** with FAQ, result-type explanations, and a how-it-work guide.
- **Architecture diagram** showing the system flow and module separation.
- **Limitations page** with an honest assessment of what the tool does and
  does not do.
- **Automated tests** (Vitest) for the validation engine.

## Two Distinct Checks

ExportGuard deliberately separates two kinds of validation:

1. **BGP Export Policy Check** — based on the commercial relationship between
   the local AS and the neighbor, using Gao-Rexford valley-free routing rules:
   - Routes learned from customers may be exported to customers, peers, and providers.
   - Routes learned from peers may be exported to customers only.
   - Routes learned from providers may be exported to customers only.

2. **ASPA-Based Path Validation** — walks each adjacent pair in the AS_PATH
   and checks whether the customer AS has an ASPA record authorizing the next
   AS as a provider. Missing ASPA data produces UNKNOWN — never an automatic
   pass.

These are reported as separate steps in the validation report so the user can
see exactly which rule caused the result.

## Important Design Decisions

- **No RFC compliance claim.** ExportGuard is a simplified, offline demonstrator.
  It does not implement the full ASPA verification procedure from any RFC or
  draft. See the Limitations page.
- **Missing ASPA data → UNKNOWN.** Absence of evidence is not evidence of
  absence. Routes with missing ASPA records are flagged for review.
- **All data is labelled sample data.** The ASPA registry uses private
  documentation ASNs (64512–64521, RFC 5398).
- **Validation logic is separate from the UI.** The engine lives in
  `src/lib/validator.ts` and is unit-tested in isolation.

## Project Structure

```
src/
  lib/
    types.ts          # Shared TypeScript types
    aspaData.ts       # Sample ASPA registry + lookup
    validator.ts      # Core validation engine (export policy + ASPA)
    samples.ts        # Pre-built sample test cases
    history.ts        # localStorage persistence
    csv.ts            # CSV generation + download
    validator.test.ts # Vitest unit tests
  components/
    Dashboard.tsx           # Overview + statistics + sample cases
    RouteChecker.tsx        # Input form + validation report
    AspaDataViewer.tsx      # ASPA registry table
    HistoryPage.tsx         # Validation history + CSV download
    HelpPage.tsx            # FAQ + result explanations
    ArchitecturePage.tsx    # System flow diagram
    LimitationsPage.tsx     # Honest limitations assessment
    ValidationReportView.tsx # Step-by-step result display
    ResultBadge.tsx         # Reusable result badge component
  App.tsx              # Navigation + page routing
```

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (Vite's default port).
In the Bolt environment, the dev server starts automatically.

### Building for Production

```bash
npm run build
```

This produces a `dist/` directory with static files that can be served by any
web host (Vercel, Netlify, GitHub Pages, S3, etc.).

### Previewing the Production Build

```bash
npm run preview
```

## Testing

The validation engine has unit tests covering all four result types and edge
cases:

```bash
npx vitest run
```

Tests verify:
- Valid ASPA chains produce PASS
- Unauthorized ASPA transitions produce FAIL
- Missing ASPA data produces UNKNOWN (not PASS)
- Single-AS paths skip ASPA validation (no transitions to check)
- FAIL takes precedence over UNKNOWN when both occur
- Export policy warnings are surfaced correctly
- Every report includes a summary and step-by-step rules

## Deployment

ExportGuard is a static SPA built with Vite. To deploy:

1. Run `npm run build` to generate the `dist/` directory.
2. Upload the contents of `dist/` to any static hosting provider:
   - **Vercel:** Connect the repo, set the build command to `npm run build`
     and the output directory to `dist`.
   - **Netlify:** Same settings as Vercel.
   - **GitHub Pages:** Push `dist/` to a `gh-pages` branch.
   - **Any web server:** Copy `dist/` to your document root.

No server-side runtime is required — all validation happens in the browser.

## How to Record a Demo Video

1. Start the dev server (`npm run dev`).
2. Open the app in your browser at the displayed URL.
3. Walk through the following flow:
   - **Dashboard:** Show the overview, stats cards, and sample test cases.
   - **Route Checker:** Click a sample test case (e.g. "Invalid ASPA Chain"),
     then click "Validate Route". Walk through the step-by-step explanation.
   - Repeat with a different sample (e.g. "Unknown Route — Missing ASPA Data")
     to show the UNKNOWN result.
   - **ASPA Data:** Show the sample ASPA registry table and the "sample data"
     labels.
   - **History:** Show the saved validations, then click "Download CSV" to
     export a report.
   - **Help:** Scroll through the FAQ and result-type explanations.
   - **Architecture:** Show the flow diagram.
   - **Limitations:** Read through the honest limitations.
4. Use screen recording software (OBS, Loom, QuickTime, etc.) to capture the
   walkthrough.

## Tech Stack

- **React 18** + **TypeScript** — UI framework
- **Vite** — build tool and dev server
- **Tailwind CSS** — styling
- **Lucide React** — icons
- **Vitest** — unit testing
