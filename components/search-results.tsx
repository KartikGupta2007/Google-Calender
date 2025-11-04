import { useEffect, useState } from 'react';
import { useSearchStore } from '@/lib/search-store';
import type { SearchResult } from '@/types/search';

export function SearchResults() {
  const { searchQuery } = useSearchStore();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    const searchEvents = async () => {
      setLoading(true);
      try {
        const { offlineDb } = await import('@/lib/offline-db');
        const allEvents = await offlineDb.getEvents();

        // Filter events based on search query
        const filteredEvents = allEvents
          .filter((event) => {
            const query = searchQuery.toLowerCase();
            const titleMatch = event.title?.toLowerCase().includes(query);
            const descMatch = event.description?.toLowerCase().includes(query);
            const locMatch = event.location?.toLowerCase().includes(query);
            return titleMatch || descMatch || locMatch;
          })
          .map(event => ({
            id: event.id.toString(),
            title: event.title || 'Untitled Event',
            startDate: new Date(event.startDate),
            calendar: {
              id: event.calendarId || 'default',
              name: 'My Calendar',
              color: event.calendarColor || '#039BE5'
            }
          }))
          // Sort by date (most recent first)
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        setResults(filteredEvents);
      } catch (error) {
        console.error('Error searching events:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchEvents();
  }, [searchQuery]);

  if (!searchQuery) {
    return null;
  }

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[800px] bg-[#202124] mt-1 z-50 rounded-lg overflow-hidden shadow-lg max-h-[400px] overflow-y-auto"
      style={{ top: '64px' }}
    >
      {loading ? (
        <div className="p-4 text-[#e8eaed] text-center">Searching...</div>
      ) : results.length === 0 ? (
        <div className="p-4 text-[#e8eaed] text-center">No results found</div>
      ) : (
        <div>
          {results.map((result) => {
            const eventDate = result.startDate;
            const day = eventDate.getDate();
            const time = eventDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            return (
              <div
                key={result.id}
                className="px-4 py-3 hover:bg-[#3c4043] transition-colors cursor-pointer flex items-center gap-4 border-b border-[#3c4043] last:border-b-0"
              >
                {/* Calendar icon with date */}
                <div
                  className="w-12 h-12 rounded flex flex-col items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: result.calendar.color }}
                >
                  <div className="text-white text-xs font-semibold">
                    {eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </div>
                  <div className="text-white text-lg font-bold leading-none">
                    {day}
                  </div>
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <div className="text-[#e8eaed] font-normal text-base">{result.title}</div>
                  <div className="text-[#9aa0a6] text-sm">
                    &lt;{result.calendar.name || 'calendar'}@gmail.com&gt;
                  </div>
                </div>

                {/* Date and time on the right */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[#e8eaed] text-sm">
                    {eventDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-[#9aa0a6] text-sm">
                    {time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}