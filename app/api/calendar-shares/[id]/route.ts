import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { calendarSharesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/calendar-shares/[id] - Update a calendar share permission
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = parseInt(params.id);

    if (isNaN(shareId)) {
      return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 });
    }

    const body = await request.json();
    const { permission } = body;

    if (!permission) {
      return NextResponse.json({ error: 'Permission is required' }, { status: 400 });
    }

    // Validate permission
    if (!['view', 'edit', 'manage'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission. Must be "view", "edit", or "manage"' },
        { status: 400 }
      );
    }

    const result = await db
      .update(calendarSharesTable)
      .set({
        permission,
        updatedAt: new Date(),
      })
      .where(eq(calendarSharesTable.id, shareId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Calendar share not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating calendar share:', error);
    return NextResponse.json({ error: 'Failed to update calendar share' }, { status: 500 });
  }
}

// DELETE /api/calendar-shares/[id] - Remove a calendar share
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shareId = parseInt(params.id);

    if (isNaN(shareId)) {
      return NextResponse.json({ error: 'Invalid share ID' }, { status: 400 });
    }

    const result = await db
      .delete(calendarSharesTable)
      .where(eq(calendarSharesTable.id, shareId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Calendar share not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Calendar share removed successfully' });
  } catch (error) {
    console.error('Error deleting calendar share:', error);
    return NextResponse.json({ error: 'Failed to delete calendar share' }, { status: 500 });
  }
}
