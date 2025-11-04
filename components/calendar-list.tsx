'use client'

import React, { useState } from 'react'
import { useCalendarListStore, CalendarInfo } from '@/lib/store'
import { Check, ChevronDown, Plus } from 'lucide-react'

export default function CalendarList() {
  const { calendars, toggleCalendar } = useCalendarListStore()
  const [isMyCalExpanded, setIsMyCalExpanded] = useState(true)
  const [isOtherCalExpanded, setIsOtherCalExpanded] = useState(true)

  if (calendars.length === 0) {
    return null
  }

  // Group calendars
  const primaryCalendars = calendars.filter(cal =>
    cal.id === 'primary' ||
    cal.name.toLowerCase().includes('kartik') ||
    cal.name === 'Birthdays' ||
    cal.name === 'Family' ||
    cal.name === 'Tasks'
  )

  const otherCalendars = calendars.filter(cal =>
    !primaryCalendars.some(pc => pc.id === cal.id)
  )

  return (
    <div style={{ fontSize: '14px', padding: '12px 0' }}>
      {/* My calendars section */}
      {primaryCalendars.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <button
            onClick={() => setIsMyCalExpanded(!isMyCalExpanded)}
            className="flex items-center justify-between w-full px-4 py-[6px] hover:bg-[#282828] rounded-lg"
            style={{ 
              color: '#e8eaed', 
              fontSize: '14px', 
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.25px',
              height: '32px'
            }}
          >
            <span>My calendars</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${isMyCalExpanded ? 'rotate-180' : ''}`}
              style={{ color: '#e8eaed' }}
            />
          </button>

          {isMyCalExpanded && (
            <div>
              {primaryCalendars.map((calendar) => (
                <CalendarItem
                  key={calendar.id}
                  calendar={calendar}
                  onToggle={() => toggleCalendar(calendar.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other calendars section */}
      {otherCalendars.length > 0 && (
        <div className="mb-1">
          <button
            onClick={() => setIsOtherCalExpanded(!isOtherCalExpanded)}
            className="flex items-center justify-between w-full px-4 py-[6px] hover:bg-[#282828] rounded-lg group"
            style={{ 
              color: '#e8eaed', 
              fontSize: '14px', 
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
              fontWeight: 500,
              letterSpacing: '0.25px',
              height: '32px'
            }}
          >
            <span>Other calendars</span>
            <div className="flex items-center gap-1">
              <Plus className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: '#e8eaed' }} />
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${isOtherCalExpanded ? 'rotate-180' : ''}`}
                style={{ color: '#e8eaed' }}
              />
            </div>
          </button>

          {isOtherCalExpanded && (
            <div>
              {otherCalendars.map((calendar) => (
                <CalendarItem
                  key={calendar.id}
                  calendar={calendar}
                  onToggle={() => toggleCalendar(calendar.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}

function CalendarItem({ calendar, onToggle }: { calendar: CalendarInfo; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center w-full px-4 py-[6px] hover:bg-[#282828] rounded-lg group"
      style={{ height: '32px' }}
    >
      <div className="relative flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-sm flex items-center justify-center transition-colors duration-200"
          style={{
            border: `2px solid ${calendar.color || '#4285f4'}`,
            backgroundColor: calendar.isVisible ? (calendar.color || '#4285f4') : 'transparent',
          }}
        >
          {calendar.isVisible && (
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      <span
        className="truncate flex-1 text-left"
        style={{
          color: '#e8eaed',
          fontSize: '14px',
          fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
          fontWeight: 400,
          lineHeight: '20px',
          letterSpacing: '0.25px'
        }}
      >
        {calendar.name}
      </span>
    </button>
  )
}
