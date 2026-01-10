import { NextResponse } from 'next/server';
import { getEvents } from '@/app/actions/event-actions';

export async function GET(request: Request) {
  try {
    // Get query parameters for date range
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const updatedAfterParam = searchParams.get('updatedAfter');

    // Default to current month ± 6 months if no params provided
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 7, 0);

    const startDate = startDateParam ? new Date(startDateParam) : defaultStart;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEnd;

    const events = await getEvents(startDate, endDate);

    // Filter by updatedAfter timestamp for incremental sync
    if (updatedAfterParam) {
      const updatedAfter = new Date(parseInt(updatedAfterParam));
      const filteredEvents = events.filter((event: any) => {
        const eventUpdatedAt = event.updatedAt ? new Date(event.updatedAt) : new Date(event.createdAt);
        return eventUpdatedAt > updatedAfter;
      });
      return NextResponse.json(filteredEvents);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
