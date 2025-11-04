"use client";

import { ChevronDown } from "lucide-react";
import ProfileMenu from "./profile-menu";
import { useViewStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import MovableHelpDialog from "../movable-help-dialog";
import { useSearchStore } from "@/lib/search-store";
import { SearchBar } from "@/components/search-bar";

interface HeaderRightProps {
  onTasksClick?: () => void;
  isTaskMode?: boolean;
}

export default function HeaderRight({ onTasksClick, isTaskMode = false }: HeaderRightProps) {
  const { selectedView, setView } = useViewStore();
  const { isSearchOpen, setSearchOpen, setSearchQuery } = useSearchStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMovableHelpOpen, setIsMovableHelpOpen] = useState(false);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [showSettingsTooltip, setShowSettingsTooltip] = useState(false);
  const [showCalendarTooltip, setShowCalendarTooltip] = useState(false);
  const [showTasksTooltip, setShowTasksTooltip] = useState(false);
  const [showAppsTooltip, setShowAppsTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };

    if (isDropdownOpen || isSettingsOpen || isHelpOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isSettingsOpen, isHelpOpen]);

  const getViewLabel = () => {
    switch (selectedView) {
      case "day":
        return "Day";
      case "week":
        return "Week";
      case "month":
        return "Month";
      case "year":
        return "Year";
      case "schedule":
        return "Schedule";
      default:
        return "Month";
    }
  };

  const handleViewSelect = (view: "day" | "week" | "month" | "year" | "schedule") => {
    setView(view);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center" style={{ gap: '12px' }}>
      {/* Search Icon Button - Hide in task mode */}
      {!isTaskMode && (
        <>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSearchOpen(true)}
              onMouseEnter={() => setShowSearchTooltip(true)}
              onMouseLeave={() => setShowSearchTooltip(false)}
              className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] transition-colors"
              style={{ width: '40px', height: '40px', color: 'var(--text)' }}
              aria-label="Search"
            >
              <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.49,19l-5.73-5.73C15.53,12.2,16,10.91,16,9.5C16,5.91,13.09,3,9.5,3S3,5.91,3,9.5C3,13.09,5.91,16,9.5,16 c1.41,0,2.7-0.47,3.77-1.24L19,20.49L20.49,19z M5,9.5C5,7.01,7.01,5,9.5,5S14,7.01,14,9.5S11.99,14,9.5,14S5,11.99,5,9.5z"></path>
              </svg>
            </button>
            {showSearchTooltip && (
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
                Search
              </div>
            )}
          </div>

          {/* Search Bar */}
          {isSearchOpen && (
            <SearchBar
              onClose={() => setSearchOpen(false)}
              onSearch={(query) => {
                setSearchQuery(query);
                // Implement search functionality here
              }}
            />
          )}
        </>
      )}

      {/* Help Icon Button */}
      <div className="relative" ref={helpRef}>
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          onMouseEnter={() => setShowHelpTooltip(true)}
          onMouseLeave={() => setShowHelpTooltip(false)}
          className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] transition-colors"
          style={{ width: '40px', height: '40px', color: 'var(--text)' }}
          aria-label="Help and feedback"
        >
          <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
          </svg>
        </button>
        {showHelpTooltip && !isHelpOpen && (
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
            Support
          </div>
        )}

        {isHelpOpen && (
          <div
            className="absolute mt-2 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{
              width: '200px',
              background: '#292a2d',
              border: '1px solid #3c4043',
              right: '0'
            }}
          >
            <button
              onClick={() => {
                setIsMovableHelpOpen(true);
                setIsHelpOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '14px',
                background: 'transparent',
                padding: '12px 16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Help
            </button>

            <button
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '14px',
                background: 'transparent',
                padding: '12px 16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Training
            </button>

            <button
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '14px',
                background: 'transparent',
                padding: '12px 16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Send feedback to Google
            </button>
          </div>
        )}
      </div>

      {/* Settings Icon Button - Hide in task mode */}
      {!isTaskMode && (
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            onMouseEnter={() => setShowSettingsTooltip(true)}
            onMouseLeave={() => setShowSettingsTooltip(false)}
            className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] transition-colors"
            style={{ width: '40px', height: '40px', color: 'var(--text)' }}
            aria-label="Settings"
          >
            <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M13.85 22.25h-3.7c-.74 0-1.36-.54-1.45-1.27l-.27-1.89c-.27-.14-.53-.29-.79-.46l-1.8.72c-.7.26-1.47-.03-1.81-.65L2.2 15.53c-.35-.66-.2-1.44.36-1.88l1.53-1.19c-.01-.15-.02-.3-.02-.46 0-.15.01-.31.02-.46l-1.52-1.19c-.59-.45-.74-1.26-.37-1.88l1.85-3.19c.34-.62 1.11-.9 1.79-.63l1.81.73c.26-.17.52-.32.78-.46l.27-1.91c.09-.7.71-1.25 1.44-1.25h3.7c.74 0 1.36.54 1.45 1.27l.27 1.89c.27.14.53.29.79.46l1.8-.72c.71-.26 1.48.03 1.82.65l1.84 3.18c.36.66.2 1.44-.36 1.88l-1.52 1.19c.01.15.02.3.02.46s-.01.31-.02.46l1.52 1.19c.56.45.72 1.23.37 1.86l-1.86 3.22c-.34.62-1.11.9-1.8.63l-1.8-.72c-.26.17-.52.32-.78.46l-.27 1.91c-.1.68-.72 1.22-1.46 1.22zm-3.23-2h2.76l.37-2.55.53-.22c.44-.18.88-.44 1.34-.78l.45-.34 2.38.96 1.38-2.4-2.03-1.58.07-.56c.03-.26.06-.51.06-.78s-.03-.53-.06-.78l-.07-.56 2.03-1.58-1.39-2.4-2.39.96-.45-.35c-.42-.32-.87-.58-1.33-.77l-.52-.22-.37-2.55h-2.76l-.37 2.55-.53.21c-.44.19-.88.44-1.34.79l-.45.33-2.38-.95-1.39 2.39 2.03 1.58-.07.56a7 7 0 0 0-.06.79c0 .26.02.53.06.78l.07.56-2.03 1.58 1.38 2.4 2.39-.96.45.35c.43.33.86.58 1.33.77l.53.22.38 2.55z"></path>
              <circle fill="currentColor" cx="12" cy="12" r="3.5"></circle>
            </svg>
          </button>
          {showSettingsTooltip && !isSettingsOpen && (
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
              Settings
            </div>
          )}

        {isSettingsOpen && (
          <div
            className="absolute mt-2 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{
              width: '180px',
              background: '#292a2d',
              border: '1px solid #3c4043',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            <Link
              href="/settings"
              className="block w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '16px',
                background: 'transparent',
                padding: '16px 24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Settings
            </Link>

            <div style={{ height: '1px', background: '#3c4043', margin: '0' }}></div>

            <Link
              href="/trash"
              className="block w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '16px',
                background: 'transparent',
                padding: '16px 24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              onClick={() => setIsSettingsOpen(false)}
            >
              Trash
            </Link>

            <div style={{ height: '1px', background: '#3c4043', margin: '0' }}></div>

            <button
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '16px',
                background: 'transparent',
                padding: '16px 24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Appearance
            </button>

            <button
              onClick={() => {
                window.print();
                setIsSettingsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '16px',
                background: 'transparent',
                padding: '16px 24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Print
            </button>

            <div style={{ height: '1px', background: '#3c4043', margin: '0' }}></div>

            <button
              onClick={() => {
                window.open('https://workspace.google.com/u/0/marketplace', '_blank');
                setIsSettingsOpen(false);
              }}
              className="w-full text-left transition-colors"
              style={{
                color: '#e8eaed',
                fontSize: '16px',
                background: 'transparent',
                padding: '16px 24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3c4043';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Get add-ons
            </button>
          </div>
        )}
        </div>
      )}

      {/* Calendar/Tasks Toggle - Show in task mode */}
      {isTaskMode && (
        <div className="flex rounded-full" style={{ background: 'rgb(48, 49, 51)', border: '1px solid rgb(60, 64, 67)', overflow: 'visible' }}>
          {/* Calendar View Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={onTasksClick}
              onMouseEnter={() => setShowCalendarTooltip(true)}
              onMouseLeave={() => setShowCalendarTooltip(false)}
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '36px',
                background: 'transparent',
                color: 'var(--text)',
                borderTopLeftRadius: '999px',
                borderBottomLeftRadius: '999px',
                transition: 'all 0.2s'
              }}
              aria-label="Calendar view"
            >
              <svg
                style={{
                  color: '#c4c7c5',
                  display: 'inline',
                  fill: '#c4c7c5',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
              >
                <path d="M19,4h-1V2h-2v2H8V2H6v2H5C3.89,4,3.01,4.9,3.01,6L3,20c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M19,20 H5V10h14V20z M19,8H5V6h14V8z"></path>
                <circle cx="7.5" cy="12.5" r="1.5" />
                <circle cx="12" cy="12.5" r="1.5" />
                <circle cx="16.5" cy="12.5" r="1.5" />
              </svg>
            </button>
            {showCalendarTooltip && (
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
                Switch to Calendar
              </div>
            )}
          </div>

          {/* Tasks View Button (Active) */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowTasksTooltip(true)}
              onMouseLeave={() => setShowTasksTooltip(false)}
              className="flex items-center justify-center"
              style={{
                width: '48px',
                height: '36px',
                background: '#004a77',
                color: '#fff',
                borderTopRightRadius: '999px',
                borderBottomRightRadius: '999px',
                transition: 'all 0.2s'
              }}
              aria-label="Tasks view"
            >
              <svg
                style={{
                  color: '#c4c7c5',
                  display: 'inline',
                  fill: '#c4c7c5',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
            </button>
            {showTasksTooltip && (
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
                Switch to Tasks
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Switcher Dropdown - Hide in task mode */}
      {!isTaskMode && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-full flex items-center hover:bg-[var(--hover)] transition-colors"
            style={{
              height: '36px',
              padding: '0 16px',
              border: '1px solid var(--border)',
              background: 'var(--pill)',
              fontSize: '14px',
              fontWeight: 500,
              gap: '6px',
              color: 'var(--text)'
            }}
            aria-label="Select calendar view"
          >
            <span>{getViewLabel()}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

        {isDropdownOpen && (
          <div
            className="absolute right-0 mt-2 w-32 rounded-lg shadow-lg z-50 overflow-hidden"
            style={{
              background: 'var(--pill)',
              border: '1px solid var(--border)'
            }}
          >
            <button
              onClick={() => handleViewSelect("day")}
              className="w-full px-4 py-2 text-left text-sm transition-colors"
              style={{
                color: 'var(--text)',
                background: selectedView === "day" ? 'var(--hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedView !== "day") {
                  e.currentTarget.style.background = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== "day") {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Day
            </button>
            <button
              onClick={() => handleViewSelect("week")}
              className="w-full px-4 py-2 text-left text-sm transition-colors"
              style={{
                color: 'var(--text)',
                background: selectedView === "week" ? 'var(--hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedView !== "week") {
                  e.currentTarget.style.background = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== "week") {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Week
            </button>
            <button
              onClick={() => handleViewSelect("month")}
              className="w-full px-4 py-2 text-left text-sm transition-colors"
              style={{
                color: 'var(--text)',
                background: selectedView === "month" ? 'var(--hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedView !== "month") {
                  e.currentTarget.style.background = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== "month") {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Month
            </button>
            <button
              onClick={() => handleViewSelect("year")}
              className="w-full px-4 py-2 text-left text-sm transition-colors"
              style={{
                color: 'var(--text)',
                background: selectedView === "year" ? 'var(--hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedView !== "year") {
                  e.currentTarget.style.background = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== "year") {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Year
            </button>
            <button
              onClick={() => handleViewSelect("schedule")}
              className="w-full px-4 py-2 text-left text-sm transition-colors"
              style={{
                color: 'var(--text)',
                background: selectedView === "schedule" ? 'var(--hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedView !== "schedule") {
                  e.currentTarget.style.background = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedView !== "schedule") {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              Schedule
            </button>
          </div>
        )}
        </div>
      )}

      {/* View Type Toggle - Hide in task mode */}
      {!isTaskMode && (
      <div className="flex rounded-full" style={{ background: 'rgb(48, 49, 51)', border: '1px solid rgb(60, 64, 67)', overflow: 'visible' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setView("month")}
            onMouseEnter={() => setShowCalendarTooltip(true)}
            onMouseLeave={() => setShowCalendarTooltip(false)}
            className="flex items-center justify-center"
            style={{
              width: '48px',
              height: '36px',
              background: selectedView !== "schedule" ? '#004a77' : 'transparent',
              color: selectedView !== "schedule" ? '#fff' : 'var(--text)',
              borderTopLeftRadius: '999px',
              borderBottomLeftRadius: '999px',
              transition: 'all 0.2s'
            }}
            aria-label="Calendar view"
          >
            <svg
              style={{
                color: '#c4c7c5',
                display: 'inline',
                fill: '#c4c7c5',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'center'
              }}
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
            >
              <path d="M19,4h-1V2h-2v2H8V2H6v2H5C3.89,4,3.01,4.9,3.01,6L3,20c0,1.1,0.89,2,2,2h14c1.1,0,2-0.9,2-2V6C21,4.9,20.1,4,19,4z M19,20 H5V10h14V20z M19,8H5V6h14V8z"></path>
              <circle cx="7.5" cy="12.5" r="1.5" />
              <circle cx="12" cy="12.5" r="1.5" />
              <circle cx="16.5" cy="12.5" r="1.5" />
            </svg>
          </button>
          {showCalendarTooltip && (
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
              Switch to Calendar
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setView("schedule");
              onTasksClick?.();
            }}
            onMouseEnter={() => setShowTasksTooltip(true)}
            onMouseLeave={() => setShowTasksTooltip(false)}
            className="flex items-center justify-center"
            style={{
              width: '48px',
              height: '36px',
              background: selectedView === "schedule" ? '#004a77' : 'transparent',
              color: selectedView === "schedule" ? '#fff' : 'var(--text)',
              borderTopRightRadius: '999px',
              borderBottomRightRadius: '999px',
              transition: 'all 0.2s'
            }}
            aria-label="Schedule view"
          >
            <svg
              style={{
                color: '#c4c7c5',
                display: 'inline',
                fill: '#c4c7c5',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'center'
              }}
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
            </svg>
          </button>
          {showTasksTooltip && (
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
              Switch to Tasks
            </div>
          )}
        </div>
      </div>
      )}

      {/* Google Apps Grid Icon - Always visible */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => window.open('https://workspace.google.com/u/0/marketplace', '_blank')}
          onMouseEnter={() => setShowAppsTooltip(true)}
          onMouseLeave={() => setShowAppsTooltip(false)}
          className="rounded-full flex items-center justify-center hover:bg-[var(--hover)] focus:outline-none focus:ring-1 focus:ring-[var(--focus)] transition-colors"
          style={{ width: '40px', height: '40px', color: 'var(--text)' }}
          aria-label="Google apps"
        >
          <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
          </svg>
        </button>
        {showAppsTooltip && (
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
            Google apps
          </div>
        )}
      </div>

      {/* Profile Menu with Sign Out */}
      <ProfileMenu />

      {/* Movable Help Dialog */}
      <MovableHelpDialog
        isOpen={isMovableHelpOpen}
        onClose={() => setIsMovableHelpOpen(false)}
      />
    </div>
  );
}