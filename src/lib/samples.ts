import type { SampleCase } from './types';

// Sample test cases demonstrating valid, invalid, and unknown routes.
// All data is SAMPLE data for demonstration purposes only.
export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'valid-customer-export',
    title: 'Valid Customer Route Export',
    description:
      'AS 64512 announces its own route to a customer. The AS_PATH contains only the origin, which is allowed for customer exports.',
    expected: 'PASS',
    input: {
      asPath: [64512],
      originAS: 64512,
      neighborAS: 64513,
      relationship: 'customer',
    },
  },
  {
    id: 'valid-provider-import-export-peer',
    title: 'Valid Route Exported to Peer',
    description:
      'A route learned from a customer is exported to a peer. The AS_PATH transitions are all authorized by ASPA records: 64512 authorizes 64513, and 64513 authorizes 64515.',
    expected: 'PASS',
    input: {
      asPath: [64515, 64513, 64512],
      originAS: 64512,
      neighborAS: 64520,
      relationship: 'peer',
    },
  },
  {
    id: 'invalid-export-to-provider-learned-from-peer',
    title: 'Invalid Export to Provider — Route Learned from Peer',
    description:
      'A route is being exported to a provider. The ASPA chain is checked and the transition from AS 64513 to AS 64520 is not authorized (64520 is not a registered provider of 64513). The route fails ASPA path validation.',
    expected: 'FAIL',
    input: {
      asPath: [64520, 64513],
      originAS: 64513,
      neighborAS: 64515,
      relationship: 'provider',
    },
  },
  {
    id: 'invalid-aspa-break',
    title: 'Invalid ASPA Chain — Unregistered Provider',
    description:
      'The AS_PATH contains a transition from AS 64513 to AS 64516, but AS 64513\u2019s ASPA record does not list 64516 as a provider, so the ASPA chain is broken.',
    expected: 'FAIL',
    input: {
      asPath: [64516, 64513, 64512],
      originAS: 64512,
      neighborAS: 64517,
      relationship: 'provider',
    },
  },
  {
    id: 'unknown-missing-aspa',
    title: 'Unknown Route — Missing ASPA Data',
    description:
      'AS 65000 has no ASPA record in the sample database, so path validation cannot be completed. The result is UNKNOWN / needs review, not a PASS.',
    expected: 'UNKNOWN',
    input: {
      asPath: [64512, 65000],
      originAS: 65000,
      neighborAS: 64513,
      relationship: 'customer',
    },
  },
  {
    id: 'warning-multi-hop-to-provider',
    title: 'Warning — Multi-Hop Route Exported to Provider',
    description:
      'A multi-hop route is exported to a provider. The ASPA chain is valid, but export policy cannot fully confirm the learning relationship without the local AS context. Manual review is recommended.',
    expected: 'WARNING',
    input: {
      asPath: [64515, 64513, 64512],
      originAS: 64512,
      neighborAS: 64517,
      relationship: 'provider',
    },
  },
];
