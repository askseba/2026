/**
 * Type definitions for the matching/quiz algorithm
 * Ensures type safety across match API and related services
 */

export interface TimelineStage {
  stage: 'top' | 'heart' | 'base'
  notes: string[]
  duration?: number
}

export interface PerfumeTimeline {
  stages: TimelineStage[]
  totalDuration?: number
}

export interface PerfumeForMatching {
  id: string
  name: string
  brand: string
  families: string[]
  stages: TimelineStage[]
  matchScore?: number
  source: 'local' | 'fragella'
  price?: number
  image?: string
}

export interface MatchPreferences {
  likedPerfumeIds: string[]
  dislikedPerfumeIds: string[]
  allergies?: {
    symptoms: string[]
    families: string[]
    ingredients: string[]
  }
}

export interface MatchResult {
  perfumes: PerfumeForMatching[]
  totalCount: number
  blurredCount: number
  source: {
    local: number
    fragella: number
  }
}

