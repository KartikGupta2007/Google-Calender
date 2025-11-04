import { useDateStore, useEventStore } from "@/lib/store";
import dayjs from "dayjs";
import React, { useState } from "react";
import { EventRenderer } from "./event-renderer";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";


export default function MonthViewBox({
  day,
  rowIndex,
}: {
  day: dayjs.Dayjs | null;
  rowIndex: number;
}) {
  const { openPopover, updateEvent } = useEventStore();
  const events = useFilteredEvents();
  const [isDragOver, setIsDragOver] = useState(false);

  const { setDate } = useDateStore();

  if (!day) {
    return (
      <div style={{ borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}></div>
    );
  }

  const isToday = day.format("DD-MM-YY") === dayjs().format("DD-MM-YY");
  const isCurrentMonth = day.month() === dayjs().month();
  const dayIndex = day.day();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDate(day);
    openPopover();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { eventId, eventDate } = data;

      if (!eventId || !eventDate) return;

      // Parse the original event date
      const originalDate = dayjs(eventDate);

      // Create new date with the target day but keeping the original time
      const newDate = day
        .hour(originalDate.hour())
        .minute(originalDate.minute())
        .second(originalDate.second());

      // Calculate the time difference to update endDate if it exists
      const timeDiff = newDate.diff(originalDate, 'millisecond');

      // Find the event to get its endDate
      const event = events.find(e => e.id === eventId);
      if (event) {
        console.log('[Month Drop] 🎯 Dragging event:', {
          id: event.id,
          title: event.title,
          fromDate: originalDate.format('YYYY-MM-DD'),
          toDate: newDate.format('YYYY-MM-DD'),
        });

        // Build updated event with new date/time
        const updatedEvent = {
          ...event,
          date: newDate,
          // If event has an endDate, update it to maintain the same duration
          endDate: event.endDate ? event.endDate.add(timeDiff, 'millisecond') : event.endDate
        };

        updateEvent(updatedEvent);
      }
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  };

  return (
    <div
      className="relative flex flex-col transition-all duration-200"
      style={{
        padding: '8px',
        borderRight: dayIndex === 6 ? 'none' : '1px solid #333438',
        borderBottom: '1px solid #333438',
        gap: '4px',
        overflow: 'hidden',
        background: isDragOver ? '#282828' : 'transparent',
        cursor: 'pointer'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="gridcell"
      aria-label={day.format("dddd, MMMM D, YYYY")}
      aria-current={isToday ? "date" : undefined}
    >
      {/* Date number - .day-number from styles.css */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        {rowIndex === 0 && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#9aa0a6',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '4px'
            }}
          >
            {day.format("ddd")}
          </div>
        )}
        <div
          className={`rounded-full flex items-center justify-center hover:bg-[#282828]`}
          style={{
            fontSize: '12px',
            fontWeight: isToday ? 500 : 400,
            color: isToday ? '#ffffff' : isCurrentMonth ? '#e8eaed' : '#5f6368',
            width: '24px',
            height: '24px',
            background: isToday ? '#1a73e8' : 'transparent',
            flexShrink: 0,
            transition: 'background-color 0.2s'
          }}
        >
          {day.format("D")}
        </div>
      </div>

      {/* Events container - .events-container from styles.css */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', marginTop: '4px' }}>
        <EventRenderer date={day} view="month" events={events} />
      </div>

      {/* More events indicator */}
      {events.filter(e => e.date.format("DD-MM-YY") === day.format("DD-MM-YY")).length > 3 && (
        <button
          style={{ 
            marginTop: '4px', 
            fontSize: '12px', 
            color: '#8ab4f8', 
            textAlign: 'left',
            fontWeight: 500,
            borderRadius: '4px',
            padding: '2px 4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#282828';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          +{events.filter(e => e.date.format("DD-MM-YY") === day.format("DD-MM-YY")).length - 3} more
        </button>
      )}
    </div>
  );
}
