import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Supabase Storage hostname for CSP img-src
const SUPABASE_HOSTNAME = 'ykrgaigbnlqzvhquybdy.supabase.co'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ── 1. Admin route protection ───────────────────────────────────────────────
  // /admin/* routes require an admin JWT, except /admin/login itself.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    let isAdmin = false

    try {
      const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      })

      const {
        data: { user },
      } = await supabase.auth.getUser()

      isAdmin = user?.app_metadata?.role === 'admin'
    } catch {
      isAdmin = false
    }

    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── 2. Content Security Policy (nonce-based) ────────────────────────────────
  const nonce = crypto.randomUUID()

  const isDev = process.env.NODE_ENV === 'development'

  const csp = [
    `default-src 'self'`,
    // Allow unsafe-eval in dev — React requires it for call-stack reconstruction
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''}`,
    `frame-src https://js.stripe.com https://hooks.stripe.com`,
    `img-src 'self' data: blob: https://${SUPABASE_HOSTNAME}`,
    `connect-src 'self' https://${SUPABASE_HOSTNAME} https://api.stripe.com`,
    // unsafe-inline required for Tailwind v4 inline styles
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self' https://fonts.gstatic.com`,
    `form-action 'self'`,
    `base-uri 'self'`,
  ]
    .join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Nonce', nonce)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    // Exclude: Stripe webhook, Next.js internals, static files
    '/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)',
  ],
}
