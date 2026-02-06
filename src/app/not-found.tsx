import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-background dark:to-surface px-4"
    >
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="w-20 h-20 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-4xl font-bold text-brown-text dark:text-text-primary mb-4">
          الصفحة غير موجودة
        </h1>
        <p className="text-brown-text/70 dark:text-text-secondary mb-8 text-lg leading-relaxed">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم حذفها.
        </p>
        <div className="flex flex-col gap-4 mb-8">
          <Button asChild variant="primary" size="lg" className="w-full">
            <Link href="/ar">العودة للرئيسية</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/ar/quiz/step1-favorites">تصفح العطور</Link>
          </Button>
        </div>
        <div className="pt-6 border-t border-brown-text/10 dark:border-border-subtle">
          <p className="text-sm text-brown-text/60 dark:text-text-muted mb-4">روابط سريعة:</p>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Link
              href="/ar"
              className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              الرئيسية
            </Link>
            <span className="text-brown-text/40 dark:text-text-muted">•</span>
            <Link
              href="/ar/quiz/step1-favorites"
              className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              الاختبار
            </Link>
            <span className="text-brown-text/40 dark:text-text-muted">•</span>
            <Link
              href="/ar/favorites"
              className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
            >
              المفضلة
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
