'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ComingSoonContent() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'

  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [emailError, setEmailError] = useState('')

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailStatus('loading')
    setEmailError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setEmailStatus('success')
      } else {
        setEmailStatus('error')
        setEmailError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setEmailStatus('error')
      setEmailError('Something went wrong. Please try again.')
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordStatus('loading')
    try {
      const res = await fetch('/api/preview-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = from
      } else {
        setPasswordStatus('error')
      }
    } catch {
      setPasswordStatus('error')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: '#F7F5F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
      overflow: 'hidden',
    }}>

      {/* Grayscale OpenStreetMap background — Haringey borough */}
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-0.1740%2C51.5680%2C-0.0470%2C51.6260&layer=mapnik"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          filter: 'grayscale(1) opacity(0.18)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        title="Map of Haringey"
        aria-hidden="true"
      />

      {/* Soft vignette overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(247,245,240,0.7) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Content card */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '48px 40px 40px',
        maxWidth: '460px',
        width: 'calc(100% - 32px)',
        boxShadow: '0 4px 48px rgba(0,0,0,0.10)',
        border: '1px solid rgba(229,226,219,0.8)',
      }}>

        {/* Logotype */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{
            margin: '0',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: '#E05A2B',
          }}>This Is</p>
          <p style={{
            margin: '0',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#1A1A1A',
            lineHeight: 1.1,
          }}>Haringey<span style={{ color: '#E05A2B' }}>.</span></p>
        </div>

        {/* Tagline */}
        <h1 style={{
          margin: '0 0 8px',
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#1A1A1A',
          lineHeight: 1.3,
        }}>
          Something brilliant is coming to Haringey.
        </h1>
        <p style={{
          margin: '0 0 28px',
          fontSize: '15px',
          lineHeight: 1.6,
          color: '#666',
        }}>
          We&rsquo;re building the best way to discover what&rsquo;s happening across the borough — arts, music, food, community and more. Sign up to be the first to know when we launch.
        </p>

        {/* Email signup */}
        {emailStatus === 'success' ? (
          <div style={{
            padding: '16px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '8px',
            marginBottom: '24px',
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#166534', fontWeight: 600 }}>
              You&rsquo;re on the list!
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#166534' }}>
              We&rsquo;ll be in touch as soon as we launch.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={emailStatus === 'loading'}
                style={{
                  flex: '1 1 200px',
                  height: '44px',
                  padding: '0 14px',
                  fontSize: '14px',
                  border: '1px solid #D1CEC8',
                  borderRadius: '8px',
                  background: '#fff',
                  color: '#1A1A1A',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                disabled={emailStatus === 'loading'}
                style={{
                  height: '44px',
                  padding: '0 20px',
                  background: '#E05A2B',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  cursor: emailStatus === 'loading' ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                {emailStatus === 'loading' ? 'Signing up…' : 'Stay in the loop'}
              </button>
            </div>
            {emailStatus === 'error' && (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#DC2626' }}>
                {emailError}
              </p>
            )}
          </form>
        )}

        {/* Divider */}
        <div style={{
          borderTop: '1px solid #E5E2DB',
          paddingTop: '20px',
        }}>
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '13px',
                color: '#999',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Have access? Enter password →
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#666' }}>
                Enter your access password:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoFocus
                  disabled={passwordStatus === 'loading'}
                  style={{
                    flex: '1 1 160px',
                    height: '40px',
                    padding: '0 12px',
                    fontSize: '14px',
                    border: passwordStatus === 'error' ? '1px solid #DC2626' : '1px solid #D1CEC8',
                    borderRadius: '8px',
                    background: '#fff',
                    color: '#1A1A1A',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  disabled={passwordStatus === 'loading'}
                  style={{
                    height: '40px',
                    padding: '0 16px',
                    background: '#1A1A1A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: passwordStatus === 'loading' ? 'wait' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {passwordStatus === 'loading' ? 'Checking…' : 'Enter'}
                </button>
              </div>
              {passwordStatus === 'error' && (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#DC2626' }}>
                  Incorrect password. Please try again.
                </p>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  )
}

const LoadingFallback = () => (
  <div style={{
    position: 'fixed',
    top: 0, right: 0, bottom: 0, left: 0,
    width: '100vw', height: '100vh',
    zIndex: 9999,
    background: '#F7F5F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, letterSpacing: '0.20em', textTransform: 'uppercase', color: '#E05A2B' }}>This Is</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', color: '#1A1A1A' }}>Haringey<span style={{ color: '#E05A2B' }}>.</span></p>
    </div>
  </div>
)

export default function ComingSoonPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ComingSoonContent />
    </Suspense>
  )
}
