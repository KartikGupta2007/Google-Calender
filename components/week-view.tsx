import { getHours, getWeekDays } from "@/lib/getTime";
import { useDateStore, useEventStore, useViewStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { EventRenderer } from "./event-renderer";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";


export default function WeekView() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { openPopover, updateEvent, openEventSummary } = useEventStore();
  const events = useFilteredEvents();
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  
  // State for click-and-drag event creation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: dayjs.Dayjs; hour: number; minute: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ date: dayjs.Dayjs; hour: number; minute: number; y: number } | null>(null);
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

  const { userSelectedDate, setDate, setEndDate } = useDateStore();
  const { setView } = useViewStore();

  // Helper function to check if event is full day (12:00 AM to 11:59 PM)
  interface Event {
    id: string;
    title: string;
    date: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
    isAllDay?: boolean;
    calendarColor?: string;
  }

  const isFullDayEvent = (event: Event) => {
    if (event.isAllDay) return true;

    if (event.date && event.endDate) {
      const start = dayjs(event.date);
      const end = dayjs(event.endDate);

      // Check if event starts at midnight (00:00) and ends at 23:59 or 00:00 next day
      const startsAtMidnight = start.hour() === 0 && start.minute() === 0;
      const endsAtEndOfDay = (end.hour() === 23 && end.minute() === 59) ||
                             (end.hour() === 0 && end.minute() === 0 && end.date() !== start.date());

      return startsAtMidnight && endsAtEndOfDay;
    }

    return false;
  };

  // Separate all-day events from timed events
  const allDayEvents = events.filter(isFullDayEvent);
  const timedEvents = events.filter(event => !isFullDayEvent(event));

  const handleDrop = async (dayDate: dayjs.Dayjs, hour: dayjs.Dayjs, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCell(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { eventId, duration } = data;

      const event = events.find(evt => evt.id === eventId);
      if (!event) return;

      const newStart = dayDate.hour(hour.hour()).minute(0).second(0);
      const newEnd = newStart.add(duration || 60, 'minute');

      await updateEvent({
        ...event,
        date: newStart,
        endDate: newEnd,
        isAllDay: false,
      });
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleAllDayDrop = async (dayDate: dayjs.Dayjs, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCell(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { eventId } = data;

      const event = events.find(evt => evt.id === eventId);
      if (!event) return;

      const newStart = dayDate.hour(0).minute(0).second(0);
      const newEnd = dayDate.hour(23).minute(59).second(0);

      await updateEvent({
        ...event,
        date: newStart,
        endDate: newEnd,
        isAllDay: true,
      });
    } catch (error) {
      console.error('All-day drop error:', error);
    }
  };

  const handleDragOver = (cellKey: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell(cellKey);
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  // Handle mouse down for click-and-drag event creation
  const handleMouseDown = (dayDate: dayjs.Dayjs, hour: dayjs.Dayjs, e: React.MouseEvent<HTMLDivElement>) => {
    // Only start drag on left mouse button
    if (e.button !== 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minute = Math.round((offsetY / 48) * 60);
    
    // Pick a random color for this drag
    const randomColor = dragColors[Math.floor(Math.random() * dragColors.length)];
    setDragPreviewColor(randomColor);
    
    setIsDragging(true);
    setDragStart({
      date: dayDate,
      hour: hour.hour(),
      minute: minute,
      y: e.clientY
    });
    setDragEnd({
      date: dayDate,
      hour: hour.hour(),
      minute: minute,
      y: e.clientY
    });
  };

  // Handle mouse move during drag
  const handleMouseMove = (dayDate: dayjs.Dayjs, hour: dayjs.Dayjs, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart) return;
    
    // Only allow dragging in the same day column
    if (!dayDate.isSame(dragStart.date, 'day')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minute = Math.round((offsetY / 48) * 60);
    
    setDragEnd({
      date: dayDate,
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
    
    // Create start and end times
    const startTime = dragStart.date
      .hour(startHour)
      .minute(startMinute)
      .second(0);
    
    let endTime = dragStart.date
      .hour(endHour)
      .minute(endMinute)
      .second(0);
    
    // Ensure minimum 15-minute duration
    if (endTime.isSameOrBefore(startTime)) {
      endTime = startTime.add(15, 'minute');
    }
    
    // Set the date and end date in the store and open the event creation dialog
    setDate(startTime);
    setEndDate(endTime);
    openPopover();
    
    // Reset drag state
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Calculate drag preview overlay for a specific hour
  const getDragPreview = (dayDate: dayjs.Dayjs, hour: number) => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    // Only show preview in the same day column
    if (!dayDate.isSame(dragStart.date, 'day')) return null;
    
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Global mouse up handler to catch mouse up outside grid
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging, dragStart, dragEnd]);

  return (
    <section style={{ padding: '0 0 8px 0', height: 'calc(100vh - 64px)', background: '#1f1f1f' }}>
      <div className="flex flex-col overflow-hidden rounded-[24px] border border-[#333438]" style={{ background: '#131314', height: 'calc(100% - 8px)' }}>
      <div className={cn("grid grid-cols-[64px_repeat(7,1fr)]", allDayEvents.length === 0 && "border-b border-[#333438]")} style={{ background: '#131314' }}>
        <div>
        </div>

        {/* Week View Header */}
        {getWeekDays(userSelectedDate).map(({ currentDate, today }, index) => (
          <div key={index} className="flex flex-col items-center py-2">
            <div className={cn("text-[11px] font-medium uppercase mb-1 tracking-wider", today ? "text-[#8ab4f8]" : "text-[#9aa0a6]")}>
              {currentDate.format("ddd")}
            </div>
            <div
              onClick={() => {
                setDate(currentDate);
                setView("day");
              }}
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-sm font-normal transition-all cursor-pointer",
                today ? "bg-[#1a73e8] text-white font-medium" : "text-[#e8eaed] hover:bg-[#282828]"
              )}
            >
              {currentDate.format("D")}
            </div>
          </div>
        ))}
      </div>

      {/* All-Day Events Section */}
      {allDayEvents.length > 0 && (
        <div className="grid grid-cols-[64px_repeat(7,1fr)]" style={{ background: 'var(--panel)' }}>
          <div className="flex items-end justify-center border-r border-[#333438] min-h-[40px] text-[10px] text-[#9aa0a6] pb-1">
            GMT+05:30
          </div>

          {/* All-day events grid */}
          {getWeekDays(userSelectedDate).map((_, index) => {
            const dayDate = userSelectedDate.startOf("week").add(index, "day");
            const dayEvents = allDayEvents.filter(event =>
              dayjs(event.date).format('YYYY-MM-DD') === dayDate.format('YYYY-MM-DD')
            );
            const cellKey = `allday-${dayDate.format('YYYY-MM-DD')}`;
            const isDragOver = dragOverCell === cellKey;

            return (
              <div
                key={index}
                className={cn("min-h-[40px] p-1 border-b border-[#333438]", index !== 0 && "border-l border-[#333438]")}
                style={{
                  backgroundColor: isDragOver ? '#1e4d7a' : undefined,
                  transition: 'background-color 0.2s'
                }}
                onDrop={(e) => handleAllDayDrop(dayDate, e)}
                onDragOver={(e) => handleDragOver(cellKey, e)}
                onDragLeave={handleDragLeave}
              >
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('application/json', JSON.stringify({
                        eventId: event.id,
                        duration: 0,
                      }));
                      e.currentTarget.style.opacity = '0.5';
                    }}
                    onDragEnd={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onClick={() => openEventSummary(event)}
                    className="text-xs px-2 py-1 mb-1 rounded cursor-move flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: event.calendarColor || '#039BE5',
                      color: '#041e49',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
                      <path d="M12 7V3H4v4H2v2h2v4h8V9h2V7h-2zm-2 4H6V5h4v6z"/>
                    </svg>
                    <span className="font-medium truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Time Column & Corresponding Boxes of time per each date  */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-[64px_repeat(7,1fr)]" style={{ background: 'var(--panel)' }}>
          {/* Time Column */}
          <div className="border-r border-[#333438]">
            {getHours.map((hour, index) => (
              <div key={index} className="relative h-12">
                {hour.hour() !== 0 && (
                  <div className="absolute -top-2.5 right-2 text-[10px] text-[#9aa0a6]">
                    {hour.format("h A")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Week Days Corresponding Boxes */}
          {getWeekDays(userSelectedDate).map(
            ({ isCurrentDay, today }, index) => {
              const dayDate = userSelectedDate
                .startOf("week")
                .add(index, "day");

              return (
                <div key={index} className={cn("relative", index !== 0 && "border-l border-[#333438]")}>
                  {getHours.map((hour, i) => {
                    const cellKey = `${dayDate.format('YYYY-MM-DD')}-${hour.hour()}`;
                    const isDragOver = dragOverCell === cellKey;

                    return (
                      <div
                        key={i}
                        className={cn(
                          "relative flex h-12 flex-col items-center gap-y-1 border-b border-[#333438] transition-all duration-200",
                          !isDragOver && "hover:bg-[#282828]"
                        )}
                        style={{
                          backgroundColor: isDragOver ? '#1e4d7a' : undefined,
                          cursor: isDragging ? 'ns-resize' : 'pointer'
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
                              setDate(dayDate.hour(hour.hour()));
                              openPopover();
                            }
                          }
                        }}
                        onMouseDown={(e) => handleMouseDown(dayDate, hour, e)}
                        onMouseMove={(e) => handleMouseMove(dayDate, hour, e)}
                        onMouseUp={handleMouseUp}
                        onDrop={(e) => handleDrop(dayDate, hour, e)}
                        onDragOver={(e) => handleDragOver(cellKey, e)}
                        onDragLeave={handleDragLeave}
                        role="gridcell"
                        aria-label={`${dayDate.format('dddd, MMMM D')} at ${hour.format('h A')}`}
                      >
                        {/* Drag preview overlay */}
                        {isDragging && (() => {
                          const preview = getDragPreview(dayDate, hour.hour());
                          if (!preview) return null;
                          return (
                            <div
                              className="absolute left-0 right-0 rounded pointer-events-none"
                              style={{
                                top: `${preview.top}px`,
                                height: `${preview.height}px`,
                                background: dragPreviewColor,
                                opacity: 0.5,
                                zIndex: 5
                              }}
                            />
                          );
                        })()}
                        <EventRenderer
                          events={timedEvents}
                          date={dayDate.hour(hour.hour())}
                          view="week"
                        />
                      </div>
                    );
                  })}
                  {/* Current time indicator */}
                  {isCurrentDay(dayDate) && today && (
                    <div
                      className={cn("absolute left-0 right-0 h-[2px] bg-[#ea4335] z-10")}
                      style={{
                        top: `${(currentTime.hour() * 60 + currentTime.minute()) / (24 * 60) * 100}%`,
                      }}
                    >
                      <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-[#ea4335]" />
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </ScrollArea>
      </div>
    </section>
  );
}
