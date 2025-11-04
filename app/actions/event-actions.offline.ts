'use client'

import { offlineDb } from '@/lib/offline-db'

// Create Event (Offline)
export async function createEventOffline(formData: FormData): Promise<{ error: string } | { success: boolean; eventId?: string }> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const endTime = formData.get('endTime') as string;
  const location = formData.get('location') as string;
  const guests = formData.get('guests') as string;
  const eventType = formData.get('eventType') as string || 'event';
  const calendarId = formData.get('calendarId') as string || 'calendar_personal';
  const isAllDay = formData.get('isAllDay') === 'true';

  if (!title || !date) {
    return { error: 'Title and date are required' };
  }

  const startDate = isAllDay
    ? new Date(date).toISOString()
    : new Date(`${date}T${time || '00:00'}:00`).toISOString();

  const endDate = endTime
    ? new Date(`${date}T${endTime}:00`).toISOString()
    : isAllDay
      ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(new Date(startDate).getTime() + 60 * 60 * 1000).toISOString();

  // Get calendar info
  const calendars = await offlineDb.getCalendars();
  const calendar = calendars.find(cal => cal.id === calendarId) || calendars[0];

  try {
    const event = await offlineDb.createEvent({
      title,
      description: description || '',
      startDate,
      endDate,
      location: location || null,
      calendarId: calendar.id,
      calendarName: calendar.name,
      calendarColor: calendar.color,
      color: null,
      isAllDay,
    });

    // Trigger a custom event to notify components to reload
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-event-created'));
    }

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: 'Failed to create event' };
  }
}

// Update Event (Offline)
export async function updateEventOffline(
  eventId: string,
  formData: FormData
): Promise<{ error: string } | { success: boolean }> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const endTime = formData.get('endTime') as string;
  const location = formData.get('location') as string;
  const isAllDay = formData.get('isAllDay') === 'true';

  if (!title || !date) {
    return { error: 'Title and date are required' };
  }

  const startDate = isAllDay
    ? new Date(date).toISOString()
    : new Date(`${date}T${time || '00:00'}:00`).toISOString();

  const endDate = endTime
    ? new Date(`${date}T${endTime}:00`).toISOString()
    : isAllDay
      ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : new Date(new Date(startDate).getTime() + 60 * 60 * 1000).toISOString();

  try {
    await offlineDb.updateEvent(eventId, {
      title,
      description: description || '',
      startDate,
      endDate,
      location: location || null,
      isAllDay,
    });

    // Trigger a custom event to notify components to reload
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-event-updated'));
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { error: 'Failed to update event' };
  }
}

// Delete Event (Offline)
export async function deleteEventOffline(eventId: string): Promise<{ error: string } | { success: boolean }> {
  try {
    await offlineDb.deleteEvent(eventId);

    // Trigger a custom event to notify components to reload
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-event-deleted'));
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error: 'Failed to delete event' };
  }
}
