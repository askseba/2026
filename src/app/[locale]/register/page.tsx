'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import logger from '@/lib/logger'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired')
    }

    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newErrors.email = t('errors.emailRequired')
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = t('errors.emailInvalid')
    }
    
    if (formData.password.length < 8) {
      newErrors.password = t('errors.passwordMinLength')
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordsDoNotMatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('errors.registrationFailed'))
        setIsLoading(false)
        return
      }

      toast.success(t('register.success'))

      const loginResult = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false
      })

      if (loginResult?.ok) {
        router.push('/dashboard')
      } else {
        router.push('/login?registered=true')
      }
    } catch (error) {
      logger.error('[Register] Error:', error)
      toast.error(t('errors.unexpected'))
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard', redirect: true })
    } catch (err) {
      logger.error('[Register] Google sign-in error:', err)
      toast.error(t('errors.googleSignIn'))
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

        <div className="text-center mb-4">
          <h1 className="text-2xl font-black text-primary dark:text-accent-primary mb-1">
            {t('register.title')}
          </h1>
          <p className="text-dark-brown dark:text-slate-400 text-xs">
            {t('register.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-safe-green/5 dark:bg-safe-green/10 rounded-xl mb-5 border border-safe-green/20">
          <ShieldCheck className="size-4 text-safe-green shrink-0" aria-hidden />
          <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">
            {t('register.securityNote')}
          </p>
        </div>

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
            {t('register.continueWithGoogle')}
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
            <Input
              type="text"
              aria-label={t('register.namePlaceholder')}
              placeholder={t('register.namePlaceholder')}
              icon="person"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
              }}
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
              disabled={isLoading}
              error={errors.name}
            />

            <Input
              type="email"
              aria-label={t('register.emailPlaceholder')}
              placeholder={t('register.emailPlaceholder')}
              icon="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
              autoComplete="email"
              required
              disabled={isLoading}
              error={errors.email}
            />

            <Input
              type="password"
              aria-label={t('register.passwordPlaceholder')}
              placeholder={t('register.passwordPlaceholder')}
              icon="lock"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
              autoComplete="new-password"
              required
              disabled={isLoading}
              error={errors.password}
            />

            <Input
              type="password"
              aria-label={t('register.confirmPasswordPlaceholder')}
              placeholder={t('register.confirmPasswordPlaceholder')}
              icon="lock"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              className="rounded-xl dark:bg-slate-800 dark:border-slate-700"
              autoComplete="new-password"
              required
              disabled={isLoading}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              className="w-full py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold shadow-md hover:shadow-lg transition-all mt-2"
              isLoading={isLoading}
            >
              {t('register.submit')}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500 dark:text-slate-400">
          {t('register.alreadyHaveAccount')}{" "}
          <Link
            href="/login"
            className="font-bold text-primary dark:text-accent-primary hover:underline underline-offset-4"
          >
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
