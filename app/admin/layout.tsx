'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-16 z-40 bg-surface border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted">
            Admin
          </span>
        </div>
        {!isLoginPage && (
          <div className="flex items-center gap-4">
            <Link
              href="/admin/submissions"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Submissions
            </Link>
            <Link
              href="/admin/analytics"
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/"
              className="text-xs text-muted hover:text-foreground transition-colors"
              target="_blank"
            >
              View site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-muted hover:text-foreground transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminNav />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        {children}
      </main>
    </>
  )
}
