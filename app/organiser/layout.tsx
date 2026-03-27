'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OrganiserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/organiser/login')
  }

  const navLinks = [
    { href: '/organiser/dashboard', label: 'My listings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Admin-style sticky header */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted">
              This Is
            </span>
            <span className="text-lg font-extrabold tracking-[-0.04em] text-foreground">
              Haringey<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-foreground',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:block text-xs text-muted hover:text-foreground transition-colors"
            >
              View site
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted hover:text-foreground hover:border-foreground transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
