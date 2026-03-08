// Checkout recovery – GET session by recoverId, PATCH status to recovered
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

type RouteParams = { params: Promise<{ recoverId: string }> }

/**
 * GET /api/checkout-session/[recoverId]
 * Fetch checkout session by id for recovery pre-fill (e.g. ?recover=xxx on pricing).
 * Link is the secret; no auth required so recovery email links work.
 * Returns 404 if session not found.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { recoverId } = await params
    if (!recoverId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'معرف الاسترداد مطلوب' },
        { status: 400 }
      )
    }

    const session = await prisma.checkoutSession.findUnique({
      where: { id: recoverId.trim() }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'جلسة الدفع غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        plan: session.plan,
        status: session.status
      }
    })
  } catch (err) {
    logger.error('Checkout session GET error:', err)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب جلسة الدفع' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/checkout-session/[recoverId]
 * Update session status (e.g. to 'recovered' when user returns from recovery link).
 * Only allows status -> 'recovered' when current status is 'abandoned'.
 * Returns 404 if session not found.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { recoverId } = await params
    if (!recoverId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'معرف الاسترداد مطلوب' },
        { status: 400 }
      )
    }

    const session = await prisma.checkoutSession.findUnique({
      where: { id: recoverId.trim() }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'جلسة الدفع غير موجودة' },
        { status: 404 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const newStatus = (body.status ?? '').toString()

    if (newStatus !== 'recovered') {
      return NextResponse.json(
        { success: false, error: 'السماح فقط بتحديث الحالة إلى recovered' },
        { status: 400 }
      )
    }

    if (session.status !== 'abandoned') {
      return NextResponse.json({
        success: true,
        session: { plan: session.plan, status: session.status }
      })
    }

    await prisma.checkoutSession.update({
      where: { id: recoverId.trim() },
      data: { status: 'recovered' }
    })

    return NextResponse.json({
      success: true,
      session: { plan: session.plan, status: 'recovered' }
    })
  } catch (err) {
    logger.error('Checkout session PATCH error:', err)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث جلسة الدفع' },
      { status: 500 }
    )
  }
}
