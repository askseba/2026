"use client"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  User,
  Camera,
  ShieldCheck,
  Lock,
  LogOut,
  AlertCircle,
  Crown,
  Zap
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Link } from '@/i18n/routing'
import { useRouter } from '@/i18n/routing'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { DeleteAccountDialog } from '@/components/profile/delete-account-dialog'

type TierResponse = {
  tier: 'GUEST' | 'FREE' | 'PREMIUM'
  hasActiveSubscription: boolean
  subscription?: {
    plan: string
    endDate: string
    amount: number
    currency: string
    status: string
  } | null
}

export default function ProfilePage() {
  const locale = useLocale()
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [tierData, setTierData] = useState<TierResponse | null>(null)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setTierData(null)
      return
    }
    fetch('/api/user/tier')
      .then((res) => res.json())
      .then((data: TierResponse) => setTierData(data))
      .catch(() => setTierData(null))
  }, [status, session?.user?.id])

  if (status === 'loading') {
    return (
      <div className="container mx-auto py-8" dir={direction}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-surface-muted rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-surface-muted rounded" />
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-bg dark:!bg-surface" dir={direction}>
        <div className="text-center space-y-6 px-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('auth.required')}</h1>
          <p className="text-text-secondary">{t('auth.pleaseSignIn')}</p>
          <Link href="/login">
            <Button>{t('auth.signInButton')}</Button>
          </Link>
        </div>
      </div>
    )
  }
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [allergySettings, setAllergySettings] = useState({
    strictMode: true,
    notifyOnAllergen: true,
    shareWithConsultants: false
  })

  const handleToggle = (key: keyof typeof allergySettings) => {
    setAllergySettings(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success(t('sensitivity.updated'))
  }

  return (
    <div className="min-h-screen bg-cream-bg dark:!bg-surface pb-20" dir={direction}>
      <div className="bg-white border-b border-primary/5 pt-12 pb-8 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <BackButton href="/" label={tCommon('backToHome')} className="mb-6" />
          <h1 className="text-lg font-bold text-text-primary mb-4">{t('pageTitle')}</h1>
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-elevation-3 border-4 border-white relative">
              <Image
                src={session?.user?.image || '/placeholder-user.png'}
                alt={t('avatarAlt')}
                fill
                className="object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-2xl shadow-button hover:scale-110 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>
          <h2 className="text-3xl font-black text-text-primary mt-6">{session?.user?.name}</h2>
          <p className="text-text-secondary text-sm">{session?.user?.email}</p>
          {tierData && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {tierData.tier === 'PREMIUM' && tierData.hasActiveSubscription ? (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-black px-3 py-1.5 rounded-full">
                  <Crown className="w-3.5 h-3.5" />
                  مميز
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-cream-bg text-text-secondary text-xs font-bold px-3 py-1.5 rounded-full">
                  <Zap className="w-3.5 h-3.5" />
                  مجاني
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-10 space-y-8">
        {tierData && (
          <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-primary/5">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              الاشتراك
            </h3>
            {tierData.tier === 'PREMIUM' && tierData.subscription ? (
              <div className="space-y-3">
                <p className="text-text-primary font-medium">
                  الحالة: <span className="text-safe-green font-bold">نشط</span>
                </p>
                <p className="text-text-secondary text-sm">
                  الخطة: {tierData.subscription.plan === 'yearly' ? 'سنوي' : 'شهري'} • ينتهي في{' '}
                  {new Date(tierData.subscription.endDate).toLocaleDateString('ar-SA')}
                </p>
                <p className="text-text-secondary text-sm">
                  {tierData.subscription.amount} {tierData.subscription.currency}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-text-secondary text-sm">خطتك الحالية: مجاني</p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => router.push('/pricing')}
                >
                  ترقية إلى مميز
                </Button>
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-primary/5">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('personalInfo.title')}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block mr-1">{t('personalInfo.fullName')}</label>
              <Input defaultValue={session?.user?.name || ''} className="rounded-xl py-6" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block mr-1">{t('personalInfo.email')}</label>
              <Input defaultValue={session?.user?.email || ''} disabled className="rounded-xl py-6 bg-cream-bg/50" title={t('personalInfo.emailReadonly')} />
            </div>
            <Button className="w-full py-6 rounded-xl mt-2">{t('personalInfo.save')}</Button>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-safe-green" />
              {t('sensitivity.title')}
            </h3>
            <span className="bg-safe-green/10 text-safe-green text-[10px] font-black px-2 py-0.5 rounded-full">{t('sensitivity.active')}</span>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-cream-bg rounded-2xl">
              <div>
                <p className="font-bold text-text-primary text-sm">{t('sensitivity.strictMode')}</p>
                <p className="text-[10px] text-text-secondary">{t('sensitivity.strictDesc')}</p>
              </div>
              <button
                onClick={() => handleToggle('strictMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${allergySettings.strictMode ? 'bg-safe-green' : 'bg-text-secondary/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allergySettings.strictMode ? 'right-7' : 'right-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-cream-bg rounded-2xl">
              <div>
                <p className="font-bold text-text-primary text-sm">{t('sensitivity.ingredientAlerts')}</p>
                <p className="text-[10px] text-text-secondary">{t('sensitivity.ingredientAlertsDesc')}</p>
              </div>
              <button
                onClick={() => handleToggle('notifyOnAllergen')}
                className={`w-12 h-6 rounded-full transition-colors relative ${allergySettings.notifyOnAllergen ? 'bg-safe-green' : 'bg-text-secondary/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allergySettings.notifyOnAllergen ? 'right-7' : 'right-1'}`} />
              </button>
            </div>
            <div className="p-4 border border-warning-amber/20 bg-warning-amber/5 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning-amber shrink-0" />
              <p className="text-[10px] text-warning-amber font-medium leading-relaxed">
                {t('sensitivity.ifraNote')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-danger-red/10">
          <h3 className="text-lg font-bold text-danger-red mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {t('danger.title')}
          </h3>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 rounded-xl border-danger-red/20 text-danger-red hover:bg-danger-red/5"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 ml-2" />
              {t('danger.logout')}
            </Button>
            <div className="w-full flex justify-center">
              <DeleteAccountDialog />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
