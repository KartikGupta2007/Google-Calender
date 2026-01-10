"use client";

import { useState, useEffect } from "react";
import { X, Plus, UserCheck, UserX, UserMinus, User, Check, Trash2 } from "lucide-react";

interface Attendee {
  id: number;
  eventId: number;
  userId: number | null;
  email: string;
  name: string;
  responseStatus: "needsAction" | "accepted" | "declined" | "tentative";
  isOrganizer: boolean;
  isOptional: boolean;
  comment: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AttendeeManagerProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  isOrganizer?: boolean;
}

export default function AttendeeManager({ eventId, isOpen, onClose, isOrganizer = true }: AttendeeManagerProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newAttendeeEmail, setNewAttendeeEmail] = useState("");
  const [newAttendeeName, setNewAttendeeName] = useState("");
  const [newAttendeeOptional, setNewAttendeeOptional] = useState(false);

  // Fetch attendees
  const fetchAttendees = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/event-attendees?eventId=${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setAttendees(data);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add attendee
  const addAttendee = async () => {
    if (!newAttendeeEmail.trim() || !newAttendeeName.trim()) {
      alert("Please enter both email and name");
      return;
    }

    try {
      const response = await fetch("/api/event-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          attendees: [{
            email: newAttendeeEmail,
            name: newAttendeeName,
            isOptional: newAttendeeOptional,
            isOrganizer: false,
          }],
        }),
      });

      if (response.ok) {
        fetchAttendees();
        setNewAttendeeEmail("");
        setNewAttendeeName("");
        setNewAttendeeOptional(false);
        setIsAdding(false);
      } else {
        alert("Failed to add attendee");
      }
    } catch (error) {
      console.error("Error adding attendee:", error);
      alert("Failed to add attendee");
    }
  };

  // Update RSVP status
  const updateRSVP = async (attendeeId: number, status: Attendee["responseStatus"]) => {
    try {
      const response = await fetch(`/api/event-attendees/${attendeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseStatus: status }),
      });

      if (response.ok) {
        setAttendees(attendees.map(a =>
          a.id === attendeeId
            ? { ...a, responseStatus: status, respondedAt: new Date() }
            : a
        ));
      } else {
        alert("Failed to update RSVP");
      }
    } catch (error) {
      console.error("Error updating RSVP:", error);
      alert("Failed to update RSVP");
    }
  };

  // Remove attendee
  const removeAttendee = async (attendeeId: number) => {
    if (!confirm("Remove this attendee?")) return;

    try {
      const response = await fetch(`/api/event-attendees/${attendeeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAttendees(attendees.filter(a => a.id !== attendeeId));
      } else {
        alert("Failed to remove attendee");
      }
    } catch (error) {
      console.error("Error removing attendee:", error);
      alert("Failed to remove attendee");
    }
  };

  // Get status icon and color
  const getStatusDisplay = (status: Attendee["responseStatus"]) => {
    const displays = {
      needsAction: { icon: User, color: "#5f6368", label: "Awaiting" },
      accepted: { icon: UserCheck, color: "#33b679", label: "Accepted" },
      declined: { icon: UserX, color: "#d50000", label: "Declined" },
      tentative: { icon: UserMinus, color: "#f9ab00", label: "Maybe" },
    };
    return displays[status];
  };

  useEffect(() => {
    if (isOpen) {
      fetchAttendees();
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  const organizer = attendees.find(a => a.isOrganizer);
  const otherAttendees = attendees.filter(a => !a.isOrganizer);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: "600px",
          maxHeight: "80vh",
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)" }}>
            Event Attendees
          </h2>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-[var(--hover)] p-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(80vh - 140px)", padding: "16px 24px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]" />
            </div>
          ) : (
            <>
              {/* Organizer */}
              {organizer && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>
                    Organizer
                  </h3>
                  <div
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: "var(--bg)" }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#1a73e8",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: 600,
                      }}
                    >
                      {organizer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>
                        {organizer.name}
                      </p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {organizer.email}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        background: "#e8f0fe",
                        color: "#1a73e8",
                      }}
                    >
                      Organizer
                    </span>
                  </div>
                </div>
              )}

              {/* Other Attendees */}
              {otherAttendees.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase" }}>
                    Guests ({otherAttendees.length})
                  </h3>
                  {otherAttendees.map((attendee) => {
                    const statusDisplay = getStatusDisplay(attendee.responseStatus);
                    const StatusIcon = statusDisplay.icon;

                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 p-3 rounded-lg mb-2 hover:bg-[var(--hover)] transition-colors"
                      >
                        <div
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: "40px",
                            height: "40px",
                            background: statusDisplay.color,
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 600,
                          }}
                        >
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>
                              {attendee.name}
                            </p>
                            {attendee.isOptional && (
                              <span
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  background: "var(--hover)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                Optional
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                            {attendee.email}
                          </p>
                        </div>

                        {/* RSVP Status */}
                        <div className="flex items-center gap-1">
                          <StatusIcon
                            className="h-4 w-4"
                            style={{ color: statusDisplay.color }}
                          />
                          <span style={{ fontSize: "12px", color: statusDisplay.color, fontWeight: 500 }}>
                            {statusDisplay.label}
                          </span>
                        </div>

                        {/* Actions (only if organizer) */}
                        {isOrganizer && (
                          <button
                            onClick={() => removeAttendee(attendee.id)}
                            className="p-1.5 rounded hover:bg-[var(--hover)] transition-colors"
                            style={{ color: "var(--text-secondary)" }}
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Attendee Form */}
              {isOrganizer && (
                <>
                  {isAdding ? (
                    <div
                      className="p-4 rounded-lg"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <input
                        type="text"
                        value={newAttendeeName}
                        onChange={(e) => setNewAttendeeName(e.target.value)}
                        className="w-full px-3 py-2 rounded border outline-none mb-3"
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                        placeholder="Name"
                        autoFocus
                      />
                      <input
                        type="email"
                        value={newAttendeeEmail}
                        onChange={(e) => setNewAttendeeEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded border outline-none mb-3"
                        style={{
                          background: "var(--card-bg)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                        placeholder="Email"
                      />
                      <label className="flex items-center gap-2 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAttendeeOptional}
                          onChange={(e) => setNewAttendeeOptional(e.target.checked)}
                          style={{ width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "14px", color: "var(--text)" }}>
                          Optional attendee
                        </span>
                      </label>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setIsAdding(false);
                            setNewAttendeeEmail("");
                            setNewAttendeeName("");
                            setNewAttendeeOptional(false);
                          }}
                          className="px-4 py-2 rounded hover:bg-[var(--hover)] transition-colors"
                          style={{ fontSize: "14px", color: "var(--text-secondary)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addAttendee}
                          disabled={!newAttendeeEmail.trim() || !newAttendeeName.trim()}
                          className="px-4 py-2 rounded transition-colors"
                          style={{
                            fontSize: "14px",
                            background: (newAttendeeEmail.trim() && newAttendeeName.trim()) ? "#1a73e8" : "var(--border)",
                            color: (newAttendeeEmail.trim() && newAttendeeName.trim()) ? "#fff" : "var(--text-secondary)",
                            cursor: (newAttendeeEmail.trim() && newAttendeeName.trim()) ? "pointer" : "not-allowed",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-[var(--hover)] transition-colors"
                      style={{ color: "var(--text)" }}
                    >
                      <Plus className="h-5 w-5" />
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>Add guests</span>
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end px-6 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#1a73e8",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
