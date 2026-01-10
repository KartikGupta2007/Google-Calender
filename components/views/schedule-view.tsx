"use client";

import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  isAllDay?: boolean;
  color?: string;
  calendarId?: number;
}

interface ScheduleViewProps {
  currentDate: Dayjs;
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function ScheduleView({ currentDate, events, onEventClick }: ScheduleViewProps) {
  const [groupedEvents, setGroupedEvents] = useState<{ [key: string]: Event[] }>({});

  // Group events by date
  useEffect(() => {
    const grouped: { [key: string]: Event[] } = {};

    // Get date range (current month ± 1 month)
    const startRange = currentDate.subtract(1, 'month').startOf('month');
    const endRange = currentDate.add(1, 'month').endOf('month');

    events.forEach((event) => {
      const eventDate = dayjs(event.startDate);

      // Only include events within the range
      if (eventDate.isBetween(startRange, endRange, null, '[]')) {
        const dateKey = eventDate.format('YYYY-MM-DD');

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }

        grouped[dateKey].push(event);
      }
    });

    // Sort events within each day by start time
    Object.keys(grouped).forEach((dateKey) => {
      grouped[dateKey].sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });

    setGroupedEvents(grouped);
  }, [events, currentDate]);

  // Get sorted dates
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return dayjs(a).unix() - dayjs(b).unix();
  });

  // Format time
  const formatTime = (date: Date, isAllDay?: boolean) => {
    if (isAllDay) return 'All day';
    return dayjs(date).format('h:mm A');
  };

  // Format date header
  const formatDateHeader = (dateStr: string) => {
    const date = dayjs(dateStr);
    const isToday = date.isSame(dayjs(), 'day');
    const isTomorrow = date.isSame(dayjs().add(1, 'day'), 'day');

    if (isToday) {
      return `Today • ${date.format('MMMM D, YYYY')}`;
    } else if (isTomorrow) {
      return `Tomorrow • ${date.format('MMMM D, YYYY')}`;
    }

    return date.format('dddd, MMMM D, YYYY');
  };

  // Get event duration text
  const getEventDuration = (event: Event) => {
    const start = dayjs(event.startDate);
    const end = event.endDate ? dayjs(event.endDate) : null;

    if (event.isAllDay) {
      if (end && !end.isSame(start, 'day')) {
        const days = end.diff(start, 'day') + 1;
        return `All day • ${days} days`;
      }
      return 'All day';
    }

    if (end) {
      const duration = end.diff(start, 'minute');
      if (duration < 60) {
        return `${duration} min`;
      } else {
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
      }
    }

    return '';
  };

  return (
    <div
      className="overflow-y-auto"
      style={{
        background: 'var(--bg)',
        padding: '24px',
        height: 'calc(100vh - 64px)',
        minHeight: 0,
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {sortedDates.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: '48px 24px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}
          >
            No events scheduled
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dayEvents = groupedEvents[dateKey];
            const date = dayjs(dateKey);
            const isToday = date.isSame(dayjs(), 'day');

            return (
              <div key={dateKey} style={{ marginBottom: '32px' }}>
                {/* Date Header */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: isToday ? '#1a73e8' : 'var(--text-secondary)',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {formatDateHeader(dateKey)}
                </div>

                {/* Events List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="group"
                      style={{
                        display: 'flex',
                        gap: '16px',
                        padding: '12px 16px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--hover)';
                        e.currentTarget.style.borderColor = event.color || '#1a73e8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--card-bg)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      {/* Color Bar */}
                      <div
                        style={{
                          width: '4px',
                          borderRadius: '2px',
                          background: event.color || '#1a73e8',
                          flexShrink: 0,
                        }}
                      />

                      {/* Time */}
                      <div
                        style={{
                          width: '80px',
                          flexShrink: 0,
                          fontSize: '13px',
                          color: 'var(--text-secondary)',
                          paddingTop: '2px',
                        }}
                      >
                        {formatTime(event.startDate, event.isAllDay)}
                      </div>

                      {/* Event Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Title */}
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--text)',
                            marginBottom: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {event.title}
                        </div>

                        {/* Meta Info */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '12px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {/* Duration */}
                          <span>{getEventDuration(event)}</span>

                          {/* Location */}
                          {event.location && (
                            <>
                              <span>•</span>
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {event.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
