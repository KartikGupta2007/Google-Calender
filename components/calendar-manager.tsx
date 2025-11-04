"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, Check, Eye, EyeOff } from "lucide-react";
import { useCalendarListStore } from "@/lib/store";

interface Calendar {
  id: string;
  name: string;
  color: string;
  isVisible: boolean;
  description?: string;
}

interface CalendarManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#1a73e8", // Google Blue
  "#d50000", // Red
  "#e67c73", // Coral
  "#f4511e", // Orange
  "#f6bf26", // Yellow
  "#33b679", // Green
  "#0b8043", // Dark Green
  "#039be5", // Cyan
  "#3f51b5", // Indigo
  "#7986cb", // Light Purple
  "#8e24aa", // Purple
  "#616161", // Gray
];

export default function CalendarManager({ isOpen, onClose }: CalendarManagerProps) {
  const { calendars, setCalendars, toggleCalendar } = useCalendarListStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: PRESET_COLORS[0],
    description: "",
  });

  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setEditingId(null);
      setFormData({ name: "", color: PRESET_COLORS[0], description: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          color: formData.color,
          description: formData.description || null,
          isVisible: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create calendar');
      }

      const newCalendar = await response.json();

      // Convert to CalendarInfo format for Zustand
      const calendarInfo: Calendar = {
        id: newCalendar.id.toString(),
        name: newCalendar.name,
        color: newCalendar.color,
        isVisible: newCalendar.isVisible,
        description: newCalendar.description,
      };

      setCalendars([...calendars, calendarInfo]);
      setIsCreating(false);
      setFormData({ name: "", color: PRESET_COLORS[0], description: "" });
    } catch (error) {
      console.error("Error creating calendar:", error);
      alert("Failed to create calendar. Please try again.");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;

    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          color: formData.color,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update calendar');
      }

      const updatedCalendar = await response.json();

      // Update local state
      const updated = calendars.map(cal =>
        cal.id === id
          ? { ...cal, name: updatedCalendar.name, color: updatedCalendar.color, description: updatedCalendar.description }
          : cal
      );

      setCalendars(updated);
      setEditingId(null);
      setFormData({ name: "", color: PRESET_COLORS[0], description: "" });
    } catch (error) {
      console.error("Error updating calendar:", error);
      alert("Failed to update calendar. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this calendar?")) return;

    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete calendar');
      }

      // Update local state
      const filtered = calendars.filter(cal => cal.id !== id);
      setCalendars(filtered);
    } catch (error) {
      console.error("Error deleting calendar:", error);
      alert("Failed to delete calendar. Please try again.");
    }
  };

  const handleToggleVisibility = async (calendar: Calendar) => {
    try {
      const response = await fetch(`/api/calendars/${calendar.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVisible: !calendar.isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update calendar visibility');
      }

      // Update local state
      toggleCalendar(calendar.id);
    } catch (error) {
      console.error("Error toggling calendar visibility:", error);
      alert("Failed to update calendar visibility. Please try again.");
    }
  };

  const startEdit = (calendar: Calendar) => {
    setEditingId(calendar.id);
    setFormData({
      name: calendar.name,
      color: calendar.color,
      description: calendar.description || "",
    });
    setIsCreating(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: '600px',
          maxHeight: '80vh',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--text)' }}>
            Manage Calendars
          </h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-[var(--hover)] p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 140px)', padding: '16px 24px' }}
        >
          {/* Calendar List */}
          <div style={{ marginBottom: '16px' }}>
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="flex items-center gap-3 p-3 rounded-lg mb-2 hover:bg-[var(--hover)] transition-colors"
              >
                {/* Visibility Toggle */}
                <button
                  onClick={() => handleToggleVisibility(calendar)}
                  className="flex items-center justify-center"
                  style={{ width: '24px', height: '24px', color: 'var(--text-secondary)' }}
                  aria-label={calendar.isVisible ? "Hide calendar" : "Show calendar"}
                >
                  {calendar.isVisible ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>

                {/* Color Indicator */}
                <div
                  className="rounded-full"
                  style={{
                    width: '20px',
                    height: '20px',
                    background: calendar.color,
                    flexShrink: 0,
                  }}
                />

                {editingId === calendar.id ? (
                  /* Edit Mode */
                  <>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded border outline-none"
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                      }}
                      placeholder="Calendar name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(calendar.id)}
                        className="p-2 rounded hover:bg-[var(--hover)] transition-colors"
                        style={{ color: '#33b679' }}
                        aria-label="Save"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: "", color: PRESET_COLORS[0], description: "" });
                        }}
                        className="p-2 rounded hover:bg-[var(--hover)] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="Cancel"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* View Mode */
                  <>
                    <span
                      className="flex-1"
                      style={{
                        fontSize: '14px',
                        color: calendar.isVisible ? 'var(--text)' : 'var(--text-secondary)',
                        fontWeight: calendar.isVisible ? 500 : 400,
                      }}
                    >
                      {calendar.name}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(calendar)}
                        className="p-2 rounded hover:bg-[var(--hover)] transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(calendar.id)}
                        className="p-2 rounded hover:bg-[var(--hover)] transition-colors"
                        style={{ color: '#d50000' }}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Create New Calendar */}
          {isCreating ? (
            <div
              className="p-4 rounded-lg"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
              }}
            >
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded border outline-none mb-3"
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                placeholder="Calendar name"
                autoFocus
              />

              {/* Color Picker */}
              <div style={{ marginBottom: '12px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className="rounded-full transition-transform hover:scale-110"
                      style={{
                        width: '32px',
                        height: '32px',
                        background: color,
                        border: formData.color === color ? '3px solid var(--text)' : '2px solid transparent',
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ name: "", color: PRESET_COLORS[0], description: "" });
                  }}
                  className="px-4 py-2 rounded hover:bg-[var(--hover)] transition-colors"
                  style={{ fontSize: '14px', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!formData.name.trim()}
                  className="px-4 py-2 rounded transition-colors"
                  style={{
                    fontSize: '14px',
                    background: formData.name.trim() ? '#1a73e8' : 'var(--border)',
                    color: formData.name.trim() ? '#fff' : 'var(--text-secondary)',
                    cursor: formData.name.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-[var(--hover)] transition-colors"
              style={{ color: 'var(--text)' }}
            >
              <Plus className="h-5 w-5" />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Create new calendar</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#1a73e8',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
