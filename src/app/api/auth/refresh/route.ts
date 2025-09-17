import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    // Force session refresh by getting fresh session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Return the fresh session data
    return NextResponse.json({ 
      message: 'Session refreshed successfully',
      user: session.user,
      role: (session.user as { role?: string })?.role
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error refreshing session:', error)
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
  }
}
