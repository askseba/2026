'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AlertCircle } from 'lucide-react'
import logger from '@/lib/logger'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginContent() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // التحقق من وجود رسالة نجاح من صفحة التسجيل
  const isRegistered = searchParams.get('registered') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn('google', { callbackUrl, redirect: true })
    } catch (err) {
      logger.error('[Login] Google sign-in error:', err)
      setError(t('errors.googleSignIn'))
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errors: { email?: string; password?: string } = {}

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      errors.email = t('errors.emailRequired')
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = t('errors.emailInvalid')
    }
    
    if (!password) {
      errors.password = t('errors.passwordRequired')
    } else if (password.length < 8) {
      errors.password = t('errors.passwordMinLength')
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    setFieldErrors({})
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: trimmedEmail,
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError(t('errors.invalidCredentials'))
        } else {
          setError(result.error)
        }
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      } else {
        setError(t('errors.unexpected'))
        setIsLoading(false)
      }
    } catch (err) {
      logger.error('[Login] Exception:', err)
      setError(t('errors.serverConnection'))
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cream-bg dark:bg-slate-950 flex items-center justify-center p-4 py-6 transition-colors duration-300"
      dir={direction}
    >
      <div className="max-w-xs w-full mx-auto px-6 py-8 rounded-3xl shadow-elevation-3 border border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all">

        <BackButton href="/" variant="ghost" className="mb-4 -ms-2 hover:bg-primary/5 dark:hover:bg-primary/10" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-primary dark:text-accent-primary mb-1">
            {t('login.title')}
          </h1>
          <p className="text-dark-brown dark:text-slate-400 text-xs">
            {t('login.subtitle')}
          </p>
        </div>

        {isRegistered && !error && (
          <div className="mb-4 p-3 bg-safe-green/10 border border-safe-green/20 rounded-xl text-safe-green text-[11px] text-center animate-in fade-in slide-in-from-top-1">
            {t('login.registrationSuccess')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-[11px] flex items-center gap-2 animate-in shake-2">
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-sm font-medium"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 ms-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t('login.continueWithGoogle')}
          </Button>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase">
              {t('common.or')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <div className="space-y-1">
              <Input
                type="email"
                aria-label={t('login.emailPlaceholder')}
                placeholder={t('login.emailPlaceholder')}
                icon="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
                autoComplete="email"
                required
                disabled={isLoading}
                error={fieldErrors.email}
              />
            </div>

            <div className="space-y-1">
              <Input
                type="password"
                aria-label={t('login.passwordPlaceholder')}
                placeholder={t('login.passwordPlaceholder')}
                icon="lock"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
                className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
                autoComplete="current-password"
                required
                disabled={isLoading}
                error={fieldErrors.password}
              />
            </div>

            <div className="flex justify-start px-1">
              <span
                className="text-[11px] text-slate-400 dark:text-slate-500 cursor-default"
                title={locale === 'ar' ? 'قريباً' : 'Coming soon'}
              >
                {t('login.forgotPassword')}
              </span>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold shadow-md hover:shadow-lg transition-all"
              isLoading={isLoading}
            >
              {t('login.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
          {t('login.noAccount')}{' '}
          <Link
            href="/register"
            className="font-bold text-primary dark:text-accent-primary hover:underline underline-offset-4"
          >
            {t('login.registerNow')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-bg dark:bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
