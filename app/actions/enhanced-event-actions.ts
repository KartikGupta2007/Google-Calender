'use server'

import { db } from "@/db/drizzle";
import {
  eventsTable,
  eventAttendeesTable,
  remindersTable,
  recurrencePatternsTable,
  activityLogsTable,
  notificationsTable
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Enhanced Create Event with attendees and reminders
export async function createEnhancedEvent(formData: FormData): Promise<{ error: string } | { success: boolean; eventId?: number }> {
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
  const timezone = formData.get('timezone') as string || 'America/New_York';
  const createdBy = formData.get('createdBy') as string; // User ID
  const color = formData.get('color') as string;

  if (!title || !date) {
    return { error: 'Title and date are required' };
  }

  if (!createdBy) {
    return { error: 'User must be authenticated' };
  }

  const startDate = isAllDay
    ? new Date(date)
    : new Date(`${date}T${time || '00:00'}:00`);

  const endDate = endTime
    ? new Date(`${date}T${endTime}:00`)
    : isAllDay
      ? new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

  const attendeesList = guests ? guests.split(',').map(email => email.trim()) : [];
  const remindersList = reminderMinutes ? [{ method: 'popup', minutes: parseInt(reminderMinutes) }] : [];

  try {
    // Create the event
    const result = await db.insert(eventsTable).values({
      title,
      description: description || '',
      startDate,
      endDate,
      timezone,
      location: location || '',
      createdBy: parseInt(createdBy),
      calendarId: calendarId ? parseInt(calendarId) : null,
      isAllDay,
      conferenceLink: conferenceLink || '',
      color: color || null,
      status: 'confirmed',
      // Legacy fields for backward compatibility
      attendees: JSON.stringify(attendeesList),
      reminders: JSON.stringify(remindersList),
      eventType,
    }).returning({ id: eventsTable.id });

    const eventId = result[0].id;

    // Add attendees to event_attendees table
    if (attendeesList.length > 0) {
      const attendeesData = attendeesList.map((email, index) => ({
        eventId,
        userId: null, // TODO: Look up user by email if they exist
        email,
        name: null,
        responseStatus: 'needsAction' as const,
        isOrganizer: index === 0, // First attendee is organizer
        isOptional: false,
      }));

      await db.insert(eventAttendeesTable).values(attendeesData);
    }

    // Add reminders to reminders table
    if (remindersList.length > 0 && createdBy) {
      const remindersData = remindersList.map(reminder => ({
        eventId,
        userId: parseInt(createdBy),
        method: reminder.method as 'popup' | 'email' | 'sms',
        minutesBefore: reminder.minutes,
        isSent: false,
      }));

      await db.insert(remindersTable).values(remindersData);
    }

    // Log activity
    await db.insert(activityLogsTable).values({
      userId: parseInt(createdBy),
      entityType: 'event',
      entityId: eventId,
      action: 'created',
      changes: {
        title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    });

    revalidatePath("/");
    return { success: true, eventId };
  } catch (error) {
    console.error('Error creating event:', error);
    return { error: 'Failed to create event' };
  }
}

// Enhanced Update Event
export async function updateEnhancedEvent(
  eventId: number,
  formData: FormData,
  userId: number
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
  const timezone = formData.get('timezone') as string;
  const color = formData.get('color') as string;

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

  const attendeesList = guests ? guests.split(',').map(email => email.trim()) : [];

  try {
    // Get old event data for activity log
    const oldEvent = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));

    if (oldEvent.length === 0) {
      return { error: 'Event not found' };
    }

    // Update the event
    await db
      .update(eventsTable)
      .set({
        title,
        description: description || '',
        startDate,
        endDate,
        timezone: timezone || 'America/New_York',
        location: location || '',
        attendees: JSON.stringify(attendeesList),
        isAllDay,
        conferenceLink: conferenceLink || '',
        color: color || null,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, eventId));

    // Update attendees (delete old, insert new)
    await db.delete(eventAttendeesTable).where(eq(eventAttendeesTable.eventId, eventId));

    if (attendeesList.length > 0) {
      const attendeesData = attendeesList.map((email, index) => ({
        eventId,
        userId: null,
        email,
        name: null,
        responseStatus: 'needsAction' as const,
        isOrganizer: index === 0,
        isOptional: false,
      }));

      await db.insert(eventAttendeesTable).values(attendeesData);
    }

    // Log activity
    await db.insert(activityLogsTable).values({
      userId,
      entityType: 'event',
      entityId: eventId,
      action: 'updated',
      changes: {
        before: {
          title: oldEvent[0].title,
          startDate: oldEvent[0].startDate?.toISOString(),
        },
        after: {
          title,
          startDate: startDate.toISOString(),
        },
      },
    });

    // Notify attendees of changes
    if (attendeesList.length > 0) {
      const notificationPromises = attendeesList.map(email =>
        db.insert(notificationsTable).values({
          userId, // TODO: Look up user by email
          type: 'event_updated',
          title: 'Event Updated',
          message: `"${title}" has been updated`,
          relatedEntityType: 'event',
          relatedEntityId: eventId,
        })
      );
      await Promise.all(notificationPromises);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { error: 'Failed to update event' };
  }
}

// Enhanced Delete Event
export async function deleteEnhancedEvent(
  eventId: number,
  userId: number
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Get event data before deleting for activity log
    const event = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));

    if (event.length === 0) {
      return { error: 'Event not found' };
    }

    // Delete related records first (cascade)
    await db.delete(eventAttendeesTable).where(eq(eventAttendeesTable.eventId, eventId));
    await db.delete(remindersTable).where(eq(remindersTable.eventId, eventId));

    // Delete the event
    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

    // Log activity
    await db.insert(activityLogsTable).values({
      userId,
      entityType: 'event',
      entityId: eventId,
      action: 'deleted',
      changes: {
        title: event[0].title,
        startDate: event[0].startDate?.toISOString(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error: 'Failed to delete event' };
  }
}

// Get events with attendees and reminders
export async function getEnhancedEvents(startDate?: Date, endDate?: Date) {
  try {
    let query = db
      .select({
        event: eventsTable,
      })
      .from(eventsTable);

    if (startDate && endDate) {
      query = query.where(
        and(
          gte(eventsTable.startDate, startDate),
          lte(eventsTable.startDate, endDate)
        )
      ) as any;
    }

    const events = await query.orderBy(desc(eventsTable.startDate));

    // Fetch attendees and reminders for each event
    const enhancedEvents = await Promise.all(
      events.map(async ({ event }) => {
        const attendees = await db
          .select()
          .from(eventAttendeesTable)
          .where(eq(eventAttendeesTable.eventId, event.id));

        const reminders = await db
          .select()
          .from(remindersTable)
          .where(eq(remindersTable.eventId, event.id));

        return {
          ...event,
          attendeesList: attendees,
          remindersList: reminders,
        };
      })
    );

    return enhancedEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
