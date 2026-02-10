'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AlertCircle } from 'lucide-react'
import logger from '@/lib/logger'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginContent() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const searchParams = useSearchParams()
  const router = useRouter()
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
      setError('حدث خطأ أثناء تسجيل الدخول بـ Google')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = 'يرجى إدخال البريد الإلكتروني'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'البريد الإلكتروني غير صحيح'
    }
    if (!password) {
      errors.password = 'يرجى إدخال كلمة المرور'
    } else if (password.length < 8) {
      errors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else if (result?.ok) {
        router.push(callbackUrl)
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول')
        setIsLoading(false)
      }
    } catch (err) {
      logger.error('[Login] Exception:', err)
      setError('حدث خطأ أثناء تسجيل الدخول')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-bg flex items-center justify-center p-4 py-6" dir={direction}>
      <div className="max-w-sm w-full mx-auto p-6 rounded-3xl shadow-elevation-3 border-2 border-primary/15 bg-gradient-to-b from-white to-cream-bg/50 dark:from-surface dark:to-cream-bg/10 backdrop-blur-xl">
        <BackButton href="/" variant="ghost" className="mb-4" />
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-primary dark:text-accent-primary mb-1">
            تسجيل الدخول
          </h1>
          <p className="text-dark-brown text-sm">مرحباً بك مجدداً في ask seba</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border-2 border-destructive/20 rounded-xl text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full py-4 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-white/10 border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:shadow-glow hover:scale-105 transition-all duration-200"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            aria-label="تسجيل الدخول عبر حساب Google"
          >
            <svg className="w-5 h-5 ms-2 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            المتابعة بـ Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
            <span className="relative px-4 bg-white dark:bg-surface text-xs font-bold text-dark-brown uppercase tracking-wide">
              أو
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              icon="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
              }}
              autoComplete="email"
              required
              disabled={isLoading}
              error={fieldErrors.email}
            />

            <Input
              type="password"
              placeholder="كلمة المرور"
              icon="lock"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }}
              autoComplete="current-password"
              required
              disabled={isLoading}
              error={fieldErrors.password}
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" title="نسيت كلمة المرور" className="text-xs text-dark-brown hover:text-primary transition-colors">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              aria-label="تسجيل الدخول"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow-xl hover:shadow-glow-2xl hover:scale-105 transition-all duration-200 mt-1"
              isLoading={isLoading}
            />
          </form>
        </div>

        <p className="text-center mt-2 text-sm text-dark-brown">
          لا تملك حساباً؟{' '}
          <Link href="/register" className="font-bold text-primary-dark dark:text-accent-primary hover:underline underline-offset-2">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
