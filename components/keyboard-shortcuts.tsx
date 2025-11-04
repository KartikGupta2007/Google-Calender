'use client'

import { useEffect } from 'react'
import { useDateStore, useViewStore, useEventStore } from '@/lib/store'
import dayjs from 'dayjs'

/**
 * Google Calendar Keyboard Shortcuts Component
 * Implements common keyboard shortcuts for navigation and actions
 */
export default function KeyboardShortcuts() {
  const { userSelectedDate, setDate, setMonth, selectedMonthIndex } = useDateStore()
  const { selectedView, setView } = useViewStore()
  const { openPopover } = useEventStore()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const key = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey

      // Navigation shortcuts
      switch (key) {
        // View switching
        case 'd':
          if (!ctrl && !shift) {
            setView('day')
            event.preventDefault()
          }
          break
        case 'w':
          if (!ctrl && !shift) {
            setView('week')
            event.preventDefault()
          }
          break
        case 'm':
          if (!ctrl && !shift) {
            setView('month')
            event.preventDefault()
          }
          break
        case 'y':
          if (!ctrl && !shift) {
            setView('year')
            event.preventDefault()
          }
          break

        // Date navigation
        case 't':
          // Go to today
          if (!ctrl && !shift) {
            setDate(dayjs())
            setMonth(dayjs().month())
            event.preventDefault()
          }
          break

        case 'arrowleft':
        case 'j':
          // Previous day/week/month
          if (!ctrl) {
            navigateBackward()
            event.preventDefault()
          }
          break

        case 'arrowright':
        case 'k':
          // Next day/week/month
          if (!ctrl) {
            navigateForward()
            event.preventDefault()
          }
          break

        // Create event
        case 'c':
          if (!ctrl && !shift) {
            openPopover()
            event.preventDefault()
          }
          break

        // Search
        case '/':
        case 's':
          if (ctrl || key === '/') {
            // Focus search input
            const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
              event.preventDefault()
            }
          }
          break

        // Refresh
        case 'r':
          if (!ctrl && !shift) {
            window.location.reload()
            event.preventDefault()
          }
          break

        // Help (show keyboard shortcuts)
        case '?':
          if (shift) {
            showKeyboardShortcutsHelp()
            event.preventDefault()
          }
          break

        // Escape to close dialogs
        case 'escape':
          // Close any open modals/popovers
          const closeButtons = document.querySelectorAll('[aria-label="Close"]')
          closeButtons.forEach(button => (button as HTMLElement).click())
          break
      }
    }

    const navigateBackward = () => {
      switch (selectedView) {
        case 'day':
          setDate(userSelectedDate.subtract(1, 'day'))
          setMonth(userSelectedDate.subtract(1, 'day').month())
          break
        case 'week':
          setDate(userSelectedDate.subtract(7, 'days'))
          setMonth(userSelectedDate.subtract(7, 'days').month())
          break
        case 'month':
          setMonth(selectedMonthIndex - 1)
          break
        case 'year':
          setDate(userSelectedDate.subtract(1, 'year'))
          break
      }
    }

    const navigateForward = () => {
      switch (selectedView) {
        case 'day':
          setDate(userSelectedDate.add(1, 'day'))
          setMonth(userSelectedDate.add(1, 'day').month())
          break
        case 'week':
          setDate(userSelectedDate.add(7, 'days'))
          setMonth(userSelectedDate.add(7, 'days').month())
          break
        case 'month':
          setMonth(selectedMonthIndex + 1)
          break
        case 'year':
          setDate(userSelectedDate.add(1, 'year'))
          break
      }
    }

    const showKeyboardShortcutsHelp = () => {
      alert(`
Google Calendar Keyboard Shortcuts:

NAVIGATION:
  T - Go to today
  J or ← - Previous day/week/month
  K or → - Next day/week/month

VIEW SWITCHING:
  D - Day view
  W - Week view
  M - Month view
  Y - Year view

ACTIONS:
  C - Create new event
  / or Ctrl+S - Search events
  R - Refresh calendar
  ? - Show this help

GENERAL:
  Esc - Close dialogs
      `)
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [userSelectedDate, selectedView, selectedMonthIndex, setDate, setMonth, setView, openPopover])

  return null
}
