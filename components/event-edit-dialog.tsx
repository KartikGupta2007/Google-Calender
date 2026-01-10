'use client'

import React, { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import dayjs from "dayjs";
import { IoCloseSharp } from "react-icons/io5";
import { FiClock, FiMapPin } from "react-icons/fi";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { IoMdCalendar } from "react-icons/io";
import { updateEvent, deleteEvent } from "@/app/actions/event-actions";
import { cn } from "@/lib/utils";
import EmailAutocomplete from "./email-autocomplete";
import { CalendarEventType } from "@/lib/store";
import { Trash2, Copy } from "lucide-react";

interface EventEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEventType;
}

export default function EventEditDialog({ isOpen, onClose, event }: EventEditDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await updateEvent(parseInt(event.id), formData);
        if ("error" in result) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(result.success);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  async function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteEvent(parseInt(event.id));
        if ("error" in result) {
          setError(result.error);
        } else if (result.success) {
          setSuccess(result.success);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  }

  if (!isOpen) return null;

  const startDate = dayjs(event.date);
  const endDate = event.endDate ? dayjs(event.endDate) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-lg bg-[var(--gm3-sys-color-surface)] shadow-lg"
        onClick={handleDialogClick}
      >
        <div className="mb-2 flex items-center justify-between rounded-md bg-[var(--gm3-sys-color-surface-container-high)] p-3 text-[var(--gm3-sys-color-on-surface)]">
          <h2 className="text-lg font-medium">Edit Event</h2>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <IoCloseSharp className="h-5 w-5" />
          </Button>
        </div>

        <form className="space-y-4 p-6" action={onSubmit}>
          <div>
            <Input
              type="text"
              name="title"
              defaultValue={event.title}
              placeholder="Event title"
              className="rounded-none border-0 border-b border-[var(--gm3-sys-color-surface-container-high)] text-2xl text-[var(--gm3-sys-color-on-surface)] focus-visible:border-b-2 focus-visible:border-b-[var(--gm3-sys-color-primary)] focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            />
          </div>

          <div className="flex items-center space-x-3">
            <FiClock className="size-5 text-[var(--gm3-sys-color-on-surface)] opacity-60" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  name="date"
                  defaultValue={startDate.format("YYYY-MM-DD")}
                  className="flex-1 bg-[var(--gm3-sys-color-surface-container-high)] border-0 text-[var(--gm3-sys-color-on-surface)] text-sm"
                />
                <Input
                  type="time"
                  name="time"
                  defaultValue={startDate.format("HH:mm")}
                  className="w-28 bg-[var(--gm3-sys-color-surface-container-high)] border-0 text-[var(--gm3-sys-color-on-surface)] text-sm"
                />
              </div>
              {endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--gm3-sys-color-on-surface)] opacity-60">End:</span>
                  <Input
                    type="time"
                    name="endTime"
                    defaultValue={endDate.format("HH:mm")}
                    className="w-28 bg-[var(--gm3-sys-color-surface-container-high)] border-0 text-[var(--gm3-sys-color-on-surface)] text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FiMapPin className="size-5 text-[var(--gm3-sys-color-on-surface)] opacity-60" />
            <Input
              type="text"
              name="location"
              defaultValue={event.location || ''}
              placeholder="Add location"
              className="w-full rounded-lg border-0 bg-[var(--gm3-sys-color-surface-container-high)] text-[var(--gm3-sys-color-on-surface)] placeholder:text-[var(--gm3-sys-color-on-surface)] placeholder:opacity-60 focus-visible:ring-0"
            />
          </div>

          <EmailAutocomplete
            name="guests"
            placeholder="Add guests"
            defaultValue={event.attendees?.join(', ') || ''}
          />

          <div className="flex items-center space-x-3">
            <HiOutlineMenuAlt2 className="size-5 text-[var(--gm3-sys-color-on-surface)] opacity-60" />
            <Input
              type="text"
              name="description"
              defaultValue={event.description || ''}
              placeholder="Add description"
              className="w-full rounded-lg border-0 bg-[var(--gm3-sys-color-surface-container-high)] text-[var(--gm3-sys-color-on-surface)] placeholder:text-[var(--gm3-sys-color-on-surface)] placeholder:opacity-60 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center space-x-3">
            <IoMdCalendar className="size-5 text-[var(--gm3-sys-color-on-surface)] opacity-60" />
            <div>
              <p className="text-sm text-[var(--gm3-sys-color-on-surface)]">{event.calendarName || 'Default Calendar'}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--gm3-sys-color-on-surface)] opacity-60 mt-1">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: event.calendarColor || '#039BE5' }}></div>
                <span>Busy • Default visibility</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-[var(--gm3-sys-color-error)] hover:bg-[var(--gm3-sys-color-error-container)]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {error && <p className="text-[var(--gm3-sys-color-error)] text-sm">{error}</p>}
          {success && <p className="text-[var(--gm3-sys-color-tertiary)] text-sm">Event updated successfully!</p>}
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="bg-[var(--gm3-sys-color-surface)] p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-medium text-[var(--gm3-sys-color-on-surface)] mb-2">Delete Event?</h3>
              <p className="text-sm text-[var(--gm3-sys-color-on-surface)] opacity-70 mb-4">
                Are you sure you want to delete "{event.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="bg-[var(--gm3-sys-color-error)] hover:bg-[var(--gm3-sys-color-error-container)]"
                >
                  {isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
