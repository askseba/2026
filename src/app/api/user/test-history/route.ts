import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/** GET /api/user/test-history
 *  - authenticated only
 *  - returns history ordered by newest first
 *  - ?latest=1 returns only the most recent record
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const latestOnly = searchParams.get('latest') === '1'

    const records = await prisma.testHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      ...(latestOnly ? { take: 1 } : {}),
      select: {
        id: true,
        createdAt: true,
        totalMatches: true,
        topMatchId: true,
        topMatchScore: true,
        scentDNA: true,
        likedPerfumes: true,
      },
    })

    const data = records.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      totalMatches: r.totalMatches,
      topMatchId: r.topMatchId,
      topMatchScore: r.topMatchScore,
      scentDNA: r.scentDNA ? (() => { try { return JSON.parse(r.scentDNA!) } catch { return null } })() : null,
      likedPerfumes: (() => { try { return JSON.parse(r.likedPerfumes) } catch { return [] } })(),
    }))

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('[test-history] Error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
