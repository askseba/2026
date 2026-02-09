"use client"
import { useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  Heart,
  History,
  Settings,
  Sparkles,
  Zap,
  ChevronLeft,
  Star,
  Clock
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const RadarChart = dynamic(
  () => import('@/components/ui/RadarChart').then(mod => ({ default: mod.RadarChart })),
  { ssr: false, loading: () => <div className="aspect-square bg-cream-bg animate-pulse rounded-3xl" /> }
)

const LATEST_RECOMMENDATIONS = [
  { category: 'Perfume', brand: 'Dior', name: 'Sauvage Elixir', match: 95 },
  { category: 'Perfume', brand: 'Dior', name: 'Sauvage Elixir', match: 95 }
] as const

export default function DashboardPage() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const t = useTranslations('dashboard')
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-cream-bg dark:!bg-surface"><LoadingSpinner size="lg" /></div>
  if (status === 'unauthenticated') { router.push('/login'); return null; }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream-bg dark:!bg-surface pb-20" dir={direction}>
        <header className="bg-white dark:bg-surface border-b border-primary/5 dark:border-border-subtle pt-12 pb-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col gap-4">
            <BackButton variant="link" className="mb-6" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-[2rem] overflow-hidden shadow-elevation-2 border-4 border-white">
                  <Image
                    src={session?.user?.image || '/placeholder-user.png'}
                    alt={session?.user?.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-text-primary mb-1">أهلاً، {session?.user?.name?.split(' ')[0]} ✨</h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">عضو بريميوم</span>
                    <span className="text-text-secondary text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      عضو منذ يناير 2024
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => router.push('/profile')}>
                  <Settings className="w-4 h-4 ml-2" />
                  الإعدادات
                </Button>
                <Button size="sm" className="rounded-xl shadow-button" onClick={() => router.push('/results')}>
                  <Sparkles className="w-4 h-4 ml-2" />
                  تحليل جديد
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <RadarChart className="shadow-elevation-2" />
              <div className="bg-white rounded-3xl p-6 shadow-elevation-1 border border-primary/5">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  إحصائيات سريعة
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-cream-bg rounded-2xl">
                    <span className="text-sm text-text-secondary">عطور تم تحليلها</span>
                    <span className="font-black text-text-primary">124</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream-bg rounded-2xl">
                    <span className="text-sm text-text-secondary">نسبة الدقة</span>
                    <span className="font-black text-safe-green">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cream-bg rounded-2xl">
                    <span className="text-sm text-text-secondary">توفير محتمل</span>
                    <span className="font-black text-primary">450 ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-primary/5">
                {[
                  { id: 'overview', label: 'نظرة عامة', icon: Sparkles },
                  { id: 'favorites', label: 'المفضلة', icon: Heart },
                  { id: 'history', label: 'السجل', icon: History }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-button'
                        : 'text-text-secondary hover:bg-cream-bg'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <section>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-text-primary">أحدث التوصيات لك</h2>
                        <Button variant="ghost" size="sm" className="text-primary font-bold">عرض الكل</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {LATEST_RECOMMENDATIONS.map((p, i) => (
                          <div key={i} className="bg-white p-4 rounded-3xl border border-primary/5 flex items-center gap-4 hover:shadow-elevation-2 transition-all cursor-pointer group">
                            <div className="relative w-20 h-20 bg-cream-bg rounded-2xl overflow-hidden">
                              <Image src="/placeholder-perfume.svg" alt={p.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-primary uppercase">{p.category}</p>
                              <p className="text-[10px] font-bold text-primary uppercase">{p.brand}</p>
                              <h4 className="font-bold text-text-primary">{p.name}</h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-warning-amber fill-current" />
                                <span className="text-xs font-bold text-text-secondary">{t('matchFormat', { pct: p.match })}</span>
                              </div>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="bg-gradient-to-br from-primary to-primary-light rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-elevation-3">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-2">اكتشف عطر توقيعك القادم</h3>
                        <p className="opacity-90 mb-6 text-sm max-w-md">لقد قمنا بتحديث خوارزمية التحليل الخاصة بك بناءً على آخر 5 عطور أعجبتك.</p>
                        <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-black px-8">ابدأ التحليل العميق</Button>
                      </div>
                      <Sparkles className="absolute top-1/2 right-8 -translate-y-1/2 w-32 h-32 opacity-10 rotate-12" />
                    </section>
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-primary/20">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">قائمة مفضلاتك فارغة</h3>
                    <p className="text-text-secondary text-sm mb-8">ابدأ باستكشاف العطور وأضف ما يعجبك هنا</p>
                    <Button onClick={() => router.push('/results')}>استكشف العطور الآن</Button>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-cream-bg p-3 rounded-xl"><History className="w-5 h-5 text-text-secondary" /></div>
                          <div>
                            <p className="font-bold text-text-primary text-sm">تحليل ذوق متكامل</p>
                            <p className="text-[10px] text-text-secondary">24 يناير 2024 • 12:30 م</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs font-bold">عرض النتائج</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}
