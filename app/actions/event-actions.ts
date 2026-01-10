'use server'

import { db } from "@/db/drizzle";
import { eventsTable, calendarsTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Create Event
export async function createEvent(formData: FormData): Promise<{ error: string } | { success: boolean; eventId?: number }> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const endTime = formData.get('endTime') as string;
  const location = formData.get('location') as string;
  const guests = formData.get('guests') as string;
  const eventType = formData.get('eventType') as string || 'event';
  const calendarId = formData.get('calendarId') as string;
  const isAllDay = formData.get('isAllDay') === 'true';
  const conferenceLink = formData.get('conferenceLink') as string;
  const reminderMinutes = formData.get('reminderMinutes') as string;

  if (!title || !date) {
    return { error: 'Title and date are required' };
  }

  const startDate = isAllDay
    ? new Date(date)
    : new Date(`${date}T${time || '00:00'}:00`);

  const endDate = endTime
    ? new Date(`${date}T${endTime}:00`)
    : isAllDay
      ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

  const attendees = guests ? guests.split(',').map(email => email.trim()) : [];
  const reminders = reminderMinutes ? [{ method: 'popup', minutes: parseInt(reminderMinutes) }] : [];

  try {
    const result = await db.insert(eventsTable).values({
      title,
      description: description || '',
      startDate,
      endDate,
      location: location || '',
      attendees: JSON.stringify(attendees),
      eventType,
      calendarId: calendarId ? parseInt(calendarId) : null,
      isAllDay,
      conferenceLink: conferenceLink || '',
      reminders: JSON.stringify(reminders),
    }).returning({ id: eventsTable.id });

    revalidatePath("/");
    return { success: true, eventId: result[0].id };
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: 'Failed to create event' };
  }
}

// Get all events
export async function getEvents(startDate?: Date, endDate?: Date) {
  try {
    let query = db.select().from(eventsTable);

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(eventsTable.startDate, startDate),
          lte(eventsTable.startDate, endDate)
        )
      ) as any;
    }

    const events = await query.orderBy(desc(eventsTable.startDate));
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Get single event
export async function getEventById(eventId: number) {
  try {
    const event = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
    return event[0] || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

// Update Event
export async function updateEvent(
  eventId: number,
  formData: FormData
): Promise<{ error: string } | { success: boolean }> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const endTime = formData.get('endTime') as string;
  const location = formData.get('location') as string;
  const guests = formData.get('guests') as string;
  const isAllDay = formData.get('isAllDay') === 'true';
  const conferenceLink = formData.get('conferenceLink') as string;

  if (!title || !date) {
    return { error: 'Title and date are required' };
  }

  const startDate = isAllDay
    ? new Date(date)
    : new Date(`${date}T${time || '00:00'}:00`);

  const endDate = endTime
    ? new Date(`${date}T${endTime}:00`)
    : isAllDay
      ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

  const attendees = guests ? guests.split(',').map(email => email.trim()) : [];

  try {
    await db
      .update(eventsTable)
      .set({
        title,
        description: description || '',
        startDate,
        endDate,
        location: location || '',
        attendees: JSON.stringify(attendees),
        isAllDay,
        conferenceLink: conferenceLink || '',
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, eventId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { error: 'Failed to update event' };
  }
}

// Delete Event
export async function deleteEvent(eventId: number): Promise<{ error: string } | { success: boolean }> {
  try {
    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error: 'Failed to delete event' };
  }
}

// Duplicate Event
export async function duplicateEvent(eventId: number): Promise<{ error: string } | { success: boolean; newEventId?: number }> {
  try {
    const originalEvent = await getEventById(eventId);
    if (!originalEvent) {
      return { error: 'Event not found' };
    }

    const result = await db.insert(eventsTable).values({
      ...originalEvent,
      id: undefined,
      title: `${originalEvent.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any).returning({ id: eventsTable.id });

    revalidatePath("/");
    return { success: true, newEventId: result[0].id };
  } catch (error) {
    console.error('Error duplicating event:', error);
    return { error: 'Failed to duplicate event' };
  }
}

// Search Events - DEPRECATED: Search is now handled client-side in search-events.tsx
// This function is kept for backwards compatibility but is no longer used
export async function searchEvents(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Get all events and filter in JavaScript for case-insensitive search
    const allEvents = await db.select().from(eventsTable);

    const filteredEvents = allEvents.filter(event => {
      const titleMatch = event.title?.toLowerCase().includes(query.toLowerCase());
      const descMatch = event.description?.toLowerCase().includes(query.toLowerCase());
      return titleMatch || descMatch;
    });

    console.log(`Search query: "${query}", Found ${filteredEvents.length} events out of ${allEvents.length} total`);
    return filteredEvents;
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
}

// Move Event (drag and drop)
export async function moveEvent(
  eventId: number,
  newStartDate: Date,
  newEndDate?: Date
): Promise<{ error: string } | { success: boolean }> {
  try {
    const event = await getEventById(eventId);
    if (!event) {
      return { error: 'Event not found' };
    }

    const duration = event.endDate
      ? new Date(event.endDate).getTime() - new Date(event.startDate).getTime()
      : 60 * 60 * 1000;

    const endDate = newEndDate || new Date(newStartDate.getTime() + duration);

    await db
      .update(eventsTable)
      .set({
        startDate: newStartDate,
        endDate: endDate,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, eventId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error moving event:', error);
    return { error: 'Failed to move event' };
  }
}

// Calendar Management
export async function createCalendar(name: string, color: string, description?: string) {
  try {
    const result = await db.insert(calendarsTable).values({
      name,
      color,
      description: description || '',
    }).returning({ id: calendarsTable.id });

    revalidatePath("/");
    return { success: true, calendarId: result[0].id };
  } catch (error) {
    console.error('Error creating calendar:', error);
    return { error: 'Failed to create calendar' };
  }
}

export async function getCalendars() {
  try {
    const calendars = await db.select().from(calendarsTable);
    return calendars;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return [];
  }
}

export async function updateCalendarVisibility(calendarId: number, isVisible: boolean) {
  try {
    await db
      .update(calendarsTable)
      .set({ isVisible, updatedAt: new Date() })
      .where(eq(calendarsTable.id, calendarId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating calendar visibility:', error);
    return { error: 'Failed to update calendar visibility' };
  }
}