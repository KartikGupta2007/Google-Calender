import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { activityLogsTable, usersTable } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/activity-logs - Get activity logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType'); // 'event', 'calendar', 'share'
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = db
      .select({
        id: activityLogsTable.id,
        userId: activityLogsTable.userId,
        entityType: activityLogsTable.entityType,
        entityId: activityLogsTable.entityId,
        action: activityLogsTable.action,
        changes: activityLogsTable.changes,
        metadata: activityLogsTable.metadata,
        ipAddress: activityLogsTable.ipAddress,
        userAgent: activityLogsTable.userAgent,
        createdAt: activityLogsTable.createdAt,
        userName: usersTable.name,
        userEmail: usersTable.email,
        userImage: usersTable.image,
      })
      .from(activityLogsTable)
      .leftJoin(usersTable, eq(activityLogsTable.userId, usersTable.id));

    // Apply filters
    if (entityType && entityId) {
      query = query.where(
        and(
          eq(activityLogsTable.entityType, entityType),
          eq(activityLogsTable.entityId, parseInt(entityId))
        )
      ) as any;
    } else if (userId) {
      query = query.where(eq(activityLogsTable.userId, parseInt(userId))) as any;
    }

    const logs = await query
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(limit);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}

// POST /api/activity-logs - Create an activity log entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, entityType, entityId, action, changes, metadata, ipAddress, userAgent } = body;

    if (!userId || !entityType || !entityId || !action) {
      return NextResponse.json(
        { error: 'userId, entityType, entityId, and action are required' },
        { status: 400 }
      );
    }

    // Validate entity type
    const validEntityTypes = ['event', 'calendar', 'share'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['created', 'updated', 'deleted', 'shared', 'rsvp_changed', 'unshared'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await db
      .insert(activityLogsTable)
      .values({
        userId,
        entityType,
        entityId,
        action,
        changes: changes || null,
        metadata: metadata || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating activity log:', error);

    if (error.code === '23503') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Failed to create activity log' }, { status: 500 });
  }
}
