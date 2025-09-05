import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MonthlyUpload {
  month: string
  count: number
}

export async function GET() {
  try {
    // Get monthly upload counts for the last 12 months
    const monthlyUploads = await db.$queryRaw<MonthlyUpload[]>`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count
      FROM documents 
      WHERE createdAt >= datetime('now', '-12 months')
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `

    return NextResponse.json(monthlyUploads)
  } catch (error) {
    console.error('Error fetching monthly uploads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}