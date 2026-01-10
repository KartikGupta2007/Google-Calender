import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, X, Search } from 'lucide-react';
import { useSearchStore } from '@/lib/search-store';
import { SearchResults } from './search-results';
import { offlineAuth } from '@/lib/offline-auth';

interface SearchBarProps {
  onClose: () => void;
  onSearch: (query: string) => void;
}

export function SearchBar({ onClose, onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent keyboard shortcuts when typing in search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  // Focus the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus();

    // Load user data
    const loadUser = async () => {
      const currentUser = await offlineAuth.getCurrentUser();
      if (currentUser) {
        setUser({ name: currentUser.name, email: currentUser.email });
      }
    };
    loadUser();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { offlineDb } = await import('@/lib/offline-db');
      const allEvents = await offlineDb.getEvents();
      
      // Filter events based on search query
      const filteredEvents = allEvents.filter((event) => {
        const query = searchQuery.toLowerCase();
        const titleMatch = event.title?.toLowerCase().includes(query);
        const descMatch = event.description?.toLowerCase().includes(query);
        const locMatch = event.location?.toLowerCase().includes(query);
        return titleMatch || descMatch || locMatch;
      });
      
      // Pass the filtered events to the parent component
      onSearch(searchQuery);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('searchResults', { 
          detail: { results: filteredEvents } 
        }));
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div 
        className="w-full py-2" 
        style={{ 
          background: '#1c1c1c',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
              style={{ color: '#e0e0e0' }}
            >
              <ChevronLeft size={24} />
            </button>
            <span 
              style={{ 
                color: '#e0e0e0',
                fontFamily: '"Google Sans Text", "Google Sans", Helvetica, Arial, sans-serif',
                fontSize: '18px',
                fontWeight: 400
              }}
            >
              Search
            </span>
          </div>

          {/* Center Section - Search Input */}
          <form 
            onSubmit={handleSearch} 
            className="flex-1 max-w-3xl"
          >
            <div 
              className="relative flex items-center"
              style={{
                background: '#202020',
                border: '1px solid #2a2a2a',
                borderRadius: '24px',
                height: '44px'
              }}
            >
              <Search 
                className="absolute left-4" 
                size={20} 
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  useSearchStore.getState().setSearchQuery(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search"
                className="w-full bg-transparent border-none px-12 placeholder-[#888888] focus:outline-none focus:ring-0"
                style={{
                  color: '#ffffff',
                  caretColor: '#8ab4f8',
                  fontSize: '16px',
                  fontFamily: '"Google Sans Text", "Google Sans", Helvetica, Arial, sans-serif'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    useSearchStore.getState().setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 p-1 rounded-full hover:bg-[#2a2a2a] transition-colors"
                  aria-label="Clear search"
                >
                  <X
                    size={20}
                    style={{ color: '#cccccc' }}
                  />
                </button>
              )}
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open('https://workspace.google.com/u/0/marketplace', '_blank')}
              className="rounded-full flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
              style={{ width: '40px', height: '40px', color: '#e0e0e0' }}
              aria-label="Google apps"
            >
              <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
              </svg>
            </button>
            <button
              className="rounded-full flex items-center justify-center text-white font-semibold text-sm hover:ring-1 hover:ring-[#8AB4F8] focus:outline-none focus:ring-1 focus:ring-[#8AB4F8] transition-all relative overflow-hidden"
              style={{
                width: '32px',
                height: '32px',
                background: 'conic-gradient(from 0deg, #ea4335, #fbbc05, #34a853, #4285f4, #ea4335)',
                padding: '2px'
              }}
              aria-label="Account"
            >
              <div className="h-full w-full rounded-full bg-[#004d40] flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || 'K'}
              </div>
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-[1600px] mx-auto px-4 mt-2">
          <SearchResults />
        </div>
      </div>
      
      {/* Overlay for closing search when clicking outside */}
      <div 
        className="fixed inset-0 bg-black/40 -z-10 backdrop-blur-[2px]" 
        onClick={onClose}
        style={{ animation: 'fadeIn 0.3s ease' }}
      />
    </div>
  );
}
