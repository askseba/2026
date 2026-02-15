import type { ScoredPerfume } from '@/lib/matching'

export interface SafetyCheckResult {
  canPurchase: boolean
  warningLevel: 'safe' | 'caution' | 'critical'
  message: string
  reason?: string
}

/**
 * Determines whether purchase links can be shown for the perfume.
 * Rule: Safety above all else.
 */
export function canShowPurchaseLinks(perfume: ScoredPerfume): SafetyCheckResult {
  // Rule 1: Critical danger (Safety Score = 0)
  if (perfume.safetyScore === 0) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      message: '⚠️ لا نوصي بهذا العطر - يتعارض بشدة مع صحتك',
      reason: 'safetyScorezero'
    }
  }

  // Rule 2: Potential symptoms for the user
  if (perfume.symptomTriggers && perfume.symptomTriggers.length > 0) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      message: '🚨 هذا العطر قد يسبب لك أعراض صحية',
      reason: 'symptomtriggers'
    }
  }

  // Rule 3: IFRA critical (isSafe false AND ifraWarnings present)
  if (
    perfume.isSafe === false &&
    perfume.ifraWarnings &&
    perfume.ifraWarnings.length > 0
  ) {
    return {
      canPurchase: false,
      warningLevel: 'critical',
      message: '⚠️ يحتوي على مكونات محظورة حسب IFRA',
      reason: 'ifracritical'
    }
  }

  // Rule 4: Caution (Safety < 50)
  if (perfume.safetyScore < 50) {
    return {
      canPurchase: true,
      warningLevel: 'caution',
      message: '⚠️ يحتاج حذر - راجع تفاصيل الأمان',
      reason: 'lowsafety'
    }
  }

  // Rule 5: Safe
  return {
    canPurchase: true,
    warningLevel: 'safe',
    message: '✓ آمن للاستخدام'
  }
}

/**
 * Determines perfume status taking safety into account.
 * Overrides normal classification if the perfume is dangerous.
 */
export function getMatchStatusWithSafety(
  perfume: ScoredPerfume
): 'excellent' | 'good' | 'fair' | 'poor' | 'unsafe' {
  const safetyCheck = canShowPurchaseLinks(perfume)

  if (!safetyCheck.canPurchase) {
    return 'unsafe'
  }

  return (perfume as ScoredPerfume & { matchStatus: 'excellent' | 'good' | 'fair' | 'poor' }).matchStatus
}
