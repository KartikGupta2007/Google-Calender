"use client";

import { CalendarEventType, useEventStore } from "@/lib/store";
import dayjs from "dayjs";
import { useState, useRef, useEffect } from "react";

interface ResizableEventProps {
  event: CalendarEventType;
  eventStart: dayjs.Dayjs;
  eventEnd: dayjs.Dayjs;
  height: number;
  topOffset: number;
  leftPercent: number;
  widthPercent: number;
  colors: { bg: string; color: string };
  zIndex: number;
  onClick: (e: React.MouseEvent) => void;
}

export default function ResizableEvent({
  event,
  eventStart,
  eventEnd,
  height,
  topOffset,
  leftPercent,
  widthPercent,
  colors,
  zIndex,
  onClick,
}: ResizableEventProps) {
  const { updateEvent } = useEventStore();
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHeight, setResizeHeight] = useState(height);
  const eventRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  useEffect(() => {
    setResizeHeight(height);
  }, [height]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = resizeHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(24, startHeightRef.current + deltaY); // Minimum 30 minutes
      setResizeHeight(newHeight);
    };

    const handleMouseUp = async () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Calculate new duration based on height
      const newDurationMinutes = Math.round((resizeHeight / 48) * 60);
      const newEndTime = eventStart.add(newDurationMinutes, "minute");

      // Update event - pass full event object
      updateEvent({
        ...event,
        endDate: newEndTime,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const durationMinutes = eventEnd.diff(eventStart, "minute");

  return (
    <div
      ref={eventRef}
      data-event-id={event.id}
      draggable={!isResizing}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            eventId: event.id,
            duration: durationMinutes,
          })
        );
        e.currentTarget.style.opacity = "0.5";
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1";
      }}
      onClick={onClick}
      className="cursor-pointer transition-all group"
      style={{
        position: "absolute",
        top: `${topOffset}px`,
        left: `calc(${leftPercent}% + 2px)`,
        width: `calc(${widthPercent}% - 4px)`,
        height: `${resizeHeight - 2}px`,
        fontSize: "12px",
        padding: "4px 8px",
        borderRadius: "4px",
        overflow: "hidden",
        fontWeight: 500,
        lineHeight: 1.4,
        background: colors.bg,
        color: colors.color,
        zIndex: isResizing ? 100 : zIndex,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        border: isResizing ? "2px solid var(--gm3-sys-color-primary)" : "none",
        boxShadow: isResizing ? "0 4px 8px rgba(0,0,0,0.2)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isResizing) e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        if (!isResizing) e.currentTarget.style.opacity = "1";
      }}
    >
      <div
        style={{
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {event.title}
      </div>
      {resizeHeight > 30 && (
        <div
          style={{
            fontSize: "11px",
            opacity: 0.9,
            marginTop: "2px",
          }}
        >
          {eventStart.format("h:mm A")} – {eventEnd.format("h:mm A")}
        </div>
      )}

      {/* Resize handle at bottom */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          borderBottomLeftRadius: "4px",
          borderBottomRightRadius: "4px",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            borderRadius: "2px",
            background: "rgba(255, 255, 255, 0.7)",
          }}
        />
      </div>

      {/* Resize indicator when resizing */}
      {isResizing && (
        <div
          style={{
            position: "absolute",
            bottom: "-24px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "2px 8px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            borderRadius: "4px",
            fontSize: "11px",
            whiteSpace: "nowrap",
            zIndex: 1000,
          }}
        >
          {Math.round((resizeHeight / 48) * 60)} min
        </div>
      )}
    </div>
  );
}
