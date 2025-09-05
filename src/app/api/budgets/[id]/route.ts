import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = parseInt(params.id)
    const { activity, planned, realized, date } = await request.json()

    if (isNaN(budgetId)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      )
    }

    if (!activity || !planned || !date) {
      return NextResponse.json(
        { error: 'Activity, planned amount, and date are required' },
        { status: 400 }
      )
    }

    const budget = await db.budget.update({
      where: { id: budgetId },
      data: {
        activity,
        planned: parseFloat(planned),
        realized: parseFloat(realized) || 0,
        date: new Date(date)
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
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetId = parseInt(params.id)

    if (isNaN(budgetId)) {
      return NextResponse.json(
        { error: 'Invalid budget ID' },
        { status: 400 }
      )
    }

    await db.budget.delete({
      where: { id: budgetId }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}