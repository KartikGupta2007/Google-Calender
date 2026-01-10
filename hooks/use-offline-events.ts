'use client'

import { useCallback } from 'react'
import { offlineDb, OfflineEvent } from '@/lib/offline-db'
import { useEventStore } from '@/lib/store'
import dayjs from 'dayjs'

export function useOfflineEvents() {
  const { setEvents } = useEventStore()

  // Reload events from localStorage
  const reloadEvents = useCallback(async () => {
    const events = await offlineDb.getEvents()
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: dayjs(event.startDate),
      endDate: event.endDate ? dayjs(event.endDate) : undefined,
      location: event.location || undefined,
      calendarId: event.calendarId,
      calendarName: event.calendarName,
      calendarColor: event.calendarColor,
      isAllDay: event.isAllDay,
    }))
    setEvents(transformedEvents)
  }, [setEvents])

  // Create event
  const createEvent = useCallback(async (data: {
    title: string
    description?: string
    startDate: string
    endDate?: string
    location?: string
    calendarId?: string
  }) => {
    try {
      await offlineDb.createEvent({
        title: data.title,
        description: data.description || '',
        startDate: data.startDate,
        endDate: data.endDate || data.startDate,
        location: data.location || null,
        calendarId: data.calendarId || 'calendar_personal',
        calendarName: 'Personal',
        calendarColor: '#039BE5',
      })

      await reloadEvents()
      return { success: true }
    } catch (error) {
      console.error('Failed to create event:', error)
      return { success: false, error: 'Failed to create event' }
    }
  }, [reloadEvents])

  // Update event
  const updateEvent = useCallback(async (id: string, updates: Partial<OfflineEvent>) => {
    try {
      await offlineDb.updateEvent(id, updates)
      await reloadEvents()
      return { success: true }
    } catch (error) {
      console.error('Failed to update event:', error)
      return { success: false, error: 'Failed to update event' }
    }
  }, [reloadEvents])

  // Delete event
  const deleteEvent = useCallback(async (id: string) => {
    try {
      await offlineDb.deleteEvent(id)
      await reloadEvents()
      return { success: true }
    } catch (error) {
      console.error('Failed to delete event:', error)
      return { success: false, error: 'Failed to delete event' }
    }
  }, [reloadEvents])

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    reloadEvents,
  }
}
