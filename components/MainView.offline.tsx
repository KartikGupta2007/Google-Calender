'use client'

import {
  CalendarEventType,
  useDateStore,
  useEventStore,
  useViewStore,
  useCalendarListStore,
  CalendarInfo,
} from "@/lib/store";
import AnimatedMonthView from "./animated-month-view";
import SideBar from "./sidebar/SideBar";
import WeekView from "./week-view";
import DayView from "./day-view";
import YearView from "./year-view";
import ScheduleView from "./views/schedule-view";
import EventPopover from "./event-popover";
import { EventSummaryPopover } from "./event-summary-popover";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { offlineDb } from "@/lib/offline-db";

export default function MainViewOffline() {
  const { selectedView } = useViewStore();
  const { calendars, setCalendars } = useCalendarListStore();

  const {
    isPopoverOpen,
    closePopover,
    isEventSummaryOpen,
    closeEventSummary,
    selectedEvent,
    setEvents,
    events,
    openEventSummary,
  } = useEventStore();

  const { userSelectedDate, selectedMonthIndex, selectedYear } = useDateStore();

  // Auto-load events when navigating to empty months
  useEffect(() => {
    const autoLoadEvents = async () => {
      await offlineDb.autoLoadEventsForMonth(selectedYear, selectedMonthIndex);
    };

    autoLoadEvents();
  }, [selectedMonthIndex, selectedYear]);

  // Load events from localStorage on mount and when events change
  useEffect(() => {
    const loadOfflineData = async (syncFromDb = false) => {
      try {
        // Load calendars
        const offlineCalendars = await offlineDb.getCalendars();
        const calendarInfos: CalendarInfo[] = offlineCalendars.map(cal => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          isVisible: cal.isVisible,
        }));
        setCalendars(calendarInfos);

        // Load events
        const offlineEvents = await offlineDb.getEvents();

        // Transform offline events to calendar event format
        const transformedEvents: CalendarEventType[] = offlineEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: dayjs(event.startDate),
          endDate: event.endDate ? dayjs(event.endDate) : undefined,
          location: event.location || undefined,
          calendarId: event.calendarId,
          calendarName: event.calendarName,
          calendarColor: event.calendarColor,
        }));

        setEvents(transformedEvents);

        // Only sync from database on initial load, not on event changes
        if (syncFromDb) {
          // Sync in background without blocking UI
          offlineDb.syncFromDatabase().then(() => {
            // Reload data after sync completes
            loadOfflineData(false);
          }).catch(error => {
            console.error("Background sync failed:", error);
          });
        }
      } catch (error) {
        console.error("Failed to load offline data:", error);
        setEvents([]);
      }
    };

    // Initial load - load from localStorage immediately, then sync in background
    loadOfflineData(true);

    // Listen for custom events to reload data (but DON'T sync from database)
    const handleEventCreated = () => loadOfflineData(false);
    const handleEventUpdated = () => loadOfflineData(false);
    const handleEventDeleted = () => loadOfflineData(false);

    window.addEventListener('offline-event-created', handleEventCreated);
    window.addEventListener('offline-event-updated', handleEventUpdated);
    window.addEventListener('offline-event-deleted', handleEventDeleted);

    return () => {
      window.removeEventListener('offline-event-created', handleEventCreated);
      window.removeEventListener('offline-event-updated', handleEventUpdated);
      window.removeEventListener('offline-event-deleted', handleEventDeleted);
    };
  }, [setEvents, setCalendars]);

  return (
    <div className="flex bg-[var(--gm3-sys-color-surface)]">
      {/* SideBar */}
      <SideBar />

      <div className="w-full flex-1 bg-[var(--gm3-sys-color-surface)]">
        <div>
          {selectedView === "month" && <AnimatedMonthView />}
          {selectedView === "week" && <WeekView />}
          {selectedView === "day" && <DayView />}
          {selectedView === "year" && <YearView />}
          {selectedView === "schedule" && (
            <ScheduleView
              currentDate={userSelectedDate}
              events={events.map(event => ({
                id: Number(event.id),
                title: event.title,
                description: event.description,
                startDate: event.date.toDate(),
                endDate: event.endDate?.toDate(),
                location: event.location,
                isAllDay: false,
                color: event.calendarColor,
              }))}
              onEventClick={(event) => {
                const calendarEvent = events.find(e => e.id === event.id.toString());
                if (calendarEvent) {
                  openEventSummary(calendarEvent);
                }
              }}
            />
          )}
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
