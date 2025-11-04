'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { offlineAuth } from '@/lib/offline-auth'
import { LogOut } from 'lucide-react'

interface User {
  name: string;
  email: string;
}

export default function ProfileMenu(): JSX.Element {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await offlineAuth.getCurrentUser()
      if (currentUser) {
        setUser({ name: currentUser.name, email: currentUser.email })
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSignOut = async () => {
    await offlineAuth.signOut()
    router.push('/signin')
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Profile Avatar Button - 32x32px with 2px border as per contextual.md */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full flex items-center justify-center text-white font-semibold text-sm hover:ring-1 hover:ring-[#8AB4F8] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all relative overflow-hidden"
        style={{
          width: '32px',
          height: '32px',
          background: 'conic-gradient(from 0deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)',
          padding: '2px'
        }}
        aria-label="Account menu"
      >
        <div className="h-full w-full rounded-full bg-[#004d40] flex items-center justify-center text-white">
          {user?.name?.charAt(0).toUpperCase() || 'K'}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-[40px] w-64 bg-[var(--gm3-sys-color-surface-container-high)] rounded-lg shadow-lg border border-[var(--gm3-sys-color-outline)] z-[1000] overflow-hidden transform -translate-y-1"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button">
          {/* User Info */}
          <div className="p-4 border-b border-[var(--gm3-sys-color-outline)]">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                style={{
                  background: 'conic-gradient(from 0deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)',
                  padding: '2px'
                }}
              >
                <div className="h-full w-full rounded-full bg-[#3AA57A] flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--gm3-sys-color-on-surface)] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-[var(--gm3-sys-color-on-surface)] opacity-70 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--gm3-sys-color-surface-container-highest)] transition-colors text-left"
              role="menuitem"
              aria-label="Sign out of account"
            >
              <LogOut className="h-5 w-5 text-[var(--gm3-sys-color-on-surface)]" />
              <span className="text-sm text-[var(--gm3-sys-color-on-surface)]">Sign out</span>
            </button>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-3 bg-[var(--gm3-sys-color-surface-container-low)] border-t border-[var(--gm3-sys-color-outline)]">
            <p className="text-xs text-[var(--gm3-sys-color-on-surface)] opacity-60 text-center">
              Offline Mode - Data stored locally
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
