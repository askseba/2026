// src/components/Step3Allergy.tsx
// FIX: Unified allergy red (#ef4444) for all levels (Level 1-3)
// LAYOUT: Compact cards for Level 2, full-width 5th card for Level 1
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
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
  const t = useTranslations('quiz.step3')
  const tCommon = useTranslations('common')
  const [currentLevel, setCurrentLevel] = useState(1)

  // Level 1: Symptoms (id redness per commit 01 — symptom-mappings.ts)
  const symptoms = [
    { id: 'sneeze', icon: '🤧', title: t('symptoms.sneeze'), desc: t('symptoms.sneezeDesc') },
    { id: 'redness', icon: '🔴', title: t('symptoms.redness'), desc: t('symptoms.rednessDesc') },
    { id: 'headache', icon: '🤕', title: t('symptoms.headache'), desc: t('symptoms.headacheDesc') },
    { id: 'nausea', icon: '😖', title: t('symptoms.nausea'), desc: t('symptoms.nauseaDesc') },
    { id: 'none', icon: '✅', title: t('symptoms.none'), desc: t('symptoms.noneDesc') }
  ]

  // Level 2: Fragrance Families
  const families = [
    { id: 'floral', icon: '🌸', name: t('families.floral'), examples: t('families.floralExamples') },
    { id: 'citrus', icon: '🍋', name: t('families.citrus'), examples: t('families.citrusExamples') },
    { id: 'woody', icon: '🌲', name: t('families.woody'), examples: t('families.woodyExamples') },
    { id: 'spicy', icon: '🌶️', name: t('families.spicy'), examples: t('families.spicyExamples') },
    { id: 'gourmand', icon: '🍰', name: t('families.gourmand'), examples: t('families.gourmandExamples') },
    { id: 'leather', icon: '🧥', name: t('families.leather'), examples: t('families.leatherExamples') }
  ]

  // Level 3: Ingredients (Tags/Chips)
  const ingredients = [
    { id: 'jasmine', name: t('ingredients.jasmine'), icon: '🌸' },
    { id: 'rose', name: t('ingredients.rose'), icon: '🌹' },
    { id: 'oud', name: t('ingredients.oud'), icon: '🌲' },
    { id: 'sandalwood', name: t('ingredients.sandalwood'), icon: '🌲' },
    { id: 'vanilla', name: t('ingredients.vanilla'), icon: '🍦' },
    { id: 'musk', name: t('ingredients.musk'), icon: '💫' },
    { id: 'amber', name: t('ingredients.amber'), icon: '🟡' },
    { id: 'patchouli', name: t('ingredients.patchouli'), icon: '🍃' },
    { id: 'lavender', name: t('ingredients.lavender'), icon: '💜' },
    { id: 'bergamot', name: t('ingredients.bergamot'), icon: '🍋' },
    { id: 'pepper', name: t('ingredients.pepper'), icon: '🌶️' },
    { id: 'leather', name: t('ingredients.leather'), icon: '🧥' }
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
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 1 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 2 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${currentLevel >= 3 ? 'bg-gauge-safe dark:bg-green-500' : 'bg-cream/50 dark:bg-surface-muted'}`} />
      </div>

      {/* Level 1: Symptoms */}
      {currentLevel === 1 && (
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-center">
            {t('level1Question')}
          </h2>
          {/* Desktop: 2×2 grid, last card (none) spans full width. Mobile: single column. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {symptoms.map(({ id, icon, title, desc }) => {
              // 'none' is the exception card — spans full width on desktop to separate it visually
              const isNone = id === 'none'
              return (
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
                    ${isNone ? 'md:col-span-2 justify-center' : ''}
                    px-5 py-4 md:py-5 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1
                    flex items-center
                    transition-all duration-300 text-right touch-manipulation
                    ${allergy.level1.includes(id)
                      ? 'bg-red-50 dark:bg-red-900/20 border-4 border-danger-red dark:border-red-500 shadow-2xl ring-2 ring-red-200 dark:ring-red-500/30'
                      : 'bg-white dark:bg-surface border-2 border-cream/50 dark:border-border-subtle hover:border-text-dark/30 dark:hover:border-amber-500 hover:bg-cream/50 dark:hover:bg-surface-muted'
                    }
                  `}
                  whileHover={{ scale: isNone ? 1.01 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isNone ? (
                    <div className="flex flex-row-reverse items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center text-3xl flex-shrink-0">{icon}</div>
                      <div>
                        <h3 className="font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-xl md:text-2xl mb-1 leading-tight">
                          {title}
                        </h3>
                        <p className="text-sm text-text-dark/70 dark:text-text-muted dark:text-slate-300">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 text-right">
                        <h3 className="font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-xl md:text-2xl mb-1 leading-tight">
                          {title}
                        </h3>
                        <p className="text-sm text-text-dark/70 dark:text-text-muted dark:text-slate-300">
                          {desc}
                        </p>
                      </div>
                      <div className="w-12 h-12 flex items-center justify-center text-3xl flex-shrink-0">{icon}</div>
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Level 2: Fragrance Families */}
      {currentLevel === 2 && (
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-center">
            {t('level2Question')}
          </h2>
          {/* Desktop: 3×2 compact grid. Mobile: single column. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
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
                  px-4 py-3 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1
                  flex flex-col items-center justify-center touch-manipulation
                  transition-all duration-300
                  ${allergy.level2.includes(id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-4 border-danger-red dark:border-red-500'
                    : 'bg-white dark:bg-surface border-2 border-cream/50 dark:border-border-subtle hover:border-text-dark/30 dark:hover:border-amber-500'
                  }
                `}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-lg md:text-xl">{name}</h3>
                <p className="text-xs text-text-dark/60 dark:text-text-muted dark:text-slate-300 mt-1">{examples}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Level 3: Ingredients (Tags/Chips) */}
      {currentLevel === 3 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-dark dark:text-text-primary dark:text-slate-100 text-center">
            {t('level3Question')}
          </h2>
          <p className="text-center text-text-dark/70 dark:text-text-muted mb-8">
            {t('level3Description')}
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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
      <div className="flex gap-3 justify-between pt-8">
        {/* Mobile: ghost text button. Desktop: outlined button */}
        <BackButton
          variant="button"
          onClick={onBack}
          label={tCommon('back')}
          ariaLabel={tCommon('backToPreviousStep')}
          className="flex-none min-h-[44px] min-w-[44px] px-6 py-3 rounded-2xl font-bold
            text-text-dark/70 dark:text-text-muted
            bg-transparent border-0
            md:bg-white md:border-2 md:border-cream/50
            dark:md:bg-surface md:dark:border-border-subtle"
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
          className="min-h-[44px] min-w-[44px] px-8 py-3
            bg-gradient-to-l from-gauge-safe to-emerald-600 dark:from-green-600 dark:to-emerald-700
            text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1
            disabled:opacity-50 disabled:cursor-not-allowed transition-all
            flex-1 md:flex-none
            flex items-center justify-center touch-manipulation"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin inline me-2" aria-hidden="true" /> : null}
          {currentLevel === 3 ? t('saveButton') : tCommon('next')}
          {currentLevel < 3 && !isPending && <ChevronLeft className="w-5 h-5 inline me-2 rtl:rotate-180" aria-hidden="true" />}
        </button>
      </div>

      {/* Level Indicator */}
      <div className="flex justify-center gap-3 text-sm text-text-dark/60 dark:text-text-muted">
        <span className={currentLevel === 1 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{t('level1Title')}</span>
        <span>→</span>
        <span className={currentLevel === 2 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{t('level2Title')}</span>
        <span>→</span>
        <span className={currentLevel === 3 ? 'font-bold text-text-dark dark:text-text-primary' : ''}>{t('level3Title')}</span>
      </div>
    </div>
  )
}
