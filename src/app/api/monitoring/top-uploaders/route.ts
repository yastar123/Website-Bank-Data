import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface TopUploader {
  username: string
  count: number
}

export async function GET() {
  try {
    const topUploaders = await db.$queryRaw<TopUploader[]>`
      SELECT 
        u.username,
        COUNT(d.id) as count
      FROM users u
      LEFT JOIN documents d ON u.id = d.uploaderId
      GROUP BY u.id, u.username
      HAVING COUNT(d.id) > 0
      ORDER BY count DESC
      LIMIT 10
    `

    return NextResponse.json(topUploaders)
  } catch (error) {
    console.error('Error fetching top uploaders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}