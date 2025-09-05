import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const budgets = await db.budget.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { activity, planned, realized, date } = await request.json()

    if (!activity || !planned || !date) {
      return NextResponse.json(
        { error: 'Activity, planned amount, and date are required' },
        { status: 400 }
      )
    }

    // For now, use a default user (admin with id 1)
    // In production, get user from proper authentication
    const userId = 1

    const budget = await db.budget.create({
      data: {
        activity,
        planned: parseFloat(planned),
        realized: parseFloat(realized) || 0,
        date: new Date(date),
        userId: userId
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}