import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { calendarSharesTable, calendarsTable, usersTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/calendar-shares - Get all shares for a calendar or user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId');
    const userId = searchParams.get('userId');

    if (!calendarId && !userId) {
      return NextResponse.json(
        { error: 'Either calendarId or userId is required' },
        { status: 400 }
      );
    }

    let query = db
      .select({
        id: calendarSharesTable.id,
        calendarId: calendarSharesTable.calendarId,
        userId: calendarSharesTable.userId,
        permission: calendarSharesTable.permission,
        createdAt: calendarSharesTable.createdAt,
        updatedAt: calendarSharesTable.updatedAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
        userImage: usersTable.image,
        calendarName: calendarsTable.name,
        calendarColor: calendarsTable.color,
      })
      .from(calendarSharesTable)
      .leftJoin(usersTable, eq(calendarSharesTable.userId, usersTable.id))
      .leftJoin(calendarsTable, eq(calendarSharesTable.calendarId, calendarsTable.id));

    if (calendarId) {
      query = query.where(eq(calendarSharesTable.calendarId, parseInt(calendarId))) as any;
    } else if (userId) {
      query = query.where(eq(calendarSharesTable.userId, parseInt(userId))) as any;
    }

    const shares = await query;

    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching calendar shares:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar shares' }, { status: 500 });
  }
}

// POST /api/calendar-shares - Share a calendar with a user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { calendarId, userId, permission } = body;

    if (!calendarId || !userId || !permission) {
      return NextResponse.json(
        { error: 'calendarId, userId, and permission are required' },
        { status: 400 }
      );
    }

    // Validate permission
    if (!['view', 'edit', 'manage'].includes(permission)) {
      return NextResponse.json(
        { error: 'Invalid permission. Must be "view", "edit", or "manage"' },
        { status: 400 }
      );
    }

    // Check if share already exists
    const existing = await db
      .select()
      .from(calendarSharesTable)
      .where(
        and(
          eq(calendarSharesTable.calendarId, calendarId),
          eq(calendarSharesTable.userId, userId)
        )
      );

    if (existing.length > 0) {
      // Update existing share
      const result = await db
        .update(calendarSharesTable)
        .set({
          permission,
          updatedAt: new Date(),
        })
        .where(eq(calendarSharesTable.id, existing[0].id))
        .returning();

      return NextResponse.json(result[0]);
    }

    // Create new share
    const result = await db
      .insert(calendarSharesTable)
      .values({
        calendarId,
        userId,
        permission,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating calendar share:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Calendar or user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: 'Failed to create calendar share' }, { status: 500 });
  }
}
