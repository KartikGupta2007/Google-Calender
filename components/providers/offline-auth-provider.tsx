'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { offlineAuth } from '@/lib/offline-auth'
import { offlineDb } from '@/lib/offline-db'

export function OfflineAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await offlineAuth.isAuthenticated()
      setIsAuthenticated(authenticated)

      // Initialize sample data if first time
      if (authenticated) {
        await offlineDb.initializeSampleData()
      }

      // Redirect to signin if not authenticated and not on signin page
      if (!authenticated && pathname !== '/signin') {
        router.push('/signin')
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--gm3-sys-color-background)] flex items-center justify-center">
        <div className="text-[var(--gm3-sys-color-on-surface)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--gm3-sys-color-primary)] mx-auto mb-4"></div>
          <p className="text-sm opacity-70">Loading Calendar...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/signin') {
    return null
  }

  return <>{children}</>
}
