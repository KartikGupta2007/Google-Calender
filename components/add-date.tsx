'use client'

import { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

interface AddDateProps {
  onDateSelect: (date: string) => void;
  defaultDate: string;
  showFullFormat?: boolean; // If true, shows "Monday, 24 November", else just the date
}

export default function AddDate({
  onDateSelect,
  defaultDate,
  showFullFormat = false
}: AddDateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs(defaultDate))
  const [currentMonth, setCurrentMonth] = useState(dayjs(defaultDate))
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDateSelect = (date: dayjs.Dayjs) => {
    setSelectedDate(date)
    onDateSelect(date.format('YYYY-MM-DD'))
    setIsOpen(false)
  }

  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month')
    const endOfMonth = currentMonth.endOf('month')
    const startDate = startOfMonth.startOf('week') // Start from Sunday
    const endDate = endOfMonth.endOf('week') // End on Saturday

    const days = []
    let day = startDate

    while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'))
  }

  const goToNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'))
  }

  const today = dayjs()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: '1px solid transparent',
          borderRadius: '4px',
          color: '#e3e3e3',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '4px 8px',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid #8ab4f8';
          e.currentTarget.style.outline = 'none';
        }}
        onBlur={(e) => {
          if (!isOpen) {
            e.currentTarget.style.border = '1px solid transparent';
          }
        }}
        onMouseEnter={(e) => {
          if (document.activeElement !== e.currentTarget && !isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (document.activeElement !== e.currentTarget && !isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {showFullFormat
          ? selectedDate.format('dddd, D MMMM')
          : selectedDate.format('D MMMM YYYY')}
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          marginTop: '4px',
          backgroundColor: '#292a2d',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
          minWidth: '320px',
          padding: '16px'
        }}>
          {/* Month/Year Header with Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              onClick={goToPreviousMonth}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e3e3e3',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
              </svg>
            </button>

            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#e3e3e3'
            }}>
              {currentMonth.format('MMMM YYYY')}
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#e3e3e3',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          {/* Days of Week Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px'
          }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#9aa0a6',
                  padding: '4px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px'
          }}>
            {generateCalendarDays().map((day, index) => {
              const isCurrentMonth = day.month() === currentMonth.month()
              const isSelected = day.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
              const isToday = day.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')

              // Determine background color
              let backgroundColor = 'transparent'
              if (isSelected) {
                backgroundColor = '#1967d2' // Darker blue for selected date
              } else if (isToday) {
                backgroundColor = '#8ab4f8' // Light blue for today
              }

              // Determine text color
              let textColor = '#e3e3e3' // Default white for current month
              if (isSelected || isToday) {
                textColor = '#ffffff' // White text for selected/today
              } else if (!isCurrentMonth) {
                textColor = '#5f6368' // Grey for other months
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: '50%',
                    background: backgroundColor,
                    color: textColor,
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: (isToday || isSelected) ? 400 : 400
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isToday) {
                      e.currentTarget.style.backgroundColor = '#3c4043';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isToday) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {day.date()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
