import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { calendarsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const calendarId = parseInt(params.id);
    if (isNaN(calendarId)) {
      return NextResponse.json({ error: 'Invalid calendar ID' }, { status: 400 });
    }

    const body = await request.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.color !== undefined) updates.color = body.color;
    if (body.description !== undefined) updates.description = body.description;
    if (body.timezone !== undefined) updates.timezone = body.timezone;
    if (body.isVisible !== undefined) updates.isVisible = body.isVisible;
    if (body.isDefault !== undefined) updates.isDefault = body.isDefault;

    updates.updatedAt = new Date();

    const result = await db
      .update(calendarsTable)
      .set(updates)
      .where(eq(calendarsTable.id, calendarId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating calendar:', error);
    return NextResponse.json({ error: 'Failed to update calendar' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const calendarId = parseInt(params.id);
    if (isNaN(calendarId)) {
      return NextResponse.json({ error: 'Invalid calendar ID' }, { status: 400 });
    }

    const result = await db
      .delete(calendarsTable)
      .where(eq(calendarsTable.id, calendarId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Calendar not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: calendarId });
  } catch (error) {
    console.error('Error deleting calendar:', error);
    return NextResponse.json({ error: 'Failed to delete calendar' }, { status: 500 });
  }
}
