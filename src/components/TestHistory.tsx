// VALUE_LADDER - File 13/20: src/components/dashboard/TestHistory.tsx
// ✅ TEST HISTORY COMPONENT (Premium Only)
// 🎯 Shows user's past quiz results

'use client'
import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { safeFetch } from '@/lib/utils/api-helpers'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from '@/i18n/routing'
import logger from '@/lib/logger'

interface TestRecord {
  id: string
  createdAt: string
  totalMatches: number
  topMatchId: string | null
  topMatchScore: number | null
  scentDNA: any
  likedPerfumes: string[]
}

export function TestHistory() {
  const router = useRouter()
  const [tests, setTests] = useState<TestRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadHistory()
  }, [])
  
  const loadHistory = async () => {
    try {
      const response = await safeFetch<{ success: boolean; data?: TestRecord[] }>(
        '/api/user/test-history'
      )
      
      if (response.success && response.data) {
        setTests(response.data)
      } else {
        throw new Error('فشل تحميل السجل')
      }
    } catch (err) {
      logger.error('Failed to load test history:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner message="جاري تحميل السجل..." />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadHistory}
          className="text-primary hover:text-primary/80 font-medium"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }
  
  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-16 h-16 text-primary/40 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-brown-text mb-2">
          لا توجد اختبارات سابقة
        </h3>
        <p className="text-brown-text/75 mb-6">
          ابدأ أول اختبار لك لبناء سجل تفضيلاتك العطرية
        </p>
        <button
          onClick={() => router.push('/quiz/step1-favorites')}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all"
        >
          ابدأ الاختبار
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-brown-text flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          سجل اختباراتك
        </h3>
        <div className="text-sm text-brown-text/60">
          {tests.length} {tests.length === 1 ? 'اختبار' : 'اختبارات'}
        </div>
      </div>
      
      <div className="space-y-3">
        {tests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-brown-text/10 dark:border-slate-600/40 hover:shadow-lg dark:hover:bg-slate-700/80 transition-all cursor-pointer group"
            onClick={() => {
              // TODO: Navigate to test results
              router.push(`/test-history/${test.id}`)
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-sm text-brown-text/60">
                    {new Date(test.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {index === 0 && (
                    <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                      الأحدث
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-safe-green" />
                    <span className="text-brown-text font-medium">
                      {test.totalMatches} تطابق
                    </span>
                  </div>
                  
                  {test.topMatchScore && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-brown-text font-medium">
                        {Math.round(test.topMatchScore)}% أعلى تطابق
                      </span>
                    </div>
                  )}
                </div>
                
                {test.scentDNA && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(test.scentDNA).slice(0, 3).map(([family, value]) => (
                      <div
                        key={family}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {family}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <ChevronRight className="w-5 h-5 text-brown-text/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
