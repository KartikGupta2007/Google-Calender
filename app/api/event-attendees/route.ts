import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { eventAttendeesTable, eventsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/event-attendees - Get attendees for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const attendees = await db
      .select({
        id: eventAttendeesTable.id,
        eventId: eventAttendeesTable.eventId,
        userId: eventAttendeesTable.userId,
        email: eventAttendeesTable.email,
        name: eventAttendeesTable.name,
        responseStatus: eventAttendeesTable.responseStatus,
        isOrganizer: eventAttendeesTable.isOrganizer,
        isOptional: eventAttendeesTable.isOptional,
        comment: eventAttendeesTable.comment,
        respondedAt: eventAttendeesTable.respondedAt,
        createdAt: eventAttendeesTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
        userImage: usersTable.image,
      })
      .from(eventAttendeesTable)
      .leftJoin(usersTable, eq(eventAttendeesTable.userId, usersTable.id))
      .where(eq(eventAttendeesTable.eventId, parseInt(eventId)));

    return NextResponse.json(attendees);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json({ error: 'Failed to fetch event attendees' }, { status: 500 });
  }
}

// POST /api/event-attendees - Add attendee(s) to an event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, attendees } = body;

    if (!eventId || !attendees || !Array.isArray(attendees)) {
      return NextResponse.json(
        { error: 'eventId and attendees array are required' },
        { status: 400 }
      );
    }

    // Validate event exists
    const event = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
    if (event.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const results = [];

    for (const attendee of attendees) {
      const { userId, email, name, isOrganizer, isOptional } = attendee;

      if (!email) {
        continue; // Skip invalid attendees
      }

      // Check if attendee already exists
      const existing = await db
        .select()
        .from(eventAttendeesTable)
        .where(
          and(
            eq(eventAttendeesTable.eventId, eventId),
            eq(eventAttendeesTable.email, email)
          )
        );

      if (existing.length > 0) {
        // Update existing attendee
        const updated = await db
          .update(eventAttendeesTable)
          .set({
            userId: userId || null,
            name: name || existing[0].name,
            isOrganizer: isOrganizer !== undefined ? isOrganizer : existing[0].isOrganizer,
            isOptional: isOptional !== undefined ? isOptional : existing[0].isOptional,
            updatedAt: new Date(),
          })
          .where(eq(eventAttendeesTable.id, existing[0].id))
          .returning();

        results.push(updated[0]);
      } else {
        // Create new attendee
        const created = await db
          .insert(eventAttendeesTable)
          .values({
            eventId,
            userId: userId || null,
            email,
            name: name || null,
            responseStatus: 'needsAction',
            isOrganizer: isOrganizer || false,
            isOptional: isOptional || false,
          })
          .returning();

        results.push(created[0]);
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event attendees:', error);

    if (error.code === '23503') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to create event attendees' }, { status: 500 });
  }
}
