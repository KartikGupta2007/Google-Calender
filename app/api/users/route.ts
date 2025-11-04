import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { usersTable } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';

// GET /api/users - Get all users or search users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select().from(usersTable);

    // Search by name or email if search param provided
    if (search && search.trim().length > 0) {
      query = query.where(
        or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`)
        )
      ) as any;
    }

    const users = await query;

    // Don't return sensitive information
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      timezone: user.timezone,
    }));

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, image, timezone, workingHoursStart, workingHoursEnd, preferences } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    const result = await db.insert(usersTable).values({
      email,
      name,
      image: image || null,
      timezone: timezone || 'America/New_York',
      workingHoursStart: workingHoursStart || '09:00',
      workingHoursEnd: workingHoursEnd || '17:00',
      preferences: preferences || {},
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
