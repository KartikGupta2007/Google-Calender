import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { getHours, isCurrentDay } from "@/lib/getTime";
import { EventRenderer } from "./event-renderer";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";


export default function DayView() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { openPopover, updateEvent, openEventSummary } = useEventStore();
  const events = useFilteredEvents();
  const { userSelectedDate, setDate, setEndDate } = useDateStore();
  
  // State for click-and-drag event creation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minute: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minute: number; y: number } | null>(null);
  const [dragPreviewColor, setDragPreviewColor] = useState<string>('#8ab4f8');

  // Colors for drag preview - matching calendar event colors
  const dragColors = [
    '#039BE5', // Blue
    '#0B8043', // Green
    '#D50000', // Red
    '#E67C73', // Salmon
    '#F6BF26', // Yellow
    '#33B679', // Teal
    '#8E24AA', // Purple
    '#616161', // Gray
    '#3F51B5', // Indigo
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Handle mouse down for click-and-drag event creation
  const handleMouseDown = (hour: dayjs.Dayjs, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minute = Math.round((offsetY / 48) * 60);
    
    // Pick a random color for this drag
    const randomColor = dragColors[Math.floor(Math.random() * dragColors.length)];
    setDragPreviewColor(randomColor);
    
    setIsDragging(true);
    setDragStart({
      hour: hour.hour(),
      minute: minute,
      y: e.clientY
    });
    setDragEnd({
      hour: hour.hour(),
      minute: minute,
      y: e.clientY
    });
  };

  // Handle mouse move during drag
  const handleMouseMove = (hour: dayjs.Dayjs, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minute = Math.round((offsetY / 48) * 60);
    
    setDragEnd({
      hour: hour.hour(),
      minute: minute,
      y: e.clientY
    });
  };

  // Handle mouse up to complete event creation
  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    // Determine which time was earlier
    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour);
    
    let startMinute: number;
    let endMinute: number;
    
    if (dragStart.hour === dragEnd.hour) {
      // Same hour - use minute values directly
      startMinute = Math.min(dragStart.minute, dragEnd.minute);
      endMinute = Math.max(dragStart.minute, dragEnd.minute);
    } else if (dragStart.hour < dragEnd.hour) {
      // Start is earlier hour
      startMinute = dragStart.minute;
      endMinute = dragEnd.minute;
    } else {
      // End is earlier hour
      startMinute = dragEnd.minute;
      endMinute = dragStart.minute;
    }
    
    // Snap to 15-minute intervals
    startMinute = Math.round(startMinute / 15) * 15;
    endMinute = Math.round(endMinute / 15) * 15;
    
    // Ensure minimum 15-minute duration
    const startTime = userSelectedDate
      .hour(startHour)
      .minute(startMinute)
      .second(0);
    
    let endTime = userSelectedDate
      .hour(endHour)
      .minute(endMinute)
      .second(0);
    
    // If endTime is not after startTime, add 15 minutes
    if (endTime.isSameOrBefore(startTime)) {
      endTime = startTime.add(15, 'minute');
    }
    
    // Set the date and end date, then open popover
    setDate(startTime);
    setEndDate(endTime);
    openPopover();
    
    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Calculate drag preview overlay for a specific hour
  const getDragPreview = (hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    const startHour = Math.min(dragStart.hour, dragEnd.hour);
    const endHour = Math.max(dragStart.hour, dragEnd.hour);
    
    // Only show preview in hours that are part of the drag range
    if (hour < startHour || hour > endHour) return null;
    
    const HOUR_HEIGHT = 48;
    
    // For the starting hour
    if (hour === startHour && hour === endHour) {
      // Drag within single hour
      const minY = Math.min(dragStart.y, dragEnd.y);
      const maxY = Math.max(dragStart.y, dragEnd.y);
      const top = minY % HOUR_HEIGHT;
      const height = Math.max(12, maxY - minY);
      return { top, height };
    } else if (hour === startHour) {
      // First hour of multi-hour drag
      const top = dragStart.y % HOUR_HEIGHT;
      const height = HOUR_HEIGHT - top;
      return { top, height };
    } else if (hour === endHour) {
      // Last hour of multi-hour drag
      const height = dragEnd.y % HOUR_HEIGHT;
      return { top: 0, height: Math.max(12, height) };
    } else {
      // Middle hours - fill completely
      return { top: 0, height: HOUR_HEIGHT };
    }
  };

  // Global mouse up handler
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, dragStart, dragEnd]);

  const isToday =
    userSelectedDate.format("DD-MM-YY") === dayjs().format("DD-MM-YY");

  // Separate all-day events from timed events
  const allDayEvents = events.filter(event => {
    const sameDay = event.date.format("DD-MM-YY") === userSelectedDate.format("DD-MM-YY");
    if (!sameDay) return false;

    // Check if it's an all-day event
    const eventEnd = event.endDate || event.date.add(1, 'hour');
    const durationHours = eventEnd.diff(event.date, 'hour', true);
    const startsAtMidnight = event.date.hour() === 0 && event.date.minute() === 0;

    // All-day if it spans 20+ hours or starts at midnight and spans most of the day
    return durationHours >= 20 || (startsAtMidnight && durationHours >= 12);
  });

  // Calendar colors from styles.css - matching exact CSS variables
  const calendarColors = [
    { bg: 'var(--cal-kartik)', color: 'white' },
    { bg: 'var(--cal-birthdays)', color: 'white' },
    { bg: 'var(--cal-family)', color: 'white' },
    { bg: 'var(--cal-tasks)', color: '#131314' },
    { bg: 'var(--cal-holidays)', color: 'white' },
  ];

  return (
    <section style={{ padding: '0 0 11px 0', height: 'calc(100vh - 64px)', background: 'var(--surface)' }}>
      <div className="flex flex-col overflow-hidden" style={{ background: 'var(--panel)', borderRadius: '16px', height: 'calc(100% - 11px)' }}>
        {/* Fixed Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr',
          background: 'var(--gm3-sys-color-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}>
          {/* GMT Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '8px',
            height: '80px',
            boxSizing: 'border-box',
            position: 'relative',
            borderRight: allDayEvents.length === 0 ? '1px solid var(--cal-sys-color-grid-separator)' : 'none'
          }}>
            {allDayEvents.length === 0 && (
              <div style={{
                fontSize: '10px',
                color: '#9AA0A6',
              }}>
                GMT+05:30
              </div>
            )}
          </div>

          {/* Date Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '12px 0 8px 16px',
            height: '80px',
            boxSizing: 'border-box',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                fontSize: '11px',
                color: isToday ? 'var(--gm3-sys-color-primary)' : '#9AA0A6',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                lineHeight: '16px'
              }}>
                {userSelectedDate.format("ddd")}
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: isToday ? 500 : 400,
                  background: isToday ? 'var(--gm3-sys-color-primary)' : 'transparent',
                  color: isToday ? '#041e49' : '#C4C7C5',
                }}
              >
                {userSelectedDate.format("D")}
              </div>
            </div>
          </div>
        </div>

        {/* All-day Events Section */}
        {allDayEvents.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr',
            background: 'var(--gm3-sys-color-surface)'
          }}>
            {/* GMT label aligned with events */}
            <div style={{
              borderRight: '1px solid var(--cal-sys-color-grid-separator)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '4px'
            }}>
              <div style={{
                fontSize: '10px',
                color: '#9AA0A6',
              }}>
                GMT+05:30
              </div>
            </div>

            {/* All-day events */}
            <div style={{ padding: '4px 4px 6px 4px' }}>
              {allDayEvents.map((event, index) => {
                // Generate color index
                let colorIndex = index % calendarColors.length;
                if (event.id) {
                  const numericId = parseInt(event.id);
                  if (!isNaN(numericId)) {
                    colorIndex = numericId % calendarColors.length;
                  } else {
                    let hash = 0;
                    for (let i = 0; i < event.id.length; i++) {
                      hash = ((hash << 5) - hash) + event.id.charCodeAt(i);
                      hash = hash & hash;
                    }
                    colorIndex = Math.abs(hash) % calendarColors.length;
                  }
                }
                const colors = calendarColors[colorIndex];

                return (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEventSummary(event);
                    }}
                    style={{
                      marginBottom: index < allDayEvents.length - 1 ? '4px' : '0',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      background: colors.bg,
                      color: colors.color,
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <span style={{ fontSize: '10px', opacity: 0.8 }}>📅</span>
                    {event.title}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <ScrollArea className="flex-1" style={{ borderTop: '1px solid var(--cal-sys-color-grid-separator)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '64px 1fr',
            background: 'var(--gm3-sys-color-surface)'
          }}>
            {/* Time Column */}
            <div style={{ borderRight: '1px solid var(--cal-sys-color-grid-separator)' }}>
              {getHours.map((hour, index) => (
                <div key={index} style={{ position: 'relative', height: '48px' }}>
                  {hour.hour() !== 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '8px',
                      fontSize: '10px',
                      color: '#9AA0A6',
                      fontWeight: 400
                    }}>
                      {hour.format("h A")}
                    </div>
                  )}
                  {/* Partial line extending from right edge */}
                  {index < getHours.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '16px',
                      height: '1px',
                      background: 'var(--cal-sys-color-grid-separator)'
                    }} />
                  )}
                </div>
              ))}
            </div>

            {/* Day/Boxes Column */}
            <div style={{ position: 'relative' }}>
              {getHours.map((hour, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    height: '48px',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    borderBottom: i === getHours.length - 1 ? 'none' : '1px solid var(--cal-sys-color-grid-separator)',
                    transition: 'background-color 0.1s ease-in',
                    cursor: isDragging ? 'ns-resize' : 'pointer'
                  }}
                  onMouseDown={(e) => handleMouseDown(hour, e)}
                  onMouseMove={(e) => handleMouseMove(hour, e)}
                  onMouseUp={handleMouseUp}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    e.currentTarget.style.backgroundColor = 'var(--gm3-sys-color-surface-container)';
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = 'transparent';

                    try {
                      const data = JSON.parse(e.dataTransfer.getData('application/json'));
                      const { eventId, duration } = data;

                      // Find the event
                      const event = events.find(evt => evt.id === eventId);
                      if (!event) return;

                      // Calculate the exact drop position within the hour slot
                      const rect = e.currentTarget.getBoundingClientRect();
                      const offsetY = e.clientY - rect.top;
                      const minuteOffset = Math.round((offsetY / 48) * 60);

                      // Snap to 5-minute intervals
                      const snappedMinutes = Math.round(minuteOffset / 5) * 5;

                      // Calculate new start time
                      const newStartTime = userSelectedDate
                        .hour(hour.hour())
                        .minute(snappedMinutes)
                        .second(0);

                      // Calculate new end time based on duration
                      const newEndTime = newStartTime.add(duration, 'minute');

                      // Update the event with full object
                      updateEvent({
                        ...event,
                        date: newStartTime,
                        endDate: newEndTime
                      });
                    } catch (error) {
                      console.error('Error dropping event:', error);
                    }
                  }}
                  onClick={(e) => {
                    // Only fire onClick if not dragging and not clicking on an event
                    if (!isDragging) {
                      // Check if we clicked on an event element
                      const target = e.target as HTMLElement;
                      
                      // Check if the click target or any parent has data-event-id
                      let element: HTMLElement | null = target;
                      let isEventClick = false;
                      
                      while (element && element !== e.currentTarget) {
                        if (element.hasAttribute && element.hasAttribute('data-event-id')) {
                          isEventClick = true;
                          break;
                        }
                        element = element.parentElement;
                      }
                      
                      // Only open create popover if NOT clicking on an event
                      if (!isEventClick) {
                        setDate(userSelectedDate.hour(hour.hour()));
                        openPopover();
                      }
                    }
                  }}
                >
                  {/* Drag preview overlay */}
                  {isDragging && (() => {
                    const preview = getDragPreview(hour.hour());
                    if (!preview) return null;
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: `${preview.top}px`,
                          height: `${preview.height}px`,
                          background: dragPreviewColor,
                          opacity: 0.5,
                          borderRadius: '4px',
                          pointerEvents: 'none',
                          zIndex: 5
                        }}
                      />
                    );
                  })()}
                  <EventRenderer
                    events={events}
                    date={userSelectedDate.hour(hour.hour())}
                    view="day"
                    excludeAllDay={true}
                  />
                </div>
              ))}

              {/* Current time indicator */}
              {isCurrentDay(userSelectedDate) && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: '#EA4335',
                    zIndex: 10,
                    top: `${((currentTime.hour() * 60 + currentTime.minute()) / (24 * 60)) * (48 * 24)}px`,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '-6px',
                    top: '-5px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#EA4335'
                  }} />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
