"use client"
import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import logger from '@/lib/logger'
import content from '@/content'

type LocalPerfume = { id: string; name: string; brand: string; image: string }

const MIN_SELECTIONS = 3
const MAX_SELECTIONS = 12

export default function Step1FavoritesPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPerfumes, setSelectedPerfumes] = useState<LocalPerfume[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showMaxWarning, setShowMaxWarning] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<LocalPerfume[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Session Storage: Load (quiz-step1)
  useEffect(() => {
    const saved = sessionStorage.getItem('quiz-step1')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedPerfumes(parsed as LocalPerfume[])
        }
      } catch (e) {
        logger.error('Failed to load session:', e)
      }
    }
  }, [])

  // Session Storage: Save (quiz-step1)
  useEffect(() => {
    if (selectedPerfumes.length > 0) {
      sessionStorage.setItem('quiz-step1', JSON.stringify(selectedPerfumes))
    } else {
      sessionStorage.removeItem('quiz-step1')
    }
  }, [selectedPerfumes])

  // Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Search with Fragella API
  useEffect(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)
    setSearchError(null)

    fetch(`/api/perfumes/search?q=${encodeURIComponent(debouncedSearchTerm)}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!data.success || !data.data) throw new Error('Invalid response')
        // Fragella data conversion
        const converted = data.data.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          brand: p.brand,
          image: p.image || p.imageUrl
        }))
        setSearchResults(converted)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setSearchError(content.quiz.step1.searchError)
          setSearchResults([])
        }
      })
      .finally(() => setIsSearching(false))

    return () => controller.abort()
  }, [debouncedSearchTerm])

  const handleAddPerfume = (perfume: LocalPerfume) => {
    if (selectedPerfumes.length >= MAX_SELECTIONS) {
      setShowMaxWarning(true)
      setTimeout(() => setShowMaxWarning(false), 3000)
      toast.error(`الحد الأقصى ${MAX_SELECTIONS} عطور`)
      return
    }
    if (selectedPerfumes.find(p => p.id === perfume.id)) {
      toast.info('تم إضافة هذا العطر مسبقاً')
      return
    }
    setSelectedPerfumes([...selectedPerfumes, perfume])
    setSearchTerm('')
    setSearchResults([])
  }

  const handleRemovePerfume = (id: string) => {
    setSelectedPerfumes(selectedPerfumes.filter(p => p.id !== id))
  }

  const handleNext = () => {
    if (selectedPerfumes.length >= MIN_SELECTIONS) {
      startTransition(() => {
        router.push('/quiz/step2-disliked', { scroll: false })
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream-bg dark:bg-background p-6" dir="rtl">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-primary dark:bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-text-primary/20 dark:bg-surface-muted" />
            <div className="w-3 h-3 rounded-full bg-text-primary/20 dark:bg-surface-muted" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary mb-2 text-center">
            {content.quiz.step1.title}
          </h1>
          <p className="text-text-secondary dark:text-text-muted mb-8 text-center">
            {content.quiz.step1.description}
          </p>

          {/* Search Section - Text Only ⚡ */}
          <div className="mb-8 relative">
            <div className="relative">
              <Input
                type="text"
                placeholder={content.quiz.step1.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-4 pe-14 py-6 text-lg"
              />
              {isSearching && (
                <Loader2 className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2 animate-spin text-primary w-5 h-5" />
              )}
            </div>

            {/* Results - Text Only ⚠️ */}
            {searchResults.length > 0 && (
              <div className="absolute top-full start-0 end-0 mt-2 bg-white dark:bg-surface-elevated rounded-xl shadow-elevation-2 z-50 max-h-64 overflow-y-auto border border-primary/10 dark:border-border-subtle">
                {searchResults.map((perfume) => (
                  <button
                    key={perfume.id}
                    onClick={() => handleAddPerfume(perfume)}
                    className="min-h-[44px] min-w-[44px] w-full text-right p-4 hover:bg-cream-bg dark:hover:bg-surface-muted transition-colors border-b dark:border-border-subtle last:border-b-0 flex flex-col touch-manipulation"
                  >
                    <span className="font-bold text-text-primary dark:text-text-primary">{perfume.name}</span>
                    <span className="text-sm text-text-secondary dark:text-text-muted">{perfume.brand}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Perfumes - With Images ✅ */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-text-primary dark:text-text-primary">
              العطور المختارة ({selectedPerfumes.length}/{MAX_SELECTIONS})
            </h2>

            {selectedPerfumes.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-surface/50 rounded-2xl border-2 border-dashed border-primary/20 dark:border-border-subtle text-text-secondary dark:text-text-muted">
                <p>لم تختر أي عطر بعد</p>
                <p className="text-sm mt-1">ابحث وأضف عطورك المفضلة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {selectedPerfumes.map((perfume) => (
                  <SelectedPerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    onRemove={handleRemovePerfume}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-12">
            <Button
              onClick={handleNext}
              disabled={selectedPerfumes.length < MIN_SELECTIONS || isPending}
              isLoading={isPending}
              className="w-full py-6 text-xl"
              size="lg"
            >
              التالي ({selectedPerfumes.length} عطور)
            </Button>
            {selectedPerfumes.length < MIN_SELECTIONS && (
              <p className="text-sm text-center mt-3 text-text-secondary dark:text-text-muted">
                يجب اختيار {MIN_SELECTIONS} عطور على الأقل للمتابعة
              </p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function SelectedPerfumeCard({ perfume, onRemove }: { perfume: LocalPerfume, onRemove: (id: string) => void }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-surface rounded-xl shadow-elevation-1 border border-primary/5 dark:border-border-subtle hover:shadow-elevation-2 transition-all">
      <div className="relative w-20 h-20 flex-shrink-0 bg-cream-bg dark:bg-surface-muted rounded-lg overflow-hidden">
        <Image
          src={imageError || !perfume.image ? '/placeholder-perfume.svg' : perfume.image}
          alt={perfume.name}
          fill
          className="object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary dark:text-text-primary truncate">{perfume.name}</h3>
        <p className="text-sm text-text-secondary dark:text-text-muted truncate">{perfume.brand}</p>
      </div>
      <button
        onClick={() => onRemove(perfume.id)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-3 hover:bg-danger-red/10 dark:hover:bg-red-500/20 rounded-xl transition-colors touch-manipulation"
        aria-label={`حذف ${perfume.name}`}
      >
        <X className="w-6 h-6 text-danger-red dark:text-red-400" />
      </button>
    </div>
  )
}
