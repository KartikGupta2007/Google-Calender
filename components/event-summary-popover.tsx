'use client'

import React, { useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { CalendarEventType } from '@/lib/store'
import { Calendar, Lock, Menu, Trash2, MoreVertical, X } from 'lucide-react'
import { useOfflineEvents } from '@/hooks/use-offline-events'

interface EventSummaryPopoverProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEventType
}

export function EventSummaryPopover({ isOpen, onClose, event }: EventSummaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { deleteEvent } = useOfflineEvents()

  const handleDelete = async () => {
    try {
      const result = await deleteEvent(event.id)
      if (result.success) {
        onClose()
      } else {
        console.error('Failed to delete event:', result.error)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const startDate = dayjs(event.date)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        ref={popoverRef}
        className="w-full max-w-md mx-4 rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: '#2B2B2B' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div style={{ padding: '24px 24px 8px 24px' }}>
          {/* Top bar with action buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-[#3C3C3C] transition-colors"
                style={{ color: '#E8EAED' }}
                title="Delete event"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                className="p-2 rounded-full hover:bg-[#3C3C3C] transition-colors"
                style={{ color: '#E8EAED' }}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#3C3C3C] transition-colors"
                style={{ color: '#E8EAED' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Event color indicator and title */}
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: event.calendarColor || '#4CAF50' }}
            />
            <h2
              style={{
                fontSize: '28px',
                fontWeight: 400,
                color: '#E8EAED',
                lineHeight: '36px',
                letterSpacing: '0'
              }}
            >
              {event.title}
            </h2>
          </div>

          {/* Date */}
          <div style={{ paddingLeft: '24px' }}>
            <p
              style={{
                fontSize: '16px',
                fontWeight: 400,
                color: '#E8EAED',
                marginBottom: '24px'
              }}
            >
              {startDate.format("dddd, MMMM D")}
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ padding: '8px 24px 24px 24px' }}>
          {/* Description/Type */}
          {event.description && (
            <div className="flex items-start gap-3 py-2">
              <Menu className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#9AA0A6' }} />
              <div 
                style={{ fontSize: '14px', color: '#E8EAED' }}
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* Calendar Name */}
          <div className="flex items-center gap-3 py-2">
            <Calendar className="h-5 w-5 flex-shrink-0" style={{ color: '#9AA0A6' }} />
            <span style={{ fontSize: '14px', color: '#E8EAED' }}>
              {event.calendarName || 'My Calendar'}
            </span>
          </div>

          {/* Visibility/Privacy */}
          <div className="flex items-center gap-3 py-2">
            <Lock className="h-5 w-5 flex-shrink-0" style={{ color: '#9AA0A6' }} />
            <span style={{ fontSize: '14px', color: '#E8EAED' }}>
              Public
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
