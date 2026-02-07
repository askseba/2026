"use client"
import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  User,
  Camera,
  ShieldCheck,
  Bell,
  Lock,
  LogOut,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ProfilePage() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const { data: session } = useSession()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [allergySettings, setAllergySettings] = useState({
    strictMode: true,
    notifyOnAllergen: true,
    shareWithConsultants: false
  })

  const handleToggle = (key: keyof typeof allergySettings) => {
    setAllergySettings(prev => ({ ...prev, [key]: !prev[key] }))
    toast.success('تم تحديث الإعدادات بنجاح')
  }

  return (
    <div className="min-h-screen bg-cream-bg dark:!bg-surface pb-20" dir={direction}>
      <div className="bg-white border-b border-primary/5 pt-12 pb-8 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="relative inline-block group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-elevation-3 border-4 border-white relative">
              <Image
                src={session?.user?.image || '/placeholder-user.png'}
                alt="Profile"
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
          <h1 className="text-3xl font-black text-text-primary mt-6">{session?.user?.name}</h1>
          <p className="text-text-secondary text-sm">{session?.user?.email}</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-10 space-y-8">
        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-primary/5">
          <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            المعلومات الشخصية
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block mr-1">الاسم الكامل</label>
              <Input defaultValue={session?.user?.name || ''} className="rounded-xl py-6" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block mr-1">البريد الإلكتروني</label>
              <Input defaultValue={session?.user?.email || ''} disabled className="rounded-xl py-6 bg-cream-bg/50" />
            </div>
            <Button className="w-full py-6 rounded-xl mt-2">حفظ التغييرات</Button>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-safe-green" />
              إعدادات الحساسية المتقدمة
            </h3>
            <span className="bg-safe-green/10 text-safe-green text-[10px] font-black px-2 py-0.5 rounded-full">نشط</span>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-cream-bg rounded-2xl">
              <div>
                <p className="font-bold text-text-primary text-sm">الوضع الصارم (Strict Mode)</p>
                <p className="text-[10px] text-text-secondary">إخفاء أي عطر يحتوي على مسببات حساسية محتملة تماماً</p>
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
                <p className="font-bold text-text-primary text-sm">تنبيهات المكونات</p>
                <p className="text-[10px] text-text-secondary">إرسال تنبيه عند توفر عطور جديدة تناسب ملفك الصحي</p>
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
                ملاحظة: يتم تحديث قاعدة بيانات المكونات أسبوعياً بناءً على معايير IFRA الدولية لضمان سلامتك.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2rem] p-8 shadow-elevation-1 border border-danger-red/10">
          <h3 className="text-lg font-bold text-danger-red mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            منطقة الخطر
          </h3>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 rounded-xl border-danger-red/20 text-danger-red hover:bg-danger-red/5"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </Button>
            <button className="w-full text-center text-xs text-text-secondary hover:text-danger-red transition-colors flex items-center justify-center gap-1">
              <Trash2 className="w-3 h-3" />
              حذف الحساب نهائياً
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
