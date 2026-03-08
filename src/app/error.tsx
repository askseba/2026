'use client'

import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import logger from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Application error:', error)
  }, [error])

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4"
    >
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="w-20 h-20 text-red-600" />
        </div>

        <h1 className="text-4xl font-bold text-brown-text mb-4">
          حدث خطأ ما
        </h1>

        <p className="text-brown-text/70 mb-8 text-lg leading-relaxed">
          عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
        </p>

        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-amber-700 hover:bg-amber-800 px-8 py-3 text-lg font-semibold text-white dark:bg-amber-600 dark:hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border-2 border-amber-700 dark:border-amber-500 bg-white dark:bg-slate-800 px-8 py-3 text-lg font-semibold text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            العودة للرئيسية
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 p-4 bg-red-100 border border-red-300 rounded-lg text-right">
            <p className="text-sm text-red-800 font-mono">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

