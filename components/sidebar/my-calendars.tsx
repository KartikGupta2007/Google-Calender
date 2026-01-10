"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useCalendarListStore } from "@/lib/store";

export default function MyCalendars() {
  const { calendars, toggleCalendar } = useCalendarListStore();
  const [localCalendars, setLocalCalendars] = useState<Array<{
    id: number;
    name: string;
    color: string;
    isVisible: boolean;
  }>>([]);

  // Fetch calendars from database
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await fetch('/api/calendars');
        if (response.ok) {
          const data = await response.json();
          // Only show the 4 main calendars (filter out Google Calendar ones if any)
          const mainCalendars = data.filter((cal: any) =>
            ['Kartik Gupta', 'Birthdays', 'Family', 'Tasks'].includes(cal.name)
          );
          setLocalCalendars(mainCalendars);

          // Update store if empty
          if (calendars.length === 0) {
            useCalendarListStore.getState().setCalendars(
              mainCalendars.map((cal: any) => ({
                id: cal.id.toString(),
                name: cal.name,
                color: cal.color,
                isVisible: cal.isVisible,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching calendars:', error);
      }
    };

    fetchCalendars();
  }, []);

  const handleToggle = (calendarId: number) => {
    // Toggle in local state
    setLocalCalendars(prev =>
      prev.map(cal =>
        cal.id === calendarId ? { ...cal, isVisible: !cal.isVisible } : cal
      )
    );
    // Toggle in global store
    toggleCalendar(calendarId.toString());
  };
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="border-none">
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="py-2 px-3 font-medium hover:no-underline hover:bg-transparent" style={{ fontSize: '14px', fontFamily: '"Google Sans", Roboto, Arial, sans-serif', color: 'var(--gm3-sys-color-on-surface)', fontWeight: 500 }}>
          My calendars
        </AccordionTrigger>
        <AccordionContent className="pt-1 pb-3">
          <div className="flex flex-col gap-0.5">
            {localCalendars.map((cal) => (
              <button
                key={cal.id}
                onClick={() => handleToggle(cal.id)}
                className="flex items-center w-full px-3 py-2 hover:bg-[var(--hover)] rounded group"
              >
                <div className="relative flex items-center justify-center w-4 h-4 mr-3 flex-shrink-0">
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center transition-colors"
                    style={{
                      border: `2px solid ${cal.color}`,
                      backgroundColor: cal.isVisible ? cal.color : 'transparent',
                    }}
                  >
                    {cal.isVisible && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span
                  className="truncate flex-1 text-left"
                  style={{
                    color: 'var(--gm3-sys-color-on-surface)',
                    fontSize: '14px',
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  {cal.name}
                </span>
              </button>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
