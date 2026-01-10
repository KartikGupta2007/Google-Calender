import { NextRequest, NextResponse } from "next/server";

// OFFLINE VERSION - Uses browser local storage instead of Google Calendar API
// This is a server-side API that returns mock data for SSR compatibility

// GET - Fetch events from local storage (returns empty for SSR, client handles data)
export async function GET(request: NextRequest) {
  try {
    // In offline mode, return empty array - client will load from localStorage
    // This ensures SSR works without errors
    return NextResponse.json({ events: [] });
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create a new event (client-side will handle via localStorage)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return the event data back - client will save to localStorage
    return NextResponse.json({
      event: {
        id: `event_${Date.now()}`,
        summary: body.summary,
        description: body.description,
        location: body.location,
        start: { dateTime: body.start },
        end: { dateTime: body.end },
        calendarId: 'calendar_personal',
        calendarName: 'Personal',
        calendarColor: '#039BE5',
      }
    });
  } catch (error: any) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
