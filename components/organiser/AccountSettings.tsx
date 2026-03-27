'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  organiser: {
    id: string
    full_name: string
    organisation_name: string | null
    email: string
  }
  userId: string
}

export default function AccountSettings({ organiser, userId }: Props) {
  const [fullName, setFullName] = useState(organiser.full_name)
  const [orgName, setOrgName] = useState(organiser.organisation_name ?? '')
  const [email, setEmail] = useState(organiser.email)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Update profile via API
      const res = await fetch('/api/organiser/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          organisation_name: orgName || null,
          email,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update profile')
      }

      // Update password separately via Supabase client if provided
      if (newPassword) {
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters')
        }
        const supabase = createClient()
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })
        if (pwError) throw pwError
        setNewPassword('')
      }

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary'
  const labelClass = 'block text-sm font-medium text-foreground mb-1'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface border border-border rounded-lg p-6 space-y-4 max-w-lg"
    >
      {error && (
        <div className="p-3 rounded-md bg-[#FDF5F1] border border-primary/20 text-sm text-primary">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-[#EEF3EF] border border-[#3D5240]/20 text-sm text-[#3D5240]">
          Settings saved.
        </div>
      )}

      <div>
        <label htmlFor="full_name" className={labelClass}>
          Full name
        </label>
        <input
          id="full_name"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="org_name" className={labelClass}>
          Organisation name <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          id="org_name"
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="settings_email" className={labelClass}>
          Email address
        </label>
        <input
          id="settings_email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="new_password" className={labelClass}>
          New password <span className="text-muted font-normal">(leave blank to keep current)</span>
        </label>
        <input
          id="new_password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}
