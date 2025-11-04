import { NextResponse } from 'next/server';
import { getCalendars } from '@/app/actions/event-actions';
import { db } from '@/db/drizzle';
import { calendarsTable } from '@/db/schema';

export async function GET() {
  try {
    const calendars = await getCalendars();
    return NextResponse.json(calendars);
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, description, ownerId, timezone, isVisible, isDefault } = body;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      );
    }

    const result = await db.insert(calendarsTable).values({
      name,
      color,
      description: description || null,
      ownerId: ownerId || null,
      timezone: timezone || 'America/New_York',
      isVisible: isVisible !== undefined ? isVisible : true,
      isDefault: isDefault || false,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating calendar:', error);
    return NextResponse.json({ error: 'Failed to create calendar' }, { status: 500 });
  }
}
