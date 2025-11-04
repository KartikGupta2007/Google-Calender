import { useMemo } from 'react';
import { useEventStore, useCalendarListStore, CalendarEventType } from '@/lib/store';

export function useFilteredEvents(): CalendarEventType[] {
  const { events } = useEventStore();
  const { calendars } = useCalendarListStore();

  return useMemo(() => {
    // If no calendars are configured, show all events
    if (calendars.length === 0) {
      return events;
    }

    const visibleCalendarIds = new Set(
      calendars.filter(cal => cal.isVisible).map(cal => cal.id)
    );

    return events.filter(event => {
      // Show events without calendarId (local events)
      if (!event.calendarId) return true;
      // Show events from visible calendars
      return visibleCalendarIds.has(event.calendarId);
    });
  }, [events, calendars]);
}
