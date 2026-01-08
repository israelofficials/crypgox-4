import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER_COOKIE = 'crypgo_token'
const ADMIN_COOKIE = 'crypgo_admin_token'
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/support',
  '/downloads',
  '/not-found',
]
const ADMIN_PUBLIC_PATHS = ['/admin/login']

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true
  }

  // Allow static files with common extensions
  if (/\.(apk|apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|ico|pdf|txt|xml|json)$/i.test(pathname)) {
    return true
  }

  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname === '/favicon.ico'
  )
}

const isProtectedPath = (pathname: string) => {
  return pathname.startsWith('/exchange') || pathname.startsWith('/me')
}

const isAdminPath = (pathname: string) => pathname.startsWith('/admin')

const isAdminPublicPath = (pathname: string) => ADMIN_PUBLIC_PATHS.includes(pathname)

const isUserAuthPath = (pathname: string) => pathname === '/login'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware entirely for static files with extensions
  // This is a safety check in case the matcher doesn't catch them
  if (/\.(apk|apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|ico|pdf|txt|xml|json|woff|woff2|ttf|eot)$/i.test(pathname)) {
    return NextResponse.next()
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (isAdminPath(pathname)) {
    const adminToken = req.cookies.get(ADMIN_COOKIE)?.value

    if (!adminToken && !isAdminPublicPath(pathname)) {
      const loginUrl = new URL('/admin/login', req.nextUrl.origin)
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    if (adminToken && isAdminPublicPath(pathname)) {
      const redirectUrl = req.nextUrl.searchParams.get('redirect')
      return NextResponse.redirect(new URL(redirectUrl || '/admin', req.nextUrl.origin))
    }

    return NextResponse.next()
  }

  const userToken = req.cookies.get(USER_COOKIE)?.value

  if (isProtectedPath(pathname) && !userToken) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  if (userToken && isUserAuthPath(pathname)) {
    const redirectUrl = req.nextUrl.searchParams.get('redirect')
    return NextResponse.redirect(new URL(redirectUrl || '/exchange', req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static file extensions (images, fonts, apk, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|crypgox\\.apk|.*\\.(?:apk|png|jpg|jpeg|gif|svg|webp|ico|pdf|txt|xml|json|woff|woff2|ttf|eot)).*)',
  ],
}
