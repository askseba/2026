// src/components/Step3Allergy.tsx
// FIX: Unified allergy red (#ef4444) for all levels (Level 1-3)
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import content from '@/content'
import { BackButton } from '@/components/ui/BackButton'

interface AllergyData {
  level1: string[]
  level2: string[]
  level3: string[]
}

interface AllergyProps {
  allergy: AllergyData
  updateAllergy: (allergy: AllergyData) => void
  onNext: () => void
  onBack: () => void
  isPending?: boolean
}

export type Step3AllergyProps = AllergyProps

export function Step3Allergy({ allergy, updateAllergy, onNext, onBack, isPending }: AllergyProps) {
  const t = useTranslations('common')
  const [currentLevel, setCurrentLevel] = useState(1)

  // Level 1: Symptoms
  const symptoms = [
    { id: 'sneeze', icon: '🤧', title: 'عطاس أو احتقان', desc: 'عطور قوية تسبب لي عطاس' },
    { id: 'rash', icon: '🔴', title: 'احمرار أو حكة', desc: 'بشرتي تتحسس من بعض المكونات' },
    { id: 'headache', icon: '🤕', title: 'صداع أو دوخة', desc: 'روائح معينة تصيبني بالصداع' },
    { id: 'nausea', icon: '😖', title: 'غثيان أو ضيق تنفس', desc: 'عطور ثقيلة تضايقني' },
    { id: 'none', icon: '✅', title: 'لا أعاني من شيء', desc: 'أنا بخير تماماً' }
  ]

  // Level 2: Fragrance Families
  const families = [
    { id: 'floral', icon: '🌸', name: 'زهرية', examples: 'ياسمين، ورد' },
    { id: 'citrus', icon: '🍋', name: 'حمضية', examples: 'ليمون، برتقال' },
    { id: 'woody', icon: '🪵', name: 'خشبية', examples: 'عود، صندل' },
    { id: 'spicy', icon: '🌶️', name: 'حارة', examples: 'قرفة، فلفل' },
    { id: 'gourmand', icon: '🍰', name: 'حلوة', examples: 'فانيليا، كراميل' },
    { id: 'leather', icon: '🧥', name: 'جلدية', examples: 'جلد، تبغ' }
  ]

  // Level 3: Ingredients (Tags/Chips)
  const ingredients = [
    { id: 'jasmine', name: 'ياسمين', icon: '🌸' },
    { id: 'rose', name: 'ورد', icon: '🌹' },
    { id: 'oud', name: 'عود', icon: '🪵' },
    { id: 'sandalwood', name: 'صندل', icon: '🪵' },
    { id: 'vanilla', name: 'فانيليا', icon: '🍦' },
    { id: 'musk', name: 'مسك', icon: '💫' },
    { id: 'amber', name: 'عنبر', icon: '🟡' },
    { id: 'patchouli', name: 'باتشولي', icon: '🍃' },
    { id: 'lavender', name: 'لافندر', icon: '💜' },
    { id: 'bergamot', name: 'برغموت', icon: '🍋' },
    { id: 'pepper', name: 'فلفل', icon: '🌶️' },
    { id: 'leather', name: 'جلد', icon: '🧥' }
  ]

  const toggleSymptom = (id: string) => {
    const newLevel1 = allergy.level1.includes(id)
      ? allergy.level1.filter(s => s !== id)
      : id === 'none' 
        ? ['none']
        : [...allergy.level1.filter(s => s !== 'none'), id]
    
    updateAllergy({
      ...allergy,
      level1: newLevel1
    })
  }

  const toggleFamily = (id: string) => {
    updateAllergy({
      ...allergy,
      level2: allergy.level2.includes(id)
        ? allergy.level2.filter(f => f !== id)
        : [...allergy.level2, id]
    })
  }

  const toggleIngredient = (id: string) => {
    updateAllergy({
      ...allergy,
      level3: allergy.level3.includes(id)
        ? allergy.level3.filter(i => i !== id)
        : [...allergy.level3, id]
    })
  }

  // Allow proceeding with empty selections (skip allergies) so user can go straight to results
  const canNext = true

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 1 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 2 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 3 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
      </div>

      {/* Level 1: Symptoms */}
      {currentLevel === 1 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-center">
            {content.quiz.step3.level1Question}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {symptoms.map(({ id, icon, title, desc }) => (
              <motion.button
                key={id}
                onClick={() => toggleSymptom(id)}
                role="checkbox"
                aria-checked={allergy.level1.includes(id) ? "true" : "false"}
                aria-label={`${title} ${allergy.level1.includes(id) ? 'مُحدد' : 'غير محدد'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSymptom(id)
                  }
                }}
                className={`
                  p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2
                  transition-all duration-300 min-h-[120px] text-right touch-manipulation
                  ${allergy.level1.includes(id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-4 border-danger-red dark:border-red-500 shadow-2xl ring-2 ring-red-200 dark:ring-red-500/30'
                    : 'bg-white dark:bg-surface border-2 border-cream/50 dark:border-border-subtle hover:border-text-dark/30 dark:hover:border-amber-500 hover:bg-cream/50 dark:hover:bg-surface-muted'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-xl md:text-2xl mb-2 leading-tight">{title}</h3>
                <p className="text-sm text-text-dark/70 dark:text-text-muted dark:text-slate-300">{desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Level 2: Fragrance Families */}
      {currentLevel === 2 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-center">
            {content.quiz.step3.level2Question}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {families.map(({ id, icon, name, examples }) => (
              <motion.button
                key={id}
                onClick={() => toggleFamily(id)}
                role="checkbox"
                aria-checked={allergy.level2.includes(id) ? "true" : "false"}
                aria-label={`عائلة ${name} ${allergy.level2.includes(id) ? 'مُحددة' : 'غير محددة'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleFamily(id)
                  }
                }}
                className={`
                  p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2
                  aspect-square flex flex-col items-center justify-center touch-manipulation
                  ${allergy.level2.includes(id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-4 border-danger-red dark:border-red-500'
                    : 'bg-white dark:bg-surface border-2 border-cream/50 dark:border-border-subtle hover:border-text-dark/30 dark:hover:border-amber-500'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-xl md:text-2xl">{name}</h3>
                <p className="text-xs text-text-dark/60 dark:text-text-muted dark:text-slate-300 mt-1">{examples}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Ingredients (Tags/Chips) */}
      {currentLevel === 3 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary text-center">
            {content.quiz.step3.level3Question}
          </h2>
          <p className="text-center text-text-dark/70 dark:text-text-muted mb-8">
            {content.quiz.step3.level3Description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {ingredients.map(({ id, name, icon }) => (
              <motion.button
                key={id}
                onClick={() => toggleIngredient(id)}
                role="checkbox"
                aria-checked={allergy.level3.includes(id) ? "true" : "false"}
                aria-label={`مكون ${name} ${allergy.level3.includes(id) ? 'مُحدد' : 'غير محدد'}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleIngredient(id)
                  }
                }}
                className={`
                  min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 font-medium px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation
                  ${allergy.level3.includes(id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-2 border-danger-red dark:border-red-500 text-danger-red dark:text-red-400'
                    : 'bg-white dark:bg-surface border-2 border-cream/50 dark:border-border-subtle text-text-dark dark:text-text-primary hover:border-text-dark/30 dark:hover:border-amber-500'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xl">{icon}</span>
                <span>{name}</span>
                {allergy.level3.includes(id) && (
                  <span className="text-sm" aria-hidden="true">✓</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 justify-between pt-12">
        <BackButton
          variant="button"
          onClick={onBack}
          label={content.common.goBack}
          ariaLabel={t('backToPreviousStep')}
          className="flex-1 md:flex-none min-h-[44px] min-w-[44px] px-8 py-3 rounded-2xl font-bold"
        />
        <button
          onClick={() => {
            if (canNext && !isPending) {
              if (currentLevel < 3) {
                setCurrentLevel(currentLevel + 1)
              } else {
                onNext()
              }
            }
          }}
          disabled={!canNext || isPending}
          aria-label={currentLevel === 3 ? 'حفظ بصمة العطر' : 'الانتقال للخطوة التالية'}
          aria-disabled={!canNext || isPending}
          className="min-h-[44px] min-w-[44px] px-8 py-3 bg-gradient-to-l from-gauge-safe to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 md:flex-none flex items-center justify-center touch-manipulation"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin inline me-2" aria-hidden="true" /> : null}
          {currentLevel === 3 ? content.quiz.step3.saveButton : content.common.next}
          {currentLevel < 3 && !isPending && <ChevronLeft className="w-5 h-5 inline me-2 rtl:rotate-180" aria-hidden="true" />}
        </button>
      </div>

      {/* Level Indicator */}
      <div className="flex justify-center gap-3 text-sm text-text-dark/60 dark:text-text-muted">
        <span className={currentLevel === 1 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{content.quiz.step3.level1Title}</span>
        <span>→</span>
        <span className={currentLevel === 2 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{content.quiz.step3.level2Title}</span>
        <span>→</span>
        <span className={currentLevel === 3 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{content.quiz.step3.level3Title}</span>
      </div>
    </div>
  )
}
