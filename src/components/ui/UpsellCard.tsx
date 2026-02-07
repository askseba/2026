// VALUE_LADDER - File 7/20: src/components/ui/UpsellCard.tsx
// ✅ COMPLETE UPSELL CARD FOR FREE USERS
// 🎯 Shows after 5 results for Free tier

'use client'
import { Crown, Zap, Check, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface UpsellCardProps {
  position: 'mid-grid' | 'bottom'
  remainingCount: number
  averageMatch?: number
  onUpgrade?: () => void
}

export function UpsellCard({ position, remainingCount, averageMatch, onUpgrade }: UpsellCardProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className={`relative bg-gradient-to-br from-amber-500/10 via-primary/5 to-purple-600/10 rounded-3xl p-8 md:p-10 border-2 border-amber-500/30 shadow-xl overflow-hidden ${position === 'bottom' ? 'col-span-full mt-12' : 'col-span-1'}`}
      dir="rtl"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-4 left-4 w-40 h-40 bg-primary rounded-full blur-3xl" />
      </div>
      
      {/* Crown badge */}
      <div className="absolute top-4 left-4">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-full shadow-lg">
          <Crown className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-700 font-bold text-sm mb-4">
            <Zap className="w-4 h-4" />
            <span>ترقية مميزة</span>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-black text-brown-text leading-tight">
            {remainingCount} عطور إضافية
            <br />
            <span className="bg-gradient-to-l from-amber-600 to-primary bg-clip-text text-transparent">
              تطابقك تماماً! ✨
            </span>
          </h3>
          
          {averageMatch && (
            <p className="text-brown-text/75 text-lg">
              متوسط التطابق: <span className="font-bold text-primary">{averageMatch}%</span>
            </p>
          )}
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
          <div className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 text-right">
            <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brown-text text-sm">اختبارات غير محدودة</p>
              <p className="text-xs text-brown-text/60">اختبر ذوقك كلما تغير</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 text-right">
            <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brown-text text-sm">{remainingCount} نتيجة إضافية</p>
              <p className="text-xs text-brown-text/60">كل اختبار يظهر 12 عطر</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 text-right">
            <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brown-text text-sm">تنبيهات الأسعار</p>
              <p className="text-xs text-brown-text/60">اعرف متى ينخفض السعر</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-white/60 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 text-right">
            <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brown-text text-sm">سجل اختباراتك</p>
              <p className="text-xs text-brown-text/60">تتبع تطور ذوقك</p>
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-4xl font-black text-brown-text">15</span>
            <span className="text-2xl font-bold text-brown-text/75">ريال</span>
            <span className="text-brown-text/60">/شهر</span>
          </div>
          <p className="text-sm text-brown-text/60">
            أو 150 ريال/سنة (وفّر 17%)
          </p>
        </div>
        
        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            onClick={(e) => { onUpgrade?.(); }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
          >
            <Crown className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span>اشترك الآن</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
