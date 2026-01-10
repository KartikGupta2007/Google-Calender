"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useDateStore } from "@/lib/store";
import { useCallback, useState, useRef, useEffect } from "react";
import { SvgIcons } from "../svg-icons";
import EventPopover from "../event-popover";

type TabType = "event" | "task" | "appointment";

export default function Create() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>("event");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenPopover = useCallback((e: React.MouseEvent, tabType: TabType = "event") => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTab(tabType);
    setIsPopoverOpen(true);
    setIsDropdownOpen(false);
  }, []);

  const handleClosePopover = useCallback(() => {
    setIsPopoverOpen(false);
  }, []);

  const handleToggleDropdown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const { userSelectedDate } = useDateStore();

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        className="create-fab-button"
        onClick={handleToggleDropdown}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
        style={{
          display: 'inline-grid',
          gridTemplateColumns: '12px 24px 8px 1fr 24px 16px',
          gridAutoFlow: 'column',
          position: 'relative',
          alignItems: 'center',
          alignContent: 'center',
          boxSizing: 'border-box',
          border: 'none',
          padding: '0',
          outline: 'none',
          textDecoration: 'none',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'box-shadow .28s cubic-bezier(.4,0,.2,1), opacity 15ms linear 30ms, transform .27s 0ms cubic-bezier(0,0,.2,1)',
          backgroundColor: '#37393b', // var(--gm3-sys-color-surface-bright)
          height: '56px',
          borderRadius: '16px',
          width: 'fit-content',
          maxWidth: '100%',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
          textOverflow: 'ellipsis'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.3), 0 4px 5px 0 rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)';
        }}
      >
        <span style={{ gridColumn: '1' }}></span>
        <span style={{ gridColumn: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#e3e3e3"/>
          </svg>
        </span>
        <span style={{ gridColumn: '3' }}></span>
        <span style={{
          gridColumn: '4',
          fontFamily: 'Google Sans, Roboto, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '20px',
          letterSpacing: '0.1px',
          color: '#e3e3e3' // var(--gm3-sys-color-on-surface)
        }}>Create</span>
        <span style={{ gridColumn: '5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
            <path d="M7 10l5 5 5-5z" fill="#e3e3e3"/>
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '64px',
            left: '0',
            zIndex: 1000,
            backgroundColor: '#292a2d',
            borderRadius: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            overflow: 'hidden',
            padding: '8px 0'
          }}
        >
          <button
            onClick={(e) => handleOpenPopover(e, "event")}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              color: '#e3e3e3',
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'block',
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3c4043';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Event
          </button>
          <button
            onClick={(e) => handleOpenPopover(e, "task")}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              color: '#e3e3e3',
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'block',
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3c4043';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Task
          </button>
          <button
            onClick={(e) => handleOpenPopover(e, "appointment")}
            style={{
              width: '100%',
              padding: '12px 24px',
              border: 'none',
              background: 'transparent',
              color: '#e3e3e3',
              fontSize: '14px',
              fontWeight: 400,
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'block',
              fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3c4043';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Appointment schedule
          </button>
        </div>
      )}

      {/* Event Popover */}
      {isPopoverOpen && (
        <EventPopover
          isOpen={isPopoverOpen}
          onClose={handleClosePopover}
          date={userSelectedDate.format("YYYY-MM-DD")}
          initialTab={selectedTab}
        />
      )}
    </div>
  );
}
