import { NextRequest, NextResponse } from "next/server";

// Public Google Calendar ID for Indian Holidays
const INDIA_HOLIDAYS_CALENDAR_ID = "en.indian#holiday@group.v.calendar.google.com";

// GET - Fetch Indian holidays from public Google Calendar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin") || new Date().toISOString();
    const timeMax = searchParams.get("timeMax");

    // Build the URL for the public calendar
    const params = new URLSearchParams({
      key: process.env.GOOGLE_API_KEY || "",
      timeMin,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
    });

    if (timeMax) {
      params.append("timeMax", timeMax);
    }

    const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      INDIA_HOLIDAYS_CALENDAR_ID
    )}/events?${params.toString()}`;

    const response = await fetch(calendarUrl);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching Indian holidays:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch Indian holidays", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add calendar info to each event
    const events = (data.items || []).map((event: any) => ({
      ...event,
      calendarId: INDIA_HOLIDAYS_CALENDAR_ID,
      calendarName: "Holidays in India",
      calendarColor: "#0B8043", // Green color for holidays
    }));

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Error fetching Indian holidays:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Indian holidays" },
      { status: 500 }
    );
  }
}
