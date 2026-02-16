'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { RadarGauge } from './RadarGauge'
import { useTranslations } from 'next-intl'

const PLACEHOLDER_IMAGE = '/placeholder-perfume.svg'

/**
 * تنظيف رابط الصورة من Unsplash parameters
 * Next.js Image optimizer سيضيف parameters الخاصة به
 */
function cleanImageUrl(url: string): string {
  if (!url) return PLACEHOLDER_IMAGE
  
  try {
    // إذا كان رابط Unsplash، نزيل جميع parameters الموجودة
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url)
      // نرجع الرابط الأساسي بدون أي parameters
      return `${urlObj.origin}${urlObj.pathname}`
    }
    return url
  } catch (error) {
    console.error('Invalid image URL:', url)
    return PLACEHOLDER_IMAGE
  }
}

interface PerfumeCardProps {
  id: string
  brand: string
  displayName: string
  image: string
  finalScore: number
  tasteScore: number
  safetyScore: number
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
  onPriceCompare?: (perfume: any) => void
  perfumeData?: any
}

export function PerfumeCard({
  id,
  brand,
  displayName,
  image,
  finalScore,
  tasteScore,
  safetyScore,
  ifraScore,
  symptomTriggers,
  ifraWarnings,
  source,
  isFirst = false,
  priority = false,
  onShowIngredients,
  onShowMatch,
  onPriceCompare,
}: PerfumeCardProps) {
  const t = useTranslations('results.card')
  
  // تنظيف رابط الصورة عند التهيئة
  const cleanedImage = cleanImageUrl(image)
  const [imgSrc, setImgSrc] = useState(cleanedImage)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const cleaned = cleanImageUrl(image)
    setImgSrc(cleaned)
    setImageError(false)
  }, [image])

  // بناء كائل بيانات العطر الكامل للتمرير إلى onPriceCompare
  const perfumeData = {
    id,
    brand,
    displayName,
    image,
    finalScore,
    tasteScore,
    safetyScore,
    ifraScore,
    symptomTriggers,
    ifraWarnings,
    source
  }

  const handleImageError = () => {
    console.error('Failed to load image:', imgSrc)
    setImageError(true)
    setImgSrc(PLACEHOLDER_IMAGE)
  }

  return (
    <div className="bg-white dark:bg-surface rounded-3xl shadow-elevation-1 dark:shadow-black/20 border border-primary/5 dark:border-border-subtle overflow-hidden flex flex-col min-h-[380px]">
      
      {/* Header - الصورة */}
      <div className="relative aspect-[4/5] bg-cream-bg dark:bg-background p-5">
        <div className="absolute top-3 end-3 z-10">
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

      {/* Content - اسم العطر */}
      <div className="p-4 flex-1 flex flex-col min-h-[80px]">
        <p className="text-xs text-text-muted dark:text-text-muted mb-1">{brand}</p>
        <h3 className="text-base font-bold text-text-primary dark:text-text-primary line-clamp-2">
          {displayName}
        </h3>
      </div>

      {/* الأزرار الثلاثة - محسّنة للـ Accessibility و Dark Mode */}
      <div className="px-4 pb-4 flex gap-2 shrink-0">
        {/* Secondary Action: Ingredients */}
        <button
          onClick={(e) => { 
            e.stopPropagation()
            onShowIngredients?.()
          }}
          className="flex-1 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 text-center border border-slate-200 dark:border-slate-700 shadow-sm"
          aria-label="عرض المكونات"
        >
          {t('ingredientsBtn') || 'المكونات'}
        </button>
        
        {/* Secondary Action: Match */}
        <button
          onClick={(e) => { 
            e.stopPropagation()
            onShowMatch?.()
          }}
          className="flex-1 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all duration-200 text-center border border-slate-200 dark:border-slate-700 shadow-sm"
          aria-label="عرض التوافق"
        >
          {t('matchBtn') || 'التوافق'}
        </button>
        
        {/* Primary CTA: Price Compare */}
        <button
          onClick={(e) => { 
            e.stopPropagation()
            onPriceCompare?.(perfumeData)
          }}
          className="flex-1 py-2.5 text-xs font-medium text-white bg-primary dark:bg-amber-600 rounded-xl hover:bg-primary/90 dark:hover:bg-amber-500 active:scale-[0.98] transition-all duration-200 text-center shadow-sm"
          aria-label="مقارنة الأسعار"
        >
          {t('pricesBtn') || 'الأسعار'}
        </button>
      </div>
    </div>
  )
}
