import type { Metadata } from 'next'
import RegisterForm from '@/components/organiser/RegisterForm'

export const metadata: Metadata = {
  title: 'Create an account — This Is Haringey',
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-2">
          Create an account
        </h1>
        <p className="text-sm text-muted">
          Track your listings, edit submissions, and manage your events in one place.
        </p>
      </div>
      <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
        <RegisterForm />
      </div>
    </div>
  )
}
