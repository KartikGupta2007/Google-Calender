/**
 * Accessibility utility functions for the calendar application
 */

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite"
) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate ARIA label for a date
 */
export function getAriaLabelForDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Generate ARIA label for an event
 */
export function getAriaLabelForEvent(event: {
  title: string;
  date: Date;
  endDate?: Date;
  location?: string;
}): string {
  const parts: string[] = [event.title];

  const dateStr = event.date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  parts.push(dateStr);

  if (event.endDate) {
    const endStr = event.endDate.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    parts.push(`to ${endStr}`);
  }

  if (event.location) {
    parts.push(`at ${event.location}`);
  }

  return parts.join(", ");
}

/**
 * Generate ARIA label for calendar view
 */
export function getAriaLabelForCalendarView(
  view: string,
  date: Date
): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();

  switch (view) {
    case "day":
      return `Day view: ${getAriaLabelForDate(date)}`;
    case "week":
      return `Week view: Week of ${month} ${date.getDate()}, ${year}`;
    case "month":
      return `Month view: ${month} ${year}`;
    case "year":
      return `Year view: ${year}`;
    case "schedule":
      return `Schedule view: ${month} ${year}`;
    default:
      return `Calendar view: ${month} ${year}`;
  }
}

/**
 * Trap focus within a modal/dialog
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable?.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", handleTabKey);

  // Focus first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleTabKey);
  };
}

/**
 * Get accessible color contrast
 */
export function hasGoodContrast(
  foreground: string,
  background: string
): boolean {
  // Simple contrast check - in production, use a proper contrast ratio calculator
  // This is a placeholder implementation
  return true;
}

/**
 * Format duration for screen readers
 */
export function getAccessibleDuration(
  startDate: Date,
  endDate: Date
): string {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${
    minutes !== 1 ? "s" : ""
  }`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if high contrast mode is enabled
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Add skip link for keyboard navigation
 */
export function addSkipLink(
  targetId: string,
  linkText: string = "Skip to main content"
) {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = linkText;
  skipLink.className = "skip-link";
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "0";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * ARIA live region utilities
 */
export class LiveRegion {
  private element: HTMLDivElement;

  constructor(priority: "polite" | "assertive" = "polite") {
    this.element = document.createElement("div");
    this.element.setAttribute("role", "status");
    this.element.setAttribute("aria-live", priority);
    this.element.setAttribute("aria-atomic", "true");
    this.element.className = "sr-only";
    document.body.appendChild(this.element);
  }

  announce(message: string) {
    this.element.textContent = message;
  }

  destroy() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
