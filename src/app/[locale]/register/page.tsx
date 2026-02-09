'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useLocale } from 'next-intl'
import { useRouter, Link } from '@/i18n/routing'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import logger from '@/lib/logger'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'يرجى إدخال البريد الإلكتروني'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ أثناء إنشاء الحساب')
        setIsLoading(false)
        return
      }

      toast.success('تم إنشاء حسابك بنجاح! جاري تسجيل الدخول...')

      const loginResult = await signIn('credentials', {
        email: formData.email,
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
      toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard', redirect: true })
    } catch (err) {
      logger.error('[Register] Google sign-in error:', err)
      toast.error('حدث خطأ أثناء تسجيل الدخول بـ Google')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-bg flex items-center justify-center p-4 py-6" dir={direction}>
      <div className="max-w-sm w-full mx-auto p-6 rounded-3xl shadow-elevation-3 border-2 border-primary/15 bg-gradient-to-b from-white to-cream-bg/50 dark:from-surface dark:to-cream-bg/10 backdrop-blur-xl">
        <BackButton href="/" variant="ghost" className="mb-4" />
        <div className="text-center mb-4">
          <h1 className="text-2xl font-black text-primary dark:text-accent-primary mb-0.5">
            إنشاء حساب جديد
          </h1>
          <p className="text-dark-brown text-sm">انضم إلى ask seba واكتشف عالمك العطري</p>
        </div>

        <div className="flex items-start gap-2 p-3 bg-safe-green/10 rounded-xl mb-5 border-2 border-safe-green/20">
          <ShieldCheck className="size-4 text-safe-green shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-text-primary leading-relaxed">
            بياناتك مشفّرة وآمنة. لن نشاركها مع أي طرف ثالث
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full py-4 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-white/10 border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:shadow-glow hover:scale-105 transition-all duration-200"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
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
              type="text"
              placeholder="الاسم الكامل"
              icon="person"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />

            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              icon="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
              }}
              autoComplete="email"
              required
              disabled={isLoading}
              error={errors.email || undefined}
            />

            <Input
              type="password"
              placeholder="كلمة المرور (8 أحرف على الأقل)"
              icon="lock"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              autoComplete="new-password"
              required
              error={errors.password || undefined}
              disabled={isLoading}
            />

            <Input
              type="password"
              placeholder="تأكيد كلمة المرور"
              icon="lock"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              error={errors.confirmPassword || undefined}
              autoComplete="new-password"
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              size="lg"
              aria-label="إنشاء حساب جديد"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white shadow-glow-xl hover:shadow-glow-2xl hover:scale-105 transition-all duration-200 mt-1"
              isLoading={isLoading}
            />
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-dark-brown">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="font-bold text-primary-dark dark:text-accent-primary hover:underline underline-offset-2">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
