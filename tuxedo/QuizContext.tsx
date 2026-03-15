"use client"
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import logger from '@/lib/logger'

interface QuizData {
  step1_liked: string[]
  step2_disliked: string[]
  step3_allergy: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
}

interface QuizContextType {
  data: QuizData
  setStep: <K extends keyof QuizData>(step: K, value: QuizData[K]) => void
  clearQuiz: () => void
  isComplete: boolean
  isHydrated: boolean
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const defaultData: QuizData = {
  step1_liked: [],
  step2_disliked: [],
  step3_allergy: {
    symptoms: [],
    families: [],
    ingredients: []
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  // ✅ FIX: Always start with defaultData to match server render (prevents hydration mismatch)
  const [data, setData] = useState<QuizData>(defaultData)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from sessionStorage after mount (client-only, prevents hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let next: QuizData = { ...defaultData }
      const saved = sessionStorage.getItem('quizData')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          next = {
            step1_liked: parsed.step1_liked || [],
            step2_disliked: parsed.step2_disliked || [],
            step3_allergy: parsed.step3_allergy || {
              symptoms: [],
              families: [],
              ingredients: []
            }
          }
        } catch (e) {
          logger.error('Failed to load quiz data:', e)
        }
      }
      // Merge legacy keys so step guard sees progress from step1/step2 pages
      try {
        const step1Raw = sessionStorage.getItem('quiz-step1')
        if (step1Raw) {
          const arr = JSON.parse(step1Raw)
          if (Array.isArray(arr) && arr.length > 0) {
            const ids = arr.map((p: { id?: string }) => p.id).filter((id): id is string => Boolean(id))
            if (ids.length > 0) next.step1_liked = ids
          }
        }
        const step2Raw = sessionStorage.getItem('quiz_step2')
        if (step2Raw) {
          const arr = JSON.parse(step2Raw)
          if (Array.isArray(arr)) next.step2_disliked = arr
        } else {
          const step2Data = sessionStorage.getItem('quiz-step2-data')
          if (step2Data) {
            const arr = JSON.parse(step2Data)
            if (Array.isArray(arr) && arr.length > 0) {
              next.step2_disliked = arr.map((p: { id?: string }) => p.id).filter((id): id is string => Boolean(id))
            }
            // empty step2 = skip; leave step2_disliked as [] from default or quizData
          }
        }
      } catch (e) {
        logger.error('Failed to merge legacy quiz storage:', e)
      }
      setData(next)
      setIsHydrated(true)
    }
  }, []) // Run once on mount

  // Save to sessionStorage whenever data changes (session persistence)
  // Only save after hydration to avoid unnecessary writes during initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('quizData', JSON.stringify(data))
    }
  }, [data, isHydrated])

  const setStep = useCallback<<K extends keyof QuizData>>(
    step: K,
    value: QuizData[K]
  ) => {
    setData(prev => ({
      ...prev,
      [step]: value
    }))
  }, [])

  const clearQuiz = () => {
    setData(defaultData)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quizData')
    }
  }

  const isComplete = 
    data.step1_liked.length >= 3 &&
    data.step2_disliked.length >= 0 && // Optional
    (data.step3_allergy.symptoms.length > 0 ||
     data.step3_allergy.families.length > 0 ||
     data.step3_allergy.ingredients.length > 0)

  return (
    <QuizContext.Provider
      value={{
        data,
        setStep,
        clearQuiz,
        isComplete,
        isHydrated
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}

"use client"
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import logger from '@/lib/logger'

interface QuizData {
  step1_liked: string[]
  step2_disliked: string[]
  step3_allergy: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
}

interface QuizContextType {
  data: QuizData
  setStep: <K extends keyof QuizData>(step: K, value: QuizData[K]) => void
  clearQuiz: () => void
  isComplete: boolean
  isHydrated: boolean
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

const defaultData: QuizData = {
  step1_liked: [],
  step2_disliked: [],
  step3_allergy: {
    symptoms: [],
    families: [],
    ingredients: []
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  // ✅ FIX: Always start with defaultData to match server render (prevents hydration mismatch)
  const [data, setData] = useState<QuizData>(defaultData)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from sessionStorage after mount (client-only, prevents hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let next: QuizData = { ...defaultData }
      const saved = sessionStorage.getItem('quizData')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          next = {
            step1_liked: parsed.step1_liked || [],
            step2_disliked: parsed.step2_disliked || [],
            step3_allergy: parsed.step3_allergy || {
              symptoms: [],
              families: [],
              ingredients: []
            }
          }
        } catch (e) {
          logger.error('Failed to load quiz data:', e)
        }
      }
      // Merge legacy keys so step guard sees progress from step1/step2 pages
      try {
        const step1Raw = sessionStorage.getItem('quiz-step1')
        if (step1Raw) {
          const arr = JSON.parse(step1Raw)
          if (Array.isArray(arr) && arr.length > 0) {
            const ids = arr.map((p: { id?: string }) => p.id).filter((id): id is string => Boolean(id))
            if (ids.length > 0) next.step1_liked = ids
          }
        }
        const step2Raw = sessionStorage.getItem('quiz_step2')
        if (step2Raw) {
          const arr = JSON.parse(step2Raw)
          if (Array.isArray(arr)) next.step2_disliked = arr
        } else {
          const step2Data = sessionStorage.getItem('quiz-step2-data')
          if (step2Data) {
            const arr = JSON.parse(step2Data)
            if (Array.isArray(arr) && arr.length > 0) {
              next.step2_disliked = arr.map((p: { id?: string }) => p.id).filter((id): id is string => Boolean(id))
            }
            // empty step2 = skip; leave step2_disliked as [] from default or quizData
          }
        }
      } catch (e) {
        logger.error('Failed to merge legacy quiz storage:', e)
      }
      setData(next)
      setIsHydrated(true)
    }
  }, []) // Run once on mount

  // Save to sessionStorage whenever data changes (session persistence)
  // Only save after hydration to avoid unnecessary writes during initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      sessionStorage.setItem('quizData', JSON.stringify(data))
    }
  }, [data, isHydrated])

  const setStep = useCallback<<K extends keyof QuizData>>(
    step: K,
    value: QuizData[K]
  ) => {
    setData(prev => ({
      ...prev,
      [step]: value
    }))
  }, [])

  const clearQuiz = () => {
    setData(defaultData)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('quizData')
    }
  }

  const isComplete = 
    data.step1_liked.length >= 3 &&
    data.step2_disliked.length >= 0 && // Optional
    (data.step3_allergy.symptoms.length > 0 ||
     data.step3_allergy.families.length > 0 ||
     data.step3_allergy.ingredients.length > 0)

  return (
    <QuizContext.Provider
      value={{
        data,
        setStep,
        clearQuiz,
        isComplete,
        isHydrated
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}

