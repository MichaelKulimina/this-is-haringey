import { NextRequest, NextResponse } from 'next/server'

// Coming-soon gate — active only when COMING_SOON=true in environment variables.
// To open the site, set COMING_SOON to any other value (or remove it) and redeploy.

export function middleware(request: NextRequest) {
  if (process.env.COMING_SOON !== 'true') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Always allow: the landing page itself, its API routes, and static assets
  const isAllowed =
    pathname.startsWith('/coming-soon') ||
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/api/preview-access') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname === '/robots.txt' ||
    pathname === '/kulimina-wordmark.png'

  if (isAllowed) return NextResponse.next()

  // Allow requests that carry a valid preview-access cookie
  const accessCookie = request.cookies.get('tih-preview-access')
  if (accessCookie?.value === 'granted') return NextResponse.next()

  // Otherwise send to the coming-soon page, preserving the intended destination
  const url = request.nextUrl.clone()
  url.pathname = '/coming-soon'
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
