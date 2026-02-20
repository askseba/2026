"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/classnames"
import type { ScoredPerfume } from "@/lib/matching"
import { getGradientForFamilies, generateGradientStyle } from "@/utils/scentGradients"
import { NoteTile } from "@/components/ui/NoteTile"
import { FamilyBadgeGroup } from "@/components/ui/FamilyBadgeGroup"

const PYRAMID_CHIP_CLASSES = {
  amber: "bg-amber-50/90 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  rose: "bg-rose-50/90 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  stone: "bg-stone-100/90 dark:bg-stone-500/20 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-500/30",
} as const

type PyramidColorClass = keyof typeof PYRAMID_CHIP_CLASSES

interface PyramidSectionProps {
  title: string
  hint: string
  notes: string[]
  icon: React.ReactNode
  colorClass: PyramidColorClass
  locale: string
}

function PyramidSection({ title, hint, notes, icon, colorClass, locale }: PyramidSectionProps) {
  if (notes.length === 0) return null
  
  return (
    <div className="mb-4 rounded-xl border border-white/60 dark:border-white/20 bg-white/80 dark:bg-black/40 backdrop-blur-xl p-4 shadow-lg">
      <p className="text-xs font-bold text-text-muted dark:text-text-muted mb-1 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <p className="text-xs text-text-muted dark:text-text-muted mb-2 opacity-90">{hint}</p>
      {/* P1 #33: Responsive grid — 3 cols on 375px, 4 on sm+ */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {notes.map((note, i) => (
          <NoteTile key={i} noteName={note} size="md" locale={locale as "ar" | "en"} />
        ))}
      </div>
    </div>
  )
}

interface IngredientsSheetProps {
  perfume: ScoredPerfume
  onClose: () => void
  locale?: string
}

export function IngredientsSheet({ perfume, onClose, locale = "ar" }: IngredientsSheetProps) {
  const t = useTranslations("results.ingredients")
  const [imageError, setImageError] = useState(false)
  const isRtl = locale === "ar"
  const sheetRef = useRef<HTMLDivElement>(null)

  // P1 #21: Memoize gradient style
  const gradientStyle = useMemo(
    () => generateGradientStyle(getGradientForFamilies(perfume.families ?? [])),
    [perfume.families]
  )

  // P1 #35: Escape key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // P1 #34: Focus trap
  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return

    const focusableElements = sheet.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstEl = focusableElements[0]
    const lastEl = focusableElements[focusableElements.length - 1]

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl?.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl?.focus()
        }
      }
    }

    sheet.addEventListener("keydown", trapFocus)
    firstEl?.focus()
    return () => sheet.removeEventListener("keydown", trapFocus)
  }, [])

  // P0 #1.4: Optional chaining on families
  const hasFamilies = (perfume.families?.length ?? 0) > 0
  const hasIngredients = (perfume.ingredients?.length ?? 0) > 0
  const hasPyramid = perfume.scentPyramid != null

  // P1 #39: Empty state check
  const isEmpty = !hasPyramid && !hasIngredients && !hasFamilies

  return (
    <AnimatePresence>
      {/* P1 (#1.10 pattern): No lg:hidden — sheet is available on all viewports */}
      <div className="fixed inset-0 z-50" dir={isRtl ? "rtl" : "ltr"}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          ref={sheetRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-x-0 bottom-0 top-auto max-h-[85vh] bg-white dark:bg-surface-elevated rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-border dark:bg-border-subtle rounded-full" />
          </div>

          {/* Header: mesh gradient + glassmorphism */}
          <div className="relative border-b border-primary/10 dark:border-border-subtle overflow-hidden sticky top-0 z-10 flex-shrink-0">
            {/* Animated mesh gradient background */}
            <div
              className="absolute inset-0"
              style={gradientStyle}
              aria-hidden="true"
            />
            
            {/* Content */}
            <div className="relative z-10 px-6 pb-4 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-white/90 dark:text-white/90 mb-3 drop-shadow-sm">
                {t("sheetTitle")}
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/20 flex-shrink-0 shadow-lg">
                  <Image
                    src={imageError || !perfume.image ? "/placeholder-perfume.svg" : perfume.image}
                    alt={perfume.name}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">
                    {perfume.name}
                  </h2>
                  <p className="text-xs text-white/80 drop-shadow-sm">{perfume.brand}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
                  aria-label={t("close")}
                >
                  <X className="w-6 h-6 text-white drop-shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* P1 #39: Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <span className="text-4xl mb-4">🧪</span>
                <p className="text-sm text-text-muted dark:text-text-muted text-center">
                  {t("emptyState")}
                </p>
              </div>
            )}

            {/* Scent Pyramid section */}
            {hasPyramid && perfume.scentPyramid && (
              <motion.div
                className="px-6 py-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.1
                    }
                  }
                }}
              >
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("pyramid.title")}
                </h3>

                {perfume.scentPyramid.top?.length > 0 && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <PyramidSection
                      title={t("pyramid.top")}
                      hint={t("pyramid.topHint")}
                      notes={perfume.scentPyramid.top}
                      icon={<span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                      colorClass="amber"
                      locale={locale}
                    />
                  </motion.div>
                )}

                {perfume.scentPyramid.heart?.length > 0 && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <PyramidSection
                      title={t("pyramid.heart")}
                      hint={t("pyramid.heartHint")}
                      notes={perfume.scentPyramid.heart}
                      icon={<span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />}
                      colorClass="rose"
                      locale={locale}
                    />
                  </motion.div>
                )}

                {perfume.scentPyramid.base?.length > 0 && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                  >
                    <PyramidSection
                      title={t("pyramid.base")}
                      hint={t("pyramid.baseHint")}
                      notes={perfume.scentPyramid.base}
                      icon={<span className="w-2 h-2 rounded-full bg-stone-500 flex-shrink-0" />}
                      colorClass="stone"
                      locale={locale}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Ingredients chips section */}
            {hasIngredients && (
              <div className={cn("px-6 py-4", hasPyramid && "border-t border-primary/5 dark:border-border-subtle")}>
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("ingredientsTitle")}
                </h3>
                {/* P1 #33: Responsive grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {perfume.ingredients.map((ing, i) => (
                    <NoteTile key={i} noteName={ing} size="md" locale={locale as "ar" | "en"} />
                  ))}
                </div>
              </div>
            )}

            {/* Families */}
            {hasFamilies && (
              <div className="px-6 py-4 border-t border-primary/5 dark:border-border-subtle">
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("familiesTitle")}
                </h3>
                <FamilyBadgeGroup
                  families={perfume.families}
                  locale={locale as "ar" | "en"}
                  limit={3}
                />
              </div>
            )}

            {/* Safety status */}
            <div className="px-6 py-4 border-t border-primary/5 dark:border-border-subtle">
              <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                {t("safetyTitle")}
              </h3>

              {/* IFRA Score */}
              {perfume.ifraScore !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white",
                      perfume.ifraScore >= 70
                        ? "bg-safe-green"
                        : perfume.ifraScore >= 40
                          ? "bg-amber-500"
                          : "bg-red-500"
                    )}
                  >
                    {perfume.ifraScore}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary dark:text-text-primary">
                      {/* isSafe === undefined → treated as warning (falsy) */}
                      {perfume.isSafe ? t("safeLabel") : t("warningLabel")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t("ifraScore")}: {perfume.ifraScore}/100
                    </p>
                  </div>
                </div>
              )}

              {/* IFRA Warnings */}
              {perfume.ifraWarnings && perfume.ifraWarnings.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-3 border border-amber-200 dark:border-amber-500/20 mb-3">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                    {t("warningsTitle")}
                  </p>
                  <ul className="space-y-1">
                    {perfume.ifraWarnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-600 dark:text-amber-300">
                        - {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Symptom Triggers */}
              {perfume.symptomTriggers && perfume.symptomTriggers.length > 0 && (
                <div className="bg-rose-50/50 dark:bg-rose-500/5 rounded-xl p-3 border border-rose-200/60 dark:border-rose-500/20">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                    {t("triggersTitle")}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {perfume.symptomTriggers.map((trigger, i) => (
                      <span
                        key={i}
                        className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
