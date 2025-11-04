'use client'

import React, { Fragment } from 'react'
import MonthViewBox from './month-view-box'
import { useDateStore } from '@/lib/store';

export default function MonthView() {
  const { twoDMonthArray } = useDateStore();

  // Calculate row heights dynamically based on viewport and number of rows
  const numRows = twoDMonthArray.length;
  // For 6 rows, we need to ensure each row gets enough space while fitting in viewport
  // Header height (64px) + padding (11px) + any additional spacing
  const totalAvailableHeight = 'calc(100vh - 75px)'; // 64px header + 11px padding
  const rowHeight = `calc((${totalAvailableHeight}) / ${numRows})`; // Divide available space by number of rows

  return (
    <section style={{ padding: '0 0 8px 0', height: 'calc(100vh - 64px)', background: '#1f1f1f' }}>
      {/* Month panel - .month-panel from styles.css */}
      <div
        style={{
          background: '#131314',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 8px)',
          minHeight: 0, // Allows flex child to shrink below content size if needed
          border: '1px solid #333438'
        }}
      >
        {/* Month grid - .month-grid from styles.css */}
        <div
          className='grid'
          style={{
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: `repeat(${numRows}, ${rowHeight})`,
            flex: 1,
            minHeight: 0 // Ensures grid can shrink if needed
          }}
        >
          {twoDMonthArray.map((row, i) => (
            <Fragment key={i}>
              {row.map((day, index) => (
                <MonthViewBox key={index} day={day} rowIndex={i} />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
