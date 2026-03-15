"use client"
import React, { useState } from "react"
import { DollarSign, GitCompare, FlaskConical } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/classnames"
import { getSafetyDisplay, severityFromScore } from "@/lib/safety-display"
import { RadarGauge } from "./RadarGauge"
import type { ScoredPerfume } from "@/lib/matching"

const PLACEHOLDER_URL = "/placeholder-perfume.svg"

interface PerfumeCardProps {
  id: string
  name?: string
  title?: string
  brand: string
  finalScore?: number
  matchPercentage?: number
  image?: string
  imageUrl?: string
  description?: string | null
  isSafe?: boolean
  showCompare?: boolean
  isComparing?: boolean
  onCompare?: () => void
  rarity?: "common" | "rare" | "exclusive"
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock"
  variant?: "on-sale" | "just-arrived" | string | null
  priority?: boolean
  ifraScore?: number
  symptomTriggers?: string[]
  ifraWarnings?: string[]
  source?: string
  safetySeverity?: 'low' | 'medium' | 'high'
  isFirst?: boolean
  onShowIngredients?: () => void
  onShowMatch?: () => void
  onPriceCompare?: (perfume: ScoredPerfume) => void
  perfumeData?: ScoredPerfume
}

export function PerfumeCard({
  id,
  name,
  title,
  brand,
  finalScore,
  matchPercentage,
  image,
  imageUrl,
  description,
  isSafe = true,
  showCompare = false,
  isComparing = false,
  onCompare,
  rarity = "rare",
  stockStatus = "in-stock",
  priority = false,
  ifraScore,
  symptomTriggers,
  ifraWarnings,
  source,
  safetySeverity,
  isFirst = false,
  onShowIngredients,
  onShowMatch,
  onPriceCompare,
  perfumeData,
}: PerfumeCardProps) {
  const t = useTranslations("results.card")
  const displayName = name || title || t("unknownPerfume")
  const displayScore = finalScore ?? matchPercentage ?? 0

  const [imageError, setImageError] = useState(false)

  // Resolve the best available image string (image prop takes priority over imageUrl).
  // Treat null, "null", and blank strings as missing.
  const raw = image || imageUrl
  const displayImage =
    !raw || raw === "null" || raw.trim() === ""
      ? PLACEHOLDER_URL
      : raw

  // After a load error fall back to the same placeholder.
  const imgSrc = imageError ? PLACEHOLDER_URL : displayImage

  // Always unoptimized for external URLs so no domain whitelisting is needed for
  // arbitrary CDN hosts; via.placeholder.com IS in remotePatterns but unoptimized
  // is simpler and consistent across all external sources.
  const isExternal =
    imgSrc.startsWith("http://") || imgSrc.startsWith("https://")

  const tasteScore =
    perfumeData?.tasteScore ?? Math.round(displayScore * 0.7)
  const safetyScore = perfumeData?.safetyScore ?? (isSafe ? 100 : 0)
  const finalScoreValue = finalScore ?? displayScore

  return (
    <div
      tabIndex={0}
      role="article"
      aria-label={`${displayName} - ${finalScoreValue}% ${t("match")}`}
      className={cn(
        "group bg-white dark:bg-slate-900",
        "rounded-2xl border border-card-border dark:border-slate-700",
        "overflow-hidden flex flex-col h-[380px]",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "card-hover shadow-sm"
      )}
    >
      {/* Header: صورة + Radar + Badge */}
      <div className="relative h-[200px] bg-surface-muted dark:bg-slate-800 overflow-hidden">
        {/* Radar صغير */}
        <div className="absolute top-3 end-3 z-10">
          <RadarGauge
            finalScore={finalScoreValue}
            tasteScore={tasteScore}
            safetyScore={safetyScore}
            size="sm"
          />
        </div>

        {/* Badge أفضل تطابق */}
        {isFirst && (
          <div className="absolute top-3 start-3 z-20">
            <span className="inline-block text-xs font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
              {t("topMatch")}
            </span>
          </div>
        )}

        {/* Safety pill */}
        {(() => {
          const severity = safetySeverity ?? severityFromScore(
            (safetyScore === 100 ? 100 : safetyScore === 50 ? 50 : 0) as 0 | 50 | 100
          )
          const display = getSafetyDisplay(severity)
          if (!display.showWarning) return null
          return (
            <div className="absolute top-14 end-3 z-10">
              <span
                style={{ backgroundColor: display.color }}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
              >
                {display.badge} {display.label}
              </span>
            </div>
          )
        })()}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 dark:from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-[-1]" />

        {/* صورة العطر */}
        <Image
          key={imgSrc}
          src={imgSrc}
          alt={displayName}
          fill
          className="object-contain p-4 z-0 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          unoptimized={isExternal}
          onError={() => setImageError(true)}
        />
      </div>

      {/* معلومات */}
      <div className="px-5 pt-4 pb-2 flex-1 flex flex-col">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">{brand}</p>
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 line-clamp-2 mb-auto">
          {displayName}
        </h3>
      </div>

      {/* 3 أزرار — visual refresh, same handlers */}
      <div className="px-5 pb-4 flex gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onShowIngredients?.()
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 tab-toggle border-0"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          {t("ingredientsBtn")}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onShowMatch?.()
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 tab-toggle border-0"
        >
          <GitCompare className="h-3.5 w-3.5" />
          {t("matchBtn")}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onPriceCompare && perfumeData) {
              onPriceCompare(perfumeData)
            }
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium bg-amber-700 dark:bg-amber-500 text-white dark:text-gray-900 hover:bg-amber-800 dark:hover:bg-amber-400 transition-all border-0 shadow-sm"
        >
          <DollarSign className="h-3.5 w-3.5" />
          {t("pricesBtn")}
        </button>
      </div>
    </div>
  )
}
