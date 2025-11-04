import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { eventsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  canViewEvent,
  canEditEvent,
  canDeleteEvent,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/access-control";

/**
 * Protected GET endpoint - get a single event with permission check
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get("eventId") || "0");
    const userId = parseInt(searchParams.get("userId") || "1"); // In production, get from session

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if user has permission to view this event
    const hasPermission = await canViewEvent(userId, eventId);
    if (!hasPermission) {
      return unauthorizedResponse("You do not have permission to view this event");
    }

    // Fetch the event
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return notFoundResponse("Event not found");
    }

    return NextResponse.json(event[0]);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

/**
 * Protected PATCH endpoint - update an event with permission check
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { eventId, userId = 1, ...updates } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if user has permission to edit this event
    const hasPermission = await canEditEvent(userId, eventId);
    if (!hasPermission) {
      return unauthorizedResponse("You do not have permission to edit this event");
    }

    // Update the event
    updates.updatedAt = new Date();

    const result = await db
      .update(eventsTable)
      .set(updates)
      .where(eq(eventsTable.id, eventId))
      .returning();

    if (result.length === 0) {
      return notFoundResponse("Event not found");
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

/**
 * Protected DELETE endpoint - delete an event with permission check
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = parseInt(searchParams.get("eventId") || "0");
    const userId = parseInt(searchParams.get("userId") || "1"); // In production, get from session

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Check if user has permission to delete this event
    const hasPermission = await canDeleteEvent(userId, eventId);
    if (!hasPermission) {
      return unauthorizedResponse("You do not have permission to delete this event");
    }

    // Delete the event
    const result = await db
      .delete(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .returning();

    if (result.length === 0) {
      return notFoundResponse("Event not found");
    }

    return NextResponse.json({ success: true, id: eventId });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
