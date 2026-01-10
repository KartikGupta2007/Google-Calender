
import { CalendarEventType, useEventStore } from "@/lib/store";

import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import React from "react";
import ResizableEvent from "./resizable-event";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

type EventRendererProps = {
  date: dayjs.Dayjs;
  view: "month" | "week" | "day";
  events: CalendarEventType[];
  excludeAllDay?: boolean;
};

export function EventRenderer({ date, view, events, excludeAllDay = false }: EventRendererProps) {
  const { openEventSummary, updateEvent } = useEventStore();

  // Calendar colors from styles.css - matching exact CSS variables
  const calendarColors = [
    { bg: 'var(--cal-kartik)', color: 'white' },      // #039BE5 - Kartik
    { bg: 'var(--cal-birthdays)', color: 'white' },   // #0B8043 - Birthdays
    { bg: 'var(--cal-family)', color: 'white' },      // #7986CB - Family
    { bg: 'var(--cal-tasks)', color: '#131314' },     // #F6BF26 - Tasks
    { bg: 'var(--cal-holidays)', color: 'white' },    // #E67C73 - Holidays
  ];

  // For day/week view, we need to filter events that START in this hour
  if (view === "week" || view === "day") {
    // Get ALL events for the day to calculate overlaps properly
    let allDayEvents = events.filter((event: CalendarEventType) => {
      return event.date.format("DD-MM-YY") === date.format("DD-MM-YY");
    });

    // Exclude all-day events if requested
    if (excludeAllDay) {
      allDayEvents = allDayEvents.filter((event: CalendarEventType) => {
        const eventEnd = event.endDate || event.date.add(1, 'hour');
        const durationHours = eventEnd.diff(event.date, 'hour', true);
        const startsAtMidnight = event.date.hour() === 0 && event.date.minute() === 0;

        // Exclude if it's an all-day event
        return !(durationHours >= 20 || (startsAtMidnight && durationHours >= 12));
      });
    }

    // Calculate overlaps and assign columns to ALL events for the day
    const eventsWithLayout = allDayEvents.map(event => {
      const eventStart = event.date;
      const eventEnd = event.endDate || event.date.add(1, 'hour');
      return { event, start: eventStart, end: eventEnd, column: 0, totalColumns: 1, isContained: false };
    });

    // Sort events by start time, then by duration (longer events first)
    eventsWithLayout.sort((a, b) => {
      const startDiff = a.start.valueOf() - b.start.valueOf();
      if (startDiff !== 0) return startDiff;
      return b.end.valueOf() - a.end.valueOf(); // Longer events first
    });

    // Mark contained events
    eventsWithLayout.forEach(eventLayout => {
      eventLayout.isContained = eventsWithLayout.some(e => {
        if (e.event.id === eventLayout.event.id) return false;
        return e.start.isSameOrBefore(eventLayout.start) && e.end.isSameOrAfter(eventLayout.end);
      });
    });

    // Assign columns using a greedy algorithm
    type EventLayout = {
      event: CalendarEventType;
      start: dayjs.Dayjs;
      end: dayjs.Dayjs;
      column: number;
      totalColumns: number;
      isContained: boolean;
    };
    const columns: EventLayout[][] = [];

    eventsWithLayout.forEach(eventLayout => {
      // Check if this event is completely contained within another event
      const containerEvent = eventsWithLayout.find(e => {
        if (e.event.id === eventLayout.event.id) return false;
        // Check if eventLayout is completely within e
        return e.start.isSameOrBefore(eventLayout.start) && e.end.isSameOrAfter(eventLayout.end);
      });

      if (containerEvent) {
        // If contained, place it in the next column after the container
        eventLayout.column = (containerEvent.column || 0) + 1;
        // Add to appropriate column array
        if (!columns[eventLayout.column]) {
          columns[eventLayout.column] = [];
        }
        columns[eventLayout.column].push(eventLayout);
      } else {
        // Find the first column where this event doesn't overlap with any existing event
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const columnEvents = columns[i];
          const hasOverlap = columnEvents.some(e =>
            e.start.isBefore(eventLayout.end) && e.end.isAfter(eventLayout.start)
          );

          if (!hasOverlap) {
            columns[i].push(eventLayout);
            eventLayout.column = i;
            placed = true;
            break;
          }
        }

        // If no suitable column found, create a new one
        if (!placed) {
          columns.push([eventLayout]);
          eventLayout.column = columns.length - 1;
        }
      }
    });

    // Set totalColumns for all events
    const maxColumns = columns.length;
    eventsWithLayout.forEach(eventLayout => {
      // Find all events that overlap with this event
      const overlappingEvents = eventsWithLayout.filter(e =>
        e.event.id !== eventLayout.event.id &&
        e.start.isBefore(eventLayout.end) &&
        e.end.isAfter(eventLayout.start)
      );

      // Total columns is the max column index among overlapping events + 1
      const maxColumn = Math.max(
        eventLayout.column,
        ...overlappingEvents.map(e => e.column)
      );
      eventLayout.totalColumns = maxColumn + 1;
    });

    const eventsWithColumns = eventsWithLayout;

    // Filter to only events that START in this specific hour
    const eventsStartingInThisHour = eventsWithColumns.filter(({ event }) => {
      return event.date.format("DD-MM-YY HH") === date.format("DD-MM-YY HH");
    });

    return (
      <>
        {eventsStartingInThisHour.map(({ event, start: eventStart, end: eventEnd, column, totalColumns }, index) => {
          // Calculate duration in minutes
          const durationMinutes = eventEnd.diff(eventStart, 'minute');
          const height = (durationMinutes / 60) * 48; // 48px per hour

          // Calculate offset from top of hour slot
          const minutesFromHourStart = eventStart.minute();
          const topOffset = (minutesFromHourStart / 60) * 48;

          // Calculate width and left position based on column
          let leftPercent: number;
          let widthPercent: number;

          // Check if this event is contained within another
          const isContainedEvent = eventsWithColumns.some(e => {
            if (e.event.id === event.id) return false;
            // Must be strictly contained: container starts at or before, ends at or after
            // AND they don't have identical time spans
            const startsAtOrBefore = e.start.isSameOrBefore(eventStart);
            const endsAtOrAfter = e.end.isSameOrAfter(eventEnd);
            const notIdentical = !(e.start.isSame(eventStart) && e.end.isSame(eventEnd));
            return startsAtOrBefore && endsAtOrAfter && notIdentical;
          });

          // Check if this event contains other events
          const hasContainedEvents = eventsWithColumns.some(e => {
            if (e.event.id === event.id) return false;
            // This event must start at or before the other, and end at or after the other
            // AND they don't have identical time spans
            const startsAtOrBefore = eventStart.isSameOrBefore(e.start);
            const endsAtOrAfter = eventEnd.isSameOrAfter(e.end);
            const notIdentical = !(eventStart.isSame(e.start) && eventEnd.isSame(e.end));
            return startsAtOrBefore && endsAtOrAfter && notIdentical;
          });

          if (isContainedEvent) {
            // Contained event: starts with 10% gap from left, extends to right edge
            leftPercent = 10;
            widthPercent = 90;
          } else if (hasContainedEvents) {
            // Container event: full width
            leftPercent = 0;
            widthPercent = 100;
          } else {
            // Regular overlapping events: equal split
            const columnWidth = 100 / totalColumns;
            leftPercent = column * columnWidth;
            widthPercent = columnWidth;
          }

          // Generate a stable color index from event ID or use index as fallback
          let colorIndex = index % calendarColors.length;
          if (event.id) {
            const numericId = parseInt(event.id);
            if (!isNaN(numericId)) {
              colorIndex = numericId % calendarColors.length;
            } else {
              // For non-numeric IDs (like Google Calendar IDs), use string hash
              let hash = 0;
              for (let i = 0; i < event.id.length; i++) {
                hash = ((hash << 5) - hash) + event.id.charCodeAt(i);
                hash = hash & hash; // Convert to 32bit integer
              }
              colorIndex = Math.abs(hash) % calendarColors.length;
            }
          }
          const colors = calendarColors[colorIndex];

          return (
            <ResizableEvent
              key={event.id}
              event={event}
              eventStart={eventStart}
              eventEnd={eventEnd}
              height={height}
              topOffset={topOffset}
              leftPercent={leftPercent}
              widthPercent={widthPercent}
              colors={colors}
              zIndex={isContainedEvent ? 10 : 5}
              onClick={(e) => {
                e.stopPropagation();
                openEventSummary(event);
              }}
            />
          );
        })}
      </>
    );
  }

  // Month view - keep existing logic
  const filteredEvents = events.filter((event: CalendarEventType) => {
    return event.date.format("DD-MM-YY") === date.format("DD-MM-YY");
  });

  // Display max 3 events
  const displayEvents = filteredEvents.slice(0, 3);

  return (
    <>
      {displayEvents.map((event, index) => {
        // Generate a stable color index from event ID or use index as fallback
        let colorIndex = index % calendarColors.length;
        if (event.id) {
          const numericId = parseInt(event.id);
          if (!isNaN(numericId)) {
            colorIndex = numericId % calendarColors.length;
          } else {
            // For non-numeric IDs (like Google Calendar IDs), use string hash
            let hash = 0;
            for (let i = 0; i < event.id.length; i++) {
              hash = ((hash << 5) - hash) + event.id.charCodeAt(i);
              hash = hash & hash; // Convert to 32bit integer
            }
            colorIndex = Math.abs(hash) % calendarColors.length;
          }
        }
        const colors = calendarColors[colorIndex];

        return (
          <div
            key={event.id}
            data-event-id={event.id}
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('application/json', JSON.stringify({
                eventId: event.id,
                eventDate: event.date.format('YYYY-MM-DD HH:mm:ss')
              }));
              e.currentTarget.style.opacity = '0.5';
            }}
            onDragEnd={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onClick={(e) => {
              e.stopPropagation();
              openEventSummary(event);
            }}
            className="cursor-pointer transition-all"
            style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 500,
              lineHeight: 1.4,
              background: colors.bg,
              color: colors.color
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {event.title}
          </div>
        );
      })}
    </>
  );
}
