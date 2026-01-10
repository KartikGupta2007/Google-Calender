import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert a date from one timezone to another
 */
export function convertTimezone(
  date: dayjs.Dayjs | Date | string,
  fromTimezone: string,
  toTimezone: string
): dayjs.Dayjs {
  return dayjs(date).tz(fromTimezone).tz(toTimezone);
}

/**
 * Format a date in a specific timezone
 */
export function formatInTimezone(
  date: dayjs.Dayjs | Date | string,
  timezone: string,
  format: string = "YYYY-MM-DD HH:mm:ss"
): string {
  return dayjs(date).tz(timezone).format(format);
}

/**
 * Get the current time in a specific timezone
 */
export function nowInTimezone(timezone: string): dayjs.Dayjs {
  return dayjs().tz(timezone);
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string): number {
  const offset = dayjs().tz(timezone).utcOffset();
  return offset / 60; // Convert minutes to hours
}

/**
 * Get timezone abbreviation (e.g., EST, PST)
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const date = dayjs().tz(timezone);
  const offset = date.utcOffset();
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset >= 0 ? "+" : "-";

  return `UTC${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
}

/**
 * Check if a timezone observes daylight saving time
 */
export function isDST(date: dayjs.Dayjs | Date, timezone: string): boolean {
  const dayjsDate = dayjs(date).tz(timezone);
  const jan = dayjs(new Date(dayjsDate.year(), 0, 1)).tz(timezone);
  const jul = dayjs(new Date(dayjsDate.year(), 6, 1)).tz(timezone);

  const stdOffset = Math.max(jan.utcOffset(), jul.utcOffset());
  return dayjsDate.utcOffset() < stdOffset;
}

/**
 * Convert event times to display timezone
 */
export function convertEventToTimezone(
  event: {
    date: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
  },
  eventTimezone: string,
  displayTimezone: string
) {
  return {
    ...event,
    date: event.date.tz(eventTimezone).tz(displayTimezone),
    endDate: event.endDate
      ? event.endDate.tz(eventTimezone).tz(displayTimezone)
      : undefined,
  };
}

/**
 * Get user's system timezone
 */
export function getSystemTimezone(): string {
  return dayjs.tz.guess();
}

/**
 * Format timezone display with offset
 */
export function formatTimezoneDisplay(timezone: string): string {
  const abbr = getTimezoneAbbreviation(timezone);
  return `${timezone.replace(/_/g, " ")} (${abbr})`;
}

/**
 * Check if two dates are on the same day in a given timezone
 */
export function isSameDayInTimezone(
  date1: dayjs.Dayjs | Date,
  date2: dayjs.Dayjs | Date,
  timezone: string
): boolean {
  const d1 = dayjs(date1).tz(timezone);
  const d2 = dayjs(date2).tz(timezone);

  return (
    d1.year() === d2.year() &&
    d1.month() === d2.month() &&
    d1.date() === d2.date()
  );
}

/**
 * Get the start of day in a specific timezone
 */
export function startOfDayInTimezone(
  date: dayjs.Dayjs | Date,
  timezone: string
): dayjs.Dayjs {
  return dayjs(date).tz(timezone).startOf("day");
}

/**
 * Get the end of day in a specific timezone
 */
export function endOfDayInTimezone(
  date: dayjs.Dayjs | Date,
  timezone: string
): dayjs.Dayjs {
  return dayjs(date).tz(timezone).endOf("day");
}

/**
 * Calculate time difference between two timezones
 */
export function getTimezoneDifference(
  timezone1: string,
  timezone2: string
): number {
  const offset1 = dayjs().tz(timezone1).utcOffset();
  const offset2 = dayjs().tz(timezone2).utcOffset();
  return (offset1 - offset2) / 60; // Return difference in hours
}
