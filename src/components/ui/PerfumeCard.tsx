'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Wind, Activity, Tag } from 'lucide-react'
import { RadarGauge } from './RadarGauge'
import { useTranslations } from 'next-intl'
import type { ScoredPerfume } from '@/lib/matching'

const PLACEHOLDER_IMAGE = '/placeholder-perfume.svg'

interface PerfumeCardProps {
  id: string
  brand: string
  displayName: string
  image: string
  finalScore: number
  tasteScore: number
  safetyScore: number
  // These props are passed by ResultsGrid — kept for backward compat (P2 will clean up)
  ifraScore?: number
  symptomTriggers: string[]
  ifraWarnings?: string[]
  source?: string
  showCompare?: boolean
  isComparing?: boolean
  onCompare?: () => void
  priority?: boolean
  isFirst?: boolean
  onShowIngredients?: () => void
  onShowMatch?: () => void
  onPriceCompare?: (perfume: ScoredPerfume) => void
  perfumeData?: ScoredPerfume
}

/**
 * Clean Unsplash image URLs — Next.js Image optimizer adds its own params
 */
function cleanImageUrl(url: string): string {
  if (!url) return PLACEHOLDER_IMAGE
  
  try {
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url)
      return `${urlObj.origin}${urlObj.pathname}`
    }
    return url
  } catch (error) {
    console.error('Invalid image URL:', url)
    return PLACEHOLDER_IMAGE
  }
}

export function PerfumeCard({
  id,
  brand,
  displayName,
  image,
  finalScore,
  tasteScore,
  safetyScore,
  isFirst = false,
  priority = false,
  onShowIngredients,
  onShowMatch,
  onPriceCompare,
  perfumeData,
}: PerfumeCardProps) {
  const t = useTranslations('results.card')
  
  const cleanedImage = cleanImageUrl(image)
  const [imgSrc, setImgSrc] = useState(cleanedImage)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    async function run() {
      const cleaned = cleanImageUrl(image)
      setImgSrc(cleaned)
      setImageError(false)
    }
    run()
  }, [image])

  const handleImageError = () => {
    console.error('Failed to load image:', imgSrc)
    setImageError(true)
    setImgSrc(PLACEHOLDER_IMAGE)
  }

  return (
    <div className="bg-white dark:bg-surface rounded-3xl shadow-elevation-1 dark:shadow-black/20 border border-primary/5 dark:border-border-subtle overflow-hidden flex flex-col min-h-[380px]">
      
      {/* Header - Image */}
      <div className="relative aspect-[4/5] bg-cream-bg dark:bg-background p-5">
        {/* P1 #40: Semi-transparent background behind RadarGauge for visibility */}
        <div className="absolute top-3 end-3 z-10 bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg p-1">
          <RadarGauge 
            finalScore={finalScore} 
            tasteScore={tasteScore} 
            safetyScore={safetyScore} 
            size="sm" 
          />
        </div>
        
        {isFirst && (
          <div className="absolute top-3 start-3 z-10">
            <span className="text-xs font-bold text-white bg-primary dark:bg-amber-500 px-2.5 py-1 rounded-full shadow-sm">
              {t('topMatch') || 'أفضل تطابق'}
            </span>
          </div>
        )}
        
        <Image
          src={imgSrc}
          alt={displayName || `${brand} عطر`}
          fill
          className="object-contain p-2"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          onError={handleImageError}
        />
      </div>

      {/* Content - Name */}
      <div className="p-4 flex-1 flex flex-col min-h-[80px] min-w-0">
        <p className="text-xs text-text-muted dark:text-text-muted mb-1">{brand}</p>
        {/* P2 #24: Added title for truncated names */}
        <h3
          className="text-base font-bold text-text-primary dark:text-text-primary line-clamp-2"
          title={displayName}
        >
          {displayName}
        </h3>
      </div>

      {/* Triple Action Buttons footer — P1 #28: dark mode text */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-border-subtle px-4 pb-4 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onShowIngredients?.(); }}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors group"
          aria-label={t('ingredientsBtn') || 'Ingredients'}
        >
          <Wind className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('ingredientsBtn') || 'Ingredients'}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onShowMatch?.(); }}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
          aria-label={t('matchBtn') || 'Match'}
        >
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('matchBtn') || 'Match'}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); if (perfumeData) onPriceCompare?.(perfumeData); }}
          className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors group"
          aria-label={t('pricesBtn') || 'Price'}
        >
          <Tag className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('pricesBtn') || 'Price'}</span>
        </button>
      </div>
    </div>
  )
}
