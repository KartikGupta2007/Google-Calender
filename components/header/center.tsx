"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDateStore, useViewStore } from "@/lib/store";
import dayjs from "dayjs";

export default function HeaderCenter() {
  const todaysDate = dayjs();
  const { userSelectedDate, setDate, setMonth, selectedMonthIndex, selectedYear, setYear } =
    useDateStore();

  const { selectedView } = useViewStore();
  const [showTodayTooltip, setShowTodayTooltip] = useState(false);
  const [showPrevTooltip, setPrevTooltip] = useState(false);
  const [showNextTooltip, setNextTooltip] = useState(false);

  const handleTodayClick = () => {
    setDate(todaysDate);
    setYear(dayjs().year());
    setMonth(dayjs().month());
  };

  const handlePrevClick = () => {
    switch (selectedView) {
      case "month":
        setMonth(selectedMonthIndex - 1);
        break;
      case "week":
        setDate(userSelectedDate.subtract(1, "week"));
        break;
      case "day":
        setDate(userSelectedDate.subtract(1, "day"));
        break;
      case "year":
        setYear(selectedYear - 1);
        break;
      default:
        break;
    }
  };

  const handleNextClick = () => {
    switch (selectedView) {
      case "month":
        setMonth(selectedMonthIndex + 1);
        break;
      case "week":
        setDate(userSelectedDate.add(1, "week"));
        break;
      case "day":
        setDate(userSelectedDate.add(1, "day"));
        break;
      case "year":
        setYear(selectedYear + 1);
        break;
      default:
        break;
    }
  };

  const getDisplayText = () => {
    if (selectedView === "year") {
      return selectedYear;
    }
    if (selectedView === "day") {
      return userSelectedDate.format("MMMM D, YYYY");
    }
    if (selectedView === "week") {
      return userSelectedDate.format("MMMM YYYY");
    }
    // Default for month view
    return dayjs(new Date(selectedYear, selectedMonthIndex)).format("MMMM YYYY");
  };

  return (
    <div className="flex items-center" style={{ gap: '12px' }}>
      {/* Today Button with Custom Tooltip - .pill from styles.css */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          onClick={handleTodayClick}
          onMouseEnter={() => setShowTodayTooltip(true)}
          onMouseLeave={() => setShowTodayTooltip(false)}
          className="rounded-full flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[var(--focus)]"
          style={{
            overflow: 'hidden',
            width: '95px',
            height: '42px',
            border: '1.5px solid #9c9fa3ff',
            background: showTodayTooltip ? 'rgba(95, 99, 104, 0.08)' : '#1f1f1f',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text)',
            padding: '0 0 0 -5',
            borderRadius: '20px',
            transition: 'background-color 0.2s ease-in-out',
            position: 'relative'
          }}
          aria-label="Jump to today"
        >
          Today
        </button>

        {/* Floating tooltip */}
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#ffffff',
            color: '#3c4043',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 400,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 1000,
            pointerEvents: 'none',
            opacity: showTodayTooltip ? 1 : 0,
            visibility: showTodayTooltip ? 'visible' : 'hidden',
            transition: 'opacity 0.15s ease-in-out'
          }}
        >
          {todaysDate.format("dddd, D MMMM")}
        </div>
      </div>

      {/* Navigation Arrows - .icon-btn from styles.css: 40x40px */}
      <div className="flex items-center" style={{ gap: '4px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={handlePrevClick}
            onMouseEnter={() => setPrevTooltip(true)}
            onMouseLeave={() => setPrevTooltip(false)}
            className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] focus:outline-none focus:ring-1 focus:ring-[var(--focus)] transition-colors"
            style={{ width: '40px', height: '40px', color: 'var(--text)', background: '#1f1f1f' }}
            aria-label="Previous period"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {showPrevTooltip && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffffff',
                color: '#3c4043',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 400,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              Previous {selectedView}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={handleNextClick}
            onMouseEnter={() => setNextTooltip(true)}
            onMouseLeave={() => setNextTooltip(false)}
            className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] focus:outline-none focus:ring-1 focus:ring-[var(--focus)] transition-colors"
            style={{ width: '40px', height: '40px', color: 'var(--text)', background: '#1f1f1f' }}
            aria-label="Next period"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {showNextTooltip && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#ffffff',
                color: '#3c4043',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 400,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              Next {selectedView}
            </div>
          )}
        </div>
      </div>

      {/* Current View Title - .title from styles.css: 22px */}
      <h2 style={{ fontSize: '22px', fontWeight: 400, color: 'var(--text)' }}>
        {getDisplayText()}
      </h2>
    </div>
  );
}
