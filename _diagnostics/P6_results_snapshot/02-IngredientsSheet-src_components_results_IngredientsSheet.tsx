"use client"
import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/classnames"
import type { ScoredPerfume } from "@/lib/matching"

interface IngredientsSheetProps {
  perfume: ScoredPerfume
  onClose: () => void
  locale?: string
}

export function IngredientsSheet({ perfume, onClose, locale = "ar" }: IngredientsSheetProps) {
  const t = useTranslations("results.ingredients")
  const [imageError, setImageError] = useState(false)
  const isRtl = locale === "ar"

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 lg:hidden" dir={isRtl ? "rtl" : "ltr"}>
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
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-x-0 bottom-0 top-auto max-h-[85vh] bg-white dark:bg-surface-elevated rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-border dark:bg-border-subtle rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 border-b border-primary/5 dark:border-border-subtle flex items-center gap-4 bg-cream-bg dark:bg-surface sticky top-0 z-10">
            {/* Image */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-bg dark:bg-background border border-primary/10 dark:border-border-subtle flex-shrink-0">
              <Image
                src={imageError || !perfume.image ? "/placeholder-perfume.svg" : perfume.image}
                alt={perfume.name}
                fill
                className="object-contain p-2"
                sizes="64px"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-text-primary dark:text-text-primary line-clamp-1">
                {perfume.name}
              </h2>
              <p className="text-xs text-text-muted dark:text-text-muted">{perfume.brand}</p>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/5 dark:hover:bg-surface-muted rounded-full transition-colors flex-shrink-0"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6 text-text-primary dark:text-text-primary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* القسم 1: هرم النوتات أو المكونات */}
            {perfume.scentPyramid ? (
              <div className="px-6 py-4">
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("pyramid.title")}
                </h3>

                {/* Top Notes - أصفر */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-text-muted dark:text-text-muted mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {t("pyramid.top")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {perfume.scentPyramid.top.map((note, i) => (
                      <span
                        key={i}
                        className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Heart Notes - وردي */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-text-muted dark:text-text-muted mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {t("pyramid.heart")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {perfume.scentPyramid.heart.map((note, i) => (
                      <span
                        key={i}
                        className="text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-500/20"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Base Notes - بني */}
                <div>
                  <p className="text-xs font-bold text-text-muted dark:text-text-muted mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-500" />
                    {t("pyramid.base")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {perfume.scentPyramid.base.map((note, i) => (
                      <span
                        key={i}
                        className="text-xs bg-stone-100 dark:bg-stone-500/10 text-stone-700 dark:text-stone-400 px-2.5 py-1 rounded-full border border-stone-200 dark:border-stone-500/20"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-4">
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("ingredientsTitle")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {perfume.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs bg-cream-bg dark:bg-surface-muted text-text-secondary dark:text-text-muted px-2.5 py-1 rounded-full"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* القسم 2: العائلات العطرية */}
            {perfume.families.length > 0 && (
              <div className="px-6 py-4 border-t border-primary/5 dark:border-border-subtle">
                <h3 className="text-sm font-bold text-text-secondary dark:text-text-muted mb-3">
                  {t("familiesTitle")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {perfume.families.map((fam, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 dark:bg-amber-500/10 text-primary dark:text-amber-500 px-2.5 py-1 rounded-full font-medium"
                    >
                      {fam}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* القسم 3: حالة الأمان */}
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
                <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-3 border border-red-200 dark:border-red-500/20">
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
