'use client'

import { useSearchParams } from 'next/navigation'

export default function VerifiedBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('verified') !== '1') return null

  return (
    <div className="flex items-center gap-3 p-4 rounded-md bg-[#F0F5F1] border border-[#6B7C6E]/30 text-sm text-[#3D5C42]">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
        <circle cx="9" cy="9" r="9" fill="#6B7C6E" />
        <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span><strong>Your email is verified.</strong> Welcome to This Is Haringey — you&apos;re all set.</span>
    </div>
  )
}
