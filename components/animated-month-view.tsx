'use client'

/**
 * AnimatedMonthView Component
 *
 * A swipeable month-view calendar with sliding panel transitions using Framer Motion.
 *
 * Features:
 * - Swipe gestures with natural physics (touch & mouse)
 * - Keyboard arrow navigation (Left/Right/Up/Down arrows)
 * - Smooth sliding animations with Material Design easing curve
 * - Auto-detects month changes from external sources (header navigation)
 *
 * Animation Logic:
 * - Sliding panel effect: incoming month slides over the current month like pages
 * - Swipe left → next month slides in from right (translateX: 100% → 0%)
 * - Swipe right → previous month slides in from left (translateX: -100% → 0%)
 * - Animation duration: 280ms with cubic-bezier(0.4, 0.0, 0.2, 1) Material Design easing
 * - Powered by Framer Motion for buttery-smooth 60fps performance
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useDateStore } from '@/lib/store'
import { getMonth } from '@/lib/getTime'
import MonthViewBox from './month-view-box'
import dayjs from 'dayjs'

// Separate component that captures and freezes month data based on monthIndex
const MonthGrid = ({ monthIndex, year, rowHeight }: { monthIndex: number; year: number; rowHeight: string }) => {
  // This useMemo will capture the month data when this component is created
  const monthData = useMemo(() => getMonth(monthIndex, year), [monthIndex, year])

  return (
    <div
      className='grid'
      style={{
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: `repeat(${monthData.length}, ${rowHeight})`,
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {monthData.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, index) => (
            <MonthViewBox key={`${day.format('YYYY-MM-DD')}-${index}`} day={day} rowIndex={i} />
          ))}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function AnimatedMonthView() {
  const { selectedMonthIndex, selectedYear, setMonth } = useDateStore()

  // Track direction for animation variants
  const [direction, setDirection] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevMonthIndexRef = useRef(selectedMonthIndex)

  // Calculate row heights dynamically - use a temp calculation
  const tempMonthData = useMemo(() => getMonth(selectedMonthIndex, selectedYear), [selectedMonthIndex, selectedYear])
  const numRows = tempMonthData.length
  const totalAvailableHeight = 'calc(100vh - 75px)'
  const rowHeight = `calc((${totalAvailableHeight}) / ${numRows})`

  // Auto-detect month changes from external sources (header navigation)
  useEffect(() => {
    if (prevMonthIndexRef.current !== selectedMonthIndex) {
      const newDirection = selectedMonthIndex > prevMonthIndexRef.current ? 1 : -1
      setDirection(newDirection)
      prevMonthIndexRef.current = selectedMonthIndex
    }
  }, [selectedMonthIndex])

  // Handle month change with animation (triggered by swipe or keyboard)
  const navigateMonth = useCallback((dir: 'prev' | 'next') => {
    setDirection(dir === 'next' ? 1 : -1)
    const newMonthIndex = dir === 'prev'
      ? selectedMonthIndex - 1
      : selectedMonthIndex + 1
    setMonth(newMonthIndex)
  }, [selectedMonthIndex, setMonth])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          navigateMonth('prev')
          break
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          navigateMonth('next')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigateMonth])

  // Trackpad two-finger swipe navigation
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null
    let isScrolling = false
    let accumulatedDeltaX = 0

    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scrolling (two-finger swipe on trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault()

        // If already scrolling, ignore additional events
        if (isScrolling) return

        // Accumulate deltaX
        accumulatedDeltaX += e.deltaX

        // Clear previous timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        // Wait for gesture to settle before triggering navigation
        scrollTimeout = setTimeout(() => {
          const threshold = 40 // Minimum accumulated deltaX to trigger navigation

          if (Math.abs(accumulatedDeltaX) > threshold) {
            // Set scrolling flag immediately to prevent multiple triggers
            isScrolling = true

            if (accumulatedDeltaX > 0) {
              // Swiping right to left (deltaX positive) → next month
              navigateMonth('next')
            } else {
              // Swiping left to right (deltaX negative) → previous month
              navigateMonth('prev')
            }

            // Reset after a longer delay to prevent rapid successive swipes
            setTimeout(() => {
              isScrolling = false
              accumulatedDeltaX = 0
            }, 400)
          } else {
            // Reset accumulated delta if below threshold
            accumulatedDeltaX = 0
          }
        }, 50) // Wait 50ms after last wheel event before processing
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [navigateMonth])

  // Handle drag end - determine if swipe was strong enough
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)

    const swipe = Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500

    if (swipe) {
      if (info.offset.x > 0) {
        navigateMonth('prev')
      } else {
        navigateMonth('next')
      }
    }
  }

  // Animation variants for smooth sliding - subtle movement
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '3%' : '-3%', // Very subtle slide from right or left
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: 0, // Old month stays in place
      opacity: 0, // Fades out
      transition: {
        duration: 0.15,
      }
    },
  }


  return (
    <section style={{ padding: '0 0 8px 0', height: 'calc(100vh - 64px)', background: '#1f1f1f' }}>
      {/* Month panel */}
      <div
        ref={containerRef}
        style={{
          background: '#131314',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 8px)',
          minHeight: 0,
          border: '1px solid #333438',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {/* Container for animated months */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={selectedMonthIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "tween",
                ease: [0.4, 0.0, 0.2, 1], // Material Design standard easing
                duration: 0.25,
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <MonthGrid monthIndex={selectedMonthIndex} year={selectedYear} rowHeight={rowHeight} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
