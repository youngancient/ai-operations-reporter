import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('exec_session')

  // Let them access login page freely
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session) {
      // If already logged in, redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes might need their own auth checks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
