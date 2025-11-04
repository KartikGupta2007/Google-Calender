'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Calendar, MapPin, Clock } from 'lucide-react'
import { Input } from './ui/input'
import dayjs from 'dayjs'
import { cn } from '@/lib/utils'
import { useDateStore, useViewStore } from '@/lib/store'

interface SearchResult {
  id: number
  title: string
  description: string | null
  location: string | null
  startDate: Date
  endDate: Date | null
  calendarColor: string | null
}

export default function SearchEvents() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { setDate, setMonth } = useDateStore()
  const { setView } = useViewStore()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true)
        try {
          // Load events from offline storage
          const { offlineDb } = await import('@/lib/offline-db');
          const allEvents = await offlineDb.getEvents();

          // Filter events based on search query
          const filteredEvents = allEvents.filter((event) => {
            const titleMatch = event.title?.toLowerCase().includes(query.toLowerCase());
            const descMatch = event.description?.toLowerCase().includes(query.toLowerCase());
            const locMatch = event.location?.toLowerCase().includes(query.toLowerCase());
            return titleMatch || descMatch || locMatch;
          });

          // Transform offline events to match our expected format
          const transformedEvents = filteredEvents.map((event) => ({
            id: event.id,
            title: event.title || 'Untitled Event',
            description: event.description || null,
            location: event.location || null,
            startDate: new Date(event.startDate),
            endDate: event.endDate ? new Date(event.endDate) : null,
            calendarColor: event.calendarColor || '#039BE5',
          }));

          setResults(transformedEvents);
        } catch (error) {
          console.error('Search error:', error)
          setResults([]);
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleResultClick = (event: SearchResult) => {
    const eventDate = dayjs(event.startDate)
    setDate(eventDate)
    setMonth(eventDate.month())
    setView('day')
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--gm3-sys-color-on-surface)] opacity-50" />
        <Input
          type="text"
          placeholder="Search events"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-10 w-64 bg-[var(--gm3-sys-color-surface-container)] border-0 text-[var(--gm3-sys-color-on-surface)] placeholder:text-[var(--gm3-sys-color-on-surface)] placeholder:opacity-50 focus-visible:ring-1 focus-visible:ring-[var(--gm3-sys-color-outline)] rounded-full"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-[var(--gm3-sys-color-surface-container-high)] rounded-full p-1"
          >
            <X className="h-4 w-4 text-[var(--gm3-sys-color-on-surface)] opacity-50" />
          </button>
        )}
      </div>

      {isOpen && (query.length > 0 || results.length > 0) && (
        <div className="absolute top-full mt-2 w-96 max-h-96 overflow-y-auto bg-[var(--gm3-sys-color-surface-container)] rounded-lg shadow-lg border border-[var(--gm3-sys-color-outline)] z-50">
          {isLoading ? (
            <div className="p-4 text-center text-[var(--gm3-sys-color-on-surface)] opacity-60">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleResultClick(event)}
                  className="w-full px-4 py-3 hover:bg-[var(--gm3-sys-color-surface-container-high)] transition-colors text-left flex gap-3"
                >
                  <div
                    className="h-10 w-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.calendarColor || '#039BE5' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--gm3-sys-color-on-surface)] truncate">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--gm3-sys-color-on-surface)] opacity-70">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dayjs(event.startDate).format('MMM D, YYYY h:mm A')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-[var(--gm3-sys-color-on-surface)] opacity-60 mt-1 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-[var(--gm3-sys-color-on-surface)] opacity-60">
              No events found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
