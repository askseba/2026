import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

/** GET /api/user/favorites - List favorite perfume IDs for current user */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', data: [] },
        { status: 401 }
      )
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: session.user.id },
      select: { perfumeId: true },
    })
    const data = favorites.map((f) => f.perfumeId)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[favorites GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error), data: [] },
      { status: 500 }
    )
  }
}

/** POST /api/user/favorites - Add or remove favorite. Body: { perfumeId, action: 'add' | 'remove' } */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', message: 'يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const perfumeId = (body.perfumeId ?? body.perfume_id ?? '').toString().trim()
    const action = (body.action ?? 'add').toString().toLowerCase()

    if (!perfumeId) {
      return NextResponse.json(
        { success: false, error: 'perfumeId is required' },
        { status: 400 }
      )
    }

    if (action === 'remove') {
      await prisma.userFavorite.deleteMany({
        where: {
          userId: session.user.id,
          perfumeId,
        },
      })
      return NextResponse.json({
        success: true,
        message: 'تمت إزالة المفضلة',
      })
    }

    await prisma.userFavorite.upsert({
      where: {
        userId_perfumeId: {
          userId: session.user.id,
          perfumeId,
        },
      },
      create: {
        userId: session.user.id,
        perfumeId,
      },
      update: {},
    })
    return NextResponse.json({
      success: true,
      message: 'تمت إضافة المفضلة',
    })
  } catch (error) {
    logger.error('Favorites POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update favorites' },
      { status: 500 }
    )
  }
}
