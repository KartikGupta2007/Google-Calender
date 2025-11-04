'use client'

import React, { useState } from 'react'
import { useDateStore, useViewStore, useEventStore } from '@/lib/store'
import { getYear, isCurrentDay } from '@/lib/getTime'
import dayjs from 'dayjs'
import { useFilteredEvents } from '@/hooks/useFilteredEvents'
import { X } from 'lucide-react'

const weekDaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function YearView() {
  const { selectedYear, setDate, setMonth, userSelectedDate } = useDateStore()
  useViewStore()
  const { openEventSummary } = useEventStore()
  const yearData = getYear(selectedYear)
  const events = useFilteredEvents()
  const [selectedDayForPopup, setSelectedDayForPopup] = useState<dayjs.Dayjs | null>(null)
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null)

  const handleDateClick = (day: dayjs.Dayjs, monthIndex: number, event: React.MouseEvent) => {
    setDate(day)
    setMonth(monthIndex)
    setSelectedDayForPopup(day)

    // Get the clicked element's position
    const rect = event.currentTarget.getBoundingClientRect()
    const popupWidth = 360 // preferred popup width for the second-image layout
    // Estimate popup height based on number of events for that day (base + per-event)
    const eventsForDay = events.filter(ev => ev.date.format('DD-MM-YY') === day.format('DD-MM-YY'))
    const popupHeight = Math.min(420, 120 + (eventsForDay.length * 56)) // dynamic estimate
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const spacing = 8 // spacing between date and popup
    const margin = 20 // minimum margin from viewport edges

    // (previously had multiple candidate positions; new layout centers horizontally and
    // prefers above the clicked date, falling back below if needed)

    // Preferred behavior for the second-image layout:
    // - Center horizontally relative to the clicked date
    // - Prefer showing above the date; if it would be cut off, show below
    let leftPosition = rect.left + window.scrollX + (rect.width / 2) - (popupWidth / 2)
    // Constrain horizontally within viewport margins
    leftPosition = Math.max(margin, Math.min(viewportWidth - popupWidth - margin, leftPosition))

    // Position the popup below and to the left of the clicked element
    let topPosition = rect.bottom + window.scrollY + 20 // Add 20px offset below the element

    // Check if popup would go off bottom of viewport
    if (topPosition + popupHeight > viewportHeight - margin) {
      // If it would go off bottom, try positioning above
      topPosition = rect.top + window.scrollY - popupHeight - spacing
      
      // If that would go off top, position at top with margin
      if (topPosition < margin) {
        topPosition = margin
      }
    }

    setPopupPosition({ top: topPosition, left: leftPosition })
  }

  const closePopup = () => {
    setSelectedDayForPopup(null)
    setPopupPosition(null)
  }

  // Calendar colors matching event-renderer.tsx
  const calendarColors = [
    { bg: 'var(--cal-kartik)', color: 'white' },
    { bg: 'var(--cal-birthdays)', color: 'white' },
    { bg: 'var(--cal-family)', color: 'white' },
    { bg: 'var(--cal-tasks)', color: '#131314' },
    { bg: 'var(--cal-holidays)', color: 'white' },
  ]

  // Get events for selected day
  const selectedDayEvents = selectedDayForPopup
    ? events.filter(event => event.date.format('DD-MM-YY') === selectedDayForPopup.format('DD-MM-YY'))
    : []

  return (
    <section style={{ padding: '0 0 8px 0', height: 'calc(100vh - 64px)', background: '#1f1f1f' }}>
      <div style={{ background: '#131314', borderRadius: '24px', overflow: 'auto', height: 'calc(100% - 8px)', padding: '24px' }}>
        {/* Main Content Grid - 4 columns x 3 rows as per spec */}
        <div className='grid' style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, auto)', gridRowGap: '32px', gridColumnGap: '24px' }}>
          {yearData.map(({ month, monthName, grid }) => (
            <div key={month} className='month-card'>
              {/* Month Header - per spec: 14px, font-weight 500, color #e8eaed, margin-bottom 8px */}
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#e8eaed', fontSize: '14px', fontWeight: 500 }}>
                  {monthName}
                </span>
              </div>

              {/* Days of Week Grid - per spec */}
              <div className='grid' style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {weekDaysShort.map((day, i) => (
                  <div
                    key={i}
                    style={{
                      color: '#9aa0a6', // Google Calendar's day names color
                      fontSize: '11px',
                      fontWeight: 500,
                      textAlign: 'center'
                    }}
                    title={weekDaysFull[i]}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Dates Grid - per spec with row gap */}
              <div className='grid' style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridRowGap: '4px' }}>
                {grid.map((row, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    {row.map((day, colIndex) => {
                      const isToday = isCurrentDay(day)
                      const isSelectedDate = day.format('DD-MM-YY') === userSelectedDate.format('DD-MM-YY')
                      const isCurrentMonth = day.month() === month

                      // Determine background and border based on state
                      let backgroundColor = 'transparent'
                      const border = 'none'
                      let textColor = isCurrentMonth ? '#e8eaed' : '#5f6368'

                      if (isToday) {
                        backgroundColor = '#1a73e8' // Google Calendar's today highlight color
                        textColor = '#ffffff'
                      } else if (isSelectedDate) {
                        backgroundColor = '#1e4d7a' // Google Calendar's selected date color
                        textColor = '#e8eaed'
                      }

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          style={{ textAlign: 'center' }}
                        >
                          <button
                            type='button'
                            onClick={(e) => isCurrentMonth && handleDateClick(day, month, e)}
                            aria-label={day.format('D MMMM, dddd')}
                            aria-pressed={isToday}
                            tabIndex={-1}
                            style={{
                              fontSize: '12px',
                              lineHeight: '24px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'inline-block',
                              backgroundColor: backgroundColor,
                              border: border,
                              color: textColor,
                              cursor: isCurrentMonth ? 'pointer' : 'default',
                              transition: 'background-color 0.1s',
                              fontWeight: isToday ? 700 : 'normal'
                            }}
                            onMouseEnter={(e) => {
                              if (isCurrentMonth && !isToday && !isSelectedDate) {
                                e.currentTarget.style.backgroundColor = '#282828' // Google Calendar's hover color
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isCurrentMonth && !isToday && !isSelectedDate) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            {day.format('D')}
                          </button>
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Popup Modal */}
      {selectedDayForPopup && popupPosition && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={closePopup}
          />

          {/* Popup */}
          <div
            style={{
              position: 'absolute',
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              background: '#3C4043',
              borderRadius: '24px',
              padding: '20px 28px',
              minWidth: '320px',
              maxWidth: '360px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
              zIndex: 1000,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#E0E0E0',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <X size={20} />
            </button>

            {/* Day of week */}
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#A0A0A0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              {selectedDayForPopup.format('ddd').toUpperCase()}
            </div>

            {/* Large date number */}
            <div
              style={{
                fontSize: '48px',
                fontWeight: 600,
                color: '#E0E0E0',
                marginBottom: '14px',
                lineHeight: 1,
              }}
            >
              {selectedDayForPopup.format('D')}
            </div>

            {/* Events list or no events message */}
            {selectedDayEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                {selectedDayEvents.map((event, index) => {
                  // Generate a stable color index from event ID
                  let colorIndex = index % calendarColors.length
                  if (event.id) {
                    const numericId = parseInt(event.id)
                    if (!isNaN(numericId)) {
                      colorIndex = numericId % calendarColors.length
                    } else {
                      // For non-numeric IDs, use string hash
                      let hash = 0
                      for (let i = 0; i < event.id.length; i++) {
                        hash = ((hash << 5) - hash) + event.id.charCodeAt(i)
                        hash = hash & hash
                      }
                      colorIndex = Math.abs(hash) % calendarColors.length
                    }
                  }
                  const colors = calendarColors[colorIndex]

                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        openEventSummary(event)
                        closePopup()
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '12px',
                        background: colors.bg,
                        color: colors.color,
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 600,
                        transition: 'opacity 0.15s',
                        display: 'block',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.85'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                      }}
                    >
                      {event.title}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  color: '#A0A0A0',
                  fontSize: '13px',
                  lineHeight: '1.4',
                }}
              >
                There are no events scheduled on this day.
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
