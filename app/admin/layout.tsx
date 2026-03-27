'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function AdminNav() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/submissions" className="flex flex-col leading-none select-none">
            <span className="text-[10px] font-semibold tracking-[0.20em] uppercase text-primary">
              This Is
            </span>
            <span className="text-lg font-extrabold tracking-[-0.04em] text-foreground">
              Haringey<span className="text-primary">.</span>
            </span>
          </Link>
          <span className="hidden sm:block text-xs font-medium text-muted border-l border-border pl-3">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
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
