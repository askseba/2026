import type { ScoredPerfume } from '@/lib/matching'
import { getMatchStatus } from '@/lib/matching'

export interface SafetyCheckResult {
  canPurchase: boolean
  warningLevel: 'safe' | 'caution' | 'critical'
  /**
   * P1 #12: Now returns an i18n message key instead of hardcoded Arabic text.
   * Consumers should translate via t(messageKey).
   *
   * Backward compatibility: existing UI that displays `message` directly
   * will show the key string (e.g. "results.safety.message.critical")
   * which is acceptable as a temporary state until P1 components are updated.
   */
  messageKey: string
  reason?: string
}

/**
 * Determines whether purchase links can be shown for the perfume.
 * Rule: Safety above all else.
 *
 * P0 #1.1: Handles isSafe === undefined (enrichment failed).
 * P0 #1.2: Fixed Rule 3 — isSafe === false alone blocks purchase,
 *          regardless of ifraWarnings.
 */
export function canShowPurchaseLinks(perfume: ScoredPerfume): SafetyCheckResult {
  // Rule 0 (NEW): Enrichment failed — unknown safety = block purchase
  if (perfume.enrichmentFailed === true || perfume.isSafe === undefined) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      messageKey: 'results.safety.message.enrichmentFailed',
      reason: 'enrichmentFailed'
    }
  }

  // Rule 1: Critical danger (Safety Score = 0)
  if (perfume.safetyScore === 0) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      messageKey: 'results.safety.message.critical',
      reason: 'safetyScorezero'
    }
  }

  // Rule 2: Potential symptoms for the user
  if (perfume.symptomTriggers && perfume.symptomTriggers.length > 0) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      messageKey: 'results.safety.message.symptomTrigger',
      reason: 'symptomtriggers'
    }
  }

  // Rule 3 (FIXED P0 #1.2): isSafe === false blocks purchase
  // regardless of ifraWarnings presence
  if (perfume.isSafe === false) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      messageKey: 'results.safety.message.ifraUnsafe',
      reason: 'ifracritical'
    }
  }

  // Rule 4: Caution (Safety < 50)
  if (perfume.safetyScore < 50) {
    return {
      canPurchase: true,
      warningLevel: 'caution',
      messageKey: 'results.safety.message.caution',
      reason: 'lowsafety'
    }
  }

  // Rule 5: Safe
  return {
    canPurchase: true,
    warningLevel: 'safe',
    messageKey: 'results.safety.message.safe'
  }
}

/**
 * Determines perfume status taking safety into account.
 * Overrides normal classification if the perfume is dangerous.
 *
 * P0 #1.3 (FIXED): Reads matchStatus directly from ScoredPerfume
 * (now computed in matching.ts), with a local fallback via getMatchStatus.
 * No more type assertion on a non-existent property.
 */
export function getMatchStatusWithSafety(
  perfume: ScoredPerfume
): 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe' {
  const safetyCheck = canShowPurchaseLinks(perfume)

  if (!safetyCheck.canPurchase) {
    return 'unsafe'
  }

  // P0 #1.3: matchStatus is now a real field on ScoredPerfume.
  // Fallback: derive from finalScore if somehow missing.
  if (perfume.matchStatus) {
    return perfume.matchStatus
  }

  // Defensive fallback — should not happen after P0 changes
  return getMatchStatus(perfume.finalScore).status
}
