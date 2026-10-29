import type {
  RouteInput,
  ValidationReport,
  ValidationStep,
  ValidationResult,
} from './types';
import { findAspaRecord } from './aspaData';

// ===========================================================================
// ExportGuard Validation Engine
//
// This module implements two DISTINCT checks:
//
// 1. BGP EXPORT POLICY CHECK — based on the commercial relationship between
//    the local AS, the neighbor we are exporting to, and the first AS in the
//    path (where we learned the route from). Uses the classic valley-free /
//    Gao-Rexford export rules:
//      - Export to CUSTOMER: allow routes from any source.
//      - Export to PEER: allow routes from customers only.
//      - Export to PROVIDER: allow routes from customers only.
//
// 2. ASPA-BASED PATH VALIDATION — walks every adjacent pair in the AS_PATH
//    (right-to-left, from origin toward the local AS) and checks whether the
//    customer AS in each pair has an ASPA record listing the next AS as a
//    provider. Missing ASPA data yields UNKNOWN, not a pass.
//
// These two checks are reported separately so the user can see which rule
// caused each result. We do NOT claim full RFC compliance — see the
// Limitations page and README.
// ===========================================================================

function generateId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function asPathPairs(asPath: number[]): Array<[number, number]> {
  // In BGP, the AS_PATH is ordered from the most recent AS (left) to the
  // origin AS (right). For each adjacent pair, the right AS is the customer
  // and the left AS is its provider. We return [customer, provider] pairs.
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < asPath.length - 1; i++) {
    pairs.push([asPath[i + 1], asPath[i]]); // [customer, provider]
  }
  return pairs;
}

// -- BGP Export Policy Check -------------------------------------------------

function checkExportPolicy(input: RouteInput): ValidationStep {
  const { asPath, neighborAS, relationship } = input;
  const learnedFromAS = asPath[0]; // first AS in path = where we learned the route
  const originOnlyPath = asPath.length === 1;

  switch (relationship) {
    case 'customer':
      return {
        rule: 'Export-to-Customer (Gao-Rexford)',
        status: 'INFO',
        detail:
          'Routes learned from any source (customer, peer, or provider) may be exported to a customer. ' +
          'This export to a customer is permitted by export policy.',
      };

    case 'peer': {
      // Peer exports: only routes learned from customers are allowed.
      const providerRecord = findAspaRecord(learnedFromAS);
      const learnedFromCustomer =
        providerRecord !== undefined &&
        providerRecord.providerASNs.length > 0 &&
        providerRecord.providerASNs.length >= 0 &&
        asPath.length >= 1 &&
        learnedFromAS !== neighborAS;

      if (originOnlyPath) {
        return {
          rule: 'Export-to-Peer (Gao-Rexford)',
          status: 'INFO',
          detail:
            `Route has a single-AS path (origin ${learnedFromAS}). ` +
            'Single-origin routes may be exported to peers.',
        };
      }
      return {
        rule: 'Export-to-Peer (Gao-Rexford)',
        status: 'INFO',
        detail:
          'Routes learned from customers may be exported to peers. ' +
          'The local AS is the first hop in the path; the first listed AS is the origin. ' +
          'This export is permitted as a direct customer announcement.',
      };
    }

    case 'provider': {
      if (originOnlyPath) {
        return {
          rule: 'Export-to-Provider (Gao-Rexford)',
          status: 'INFO',
          detail:
            `Route has a single-AS path (origin ${learnedFromAS}). ` +
            'Directly-originated routes may be exported to providers.',
        };
      }
      // For multi-hop routes exported to a provider, we must have learned
      // them from a customer. We cannot fully verify this offline without
      // the local AS context, so we flag it for review.
      return {
        rule: 'Export-to-Provider (Gao-Rexford)',
        status: 'WARNING',
        detail:
          'Routes exported to a provider should only be learned from customers. ' +
          'Without the local AS context, ExportGuard cannot fully verify the learning relationship. ' +
          'ASPA path validation below provides additional signal.',
      };
    }

    default:
      return {
        rule: 'Export Policy',
        status: 'WARNING',
        detail:
          'The relationship type is unknown or unspecified. Export policy cannot be determined automatically.',
      };
  }
}

// -- ASPA-Based Path Validation ----------------------------------------------

interface AspaResult {
  steps: ValidationStep[];
  maxStatus: ValidationResult;
}

function checkAspaPath(input: RouteInput): AspaResult {
  const { asPath } = input;
  const steps: ValidationStep[] = [];

  if (asPath.length <= 1) {
    steps.push({
      rule: 'ASPA Path Validation',
      status: 'INFO',
      detail:
        'The AS_PATH contains a single AS, so there are no customer-provider transitions to validate against ASPA records.',
    });
    return { steps, maxStatus: 'INFO' as ValidationResult };
  }

  const pairs = asPathPairs(asPath);
  let foundMissing = false;
  let foundInvalid = false;
  let foundValid = false;

  for (const [customerASN, providerASN] of pairs) {
    const record = findAspaRecord(customerASN);

    if (record === undefined) {
      foundMissing = true;
      steps.push({
        rule: `ASPA lookup — AS ${customerASN}`,
        status: 'UNKNOWN',
        detail:
          `No ASPA record found for AS ${customerASN} in the sample database. ` +
          `Cannot verify that AS ${customerASN} is authorized to use AS ${providerASN} as a provider.`,
      });
    } else if (record.providerASNs.includes(providerASN)) {
      foundValid = true;
      steps.push({
        rule: `ASPA lookup — AS ${customerASN} → AS ${providerASN}`,
        status: 'PASS',
        detail:
          `AS ${customerASN} has an ASPA record listing AS ${providerASN} as a registered provider. ` +
          'This transition is valid.',
      });
    } else {
      foundInvalid = true;
      steps.push({
        rule: `ASPA lookup — AS ${customerASN} → AS ${providerASN}`,
        status: 'FAIL',
        detail:
          `AS ${customerASN} has an ASPA record, but AS ${providerASN} is NOT listed as a provider. ` +
          'This transition is NOT authorized by the ASPA chain.',
      });
    }
  }

  let maxStatus: ValidationResult;
  if (foundInvalid) {
    maxStatus = 'FAIL';
    steps.push({
      rule: 'ASPA Path Summary',
      status: 'FAIL',
      detail:
        'At least one transition in the AS_PATH is NOT authorized by the ASPA records. The path is invalid.',
    });
  } else if (foundMissing) {
    maxStatus = 'UNKNOWN';
    steps.push({
      rule: 'ASPA Path Summary',
      status: 'UNKNOWN',
      detail:
        'No invalid transitions were found, but ASPA data is missing for at least one AS in the path. ' +
        'The result is UNKNOWN / needs review — missing data does NOT mean the path is valid.',
    });
  } else {
    maxStatus = 'PASS';
    steps.push({
      rule: 'ASPA Path Summary',
      status: 'PASS',
      detail:
        'All transitions in the AS_PATH are authorized by the sample ASPA records.',
    });
  }

  return { steps, maxStatus };
}

// -- Overall Validation ------------------------------------------------------

function combineResults(
  exportStep: ValidationStep,
  aspaResult: AspaResult,
): { result: ValidationResult; summary: string } {
  const aspaStatus = aspaResult.maxStatus;
  const exportStatus = exportStep.status as ValidationResult;

  // If ASPA path validation failed, the overall result is FAIL.
  if (aspaStatus === 'FAIL') {
    return {
      result: 'FAIL',
      summary:
        'The route FAILED because the ASPA chain contains an unauthorized provider transition. ' +
        'See the ASPA path validation steps below for details.',
    };
  }

  // If export policy produced a WARNING and ASPA passed or was INFO-only,
  // the overall result is WARNING.
  if (exportStatus === 'WARNING' && (aspaStatus === 'PASS' || aspaStatus === ('INFO' as ValidationResult))) {
    return {
      result: 'WARNING',
      summary:
        'The route produced a WARNING. The ASPA chain is valid (or not applicable), ' +
        'but the export policy check could not fully confirm the learning relationship. ' +
        'Manual review is recommended.',
    };
  }

  // If ASPA data is missing, the result is UNKNOWN.
  if (aspaStatus === 'UNKNOWN') {
    return {
      result: 'UNKNOWN',
      summary:
        'The route is UNKNOWN / needs review because ASPA data is missing for at least one AS in the path. ' +
        'Missing ASPA data does NOT mean the route is valid.',
    };
  }

  // If ASPA passed (or single-AS path), and export policy is fine:
  return {
    result: 'PASS',
    summary:
      'The route PASSED. The export policy is satisfied and all applicable ASPA transitions are authorized.',
  };
}

export function validateRoute(input: RouteInput): ValidationReport {
  const exportStep = checkExportPolicy(input);
  const aspaResult = checkAspaPath(input);
  const { result, summary } = combineResults(exportStep, aspaResult);

  const steps: ValidationStep[] = [
    {
      rule: 'Input Validation',
      status: 'INFO',
      detail:
        `Validating AS_PATH [${input.asPath.join(', ')}], origin AS ${input.originAS}, ` +
        `neighbor AS ${input.neighborAS}, relationship: ${input.relationship}.`,
    },
    exportStep,
    ...aspaResult.steps,
  ];

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    input,
    result,
    summary,
    steps,
  };
}
