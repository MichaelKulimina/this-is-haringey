'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface Props {
  token: string
  email: string
  currentCategories: string[]
  allCategories: Category[]
  unsubscribeUrl: string
}

export default function ManagePreferencesForm({
  token,
  email,
  currentCategories,
  allCategories,
  unsubscribeUrl,
}: Props) {
  const [selected, setSelected] = useState<string[]>(currentCategories)
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
    // Clear saved state when user changes selection
    if (status === 'saved') setStatus('idle')
  }

  async function handleSave() {
    setError('')

    if (selected.length === 0) {
      setError('Please select at least one category.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/manage-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, categories: selected }),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('saved')
    } catch {
      setStatus('error')
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted mb-1">Subscribed email</p>
        <p className="text-sm font-medium text-foreground">{email}</p>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-foreground mb-2">
          Categories
        </legend>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selected.includes(cat.id)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background text-muted border-border hover:border-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {status === 'saved' && (
        <p className="text-sm text-[#3D5240] font-medium">
          ✓ Your preferences have been updated.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={status === 'loading'}
          className="px-5 py-2.5 bg-primary text-white rounded-md text-sm font-semibold tracking-[-0.01em] hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving…' : 'Save preferences'}
        </button>
      </div>

      <div className="pt-2 border-t border-border">
        <Link
          href={unsubscribeUrl}
          className="text-sm text-muted hover:text-foreground transition-colors underline"
        >
          Unsubscribe entirely
        </Link>
      </div>
    </div>
  )
}
