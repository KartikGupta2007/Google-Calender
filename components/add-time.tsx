'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown } from "lucide-react"

// Convert 24-hour time to 12-hour format (e.g., "16:00" -> "4:00pm")
const formatTo12Hour = (time24: string): string => {
  const [hourStr, minute] = time24.split(':');
  const hour = parseInt(hourStr);
  const period = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute}${period}`;
};

export default function AddTime({
  onTimeSelect,
  defaultTime = '00:00',
}: {
  onTimeSelect: (time: string) => void;
  defaultTime?: string;
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState(defaultTime)
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

  const generateTimeIntervals = () => {
    const intervals = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        intervals.push(
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        )
      }
    }
    return intervals
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    onTimeSelect(time);
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#e3e3e3',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '0',
          fontFamily: 'inherit'
        }}
      >
        {formatTo12Hour(selectedTime)}
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          marginTop: '4px',
          backgroundColor: '#292a2d',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
          minWidth: '100px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '8px 0' }}>
            {generateTimeIntervals().map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleTimeSelect(time)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: '#e3e3e3',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3c4043';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {formatTo12Hour(time)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}