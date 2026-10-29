import type { AspaRecord } from './types';

// ---------------------------------------------------------------------------
// SAMPLE / OFFLINE ASPA DATA — clearly labelled demonstration data only.
// This is NOT real RPKI/ASPA data. It is hand-curated sample data used to
// demonstrate the validation logic offline. In production, ASPA records
// would be fetched live from an RPKI repository.
// ---------------------------------------------------------------------------

export const SAMPLE_ASPA_DATA: AspaRecord[] = [
  {
    customerASN: 64512,
    providerASNs: [64513, 64514],
    source: 'sample',
    note: 'Sample customer with two sample providers',
  },
  {
    customerASN: 64513,
    providerASNs: [64515],
    source: 'sample',
  },
  {
    customerASN: 64514,
    providerASNs: [64515, 64516],
    source: 'sample',
  },
  {
    customerASN: 64515,
    providerASNs: [64517],
    source: 'sample',
  },
  {
    customerASN: 64516,
    providerASNs: [64517],
    source: 'sample',
  },
  {
    customerASN: 64517,
    providerASNs: [],
    source: 'sample',
    note: 'Top-tier sample AS — no upstream providers',
  },
  {
    customerASN: 64520,
    providerASNs: [64521],
    source: 'sample',
  },
  {
    customerASN: 64521,
    providerASNs: [64517],
    source: 'sample',
  },
];

export function findAspaRecord(asn: number): AspaRecord | undefined {
  return SAMPLE_ASPA_DATA.find((r) => r.customerASN === asn);
}
