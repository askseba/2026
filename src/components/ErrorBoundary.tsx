'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import logger from '@/lib/logger'

declare global {
  interface Window {
    Sentry?: { captureException: (error: Error, options?: { contexts?: Record<string, unknown> }) => void }
  }
}

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

interface ErrorBoundaryFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
}

function ErrorBoundaryFallback({ error, errorInfo, onReset }: ErrorBoundaryFallbackProps) {
  const t = useTranslations('errorBoundary')

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-bg via-amber-50 to-orange-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-brown-text/10 dark:border-slate-600/40 p-8 md:p-12">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-orange-500 rounded-full p-6">
              <AlertTriangle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brown-text mb-4">
            {t('title')}
          </h1>
          <p className="text-brown-text/85 text-lg md:text-xl leading-relaxed mb-2">
            {t('description')}
          </p>
          <p className="text-brown-text/75 text-base">
            {t('suggestion')}
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <details className="text-sm">
              <summary className="cursor-pointer text-red-700 font-semibold mb-2">
                {t('detailsSummary')}
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong className="text-red-800">{t('errorLabel')}</strong>
                  <pre className="mt-1 p-2 bg-red-100 rounded text-red-900 text-xs overflow-auto max-h-32">
                    {error.toString()}
                  </pre>
                </div>
                {errorInfo && (
                  <div>
                    <strong className="text-red-800">{t('infoLabel')}</strong>
                    <pre className="mt-1 p-2 bg-red-100 rounded text-red-900 text-xs overflow-auto max-h-32">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReset}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-brand-brown-dark font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{t('retry')}</span>
          </button>

          <Link
            href="/"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-cream-bg text-brown-text border-2 border-brown-text/20 hover:border-primary font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            <span>{t('home')}</span>
          </Link>

          <a
            href="mailto:support@askseba.com?subject=تقرير خطأ&body=مرحباً،%0D%0A%0D%0Aأود الإبلاغ عن خطأ واجهته في التطبيق.%0D%0A%0D%0Aشكراً"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-400 font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('report')}</span>
          </a>
        </div>

        {/* Helpful Tips */}
        <div className="mt-8 pt-8 border-t border-brown-text/10">
          <p className="text-center text-brown-text/75 text-sm mb-4">
            {t('tipsTitle')}
          </p>
          <ul className="text-right space-y-2 text-sm text-brown-text/85">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('tip1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('tip2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('tip3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{t('tip4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Professional Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a friendly UI instead of crashing
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', { error, errorInfo })

    // Update state with error details
    this.setState({
      error,
      errorInfo
    })

    // Send error to Sentry if available
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const Sentry = (window as unknown as Record<string, unknown>).Sentry as {
        captureException: (error: Error, options?: { contexts?: Record<string, unknown> }) => void
      };
      Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default friendly error UI (uses translations via ErrorBoundaryFallback)
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}
