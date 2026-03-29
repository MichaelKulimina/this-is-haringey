import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from '@/components/organiser/LoginForm'

export const metadata: Metadata = {
  title: 'Log in — This Is Haringey',
}

export default function OrganiserLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Log in to your account
        </h1>
        <p className="text-sm text-muted">
          Manage your event listings on This Is Haringey.
        </p>
      </div>
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
