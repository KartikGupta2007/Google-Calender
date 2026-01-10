import { useEffect, useCallback } from "react";
import { useDateStore, useEventStore, useViewStore } from "@/lib/store";
import dayjs from "dayjs";

/**
 * Keyboard shortcuts for the calendar application
 *
 * Navigation:
 * - Arrow keys: Navigate between days/weeks
 * - j/k: Previous/Next day
 * - n/p: Next/Previous week
 * - t: Go to today
 *
 * View switching:
 * - d: Day view
 * - w: Week view
 * - m: Month view
 * - y: Year view
 * - a: Schedule (agenda) view
 *
 * Actions:
 * - c: Create new event
 * - s: Search events
 * - /: Focus search
 * - ?: Show keyboard shortcuts help
 * - Escape: Close dialogs/modals
 *
 * Event actions:
 * - e: Edit selected event
 * - Delete/Backspace: Delete selected event
 * - Enter: Open event details
 */

interface KeyboardShortcutsOptions {
  enabled?: boolean;
  onCreateEvent?: () => void;
  onSearch?: () => void;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { enabled = true, onCreateEvent, onSearch, onShowHelp } = options;

  const { userSelectedDate, setDate } = useDateStore();
  const { openPopover, selectedEvent, openEventSummary, deleteEvent } =
    useEventStore();
  const { selectedView, setView } = useViewStore();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.contentEditable === "true" ||
        target.closest('[contenteditable="true"]') ||
        target.closest('[contentEditable="true"]')
      ) {
        // Allow some shortcuts even in inputs
        if (event.key === "Escape") {
          target.blur();
        }
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      // Prevent default for handled shortcuts
      const preventDefault = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      // Navigation shortcuts
      switch (key) {
        case "arrowleft":
          preventDefault();
          if (selectedView === "month") {
            setDate(userSelectedDate.subtract(1, "day"));
          } else if (selectedView === "week") {
            setDate(userSelectedDate.subtract(1, "day"));
          } else if (selectedView === "day") {
            setDate(userSelectedDate.subtract(1, "day"));
          }
          break;

        case "arrowright":
          preventDefault();
          if (selectedView === "month") {
            setDate(userSelectedDate.add(1, "day"));
          } else if (selectedView === "week") {
            setDate(userSelectedDate.add(1, "day"));
          } else if (selectedView === "day") {
            setDate(userSelectedDate.add(1, "day"));
          }
          break;

        case "arrowup":
          preventDefault();
          if (selectedView === "month") {
            setDate(userSelectedDate.subtract(1, "week"));
          } else if (selectedView === "week") {
            setDate(userSelectedDate.subtract(1, "week"));
          } else if (selectedView === "day") {
            setDate(userSelectedDate.subtract(1, "day"));
          }
          break;

        case "arrowdown":
          preventDefault();
          if (selectedView === "month") {
            setDate(userSelectedDate.add(1, "week"));
          } else if (selectedView === "week") {
            setDate(userSelectedDate.add(1, "week"));
          } else if (selectedView === "day") {
            setDate(userSelectedDate.add(1, "day"));
          }
          break;

        case "j":
          preventDefault();
          setDate(userSelectedDate.subtract(1, "day"));
          break;

        case "k":
          preventDefault();
          setDate(userSelectedDate.add(1, "day"));
          break;

        case "n":
          preventDefault();
          if (shift) {
            setDate(userSelectedDate.add(1, "month"));
          } else {
            setDate(userSelectedDate.add(1, "week"));
          }
          break;

        case "p":
          preventDefault();
          if (shift) {
            setDate(userSelectedDate.subtract(1, "month"));
          } else {
            setDate(userSelectedDate.subtract(1, "week"));
          }
          break;

        case "t":
          preventDefault();
          setDate(dayjs());
          break;

        // View switching shortcuts
        case "d":
          if (!ctrl) {
            preventDefault();
            setView("day");
          }
          break;

        case "w":
          if (!ctrl) {
            preventDefault();
            setView("week");
          }
          break;

        case "m":
          if (!ctrl) {
            preventDefault();
            setView("month");
          }
          break;

        case "y":
          if (!ctrl) {
            preventDefault();
            setView("year");
          }
          break;

        case "a":
          if (!ctrl) {
            preventDefault();
            setView("schedule");
          }
          break;

        // Action shortcuts
        case "c":
          if (!ctrl) {
            preventDefault();
            if (onCreateEvent) {
              onCreateEvent();
            } else {
              openPopover();
            }
          }
          break;

        case "s":
          if (ctrl) {
            preventDefault();
            // Prevent browser save dialog
          } else {
            preventDefault();
            onSearch?.();
          }
          break;

        case "/":
          preventDefault();
          onSearch?.();
          break;

        case "?":
          preventDefault();
          onShowHelp?.();
          break;

        case "escape":
          preventDefault();
          // Close any open dialogs - handled by individual components
          break;

        // Event action shortcuts
        case "e":
          if (selectedEvent && !ctrl) {
            preventDefault();
            openEventSummary(selectedEvent);
          }
          break;

        case "delete":
        case "backspace":
          if (selectedEvent) {
            preventDefault();
            if (
              confirm(`Are you sure you want to delete "${selectedEvent.title}"?`)
            ) {
              deleteEvent(selectedEvent.id);
            }
          }
          break;

        case "enter":
          if (selectedEvent) {
            preventDefault();
            openEventSummary(selectedEvent);
          } else {
            preventDefault();
            openPopover();
          }
          break;

        default:
          break;
      }
    },
    [
      enabled,
      selectedView,
      userSelectedDate,
      selectedEvent,
      setDate,
      setView,
      openPopover,
      openEventSummary,
      deleteEvent,
      onCreateEvent,
      onSearch,
      onShowHelp,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [enabled, handleKeyPress]);
}

/**
 * Get all keyboard shortcuts as an object for display in help modal
 */
export function getKeyboardShortcuts() {
  return {
    Navigation: [
      { keys: ["←", "→"], description: "Previous/Next day" },
      { keys: ["↑", "↓"], description: "Previous/Next week" },
      { keys: ["j"], description: "Previous day" },
      { keys: ["k"], description: "Next day" },
      { keys: ["n"], description: "Next week" },
      { keys: ["p"], description: "Previous week" },
      { keys: ["Shift", "N"], description: "Next month" },
      { keys: ["Shift", "P"], description: "Previous month" },
      { keys: ["t"], description: "Go to today" },
    ],
    "View Switching": [
      { keys: ["d"], description: "Day view" },
      { keys: ["w"], description: "Week view" },
      { keys: ["m"], description: "Month view" },
      { keys: ["y"], description: "Year view" },
      { keys: ["a"], description: "Schedule view" },
    ],
    Actions: [
      { keys: ["c"], description: "Create new event" },
      { keys: ["s"], description: "Search events" },
      { keys: ["/"], description: "Focus search" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close dialogs" },
    ],
    "Event Actions": [
      { keys: ["e"], description: "Edit selected event" },
      { keys: ["Delete"], description: "Delete selected event" },
      { keys: ["Enter"], description: "Open event details" },
    ],
  };
}
