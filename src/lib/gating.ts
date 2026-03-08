// VALUE_LADDER - File 3/20: src/lib/gating.ts
// ✅ COMPLETE GATING UTILITY
// 🎯 Centralized logic for tier limits and access control

import { SubscriptionTier } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// ============================================
// CONSTANTS
// ============================================

export const LIMITS = {
  // Quiz Results Limits
  GUEST_RESULTS: 3,      // Guests see 3 results + blurred teaser
  FREE_RESULTS: 5,       // Free users see 5 results + upsell card
  PREMIUM_RESULTS: 12,   // Premium users see all 12 results
  
  // Monthly Test Limits
  FREE_MONTHLY_TESTS: 2, // Free users get 2 tests per month
  PREMIUM_MONTHLY_TESTS: Infinity, // Premium users get unlimited tests
  
  // Price Alerts Limits
  FREE_PRICE_ALERTS: 1,  // Free users can set 1 price alert
  PREMIUM_PRICE_ALERTS: Infinity, // Premium users get unlimited alerts
  
  // Blurred Items (for teaser UI)
  GUEST_BLURRED: 9,      // Show metadata for 9 locked items
  FREE_BLURRED: 7,       // Show metadata for 7 locked items
} as const

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface GatingResult {
  canAccess: boolean
  limit: number
  remaining?: number
  reason?: string
  upgradeMessage?: string
}

export interface UserTierInfo {
  tier: SubscriptionTier
  monthlyTestCount: number
  lastTestReset: Date
  hasActiveSubscription: boolean
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get user's tier information including subscription status
 */
export async function getUserTierInfo(userId: string): Promise<UserTierInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE',
          endDate: { gt: new Date() }
        },
        orderBy: { endDate: 'desc' },
        take: 1
      }
    }
  })
  
  if (!user) {
    throw new Error('User not found')
  }
  
  const hasActiveSubscription = user.subscriptions.length > 0
  
  // Auto-upgrade tier if subscription is active
  let actualTier = user.subscriptionTier
  if (hasActiveSubscription && actualTier !== 'PREMIUM') {
    // Update user tier to PREMIUM if they have active subscription
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionTier: 'PREMIUM' }
    })
    actualTier = 'PREMIUM'
  }
  
  return {
    tier: actualTier,
    monthlyTestCount: user.monthlyTestCount,
    lastTestReset: user.lastTestReset,
    hasActiveSubscription
  }
}

/**
 * Check if user can take another quiz/test
 */
export async function checkTestLimit(userId: string): Promise<GatingResult> {
  const userInfo = await getUserTierInfo(userId)
  
  // Check if monthly reset is needed
  const now = new Date()
  const daysSinceReset = Math.floor(
    (now.getTime() - userInfo.lastTestReset.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceReset >= 30) {
    // Reset monthly count
    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyTestCount: 0,
        lastTestReset: now
      }
    })
    userInfo.monthlyTestCount = 0
  }
  
  // Premium: unlimited tests
  if (userInfo.tier === 'PREMIUM') {
    return {
      canAccess: true,
      limit: LIMITS.PREMIUM_MONTHLY_TESTS,
      remaining: Infinity
    }
  }
  
  // Free: 2 tests per month
  if (userInfo.tier === 'FREE') {
    const remaining = LIMITS.FREE_MONTHLY_TESTS - userInfo.monthlyTestCount
    
    if (remaining <= 0) {
      return {
        canAccess: false,
        limit: LIMITS.FREE_MONTHLY_TESTS,
        remaining: 0,
        reason: 'monthly_limit_reached',
        upgradeMessage: 'استنفذت الاختبارات الشهرية المجانية. اشترك للحصول على اختبارات غير محدودة بـ 15 ريال/شهر.'
      }
    }
    
    return {
      canAccess: true,
      limit: LIMITS.FREE_MONTHLY_TESTS,
      remaining
    }
  }
  
  // Guest: Should not reach here (guests use localStorage)
  return {
    canAccess: false,
    limit: 0,
    reason: 'not_registered',
    upgradeMessage: 'سجّل مجاناً للحصول على اختبارين شهرياً!'
  }
}

/**
 * Increment user's monthly test count
 */
export async function incrementTestCount(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyTestCount: { increment: 1 }
    }
  })
}

/**
 * Get results limit based on tier
 */
export function getResultsLimit(tier: SubscriptionTier | 'GUEST'): number {
  switch (tier) {
    case 'GUEST':
      return LIMITS.GUEST_RESULTS
    case 'FREE':
      return LIMITS.FREE_RESULTS
    case 'PREMIUM':
      return LIMITS.PREMIUM_RESULTS
    default:
      return LIMITS.GUEST_RESULTS
  }
}

/**
 * Get blurred items count for teaser UI
 */
export function getBlurredCount(tier: SubscriptionTier | 'GUEST'): number {
  switch (tier) {
    case 'GUEST':
      return LIMITS.GUEST_BLURRED
    case 'FREE':
      return LIMITS.FREE_BLURRED
    case 'PREMIUM':
      return 0 // Premium sees everything
    default:
      return LIMITS.GUEST_BLURRED
  }
}

/**
 * Check if user can create price alert
 */
export async function checkPriceAlertLimit(userId: string): Promise<GatingResult> {
  const userInfo = await getUserTierInfo(userId)
  
  // Premium: unlimited alerts
  if (userInfo.tier === 'PREMIUM') {
    return {
      canAccess: true,
      limit: LIMITS.PREMIUM_PRICE_ALERTS
    }
  }
  
  // Free: 1 alert max
  if (userInfo.tier === 'FREE') {
    const alertCount = await prisma.priceAlert.count({
      where: {
        userId,
        isActive: true
      }
    })
    
    if (alertCount >= LIMITS.FREE_PRICE_ALERTS) {
      return {
        canAccess: false,
        limit: LIMITS.FREE_PRICE_ALERTS,
        remaining: 0,
        reason: 'alert_limit_reached',
        upgradeMessage: 'يمكنك إضافة تنبيه سعر واحد فقط. اشترك للحصول على تنبيهات غير محدودة.'
      }
    }
    
    return {
      canAccess: true,
      limit: LIMITS.FREE_PRICE_ALERTS,
      remaining: LIMITS.FREE_PRICE_ALERTS - alertCount
    }
  }
  
  return {
    canAccess: false,
    limit: 0,
    reason: 'not_registered'
  }
}

/**
 * Get upgrade message based on current tier and feature
 */
export function getUpgradeMessage(
  fromTier: SubscriptionTier | 'GUEST',
  feature: 'results' | 'tests' | 'alerts' | 'history'
): string {
  if (fromTier === 'GUEST') {
    return 'سجّل مجاناً لحفظ تفضيلاتك والحصول على اختبارين شهرياً!'
  }
  
  if (fromTier === 'FREE') {
    switch (feature) {
      case 'results':
        return 'اشترك الآن للوصول لـ 7 عطور إضافية تطابقك بنسبة عالية - فقط 15 ريال/شهر!'
      case 'tests':
        return 'احصل على اختبارات غير محدودة مع الاشتراك المميز - 15 ريال/شهر أو 150 ريال/سنة (وفّر 17%)!'
      case 'alerts':
        return 'احصل على تنبيهات أسعار غير محدودة مع الاشتراك المميز - 15 ريال/شهر!'
      case 'history':
        return 'اشترك للوصول لسجل اختباراتك الكامل وتتبع تطور ذوقك العطري!'
      default:
        return 'اشترك الآن للوصول لجميع المميزات - 15 ريال/شهر!'
    }
  }
  
  return ''
}

/**
 * Log conversion event for analytics
 */
export async function logConversionEvent(
  eventType: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.conversionEvent.create({
      data: {
        eventType,
        userId,
        page: metadata?.page,
        fromTier: metadata?.fromTier,
        toTier: metadata?.toTier,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    })
  } catch (error) {
    logger.error('Failed to log conversion event:', error)
    // Don't throw - analytics should not break the app
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user should see price comparison feature
 */
export function canSeePriceComparison(tier: SubscriptionTier | 'GUEST'): boolean {
  return tier === 'PREMIUM'
}

/**
 * Check if user should see test history
 */
export function canSeeTestHistory(tier: SubscriptionTier | 'GUEST'): boolean {
  return tier === 'PREMIUM'
}

/**
 * Get tier display name in Arabic
 */
export function getTierDisplayName(tier: SubscriptionTier | 'GUEST'): string {
  switch (tier) {
    case 'GUEST':
      return 'زائر'
    case 'FREE':
      return 'مجاني'
    case 'PREMIUM':
      return 'مميز'
    default:
      return 'غير معروف'
  }
}
