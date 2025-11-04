"use client";
import {
  CalendarEventType,
  useDateStore,
  useEventStore,
  useViewStore,
  useCalendarListStore,
  CalendarInfo,
} from "@/lib/store";
import MonthView from "./month-view";
import SideBar from "./sidebar/SideBar";
import WeekView from "./week-view";
import DayView from "./day-view";
import YearView from "./year-view";
import EventPopover from "./event-popover";
import { EventSummaryPopover } from "./event-summary-popover";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useSession } from "next-auth/react";

export default function MainView({
  eventsData,
}: {
  eventsData: CalendarEventType[];
}) {
  const { selectedView } = useViewStore();
  const { data: session } = useSession();
  const { fetchEvents, convertToAppEvent } = useGoogleCalendar();
  const [isSyncing, setIsSyncing] = useState(false);
  const { calendars, setCalendars } = useCalendarListStore();

  const {
    isPopoverOpen,
    closePopover,
    isEventSummaryOpen,
    closeEventSummary,
    selectedEvent,
    setEvents,
    events: allEvents,
  } = useEventStore();

  const { userSelectedDate } = useDateStore();

  // Force clear old calendar storage and reset on mount
  useEffect(() => {
    // Clear all old calendar storage keys on first mount
    if (typeof window !== 'undefined') {
      const hasCleared = sessionStorage.getItem('calendars_cleared');
      if (!hasCleared) {
        console.log('Clearing old calendar storage...');
        localStorage.removeItem('calendar_list_v1');
        localStorage.removeItem('calendar_list_v2');
        localStorage.removeItem('calendar_list_v3');
        localStorage.removeItem('calendar_list_v4');

        // Reset calendars to empty
        setCalendars([]);

        // Mark as cleared for this session
        sessionStorage.setItem('calendars_cleared', 'true');
      }
    }
  }, []); // Only run once on mount

  // Sync Google Calendar events on load
  useEffect(() => {
    const syncGoogleCalendar = async () => {
      if (!session) {
        // If not authenticated, fetch Indian holidays and local events
        try {
          const startDate = dayjs().subtract(3, "month").toISOString();
          const endDate = dayjs().add(3, "month").toISOString();

          // Fetch Indian holidays from public calendar
          const holidaysResponse = await fetch(
            `/api/calendar/holidays?timeMin=${startDate}&timeMax=${endDate}`
          );

          if (holidaysResponse.ok) {
            const holidaysData = await holidaysResponse.json();
            const holidayEvents = holidaysData.events.map((event: any) => ({
              id: event.id,
              title: event.summary,
              description: event.description || "",
              date: dayjs(event.start.dateTime || event.start.date),
              endDate: dayjs(event.end.dateTime || event.end.date),
              location: event.location || "",
              calendarId: event.calendarId,
              calendarName: event.calendarName,
              calendarColor: event.calendarColor,
              isAllDay: !event.start.dateTime, // All-day if no time specified
            }));

            // Set Holidays in India as the only calendar
            const holidayCalendar = {
              id: "en.indian#holiday@group.v.calendar.google.com",
              name: "Holidays in India",
              color: "#0B8043",
              isVisible: false,
            };

            setCalendars([holidayCalendar]);

            // Merge with local events
            const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
              ...event,
              date: dayjs(event.date),
            }));

            setEvents([...holidayEvents, ...mappedEvents]);
          } else {
            // Fallback to just local events if holidays fetch fails
            const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
              ...event,
              date: dayjs(event.date),
            }));
            setEvents(mappedEvents);
          }
        } catch (error) {
          console.error("Failed to fetch Indian holidays:", error);
          // Fallback to local events
          const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
            ...event,
            date: dayjs(event.date),
          }));
          setEvents(mappedEvents);
        }
        return;
      }

      setIsSyncing(true);
      try {
        // Fetch events from Google Calendar (6 months range)
        const startDate = dayjs().subtract(3, "month").toISOString();
        const endDate = dayjs().add(3, "month").toISOString();

        // Fetch both user's Google Calendar events and Indian holidays
        const [googleEvents, holidaysResponse] = await Promise.all([
          fetchEvents(startDate, endDate),
          fetch(`/api/calendar/holidays?timeMin=${startDate}&timeMax=${endDate}`)
        ]);

        // Convert Google events to app format
        const convertedEvents = googleEvents.map(convertToAppEvent);

        // Add Indian holidays
        let holidayEvents: CalendarEventType[] = [];
        if (holidaysResponse.ok) {
          const holidaysData = await holidaysResponse.json();
          holidayEvents = holidaysData.events.map((event: any) => ({
            id: event.id,
            title: event.summary,
            description: event.description || "",
            date: dayjs(event.start.dateTime || event.start.date),
            endDate: dayjs(event.end.dateTime || event.end.date),
            location: event.location || "",
            calendarId: event.calendarId,
            calendarName: event.calendarName,
            calendarColor: event.calendarColor,
            isAllDay: !event.start.dateTime, // All-day if no time specified
          }));
        }

        // Extract unique calendars from events
        const calendarMap = new Map<string, CalendarInfo>();
        convertedEvents.forEach(event => {
          if (event.calendarId && !calendarMap.has(event.calendarId)) {
            calendarMap.set(event.calendarId, {
              id: event.calendarId,
              name: event.calendarName || 'Unknown Calendar',
              color: event.calendarColor || '#4285f4',
              isVisible: false, // Default to not visible
            });
          }
        });

        // Always add Holidays in India calendar
        calendarMap.set("en.indian#holiday@group.v.calendar.google.com", {
          id: "en.indian#holiday@group.v.calendar.google.com",
          name: "Holidays in India",
          color: "#0B8043",
          isVisible: false,
        });

        // Set calendars directly from the calendarMap (don't merge with existing)
        // This ensures we always have a clean, deduplicated list from Google Calendar
        const uniqueCalendarsArray = Array.from(calendarMap.values());
        setCalendars(uniqueCalendarsArray);

        // Merge with local events (prioritize Google Calendar)
        const googleEventIds = new Set(convertedEvents.map(e => e.id));
        const localOnlyEvents = eventsData
          .filter(e => !googleEventIds.has(e.id))
          .map(event => ({
            ...event,
            date: dayjs(event.date),
          }));

        const allEvents = [...convertedEvents, ...holidayEvents, ...localOnlyEvents];
        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to sync Google Calendar:", error);
        // Fallback to local events on error
        const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
          ...event,
          date: dayjs(event.date),
        }));
        setEvents(mappedEvents);
      } finally {
        setIsSyncing(false);
      }
    };

    syncGoogleCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="flex" style={{ background: 'var(--surface)' }}>
      {/* SideBar */}
      <SideBar />

      <div className="w-full flex-1" style={{ background: 'var(--surface)' }}>
        <div>
          {selectedView === "month" && <MonthView />}
          {selectedView === "week" && <WeekView />}
          {selectedView === "day" && <DayView />}
          {selectedView === "year" && <YearView />}
        </div>
      </div>
      {isPopoverOpen && (
        <EventPopover
          isOpen={isPopoverOpen}
          onClose={closePopover}
          date={userSelectedDate.format("YYYY-MM-DD")}
        />
      )}

      {isEventSummaryOpen && selectedEvent && (
        <EventSummaryPopover
          isOpen={isEventSummaryOpen}
          onClose={closeEventSummary}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
