import { useDateStore, useViewStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { Fragment } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function SideBarCalendar() {
  const { setMonth, selectedMonthIndex, twoDMonthArray, selectedYear, setDate, setYear, userSelectedDate } = useDateStore();
  const { setView, selectedView } = useViewStore();

  const handleDateClick = (day: dayjs.Dayjs) => {
    setDate(day);
    setMonth(day.month());
    setYear(day.year());
    setView('day');
  };

  return (
    <div>
      {/* Header: Month name and navigation - .mini-label and .mini-nav from styles.css */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gm3-sys-color-on-surface)', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', paddingLeft: '8px' }}>
          {dayjs(new Date(selectedYear, selectedMonthIndex)).format("MMMM YYYY")}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setMonth(selectedMonthIndex - 1)}
            className="rounded-full flex items-center justify-center transition-all"
            style={{
              width: '28px',
              height: '28px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Previous month"
          >
            <MdKeyboardArrowLeft style={{ fontSize: '20px' }} />
          </button>
          <button
            onClick={() => setMonth(selectedMonthIndex + 1)}
            className="rounded-full flex items-center justify-center transition-all"
            style={{
              width: '28px',
              height: '28px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Next month"
          >
            <MdKeyboardArrowRight style={{ fontSize: '20px' }} />
          </button>
        </div>
      </div>

      {/* Grid (Days of Week) - .mini-weekdays from styles.css */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0px',
          marginBottom: '1px'
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: 'var(--muted)',
              fontWeight: 500,
              padding: '1px 0'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid (Dates) - .mini-grid and .mini-cell from styles.css */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0px' }}>
        {twoDMonthArray.map((row, i) => (
          <Fragment key={i}>
            {row.map((day, index) => {
              const isToday = day.format("DD-MM-YY") === dayjs().format("DD-MM-YY");
              const isCurrentMonth = day.month() === selectedMonthIndex;
              const isSelectedDate = selectedView === 'day' && day.format("DD-MM-YY") === userSelectedDate.format("DD-MM-YY");

              // Determine background color based on state
              let backgroundColor = 'transparent';
              if (isToday) {
                backgroundColor = 'var(--accent)'; // Bright blue for today
              } else if (isSelectedDate) {
                backgroundColor = '#2d4a6d'; // Muted dark blue for selected date in day view
              }

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className="rounded-full flex items-center justify-center"
                  style={{
                    aspectRatio: '1',
                    fontSize: '11px',
                    borderRadius: '50%',
                    background: backgroundColor,
                    border: 'none',
                    color: (isToday || isSelectedDate) ? 'white' : isCurrentMonth ? 'var(--text)' : 'var(--subtle)',
                    fontWeight: (isToday || isSelectedDate) ? 700 : 'normal',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    padding: '1px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isToday && !isSelectedDate) {
                      e.currentTarget.style.background = 'var(--hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday && !isSelectedDate) {
                      e.currentTarget.style.background = 'transparent';
                    } else if (isSelectedDate && !isToday) {
                      e.currentTarget.style.background = '#2d4a6d';
                    }
                  }}
                >
                  {day.format("D")}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
