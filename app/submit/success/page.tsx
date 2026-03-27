import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Submission received',
}

export default function SubmitSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-[#EEF3EF] flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B7C6E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground mb-3">
        Submission received
      </h1>

      <p className="text-base text-muted mb-2">
        Your payment was successful. Our team will review your listing and get back to you within{' '}
        <strong className="text-foreground">3 business days</strong>.
      </p>

      <p className="text-sm text-muted mb-8">
        A confirmation email is on its way. Check your inbox (and spam folder, just in case).
      </p>

      {/* What happens next */}
      <div className="text-left bg-background border border-border rounded-md p-5 mb-8">
        <p className="text-xs font-semibold tracking-[0.08em] uppercase text-muted mb-3">
          What happens next
        </p>
        <ol className="space-y-2 text-sm text-foreground">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Our team reviews your submission for accuracy and community guidelines</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>If approved, your listing goes live and you&#39;ll receive an email with a link</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>If we need changes, we&#39;ll email you — resubmitting doesn&#39;t require another payment</span>
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          ← Back to What&#39;s On
        </Link>
        <Link
          href="/submit"
          className="px-5 py-2.5 rounded-md border border-border text-sm font-medium text-muted hover:text-foreground hover:border-foreground transition-colors"
        >
          Submit another event
        </Link>
      </div>
    </div>
  )
}
