'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/admin/submissions')
  }

  const inputCls =
    'w-full border border-border rounded-md px-3 py-2 text-sm bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col leading-none select-none mb-8 text-center items-center">
          <span className="text-[11px] font-semibold tracking-[0.20em] uppercase text-primary">
            This Is
          </span>
          <span className="text-[22px] font-extrabold tracking-[-0.04em] text-foreground">
            Haringey<span className="text-primary">.</span>
          </span>
          <span className="mt-2 text-xs text-muted">Admin dashboard</span>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h1 className="text-lg font-bold tracking-[-0.02em] text-foreground mb-5">
            Sign in
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-[#FDF5F1] border border-[#E05A2B]/30 text-sm text-[#B84520]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
