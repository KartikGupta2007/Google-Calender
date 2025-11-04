import { db } from "@/db/drizzle";
import {
  calendarsTable,
  calendarSharesTable,
  eventsTable,
  eventAttendeesTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Permission levels for calendar sharing
 */
export type CalendarPermission = "view" | "edit" | "manage";

/**
 * Check if a user has access to a calendar
 */
export async function hasCalendarAccess(
  userId: number,
  calendarId: number
): Promise<boolean> {
  try {
    // Check if user is the owner
    const calendar = await db
      .select()
      .from(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .limit(1);

    if (calendar.length === 0) {
      return false;
    }

    if (calendar[0].ownerId === userId) {
      return true;
    }

    // Check if calendar is shared with the user
    const share = await db
      .select()
      .from(calendarSharesTable)
      .where(
        and(
          eq(calendarSharesTable.calendarId, calendarId),
          eq(calendarSharesTable.userId, userId)
        )
      )
      .limit(1);

    return share.length > 0;
  } catch (error) {
    console.error("Error checking calendar access:", error);
    return false;
  }
}

/**
 * Check if a user has a specific permission level on a calendar
 */
export async function hasCalendarPermission(
  userId: number,
  calendarId: number,
  requiredPermission: CalendarPermission
): Promise<boolean> {
  try {
    // Check if user is the owner (owners have all permissions)
    const calendar = await db
      .select()
      .from(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .limit(1);

    if (calendar.length === 0) {
      return false;
    }

    if (calendar[0].ownerId === userId) {
      return true; // Owners have all permissions
    }

    // Check user's permission level
    const share = await db
      .select()
      .from(calendarSharesTable)
      .where(
        and(
          eq(calendarSharesTable.calendarId, calendarId),
          eq(calendarSharesTable.userId, userId)
        )
      )
      .limit(1);

    if (share.length === 0) {
      return false;
    }

    const userPermission = share[0].permission as CalendarPermission;

    // Permission hierarchy: manage > edit > view
    const permissionLevels: Record<CalendarPermission, number> = {
      view: 1,
      edit: 2,
      manage: 3,
    };

    return (
      permissionLevels[userPermission] >=
      permissionLevels[requiredPermission]
    );
  } catch (error) {
    console.error("Error checking calendar permission:", error);
    return false;
  }
}

/**
 * Check if a user can edit a calendar
 */
export async function canEditCalendar(
  userId: number,
  calendarId: number
): Promise<boolean> {
  return hasCalendarPermission(userId, calendarId, "edit");
}

/**
 * Check if a user can manage a calendar (share, delete, etc.)
 */
export async function canManageCalendar(
  userId: number,
  calendarId: number
): Promise<boolean> {
  return hasCalendarPermission(userId, calendarId, "manage");
}

/**
 * Check if a user can view an event
 */
export async function canViewEvent(
  userId: number,
  eventId: number
): Promise<boolean> {
  try {
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return false;
    }

    const calendarId = event[0].calendarId;
    if (!calendarId) {
      return true; // Default calendar access
    }

    return hasCalendarAccess(userId, calendarId);
  } catch (error) {
    console.error("Error checking event view permission:", error);
    return false;
  }
}

/**
 * Check if a user can edit an event
 */
export async function canEditEvent(
  userId: number,
  eventId: number
): Promise<boolean> {
  try {
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return false;
    }

    // Check if user is the event creator
    if (event[0].userId === userId) {
      return true;
    }

    // Check calendar permissions
    const calendarId = event[0].calendarId;
    if (calendarId) {
      return canEditCalendar(userId, calendarId);
    }

    // Check if user is an attendee with edit rights
    const attendee = await db
      .select()
      .from(eventAttendeesTable)
      .where(
        and(
          eq(eventAttendeesTable.eventId, eventId),
          eq(eventAttendeesTable.userId, userId)
        )
      )
      .limit(1);

    return attendee.length > 0 && attendee[0].isOrganizer;
  } catch (error) {
    console.error("Error checking event edit permission:", error);
    return false;
  }
}

/**
 * Check if a user can delete an event
 */
export async function canDeleteEvent(
  userId: number,
  eventId: number
): Promise<boolean> {
  try {
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return false;
    }

    // Check if user is the event creator
    if (event[0].userId === userId) {
      return true;
    }

    // Check calendar management permissions
    const calendarId = event[0].calendarId;
    if (calendarId) {
      return canManageCalendar(userId, calendarId);
    }

    // Check if user is the organizer
    const attendee = await db
      .select()
      .from(eventAttendeesTable)
      .where(
        and(
          eq(eventAttendeesTable.eventId, eventId),
          eq(eventAttendeesTable.userId, userId)
        )
      )
      .limit(1);

    return attendee.length > 0 && attendee[0].isOrganizer;
  } catch (error) {
    console.error("Error checking event delete permission:", error);
    return false;
  }
}

/**
 * Get user's permission level on a calendar
 */
export async function getUserCalendarPermission(
  userId: number,
  calendarId: number
): Promise<CalendarPermission | null> {
  try {
    // Check if user is the owner
    const calendar = await db
      .select()
      .from(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .limit(1);

    if (calendar.length === 0) {
      return null;
    }

    if (calendar[0].ownerId === userId) {
      return "manage"; // Owners have manage permission
    }

    // Check shared permission
    const share = await db
      .select()
      .from(calendarSharesTable)
      .where(
        and(
          eq(calendarSharesTable.calendarId, calendarId),
          eq(calendarSharesTable.userId, userId)
        )
      )
      .limit(1);

    if (share.length === 0) {
      return null;
    }

    return share[0].permission as CalendarPermission;
  } catch (error) {
    console.error("Error getting user calendar permission:", error);
    return null;
  }
}

/**
 * Middleware response helper for unauthorized access
 */
export function unauthorizedResponse(message: string = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Middleware response helper for not found
 */
export function notFoundResponse(message: string = "Resource not found") {
  return new Response(JSON.stringify({ error: message }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
