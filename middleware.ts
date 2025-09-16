import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protect /admin routes: only allow users with role 'admin'
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only guard /admin paths
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    // If no session, redirect to login
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    const role = (token as any)?.role

    // Allow only viewer, editor, and admin roles to access admin console
    // Block 'none', 'unauthorized', or any other role
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      const deniedUrl = new URL('/admin/unauthorized', request.url)
      return NextResponse.redirect(deniedUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


