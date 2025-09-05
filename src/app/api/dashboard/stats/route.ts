import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total documents
    const totalDocuments = await db.document.count()

    // Get budget stats
    const budgets = await db.budget.findMany({
      select: {
        planned: true,
        realized: true
      }
    })

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.planned, 0)
    const totalRealized = budgets.reduce((sum, budget) => sum + budget.realized, 0)

    // Get total users
    const totalUsers = await db.user.count()

    // Get recent uploads (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentUploads = await db.document.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    return NextResponse.json({
      totalDocuments,
      totalBudget,
      totalRealized,
      totalUsers,
      recentUploads
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}