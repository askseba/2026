// Safety Warnings Component
// Displays IFRA safety information and warnings for perfumes

import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import type { UnifiedPerfume } from '@/types/unified-perfume'
import logger from '@/lib/logger'

interface SafetyWarningsProps {
  perfume: UnifiedPerfume
  ifraScore?: number
  warnings?: string[]
  className?: string
}

export function SafetyWarnings({ perfume, ifraScore, warnings = [], className = '' }: SafetyWarningsProps) {
  // Validate perfume object
  if (!perfume || typeof perfume !== 'object') {
    logger.error('Invalid perfume object passed to SafetyWarnings')
    return null
  }

  // Determine safety level based on score
  const getSafetyLevel = (score: number = 0) => {
    if (score >= 80) return { level: 'safe', color: 'green', icon: CheckCircle, label: 'آمن', labelEn: 'Safe' }
    if (score >= 60) return { level: 'warning', color: 'yellow', icon: Info, label: 'آمن بشكل عام', labelEn: 'Generally Safe' }
    if (score >= 40) return { level: 'caution', color: 'orange', icon: AlertTriangle, label: 'استخدم بحذر', labelEn: 'Use with Caution' }
    return { level: 'danger', color: 'red', icon: XCircle, label: 'غير موصى به', labelEn: 'Not Recommended' }
  }

  const safety = getSafetyLevel(ifraScore)
  const Icon = safety.icon

  // Color schemes
  const colorSchemes = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600'
    }
  }

  const colors = colorSchemes[safety.color as keyof typeof colorSchemes]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Safety Score Card */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                {safety.label}
              </h3>
              {ifraScore !== undefined && (
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {ifraScore}/100
                </span>
              )}
            </div>
            
            {/* Score Description */}
            <p className={`text-sm ${colors.text} opacity-90`}>
              {safety.level === 'safe' && 'هذا العطر آمن للاستخدام ولا يحتوي على مواد محسسة بتركيز عالٍ'}
              {safety.level === 'warning' && 'يحتوي على بعض المواد المحسسة بتركيز منخفض - آمن للأغلبية'}
              {safety.level === 'caution' && 'يحتوي على مواد محسسة - يُنصح بإجراء اختبار رقعة الجلد'}
              {safety.level === 'danger' && 'يحتوي على مواد محسسة بتركيز عالٍ - غير موصى به للبشرة الحساسة'}
            </p>

            {/* Progress Bar */}
            {ifraScore !== undefined && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      safety.level === 'safe' ? 'bg-green-600' :
                      safety.level === 'warning' ? 'bg-yellow-600' :
                      safety.level === 'caution' ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, ifraScore))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings List */}
      {warnings && warnings.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 mb-2">تحذيرات</h4>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Triggers */}
      {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-800 mb-2">قد يسبب الأعراض التالية:</h4>
              <div className="flex flex-wrap gap-2">
                {perfume.symptomTriggers.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IFRA Info */}
      {perfume.source === 'fragella' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>معلومة IFRA:</strong> تم تحليل هذا العطر باستخدام قاعدة بيانات 
                IFRA (الاتحاد الدولي لجمعية العطور) لتحديد المواد المحسسة المحتملة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients Info */}
      {perfume.ingredients && perfume.ingredients.length > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-3">المكونات المحتملة ({perfume.ingredients.length})</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {perfume.ingredients.slice(0, 20).map((ingredient, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-xs"
              >
                {ingredient}
              </span>
            ))}
            {perfume.ingredients.length > 20 && (
              <span className="px-3 py-1 text-gray-500 text-xs">
                +{perfume.ingredients.length - 20} أخرى
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            ℹ️ المكونات مُستخرجة من النوتات العطرية وقد لا تكون شاملة
          </p>
        </div>
      )}
    </div>
  )
}

// Safety Warnings Component
// Displays IFRA safety information and warnings for perfumes

import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import type { UnifiedPerfume } from '@/types/unified-perfume'
import logger from '@/lib/logger'

interface SafetyWarningsProps {
  perfume: UnifiedPerfume
  ifraScore?: number
  warnings?: string[]
  className?: string
}

export function SafetyWarnings({ perfume, ifraScore, warnings = [], className = '' }: SafetyWarningsProps) {
  // Validate perfume object
  if (!perfume || typeof perfume !== 'object') {
    logger.error('Invalid perfume object passed to SafetyWarnings')
    return null
  }

  // Determine safety level based on score
  const getSafetyLevel = (score: number = 0) => {
    if (score >= 80) return { level: 'safe', color: 'green', icon: CheckCircle, label: 'آمن', labelEn: 'Safe' }
    if (score >= 60) return { level: 'warning', color: 'yellow', icon: Info, label: 'آمن بشكل عام', labelEn: 'Generally Safe' }
    if (score >= 40) return { level: 'caution', color: 'orange', icon: AlertTriangle, label: 'استخدم بحذر', labelEn: 'Use with Caution' }
    return { level: 'danger', color: 'red', icon: XCircle, label: 'غير موصى به', labelEn: 'Not Recommended' }
  }

  const safety = getSafetyLevel(ifraScore)
  const Icon = safety.icon

  // Color schemes
  const colorSchemes = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600'
    }
  }

  const colors = colorSchemes[safety.color as keyof typeof colorSchemes]

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Safety Score Card */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-xl p-4`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                {safety.label}
              </h3>
              {ifraScore !== undefined && (
                <span className={`text-2xl font-bold ${colors.text}`}>
                  {ifraScore}/100
                </span>
              )}
            </div>
            
            {/* Score Description */}
            <p className={`text-sm ${colors.text} opacity-90`}>
              {safety.level === 'safe' && 'هذا العطر آمن للاستخدام ولا يحتوي على مواد محسسة بتركيز عالٍ'}
              {safety.level === 'warning' && 'يحتوي على بعض المواد المحسسة بتركيز منخفض - آمن للأغلبية'}
              {safety.level === 'caution' && 'يحتوي على مواد محسسة - يُنصح بإجراء اختبار رقعة الجلد'}
              {safety.level === 'danger' && 'يحتوي على مواد محسسة بتركيز عالٍ - غير موصى به للبشرة الحساسة'}
            </p>

            {/* Progress Bar */}
            {ifraScore !== undefined && (
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      safety.level === 'safe' ? 'bg-green-600' :
                      safety.level === 'warning' ? 'bg-yellow-600' :
                      safety.level === 'caution' ? 'bg-orange-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, ifraScore))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings List */}
      {warnings && warnings.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-amber-800 mb-2">تحذيرات</h4>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Triggers */}
      {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-red-800 mb-2">قد يسبب الأعراض التالية:</h4>
              <div className="flex flex-wrap gap-2">
                {perfume.symptomTriggers.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IFRA Info */}
      {perfume.source === 'fragella' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>معلومة IFRA:</strong> تم تحليل هذا العطر باستخدام قاعدة بيانات 
                IFRA (الاتحاد الدولي لجمعية العطور) لتحديد المواد المحسسة المحتملة.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients Info */}
      {perfume.ingredients && perfume.ingredients.length > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-3">المكونات المحتملة ({perfume.ingredients.length})</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {perfume.ingredients.slice(0, 20).map((ingredient, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-xs"
              >
                {ingredient}
              </span>
            ))}
            {perfume.ingredients.length > 20 && (
              <span className="px-3 py-1 text-gray-500 text-xs">
                +{perfume.ingredients.length - 20} أخرى
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            ℹ️ المكونات مُستخرجة من النوتات العطرية وقد لا تكون شاملة
          </p>
        </div>
      )}
    </div>
  )
}

