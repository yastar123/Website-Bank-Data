import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started')
    
    const body = await request.json()
    const { username, password } = body
    
    console.log('Received credentials:', { username, password: '***' })
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    // Hardcoded check untuk testing
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: '1',
          username: 'admin',
          createdAt: new Date().toISOString()
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
    
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}