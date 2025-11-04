'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { offlineAuth } from '@/lib/offline-auth'
import { Calendar } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      const isAuth = await offlineAuth.isAuthenticated()
      if (isAuth) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await offlineAuth.signIn(email, name || undefined)

      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Failed to sign in')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await offlineAuth.signInAsDemo()

      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Failed to sign in')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--gm3-sys-color-background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--gm3-sys-color-surface-container)] rounded-2xl shadow-lg p-8 border border-[var(--gm3-sys-color-outline)]">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-[var(--gm3-sys-color-primary)] flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-[#041e49]" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--gm3-sys-color-on-surface)] mb-2">
              Calendar Offline
            </h1>
            <p className="text-sm text-[var(--gm3-sys-color-on-surface)] opacity-70 text-center">
              Works completely offline. No internet required.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-[var(--gm3-sys-color-error-container)] border border-[var(--gm3-sys-color-error)] rounded-lg">
              <p className="text-sm text-[var(--gm3-sys-color-error)]">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[var(--gm3-sys-color-on-surface)] mb-2">
                Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-[var(--gm3-sys-color-surface-container-high)] border border-[var(--gm3-sys-color-outline)] rounded-lg text-[var(--gm3-sys-color-on-surface)] placeholder:text-[var(--gm3-sys-color-on-surface)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--gm3-sys-color-primary)] transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--gm3-sys-color-on-surface)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[var(--gm3-sys-color-surface-container-high)] border border-[var(--gm3-sys-color-outline)] rounded-lg text-[var(--gm3-sys-color-on-surface)] placeholder:text-[var(--gm3-sys-color-on-surface)] placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--gm3-sys-color-primary)] transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[var(--gm3-sys-color-primary)] text-[#041e49] font-medium rounded-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--gm3-sys-color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--gm3-sys-color-background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--gm3-sys-color-outline)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--gm3-sys-color-surface-container)] text-[var(--gm3-sys-color-on-surface)] opacity-70">
                or
              </span>
            </div>
          </div>

          {/* Demo Sign In */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[var(--gm3-sys-color-surface-container-highest)] text-[var(--gm3-sys-color-on-surface)] font-medium rounded-lg border border-[var(--gm3-sys-color-outline)] hover:bg-[var(--gm3-sys-color-surface-container-high)] focus:outline-none focus:ring-2 focus:ring-[var(--gm3-sys-color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--gm3-sys-color-background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue as Demo User
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-[var(--gm3-sys-color-surface-container-low)] rounded-lg border border-[var(--gm3-sys-color-outline)]">
            <p className="text-xs text-[var(--gm3-sys-color-on-surface)] opacity-70 text-center">
              All data is stored locally in your browser. No account creation required.
              Your information never leaves your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
