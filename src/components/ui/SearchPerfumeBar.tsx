'use client'

import { useState, useEffect } from 'react'
import { Perfume } from '@/lib/data/perfumes'
import { safeFetch, validateArray, validateObject } from '@/lib/utils/api-helpers'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { voiceSearchEnabled } from '@/lib/feature-flags'
import logger from '@/lib/logger'
import { VoiceMicButton } from './VoiceMicButton'

interface SearchPerfumeBarProps {
  onResults?: (perfumes: Perfume[]) => void
}

export default function SearchPerfumeBar({ onResults }: SearchPerfumeBarProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Perfume[]>([])
  const { state, startListening, stopListening, reset, isSupported } = useVoiceSearch({
    onTranscript: (text) => setQuery(text),
  })

  // Debounce the search query with 300ms delay
  const debouncedQuery = useDebounce(query, 300)

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        onResults?.([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const data = await safeFetch<{ success: boolean; perfumes?: Perfume[]; total?: number; error?: string }>(
          `/api/perfumes/search?q=${encodeURIComponent(searchQuery)}&limit=50`
        )
        
        // Validate response structure
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          throw new Error('استجابة غير صحيحة من الخادم')
        }
        
        const validatedData = data as { perfumes?: Perfume[]; total?: number }
        
        // Ensure perfumes is an array
        const perfumesArray = validatedData.perfumes 
          ? validateArray<Perfume>(validatedData.perfumes, 'النتائج يجب أن تكون مصفوفة')
          : []
        
        setResults(perfumesArray)
        onResults?.(perfumesArray)
      } catch (error) {
        logger.error('Search error:', error)
        setResults([])
        onResults?.([])
        const errorMessage = error instanceof Error ? error.message : 'فشل البحث'
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    performSearch(debouncedQuery)
  }, [debouncedQuery, onResults])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    // Show loading state immediately when user types
    if (value.trim()) {
      setLoading(true)
    } else {
      setLoading(false)
      setResults([])
      onResults?.([])
    }
  }

  return (
    <div className="w-full" dir="rtl">
      <div className="relative">
        {voiceSearchEnabled && isSupported && (
          <VoiceMicButton
            className="absolute right-4 top-1/2 -translate-y-1/2"
            state={state}
            startListening={startListening}
            stopListening={stopListening}
            reset={reset}
          />
        )}
        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          placeholder="ابحث عن عطر..."
          className="w-full pr-4 pl-14 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((perfume) => (
            <div key={perfume.id} className="p-3 border rounded-lg">
              <h3 className="text-xl md:text-2xl font-semibold">{perfume.name}</h3>
              <p className="text-sm text-gray-600">{perfume.brand}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
