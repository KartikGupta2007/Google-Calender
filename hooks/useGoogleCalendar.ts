import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import dayjs from "dayjs";

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      uri: string;
      entryPointType: string;
    }>;
  };
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  calendarId?: string;
  calendarName?: string;
  calendarColor?: string;
}

export function useGoogleCalendar() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (timeMin?: string, timeMax?: string) => {
      if (!session) {
        setError("Not authenticated");
        return [];
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (timeMin) params.append("timeMin", timeMin);
        if (timeMax) params.append("timeMax", timeMax);

        const response = await fetch(`/api/calendar/events?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        return data.events || [];
      } catch (err: any) {
        setError(err.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const createEvent = useCallback(
    async (event: {
      title: string;
      description?: string;
      start: string;
      end: string;
      location?: string;
    }) => {
      if (!session) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: event.title,
            description: event.description,
            start: event.start,
            end: event.end,
            location: event.location,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create event");
        }

        const data = await response.json();
        return data.event;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const updateEvent = useCallback(
    async (
      eventId: string,
      updates: {
        title?: string;
        description?: string;
        start?: string;
        end?: string;
        location?: string;
      }
    ) => {
      if (!session) {
        setError("Not authenticated");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calendar/events/${eventId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: updates.title,
            description: updates.description,
            start: updates.start,
            end: updates.end,
            location: updates.location,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update event");
        }

        const data = await response.json();
        return data.event;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!session) {
        setError("Not authenticated");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/calendar/events/${eventId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete event");
        }

        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  // Convert Google Calendar event to your app's event format
  const convertToAppEvent = useCallback((googleEvent: GoogleCalendarEvent) => {
    const conferenceLink = googleEvent.hangoutLink ||
      googleEvent.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri;

    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description || "",
      date: dayjs(googleEvent.start.dateTime || googleEvent.start.date),
      endDate: dayjs(googleEvent.end.dateTime || googleEvent.end.date),
      location: googleEvent.location || "",
      attendees: googleEvent.attendees?.map(a => a.displayName || a.email) || [],
      conferenceLink: conferenceLink || "",
      creator: googleEvent.creator?.displayName || googleEvent.creator?.email || "",
      organizer: googleEvent.organizer?.displayName || googleEvent.organizer?.email || "",
      calendarId: googleEvent.calendarId || "",
      calendarName: googleEvent.calendarName || "",
      calendarColor: googleEvent.calendarColor || "",
      isAllDay: !googleEvent.start.dateTime, // All-day if no time specified
    };
  }, []);

  return {
    isAuthenticated: !!session,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    convertToAppEvent,
  };
}
