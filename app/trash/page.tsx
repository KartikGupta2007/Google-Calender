"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TrashPage() {
  const router = useRouter();
  const [selectedCalendar, setSelectedCalendar] = useState("Arun Misra");

  // Mock calendars - replace with actual calendar data
  const calendars = [
    { id: 1, name: "Arun Misra", color: "#1a73e8" }
  ];

  // Mock deleted events - replace with actual deleted events from store
  const deletedEvents: any[] = [];

  return (
    <div style={{
      background: '#1f1f1f',
      minHeight: '100vh',
      color: '#e8eaed'
    }}>
      {/* Header */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid #3c4043',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px'
      }}>
        <button
          onClick={() => router.back()}
          className="rounded-full hover:bg-[#3c4043] transition-colors"
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e8eaed'
          }}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 400,
          color: '#e8eaed'
        }}>
          Trash
        </h1>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '280px',
          borderRight: '1px solid #3c4043',
          padding: '16px 0'
        }}>
          <div style={{
            padding: '8px 16px 16px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#9aa0a6'
          }}>
            Trash for my calendars
          </div>

          {/* Calendar List */}
          <div>
            {calendars.map((calendar) => (
              <button
                key={calendar.id}
                onClick={() => setSelectedCalendar(calendar.name)}
                className="w-full text-left transition-colors"
                style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: selectedCalendar === calendar.name ? '#1a73e8' : 'transparent',
                  color: selectedCalendar === calendar.name ? '#ffffff' : '#e8eaed',
                  borderRadius: selectedCalendar === calendar.name ? '0 24px 24px 0' : '0',
                  marginRight: selectedCalendar === calendar.name ? '12px' : '0',
                }}
                onMouseEnter={(e) => {
                  if (selectedCalendar !== calendar.name) {
                    e.currentTarget.style.background = '#3c4043';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCalendar !== calendar.name) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: calendar.color,
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '14px' }}>{calendar.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {deletedEvents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#9aa0a6',
              fontSize: '14px'
            }}>
              There are no deleted events
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '800px' }}>
              {/* Event list will go here */}
              {deletedEvents.map((event) => (
                <div key={event.id} style={{
                  padding: '16px',
                  borderBottom: '1px solid #3c4043',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9aa0a6' }}>
                      {event.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="rounded-full hover:bg-[#3c4043] transition-colors"
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#8ab4f8'
                      }}
                    >
                      Restore
                    </button>
                    <button
                      className="rounded-full hover:bg-[#3c4043] transition-colors"
                      style={{
                        padding: '8px 16px',
                        fontSize: '14px',
                        color: '#8ab4f8'
                      }}
                    >
                      Delete forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
