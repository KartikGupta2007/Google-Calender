"use client";

import { useState, useEffect } from "react";
import HeaderLeft from "./left-side";
import HeaderCenter from "./center";
import HeaderRight from "./right-side";
import SearchBar from "./search-bar";

interface HeaderProps {
  onTasksClick: () => void;
  isTaskMode?: boolean;
}

export default function Header({ onTasksClick, isTaskMode = false }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Handle "/" keyboard shortcut to open search
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already in an input field
      if (e.key === "/" && !isSearchOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  return (
    <>
      <header
        className="flex items-center justify-between z-[100] box-border sticky top-0"
        style={{
          height: '64px',
          background: '#1f1f1f',
          padding: '8px',
          fontFamily: '"Google Sans Text",Roboto,Helvetica,Arial,sans-serif',
          transform: 'scale(0.98)',
          transformOrigin: 'top left'
        }}
        role="banner"
      >
        {isSearchOpen ? (
          <SearchBar onClose={() => setIsSearchOpen(false)} />
        ) : (
          <>
            <div className="flex items-center" style={{ gap: '24px' }}>
              <HeaderLeft />
              {!isTaskMode && <HeaderCenter />}
            </div>
            <div className="flex items-center">
              <HeaderRight
                onTasksClick={onTasksClick}
                isTaskMode={isTaskMode}
              />
            </div>
          </>
        )}
      </header>
    </>
  );
}
