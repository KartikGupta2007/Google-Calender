'use client'

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Create from "./create";
import SideBarCalendar from "./side-bar-calendar";
import CalendarList from "../calendar-list";
import SearchPeople from "./search-people";
import { useToggleSideBarStore } from "@/lib/store";

export default function SideBar() {
  const isSideBarOpen = useToggleSideBarStore((state) => state.isSideBarOpen);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    // Show top button if scrolled down more than 100px
    setShowScrollTop(scrollTop > 100);

    // Show bottom button if not at the bottom
    setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 10);
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <aside
      className="relative transition-all duration-300 ease-in-out"
      style={{
        width: isSideBarOpen ? '263px' : '0',
        background: 'var(--surface)',
        height: 'calc(100vh - 64px)',
        display: isSideBarOpen ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Fixed Create Button */}
      <div style={{ padding: '8px 12px 8px 12px', background: 'var(--surface)' }}>
        <Create />
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="flex-1"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
          padding: '0 12px 0 12px',
          overflow: 'auto'
        }}
      >
        <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '8px 8px 4px 0px' }}>
          <SideBarCalendar />
        </div>

        <SearchPeople />

        <CalendarList />
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 12px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: #474747;
          border-radius: 6px;
          border: 3px solid transparent;
          background-clip: padding-box;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #5e5e5e;
          border: 3px solid transparent;
          background-clip: padding-box;
        }
        div::-webkit-scrollbar-thumb:active {
          background: #757575;
          border: 3px solid transparent;
          background-clip: padding-box;
        }
        /* Firefox scrollbar */
        div {
          scrollbar-width: thin;
          scrollbar-color: #474747 transparent;
        }
      `}</style>
    </aside>
  );
}
