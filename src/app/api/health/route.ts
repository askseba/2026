import { NextResponse } from 'next/server'

/**
 * Lightweight reachability check for PWA offline detection.
 * Used by service worker to avoid showing offline.html when the app server is reachable
 * (e.g. on localhost where navigator.onLine may be false).
 */
export function GET() {
  return new NextResponse(null, { status: 200 })
}

export function HEAD() {
  return new NextResponse(null, { status: 200 })
}
