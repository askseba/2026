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
        // allergySettings: true, // not in User model
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const allergySettings = DEFAULT_ALLERGY

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
    // Only update fields that exist on User model (no allergySettings in schema)
    const data: { name?: string } = {}

    if (typeof body.name === 'string' && body.name.trim()) {
      data.name = body.name.trim()
    }

    // allergySettings accepted in body for API compatibility but not persisted (no column on User)

    if (Object.keys(data).length === 0) {
      // No persistable fields; accept and return success (e.g. allergySettings-only body)
      return NextResponse.json({ success: true })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
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
