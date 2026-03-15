// VALUE_LADDER - File 14/20: src/app/pricing/page.tsx
// ✅ COMPLETE PRICING PAGE
// 🎯 Shows Free, Monthly, and Yearly plans

'use client'
import { useState, useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Crown, Zap, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Link } from '@/i18n/routing'
import { logConversionEvent } from '@/lib/gating'
import logger from '@/lib/logger'

function PricingPageContent() {
  const t = useTranslations('nav')
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  // ✅ P3-#2: Recovery pre-fill logic
  useEffect(() => {
    const recoverId = searchParams.get('recover')
    if (recoverId) {
      // Fetch checkout session and pre-select plan
      fetch(`/api/checkout-session/${recoverId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.session) {
            // Pre-select the plan from the session
            if (data.session.plan === 'monthly' || data.session.plan === 'yearly') {
              setBillingCycle(data.session.plan)
            }
            
            // Update session status to 'recovered' if it was abandoned
            if (data.session.status === 'abandoned') {
              fetch(`/api/checkout-session/${recoverId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'recovered' })
              }).catch(err => logger.error('Failed to update session status:', err))
            }
          }
        })
        .catch(err => {
          logger.error('Failed to fetch checkout session:', err)
        })
    }
  }, [searchParams])
  
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!session) {
      // Log conversion event
      await logConversionEvent('pricing_signup_clicked', undefined, {
        plan,
        fromTier: 'GUEST'
      })
      signIn()
      return
    }
    if (isProcessing) return  // Double-click protection
    
    setIsProcessing(true)
    setCheckoutError(null)
    
    try {
      // Log conversion event
      await logConversionEvent('pricing_subscribe_clicked', session.user.id, {
        plan,
        fromTier: 'FREE',
        toTier: 'PREMIUM'
      })
      
      // ✅ P3-#1: Create checkout session instead of direct redirect
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'فشل إنشاء جلسة الدفع')
      }
      
      // Redirect to Moyasar checkout (return_url will redirect to success page after payment)
      window.location.href = data.checkoutUrl
      
    } catch (error: any) {
      logger.error('Checkout error:', error)

      let errorMessage = 'حدث خطأ غير متوقع. حاول مرة أخرى.'

      if (!navigator.onLine) {
        errorMessage = 'لا يوجد اتصال بالإنترنت. تحقق من الشبكة وأعد المحاولة.'
      } else if (error.message?.includes('Network') || error.name === 'TypeError') {
        errorMessage = 'مشكلة في الاتصال بالخادم. تحقق من الإنترنت.'
      } else if (error.message?.includes('session') || error.message?.includes('auth')) {
        errorMessage = 'انتهت صلاحية الجلسة. سجّل الدخول مرة أخرى.'
      } else if (error.status === 429) {
        errorMessage = 'تم إرسال طلبات كثيرة. انتظر قليلاً وأعد المحاولة.'
      } else {
        errorMessage = error.message || `خطأ: ${error.message || 'غير معروف'}. حاول مرة أخرى.`
      }

      setCheckoutError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-bg via-white to-primary/5 py-16 px-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-center mb-4">
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-300 list-none">
            <li>
              <Link href="/" className="hover:underline focus:underline focus:outline-none text-gray-500 dark:text-gray-300 hover:text-primary dark:hover:text-primary">
                {t('home')}
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400 dark:text-gray-500 select-none">/</li>
            <li aria-current="page">{t('pricing')}</li>
          </ol>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-black text-brown-text mb-4">
            اختر خطتك المثالية
          </h1>
          <p className="text-xl text-brown-text/75 mb-8">
            ابدأ مجاناً، ثم ارتقِ لتجربة كاملة
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex flex-row items-center justify-center gap-0 rounded-2xl p-2 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 min-w-[7rem] py-3 px-4 rounded-xl font-bold text-center transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/50'
              }`}
            >
              شهري
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 min-w-[7rem] py-3 px-4 rounded-xl font-bold relative text-center transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600/50'
              }`}
            >
              سنوي
              <span className="absolute -top-2 -right-2 bg-safe-green text-white text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                وفّر 17%
              </span>
            </button>
          </div>
        </motion.div>
        
        {/* Pricing Cards - side-by-side on desktop, stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full min-w-0 bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border-2 border-gray-200 dark:border-gray-700"
          >
            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-brown-text dark:text-gray-100 mb-2">مجاني</h3>
              <div className="text-4xl font-black text-brown-text dark:text-gray-100 mb-2">0 ريال</div>
              <p className="text-brown-text/60 dark:text-gray-300">للأبد</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-brown-text dark:text-gray-100">
                <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
                <span>اختبار شهري واحد</span>
              </li>
              <li className="flex items-start gap-2 text-brown-text dark:text-gray-100">
                <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
                <span>3 نتائج لكل اختبار</span>
              </li>
              <li className="flex items-start gap-2 text-brown-text dark:text-gray-100">
                <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
                <span>حفظ المفضلات</span>
              </li>
              <li className="flex items-start gap-2 text-brown-text dark:text-gray-100">
                <Check className="w-5 h-5 text-safe-green flex-shrink-0 mt-0.5" />
                <span>البصمة العطرية الشخصية</span>
              </li>
            </ul>
            
            <button
              onClick={() => !session && signIn()}
              className={`w-full py-3 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border ${
                session
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-brown-text dark:text-gray-100 border-gray-300 dark:border-gray-600'
              }`}
              disabled={!!session}
            >
              {session ? 'خطتك الحالية' : 'ابدأ مجاناً'}
            </button>
          </motion.div>

          {/* Premium Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full min-w-0 bg-gradient-to-br from-primary to-[#9d7a54] rounded-3xl p-8 shadow-2xl border-2 border-[#9d7a54] relative"
          >
            <div className="absolute -top-4 right-1/2 translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              الأكثر شعبية
            </div>
            
            <div className="text-center mb-6 text-white">
              <Crown className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">مميز شهري</h3>
              <div className="text-4xl font-black mb-2">
                {billingCycle === 'monthly' ? '15' : '12.5'}
                <span className="text-xl mr-1">ريال/شهر</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-white/80 text-sm">يُدفع 150 ريال سنوياً</p>
              )}
            </div>
            
            <ul className="space-y-3 mb-8 text-white">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">اختبارات غير محدودة</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">12 نتيجة لكل اختبار</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">مقارنة أسعار شاملة</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">تنبيهات أسعار غير محدودة</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">سجل اختباراتك الكامل</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">دعم أولوية</span>
              </li>
            </ul>

            {isProcessing && (
              <div className="w-full bg-brown-text/10 border border-brown-text/20 rounded-full h-2 mb-6 overflow-hidden shadow-sm">
                <div
                  className="h-full bg-gradient-to-r from-primary via-[#9d7a54] to-[#9d7a54] rounded-full transition-all duration-1000 ease-in-out shadow-md"
                  style={{ width: '65%' }}
                />
              </div>
            )}

            {checkoutError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-700 mb-3">{checkoutError}</p>
                <button 
                  onClick={() => handleSubscribe(billingCycle)}
                  disabled={isProcessing}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  حاول مرة أخرى
                </button>
              </div>
            )}
            
            <button
              onClick={() => handleSubscribe(billingCycle)}
              disabled={isProcessing}
              className="w-full py-3 px-6 bg-white text-gray-900 border border-white/70 hover:bg-gray-100 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>⏳ جاري المعالجة...</>
              ) : (
                'اشترك الآن'
              )}
            </button>
            
            <p className="text-white/80 text-xs text-center mt-4">
              إلغاء في أي وقت • ضمان استرجاع خلال 7 أيام
            </p>
          </motion.div>
        </div>
        
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-brown-text dark:text-gray-100 text-center mb-8">
            الأسئلة الشائعة
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-right"
      >
        <h3 className="text-lg font-bold text-brown-text dark:text-gray-100">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-brown-text dark:text-gray-100" />
        </motion.div>
      </button>
      
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <p className="text-brown-text/75 dark:text-gray-300 mt-4 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  )
}

const faqs = [
  {
    question: 'هل التسجيل مجاني حقاً؟',
    answer: 'نعم! التسجيل مجاني 100% ولا يتطلب بطاقة ائتمان. تحصل على اختبارين مجانيين شهرياً مع 5 نتائج لكل اختبار.'
  },
  {
    question: 'ماذا يحدث بعد استنفاذ الاختبارات المجانية؟',
    answer: 'يمكنك الانتظار حتى بداية الشهر التالي لتجديد اختباراتك المجانية، أو الاشتراك في الباقة المميزة للحصول على اختبارات غير محدودة.'
  },
  {
    question: 'هل يمكنني إلغاء الاشتراك في أي وقت؟',
    answer: 'بالتأكيد! يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. لن يتم خصم أي رسوم بعد الإلغاء.'
  },
  {
    question: 'ما هو ضمان استرجاع المال؟',
    answer: 'نقدم ضمان استرجاع كامل خلال 7 أيام من الاشتراك. إذا لم تكن راضياً، سنعيد لك المبلغ كاملاً دون أسئلة.'
  },
  {
    question: 'كيف تعمل مقارنة الأسعار؟',
    answer: 'نجمع أسعار العطور من متاجر متعددة (سيفورا، نون، أمازون، إلخ) ونعرض لك أفضل الأسعار المتاحة. مميز حصرياً لمشتركي الباقة المميزة.'
  }
]

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cream-bg via-white to-primary/5 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brown-text">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}
