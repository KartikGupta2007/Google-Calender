import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { eventAttendeesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/event-attendees/[id] - Update attendee RSVP status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendeeId = parseInt(params.id);

    if (isNaN(attendeeId)) {
      return NextResponse.json({ error: 'Invalid attendee ID' }, { status: 400 });
    }

    const body = await request.json();
    const { responseStatus, comment } = body;

    if (!responseStatus) {
      return NextResponse.json({ error: 'responseStatus is required' }, { status: 400 });
    }

    // Validate response status
    const validStatuses = ['needsAction', 'accepted', 'declined', 'tentative'];
    if (!validStatuses.includes(responseStatus)) {
      return NextResponse.json(
        { error: `Invalid responseStatus. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: any = {
      responseStatus,
      respondedAt: new Date(),
      updatedAt: new Date(),
    };

    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const result = await db
      .update(eventAttendeesTable)
      .set(updateData)
      .where(eq(eventAttendeesTable.id, attendeeId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating attendee RSVP:', error);
    return NextResponse.json({ error: 'Failed to update attendee RSVP' }, { status: 500 });
  }
}

// DELETE /api/event-attendees/[id] - Remove an attendee from an event
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendeeId = parseInt(params.id);

    if (isNaN(attendeeId)) {
      return NextResponse.json({ error: 'Invalid attendee ID' }, { status: 400 });
    }

    const result = await db
      .delete(eventAttendeesTable)
      .where(eq(eventAttendeesTable.id, attendeeId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Attendee removed successfully' });
  } catch (error) {
    console.error('Error deleting attendee:', error);
    return NextResponse.json({ error: 'Failed to delete attendee' }, { status: 500 });
  }
}
