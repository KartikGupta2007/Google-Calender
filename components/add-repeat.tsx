'use client'

import { useState, useRef, useEffect } from 'react'
import dayjs from 'dayjs'

interface AddRepeatProps {
  onRepeatSelect: (repeat: string) => void;
  defaultRepeat?: string;
  selectedDate?: string; // To customize options like "Annually on November 24"
}

export default function AddRepeat({
  onRepeatSelect,
  defaultRepeat = 'Does not repeat',
  selectedDate
}: AddRepeatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRepeat, setSelectedRepeat] = useState(defaultRepeat)
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

  const handleRepeatSelect = (repeat: string) => {
    setSelectedRepeat(repeat)
    onRepeatSelect(repeat)
    setIsOpen(false)
  }

  // Generate dynamic options based on selected date
  const getRepeatOptions = () => {
    const date = selectedDate ? dayjs(selectedDate) : dayjs()
    const dayName = date.format('dddd')
    const dateNum = date.date()
    const monthName = date.format('MMMM')
    const monthDay = date.format('MMMM D')

    // Calculate which week of the month (1st, 2nd, 3rd, 4th, last)
    const weekOfMonth = Math.ceil(dateNum / 7)
    const weekNames = ['first', 'second', 'third', 'fourth', 'fifth']
    const weekName = weekNames[weekOfMonth - 1] || 'fourth'

    // Check if it's the last occurrence of this day in the month
    const lastDayOfMonth = date.endOf('month').date()
    const isLastWeek = dateNum + 7 > lastDayOfMonth

    return [
      'Does not repeat',
      'Daily',
      `Weekly on ${dayName}`,
      `Monthly on the ${weekName} ${dayName}`,
      ...(isLastWeek ? [`Monthly on the last ${dayName}`] : []),
      `Annually on ${monthDay}`,
      'Every weekday (Monday to Friday)',
      'Custom...'
    ]
  }

  const repeatOptions = getRepeatOptions()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#3c4043',
          border: 'none',
          borderBottom: isOpen ? '2px solid #8ab4f8' : '2px solid transparent',
          borderRadius: '4px 4px 0 0',
          color: '#e3e3e3',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '12px 16px',
          fontFamily: 'inherit',
          textAlign: 'left',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#4a4b4f';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3c4043';
        }}
      >
        <span>{selectedRepeat}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 10l5 5 5-5z" fill="#8ab4f8"/>
        </svg>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: '#292a2d',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '8px 0' }}>
            {repeatOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRepeatSelect(option)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: selectedRepeat === option ? '2px solid #8ab4f8' : 'none',
                  background: selectedRepeat === option ? 'rgba(138, 180, 248, 0.1)' : 'transparent',
                  color: '#e3e3e3',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderRadius: selectedRepeat === option ? '4px' : '0',
                  margin: selectedRepeat === option ? '0 8px' : '0',
                  width: selectedRepeat === option ? 'calc(100% - 16px)' : '100%'
                }}
                onMouseEnter={(e) => {
                  if (selectedRepeat !== option) {
                    e.currentTarget.style.backgroundColor = '#3c4043';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRepeat !== option) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
