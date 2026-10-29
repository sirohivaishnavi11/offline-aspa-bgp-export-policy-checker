import { describe, it, expect } from 'vitest';
import { validateRoute } from './validator';
import type { RouteInput } from './types';

function makeInput(
  asPath: number[],
  originAS: number,
  neighborAS: number,
  relationship: RouteInput['relationship'],
): RouteInput {
  return { asPath, originAS, neighborAS, relationship };
}

describe('validateRoute — ASPA path validation', () => {
  it('passes when all ASPA transitions are authorized', () => {
    // AS_PATH: [64515, 64513, 64512] — left=most recent, right=origin
    // Pairs (customer, provider): (64512, 64513) and (64513, 64515)
    // 64512 lists 64513 as provider ✓, 64513 lists 64515 as provider ✓
    const report = validateRoute(
      makeInput([64515, 64513, 64512], 64512, 64520, 'customer'),
    );
    expect(report.result).toBe('PASS');
  });

  it('fails when an ASPA transition is not authorized', () => {
    // Pairs: (64512, 64516) — 64512 does NOT list 64516 as provider
    const report = validateRoute(
      makeInput([64516, 64512], 64512, 64517, 'provider'),
    );
    expect(report.result).toBe('FAIL');
    expect(report.steps.some((s) => s.status === 'FAIL')).toBe(true);
  });

  it('produces UNKNOWN when ASPA data is missing', () => {
    // Pairs: (65000, 64512) — 65000 has no ASPA record
    const report = validateRoute(
      makeInput([64512, 65000], 65000, 64513, 'customer'),
    );
    expect(report.result).toBe('UNKNOWN');
    expect(report.steps.some((s) => s.status === 'UNKNOWN')).toBe(true);
  });

  it('does not auto-pass single-AS paths — returns PASS but skips ASPA', () => {
    const report = validateRoute(
      makeInput([64512], 64512, 64513, 'customer'),
    );
    // Single-AS path: no ASPA transitions to check, export policy allows
    expect(report.result).toBe('PASS');
    expect(
      report.steps.some((s) => s.rule === 'ASPA Path Validation' && s.status === 'INFO'),
    ).toBe(true);
  });
});

describe('validateRoute — export policy checks', () => {
  it('allows export to customer regardless of path source', () => {
    const report = validateRoute(
      makeInput([64515, 64514, 64513], 64513, 64520, 'customer'),
    );
    expect(report.steps.find((s) => s.rule === 'Export-to-Customer (Gao-Rexford)')).toBeTruthy();
  });

  it('warns when exporting multi-hop route to provider', () => {
    // Multi-hop route exported to provider — needs review
    // ASPA path is valid, so WARNING comes from export policy
    const report = validateRoute(
      makeInput([64515, 64513, 64512], 64512, 64516, 'provider'),
    );
    expect(report.steps.some((s) => s.status === 'WARNING')).toBe(true);
  });
});

describe('validateRoute — result explanations', () => {
  it('always includes a summary string', () => {
    const report = validateRoute(
      makeInput([64512], 64512, 64513, 'customer'),
    );
    expect(report.summary).toBeTruthy();
    expect(report.summary.length).toBeGreaterThan(10);
  });

  it('includes step-by-step rules', () => {
    const report = validateRoute(
      makeInput([64515, 64513, 64512], 64512, 64517, 'provider'),
    );
    expect(report.steps.length).toBeGreaterThan(2);
    expect(report.steps.every((s) => s.rule.length > 0)).toBe(true);
    expect(report.steps.every((s) => s.detail.length > 0)).toBe(true);
  });
});

describe('validateRoute — FAIL takes precedence over UNKNOWN', () => {
  it('returns FAIL when both an invalid transition and missing data exist', () => {
    // Pairs: (65000, 64512) → 65000 no record (UNKNOWN),
    //        (64512, 64516) → 64516 not listed (FAIL)
    const report = validateRoute(
      makeInput([64516, 64512, 65000], 65000, 64513, 'customer'),
    );
    expect(report.result).toBe('FAIL');
  });
});
