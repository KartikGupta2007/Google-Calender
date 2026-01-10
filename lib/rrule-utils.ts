/**
 * RRULE (RFC 5545) Utilities for Recurring Events
 * Implements recurrence rule parsing and generation
 */

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type WeekDay = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RecurrencePattern {
  frequency: Frequency;
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: WeekDay[];
  byMonthDay?: number[];
  byMonth?: number[];
}

/**
 * Generate RRULE string from recurrence pattern
 */
export function generateRRule(pattern: RecurrencePattern): string {
  const parts: string[] = [`FREQ=${pattern.frequency}`];

  if (pattern.interval && pattern.interval > 1) {
    parts.push(`INTERVAL=${pattern.interval}`);
  }

  if (pattern.count) {
    parts.push(`COUNT=${pattern.count}`);
  }

  if (pattern.until) {
    const untilStr = formatRRuleDate(pattern.until);
    parts.push(`UNTIL=${untilStr}`);
  }

  if (pattern.byDay && pattern.byDay.length > 0) {
    parts.push(`BYDAY=${pattern.byDay.join(',')}`);
  }

  if (pattern.byMonthDay && pattern.byMonthDay.length > 0) {
    parts.push(`BYMONTHDAY=${pattern.byMonthDay.join(',')}`);
  }

  if (pattern.byMonth && pattern.byMonth.length > 0) {
    parts.push(`BYMONTH=${pattern.byMonth.join(',')}`);
  }

  return `RRULE:${parts.join(';')}`;
}

/**
 * Parse RRULE string into recurrence pattern
 */
export function parseRRule(rrule: string): RecurrencePattern | null {
  if (!rrule.startsWith('RRULE:')) {
    return null;
  }

  const ruleStr = rrule.substring(6);
  const parts = ruleStr.split(';');
  const pattern: Partial<RecurrencePattern> = {};

  for (const part of parts) {
    const [key, value] = part.split('=');

    switch (key) {
      case 'FREQ':
        pattern.frequency = value as Frequency;
        break;
      case 'INTERVAL':
        pattern.interval = parseInt(value);
        break;
      case 'COUNT':
        pattern.count = parseInt(value);
        break;
      case 'UNTIL':
        pattern.until = parseRRuleDate(value);
        break;
      case 'BYDAY':
        pattern.byDay = value.split(',') as WeekDay[];
        break;
      case 'BYMONTHDAY':
        pattern.byMonthDay = value.split(',').map(Number);
        break;
      case 'BYMONTH':
        pattern.byMonth = value.split(',').map(Number);
        break;
    }
  }

  return pattern.frequency ? (pattern as RecurrencePattern) : null;
}

/**
 * Generate occurrences from a recurrence pattern
 */
export function generateOccurrences(
  startDate: Date,
  pattern: RecurrencePattern,
  maxOccurrences: number = 100
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;

  const limit = pattern.count || maxOccurrences;
  const untilDate = pattern.until;

  while (count < limit) {
    // Check if we've passed the until date
    if (untilDate && currentDate > untilDate) {
      break;
    }

    occurrences.push(new Date(currentDate));
    count++;

    // Calculate next occurrence
    currentDate = getNextOccurrence(currentDate, pattern);

    // Safety check to prevent infinite loops
    if (count > 1000) {
      break;
    }
  }

  return occurrences;
}

/**
 * Get the next occurrence based on the pattern
 */
function getNextOccurrence(date: Date, pattern: RecurrencePattern): Date {
  const next = new Date(date);
  const interval = pattern.interval || 1;

  switch (pattern.frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + interval);
      break;

    case 'WEEKLY':
      if (pattern.byDay && pattern.byDay.length > 0) {
        // Find next matching day of week
        next.setDate(next.getDate() + 1);
        let attempts = 0;
        while (attempts < 7) {
          const dayOfWeek = getDayOfWeekCode(next);
          if (pattern.byDay.includes(dayOfWeek)) {
            break;
          }
          next.setDate(next.getDate() + 1);
          attempts++;
        }
      } else {
        next.setDate(next.getDate() + (7 * interval));
      }
      break;

    case 'MONTHLY':
      if (pattern.byMonthDay && pattern.byMonthDay.length > 0) {
        // Advance to next month and set to first matching day
        next.setMonth(next.getMonth() + interval);
        next.setDate(pattern.byMonthDay[0]);
      } else {
        next.setMonth(next.getMonth() + interval);
      }
      break;

    case 'YEARLY':
      if (pattern.byMonth && pattern.byMonth.length > 0) {
        next.setFullYear(next.getFullYear() + interval);
        next.setMonth(pattern.byMonth[0] - 1);
        if (pattern.byMonthDay && pattern.byMonthDay.length > 0) {
          next.setDate(pattern.byMonthDay[0]);
        }
      } else {
        next.setFullYear(next.getFullYear() + interval);
      }
      break;
  }

  return next;
}

/**
 * Get day of week code (MO, TU, etc.)
 */
function getDayOfWeekCode(date: Date): WeekDay {
  const days: WeekDay[] = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[date.getDay()];
}

/**
 * Format date for RRULE (YYYYMMDDTHHMMSSZ)
 */
function formatRRuleDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Parse RRULE date format
 */
function parseRRuleDate(dateStr: string): Date {
  // Format: YYYYMMDDTHHMMSSZ
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hours = parseInt(dateStr.substring(9, 11));
  const minutes = parseInt(dateStr.substring(11, 13));
  const seconds = parseInt(dateStr.substring(13, 15));

  return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

/**
 * Get human-readable description of recurrence pattern
 */
export function getRecurrenceDescription(pattern: RecurrencePattern): string {
  const interval = pattern.interval || 1;
  const frequency = pattern.frequency.toLowerCase();

  let description = '';

  if (interval === 1) {
    description = `Every ${frequency.slice(0, -2)}`;
  } else {
    description = `Every ${interval} ${frequency.toLowerCase()}`;
  }

  if (pattern.byDay && pattern.byDay.length > 0) {
    const days = pattern.byDay.map(d => {
      const dayMap: Record<string, string> = {
        MO: 'Monday',
        TU: 'Tuesday',
        WE: 'Wednesday',
        TH: 'Thursday',
        FR: 'Friday',
        SA: 'Saturday',
        SU: 'Sunday',
      };
      return dayMap[d];
    }).join(', ');
    description += ` on ${days}`;
  }

  if (pattern.count) {
    description += `, ${pattern.count} times`;
  } else if (pattern.until) {
    const untilStr = pattern.until.toLocaleDateString();
    description += `, until ${untilStr}`;
  }

  return description;
}

/**
 * Check if a date is an exception to the recurrence
 */
export function isException(date: Date, exceptions: string[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return exceptions.includes(dateStr);
}

/**
 * Common recurrence presets
 */
export const RECURRENCE_PRESETS = {
  daily: (): RecurrencePattern => ({
    frequency: 'DAILY',
    interval: 1,
  }),

  weekdays: (): RecurrencePattern => ({
    frequency: 'WEEKLY',
    byDay: ['MO', 'TU', 'WE', 'TH', 'FR'],
  }),

  weekly: (): RecurrencePattern => ({
    frequency: 'WEEKLY',
    interval: 1,
  }),

  biweekly: (): RecurrencePattern => ({
    frequency: 'WEEKLY',
    interval: 2,
  }),

  monthly: (): RecurrencePattern => ({
    frequency: 'MONTHLY',
    interval: 1,
  }),

  yearly: (): RecurrencePattern => ({
    frequency: 'YEARLY',
    interval: 1,
  }),
};
