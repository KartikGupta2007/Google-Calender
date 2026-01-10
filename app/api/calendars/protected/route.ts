import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { calendarsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hasCalendarAccess,
  canEditCalendar,
  canManageCalendar,
  getUserCalendarPermission,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/access-control";

/**
 * Protected GET endpoint - get calendar details with permission check
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = parseInt(searchParams.get("calendarId") || "0");
    const userId = parseInt(searchParams.get("userId") || "1"); // In production, get from session

    if (!calendarId) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to this calendar
    const hasAccess = await hasCalendarAccess(userId, calendarId);
    if (!hasAccess) {
      return unauthorizedResponse("You do not have access to this calendar");
    }

    // Fetch the calendar
    const calendar = await db
      .select()
      .from(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .limit(1);

    if (calendar.length === 0) {
      return notFoundResponse("Calendar not found");
    }

    // Include user's permission level in the response
    const permission = await getUserCalendarPermission(userId, calendarId);

    return NextResponse.json({
      ...calendar[0],
      userPermission: permission,
    });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}

/**
 * Protected PATCH endpoint - update calendar with permission check
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { calendarId, userId = 1, ...updates } = body;

    if (!calendarId) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    // Check if user can edit this calendar
    const canEdit = await canEditCalendar(userId, calendarId);
    if (!canEdit) {
      return unauthorizedResponse("You do not have permission to edit this calendar");
    }

    // Update the calendar
    updates.updatedAt = new Date();

    const result = await db
      .update(calendarsTable)
      .set(updates)
      .where(eq(calendarsTable.id, calendarId))
      .returning();

    if (result.length === 0) {
      return notFoundResponse("Calendar not found");
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating calendar:", error);
    return NextResponse.json(
      { error: "Failed to update calendar" },
      { status: 500 }
    );
  }
}

/**
 * Protected DELETE endpoint - delete calendar with permission check
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = parseInt(searchParams.get("calendarId") || "0");
    const userId = parseInt(searchParams.get("userId") || "1"); // In production, get from session

    if (!calendarId) {
      return NextResponse.json(
        { error: "Calendar ID is required" },
        { status: 400 }
      );
    }

    // Check if user can manage this calendar
    const canManage = await canManageCalendar(userId, calendarId);
    if (!canManage) {
      return unauthorizedResponse(
        "You do not have permission to delete this calendar"
      );
    }

    // Delete the calendar (cascading deletes will handle related records)
    const result = await db
      .delete(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .returning();

    if (result.length === 0) {
      return notFoundResponse("Calendar not found");
    }

    return NextResponse.json({ success: true, id: calendarId });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar" },
      { status: 500 }
    );
  }
}
