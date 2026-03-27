'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasVerifyError = searchParams.get('error') === '1'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) throw signInError

      const next = searchParams.get('next') ?? '/organiser/dashboard'
      router.push(next)
      router.refresh()
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message.includes('Invalid login')
          ? 'Incorrect email or password. Please try again.'
          : (err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
  const labelClass = 'block text-sm font-medium text-foreground mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasVerifyError && (
        <div className="p-3 rounded-md bg-[#FDF5F1] border border-primary/20 text-sm text-primary">
          Email verification failed. Please try again or contact us for help.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-[#FDF5F1] border border-primary/20 text-sm text-primary">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/organiser/register" className="text-primary hover:underline font-medium">
          Create one
        </Link>
      </p>
    </form>
  )
}
