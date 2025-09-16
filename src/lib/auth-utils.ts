import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function getUserEmailFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    return (token as { email?: string })?.email || null
  } catch (error) {
    console.error('Error getting user email from request:', error)
    return null
  }
}
