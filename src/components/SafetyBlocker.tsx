import type { ScoredPerfume } from '@/lib/matching'
import type { SafetyCheckResult } from '@/utils/safetyProtocol'

interface SafetyBlockerProps {
  perfume: ScoredPerfume
  safetyCheck: SafetyCheckResult
}

export function SafetyBlocker({ perfume, safetyCheck }: SafetyBlockerProps) {
  return (
    <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mt-4">
      <div className="flex items-start gap-4">
        <span className="text-4xl">🚨</span>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 text-lg mb-2">
            تحذير صحي مهم
          </h3>

          <p className="text-red-800 mb-4">{safetyCheck.message}</p>

          {/* Note when taste score is high */}
          {perfume.tasteScore > 80 && (
            <div className="bg-white/80 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-900">
                <strong>ملاحظة:</strong> نعلم أن هذا العطر يتوافق مع ذوقك (
                {perfume.tasteScore}%)، لكن <strong>صحتك أهم من التطابق</strong>.
                لذلك قمنا بحجب روابط الشراء لحمايتك.
              </p>
            </div>
          )}

          {/* Suggested actions */}
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="font-semibold text-red-900 mb-2">
              ماذا يمكنك أن تفعل؟
            </p>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>استشر طبيب الحساسية قبل استخدام أي عطر</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  ابحث عن عطور بديلة بنفس النوتات العطرية (لكن آمنة)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  اطلب عينة صغيرة للاختبار على جزء صغير من البشرة
                </span>
              </li>
            </ul>
          </div>

          {/* Symptom triggers chips */}
          {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-red-900 mb-1">
                الأعراض المحتملة:
              </p>
              <div className="flex flex-wrap gap-2">
                {perfume.symptomTriggers.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                  >
                    {symptom}
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
