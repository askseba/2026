"use client"
import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { RadarGauge } from "@/components/ui/RadarGauge"
import { getMatchStatusWithSafety } from "@/utils/safetyProtocol"
import { cn } from "@/lib/classnames"
import type { ScoredPerfume } from "@/lib/matching"

const getStatusConfig = (status: string) => {
  switch (status) {
    case "excellent":
      return { emoji: "⭐", bgColor: "bg-green-50", borderColor: "border-green-500", textColor: "text-green-900" }
    case "good":
      return { emoji: "✅", bgColor: "bg-blue-50", borderColor: "border-blue-500", textColor: "text-blue-900" }
    case "fair":
      return { emoji: "⚠️", bgColor: "bg-amber-50", borderColor: "border-amber-500", textColor: "text-amber-900" }
    case "poor":
      return { emoji: "❌", bgColor: "bg-purple-50", borderColor: "border-purple-500", textColor: "text-purple-900" }
    case "unsafe":
      return { emoji: "🚫", bgColor: "bg-red-50", borderColor: "border-red-500", textColor: "text-red-900" }
    default:
      return { emoji: "➖", bgColor: "bg-gray-50", borderColor: "border-gray-500", textColor: "text-gray-900" }
  }
}

interface MatchSheetProps {
  perfume: ScoredPerfume
  onClose: () => void
  locale?: string
}

export function MatchSheet({ perfume, onClose, locale = "ar" }: MatchSheetProps) {
  const t = useTranslations("results.match")
  const [imageError, setImageError] = useState(false)
  const isRtl = locale === "ar"

  const displayStatus = getMatchStatusWithSafety(perfume)
  const statusConfig = getStatusConfig(displayStatus ?? "fair")

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
            <h1 className="text-lg font-semibold text-text-primary dark:text-text-primary mb-4">
              {t("sheetTitle")}
            </h1>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
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
                <div className="min-w-0">
                  <p className="text-sm text-text-muted dark:text-text-muted">{perfume.brand}</p>
                  <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary truncate">
                    {perfume.name}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-xl hover:bg-surface-muted dark:hover:bg-surface-muted transition flex-shrink-0"
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

            {/* Status badge (Gold1: emoji + unsafe) */}
            <div
              className={cn(
                "mx-6 mb-6 p-4 rounded-2xl border-2",
                statusConfig.bgColor,
                statusConfig.borderColor,
                statusConfig.textColor
              )}
            >
              <p className="text-lg font-semibold flex items-center gap-2">
                <span className="text-2xl">{statusConfig.emoji}</span>
                {t(`statusDesc.${displayStatus ?? "fair"}`)}
              </p>
            </div>

            {/* Score Breakdown (Gold1) */}
            <div className="px-6 space-y-6 mb-6">
              {/* Taste Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <p className="font-semibold text-sm text-text-primary dark:text-text-primary">
                        {t("tasteLabel")}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted">
                        {t("tasteHint")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-text-primary dark:text-text-primary">
                      {perfume.tasteScore}
                    </span>
                    <span className="text-xs text-text-muted dark:text-text-muted">
                      {t("tastePercentage", { score: perfume.tasteScore })}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-surface-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${perfume.tasteScore}%` }}
                  />
                </div>
              </div>

              {/* Safety Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <div>
                      <p className="font-semibold text-sm text-text-primary dark:text-text-primary">
                        {t("safetyLabel")}
                      </p>
                      <p className="text-xs text-text-muted dark:text-text-muted">
                        {t("safetyHint")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-text-primary dark:text-text-primary">
                      {perfume.safetyScore}
                    </span>
                    <span className="text-xs text-text-muted dark:text-text-muted">
                      {t("safetyPercentage", { score: perfume.safetyScore })}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-surface-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                    style={{ width: `${perfume.safetyScore}%` }}
                  />
                </div>
              </div>

              {/* Overall Score card */}
              <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200 dark:border-orange-800/50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-text-primary dark:text-text-primary">
                    {t("overallLabel")}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      perfume.finalScore >= 70
                        ? "text-safe-green"
                        : perfume.finalScore >= 40
                          ? "text-amber-500"
                          : "text-red-500"
                    )}
                  >
                    {perfume.finalScore}
                  </p>
                </div>
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
