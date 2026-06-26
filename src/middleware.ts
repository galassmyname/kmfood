import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Seulement protéger /admin/* sauf /admin/login
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  // Chercher le cookie de session Supabase
  const allCookies = request.cookies.getAll()
  const hasAuth = allCookies.some(c => 
    c.name.includes('auth-token') || 
    c.name.includes('sb-') ||
    c.value.includes('access_token')
  )

  if (!hasAuth) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}