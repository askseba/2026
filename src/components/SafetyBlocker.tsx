'use client'

import { useTranslations, useLocale } from 'next-intl'
import type { ScoredPerfume } from '@/lib/matching'
import type { SafetyCheckResult } from '@/utils/safetyProtocol'

/**
 * Temporary symptom label lookup until symptomLabels.ts is created in P2.
 * Keys are English symptom names from the API; values are Arabic labels.
 * This will be replaced by a proper imported dictionary in P2 #22 (symptomLabels.ts).
 */
const SYMPTOM_LABELS_AR: Record<string, string> = {
  sneeze: 'عطس',
  headache: 'صداع',
  'skin rash': 'طفح جلدي',
  'runny nose': 'سيلان أنف',
  'watery eyes': 'دموع',
  nausea: 'غثيان',
  dizziness: 'دوخة',
  'breathing difficulty': 'صعوبة تنفس',
  itching: 'حكة',
  cough: 'سعال',
}

function translateSymptom(symptom: string, locale: string): string {
  if (locale === 'ar') {
    return SYMPTOM_LABELS_AR[symptom.toLowerCase()] ?? symptom
  }
  // English or unknown locale: return as-is (capitalized)
  return symptom.charAt(0).toUpperCase() + symptom.slice(1)
}

interface SafetyBlockerProps {
  perfume: ScoredPerfume
  safetyCheck: SafetyCheckResult
}

/**
 * P0 #1.7: All hardcoded Arabic text replaced with useTranslations.
 * P0 #13: symptomTriggers chips are translated via lookup.
 * P1 #29: Dark mode variants added to all colored backgrounds.
 */
export function SafetyBlocker({ perfume, safetyCheck }: SafetyBlockerProps) {
  const t = useTranslations('results.safetyBlocker')
  const locale = useLocale()
  const tSafety = useTranslations('results.safety.message')

  // Translate the messageKey from safetyProtocol
  const translatedMessage = (() => {
    // messageKey is like "results.safety.message.critical"
    // We extract the last segment to use with our namespaced translator
    const key = safetyCheck.messageKey
    const lastDot = key.lastIndexOf('.')
    const shortKey = lastDot >= 0 ? key.slice(lastDot + 1) : key
    try {
      return tSafety(shortKey)
    } catch {
      // Fallback: show the key itself (temporary until all i18n keys are added)
      return key
    }
  })()

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 dark:border-red-400 rounded-xl p-6 mt-4">
      <div className="flex items-start gap-4">
        <span className="text-4xl">🚨</span>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 dark:text-red-100 text-lg mb-2">
            {t('title')}
          </h3>

          <p className="text-red-800 dark:text-red-200 mb-4">{translatedMessage}</p>

          {/* Note when taste score is high */}
          {perfume.tasteScore > 80 && (
            <div className="bg-white/80 dark:bg-white/10 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>{t('highTasteNote', { score: String(perfume.tasteScore) })}</strong>{' '}
                <strong>{t('healthOverMatch')}</strong>{' '}
                {t('purchaseBlocked')}
              </p>
            </div>
          )}

          {/* Suggested actions */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
            <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
              {t('whatToDo')}
            </p>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{t('consultDoctor')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{t('findAlternatives')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>{t('requestSample')}</span>
              </li>
            </ul>
          </div>

          {/* Symptom triggers chips — P0 #13: translated */}
          {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">
                {t('possibleSymptoms')}
              </p>
              <div className="flex flex-wrap gap-2">
                {perfume.symptomTriggers.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-2 py-1 rounded-full"
                  >
                    {translateSymptom(symptom, locale)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
