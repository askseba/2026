import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

const DEFAULT_ALLERGY = {
  strictMode: true,
  notifyOnAllergen: true,
  shareWithConsultants: false,
}

/** GET /api/user/profile - Fetch profile + allergy settings */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        allergySettings: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    let allergySettings = DEFAULT_ALLERGY
    if (user.allergySettings) {
      try {
        allergySettings = {
          ...DEFAULT_ALLERGY,
          ...JSON.parse(user.allergySettings),
        }
      } catch {
        // invalid JSON, use defaults
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        allergySettings,
      },
    })
  } catch (error) {
    logger.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/** PATCH /api/user/profile - Update name and/or allergy settings */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const updates: { name?: string; allergySettings?: string } = {}

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim()
    }

    if (body.allergySettings && typeof body.allergySettings === 'object') {
      const a = body.allergySettings
      updates.allergySettings = JSON.stringify({
        strictMode: Boolean(a.strictMode ?? true),
        notifyOnAllergen: Boolean(a.notifyOnAllergen ?? true),
        shareWithConsultants: Boolean(a.shareWithConsultants ?? false),
      })
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Profile PATCH error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
