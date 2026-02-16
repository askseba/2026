"use client"
import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { RadarGauge } from "@/components/ui/RadarGauge"
import { getMatchStatus } from "@/lib/matching"
import { cn } from "@/lib/classnames"
import type { ScoredPerfume } from "@/lib/matching"

interface MatchSheetProps {
  perfume: ScoredPerfume
  onClose: () => void
  locale?: string
}

export function MatchSheet({ perfume, onClose, locale = "ar" }: MatchSheetProps) {
  const t = useTranslations("results.match")
  const [imageError, setImageError] = useState(false)
  const isRtl = locale === "ar"

  const { label, status } = getMatchStatus(perfume.finalScore)

  const statusStyles = {
    excellent: "bg-safe-green/5 border-safe-green/20 text-safe-green dark:bg-green-500/5 dark:border-green-500/20 dark:text-green-400",
    good: "bg-primary/5 border-primary/20 text-primary dark:bg-amber-500/5 dark:border-amber-500/20 dark:text-amber-500",
    fair: "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-500/5 dark:border-amber-500/20 dark:text-amber-400",
    poor: "bg-red-50 border-red-200 text-red-500 dark:bg-red-500/5 dark:border-red-500/20 dark:text-red-400",
  }

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
          className="absolute inset-x-0 bottom-0 top-auto max-h-[65vh] bg-white dark:bg-surface-elevated rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-border dark:bg-border-subtle rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-cream-bg dark:bg-background border border-primary/10 dark:border-border-subtle">
                  <Image
                    src={imageError || !perfume.image ? "/placeholder-perfume.svg" : perfume.image}
                    alt={perfume.name}
                    fill
                    className="object-contain p-2"
                    sizes="48px"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary dark:text-text-primary">
                    {perfume.name}
                  </h2>
                  <p className="text-sm text-text-muted dark:text-text-muted">{perfume.brand}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-xl hover:bg-surface-muted dark:hover:bg-surface-muted transition"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5 text-text-muted dark:text-text-muted" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* RadarGauge كبير (وسط) */}
            <div className="flex justify-center py-8">
              <RadarGauge
                finalScore={perfume.finalScore}
                tasteScore={perfume.tasteScore}
                safetyScore={perfume.safetyScore}
                size="lg"
                showBreakdown={true}
                locale={locale}
              />
            </div>

            {/* التصنيف (getMatchStatus) */}
            <div className={cn("mx-6 mb-6 p-4 rounded-2xl border", statusStyles[status])}>
              <p className="text-lg font-bold">{label}</p>
              <p className="text-sm text-text-muted dark:text-text-muted mt-2">
                {t(`statusDesc.${status}`)}
              </p>
            </div>

            {/* تفصيل الحساب (شرائط) */}
            <div className="px-6 space-y-4 mb-6">
              {/* الذوق (70%) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary dark:text-text-muted">
                    {t("tasteLabel")} (70%)
                  </span>
                  <span className="text-sm font-bold text-text-primary dark:text-text-primary">
                    {perfume.tasteScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary dark:bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${perfume.tasteScore}%` }}
                  />
                </div>
              </div>

              {/* الأمان (30%) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary dark:text-text-muted">
                    {t("safetyLabel")} (30%)
                  </span>
                  <span className="text-sm font-bold text-text-primary dark:text-text-primary">
                    {perfume.safetyScore}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      perfume.safetyScore === 100 ? "bg-safe-green" : "bg-red-500"
                    )}
                    style={{ width: `${perfume.safetyScore}%` }}
                  />
                </div>
              </div>

              {/* الإجمالي */}
              <div className="flex items-center justify-between pt-4 border-t border-primary/5 dark:border-border-subtle">
                <span className="text-base font-bold text-text-primary dark:text-text-primary">
                  {t("overallLabel")}
                </span>
                <span
                  className={cn(
                    "text-2xl font-black",
                    perfume.finalScore >= 70
                      ? "text-safe-green"
                      : perfume.finalScore >= 40
                        ? "text-amber-500"
                        : "text-red-500"
                  )}
                >
                  {perfume.finalScore}%
                </span>
              </div>
            </div>

            {/* العائلات العطرية */}
            {perfume.families.length > 0 && (
              <div className="px-6 py-4 border-t border-primary/5 dark:border-border-subtle">
                <p className="text-xs text-text-muted dark:text-text-muted mb-3">
                  {t("perfumeFamilies")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perfume.families.map((family, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 dark:bg-amber-500/10 text-primary dark:text-amber-500 px-2.5 py-1 rounded-full font-medium"
                    >
                      {family}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* سبب الاستبعاد */}
            {perfume.exclusionReason && (
              <div className="mx-6 mt-4 mb-6 p-4 bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200 dark:border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {perfume.exclusionReason}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
