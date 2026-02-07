// VALUE_LADDER - File 9/20: src/components/ui/PriceAlertButton.tsx
// ✅ COMPLETE PRICE ALERT BUTTON
// 🎯 Bell icon with gating for Free users (1 max)

'use client'
import { useState, useEffect } from 'react'
import { Bell, BellOff, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { safeFetch } from '@/lib/utils/api-helpers'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import logger from '@/lib/logger'

interface PriceAlertButtonProps {
  perfumeId: string
  perfumeName: string
  currentPrice?: number
  variant?: 'default' | 'minimal'
  onLimitReached?: () => void
}

export function PriceAlertButton({ 
  perfumeId, 
  perfumeName, 
  currentPrice,
  variant = 'default',
  onLimitReached 
}: PriceAlertButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [targetPrice, setTargetPrice] = useState<number>(currentPrice ? currentPrice * 0.9 : 0)
  
  // Load alert status on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadAlertStatus()
    }
  }, [session?.user?.id, perfumeId])
  
  const loadAlertStatus = async () => {
    try {
      const response = await safeFetch<{ success: boolean; data?: any[] }>('/api/price-alerts')
      
      if (response.success && response.data) {
        const alert = response.data.find((a: any) => a.perfumeId === perfumeId)
        if (alert) {
          setIsActive(alert.isActive)
          setTargetPrice(alert.targetPrice)
        }
      }
    } catch (error) {
      logger.error('Failed to load alert status:', error)
    }
  }
  
  const handleToggle = async () => {
    // Check authentication
    if (!session?.user?.id) {
      toast.error('يجب تسجيل الدخول لإنشاء تنبيهات الأسعار', {
        style: { direction: 'rtl', textAlign: 'right' }
      })
      router.push('/login?callbackUrl=' + window.location.pathname)
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isActive) {
        // Delete alert
        const response = await safeFetch<{ success: boolean; error?: string }>('/api/price-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            perfumeId,
            action: 'delete'
          })
        })
        
        if (response.success) {
          setIsActive(false)
          toast.success('تم إلغاء التنبيه', {
            style: { direction: 'rtl', textAlign: 'right' }
          })
        } else {
          throw new Error(response.error || 'فشل إلغاء التنبيه')
        }
      } else {
        // Create alert
        const response = await safeFetch<{
          success: boolean
          error?: string
          message?: string
          limit?: number
          remaining?: number
        }>('/api/price-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            perfumeId,
            targetPrice: targetPrice
          })
        })
        
        if (response.success) {
          setIsActive(true)
          toast.success(response.message || 'تم إنشاء التنبيه بنجاح!', {
            style: { direction: 'rtl', textAlign: 'right' }
          })
        } else if (response.error === 'alert_limit_reached') {
          // Free user hit limit
          toast.error(response.message || 'وصلت للحد الأقصى من التنبيهات', {
            style: { direction: 'rtl', textAlign: 'right' }
          })
          onLimitReached?.()
        } else {
          throw new Error(response.message || 'فشل إنشاء التنبيه')
        }
      }
    } catch (error) {
      logger.error('Price alert error:', error)
      const message = error instanceof Error ? error.message : 'حدث خطأ'
      toast.error(message, {
        style: { direction: 'rtl', textAlign: 'right' }
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`min-touch-target min-touch-target w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isActive
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-white text-amber-500 hover:bg-amber-50 border border-amber-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
        aria-label={isActive ? `إلغاء تنبيه السعر لـ ${perfumeName}` : `إنشاء تنبيه سعر لـ ${perfumeName}`}
      >
        {isActive ? <Bell className="w-5 h-5 fill-current" /> : <Bell className="w-5 h-5" />}
      </button>
    )
  }
  
  return (
    <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-brown-text/10 dark:border-slate-600/40">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          <h5 className="font-bold text-brown-text">تنبيه السعر</h5>
        </div>
        {isActive && (
          <div className="text-xs text-safe-green font-medium bg-safe-green/10 px-2 py-1 rounded-full">
            ✓ نشط
          </div>
        )}
      </div>
      
      {!isActive && currentPrice && (
        <div className="mb-3">
          <label className="text-sm text-brown-text/75 block mb-1">
            أخبرني عندما يصل السعر إلى:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg border border-brown-text/20 text-brown-text"
              min="0"
              step="10"
            />
            <span className="text-brown-text/75">ريال</span>
          </div>
          <p className="text-xs text-brown-text/50 mt-1">
            السعر الحالي: {currentPrice.toFixed(0)} ريال
          </p>
        </div>
      )}
      
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-amber-500 hover:bg-amber-600 text-white'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      >
        {isLoading ? (
          'جاري المعالجة...'
        ) : isActive ? (
          <span className="flex items-center justify-center gap-2">
            <BellOff className="w-4 h-4" />
            إلغاء التنبيه
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Bell className="w-4 h-4" />
            تفعيل التنبيه
          </span>
        )}
      </button>
    </div>
  )
}
