"use client";

import React, { useRef, useEffect } from "react";
import { ArrowLeft, Search, Grid3x3 } from "lucide-react";

interface SearchBarProps {
  onClose: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent keyboard shortcuts when typing in search
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    // Auto-focus the search input after a short delay
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    // Handle Escape key to close search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="flex items-center justify-between h-14 px-4 text-[#E8EAED] animate-in fade-in slide-in-from-top-1 duration-150">
      {/* Left Section - Back Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full grid place-items-center hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#8AB4F8] transition-colors"
          aria-label="Back to calendar"
        >
          <ArrowLeft className="h-5 w-5 text-[#E8EAED]" />
        </button>
        <span className="text-[16px] font-medium">Search</span>
      </div>

      {/* Center Section - Search Input Box */}
      <div
        className="ml-4 mr-4 flex items-center h-11 rounded-full bg-[#1F1F1F] px-4 w-[60%] max-w-[1080px] hover:bg-[#242628] focus-within:ring-1 focus-within:ring-[#8AB4F8] transition-colors"
        style={{ boxShadow: 'inset 0 -2px 0 0 rgba(255,255,255,0.04)' }}
      >
        <Search className="h-5 w-5 text-[#9AA0A6] opacity-80 mr-2 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          onKeyDown={handleInputKeyDown}
          className="flex-1 bg-transparent text-[15px] text-[#E8EAED] placeholder-[#9AA0A6] outline-none"
          role="searchbox"
          aria-label="Search"
        />
      </div>

      {/* Right Section - App & Profile Icons */}
      <div className="flex items-center gap-4">
        {/* Google Apps Grid */}
        <button
          className="h-8 w-8 rounded-full grid place-items-center hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#8AB4F8] transition-colors"
          aria-label="Google apps"
        >
          <Grid3x3 className="h-5 w-5 text-[#E8EAED] opacity-90" />
        </button>

        {/* Profile Avatar with Rainbow Ring */}
        <button
          className="relative h-9 w-9 rounded-full p-[2px] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#8AB4F8] transition-all"
          aria-label="Account"
        >
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)' }}
          />
          <span className="relative block h-full w-full rounded-full grid place-items-center bg-[#3AA57A] text-white font-semibold text-sm">
            K
          </span>
        </button>
      </div>
    </div>
  );
}
