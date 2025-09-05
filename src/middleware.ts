import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function middleware(request: NextRequest) {
  // For now, we'll skip authentication for development
  // In production, you should implement proper JWT or session-based auth
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}