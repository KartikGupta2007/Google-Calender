import { pgTable, text, timestamp, serial, integer, varchar, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ================================
// 1. USERS TABLE
// ================================
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  image: text('image'),
  timezone: varchar('timezone', { length: 100 }).default('America/New_York'),
  workingHoursStart: varchar('working_hours_start', { length: 5 }).default('09:00'),
  workingHoursEnd: varchar('working_hours_end', { length: 5 }).default('17:00'),
  preferences: json('preferences').default('{}'), // JSON for user preferences
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 2. CALENDARS TABLE (Enhanced)
// ================================
export const calendarsTable = pgTable('calendars', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => usersTable.id), // Nullable for backward compatibility
  timezone: varchar('timezone', { length: 100 }).default('America/New_York'),
  isVisible: boolean('is_visible').notNull().default(true),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 3. CALENDAR SHARES TABLE (New)
// ================================
export const calendarSharesTable = pgTable('calendar_shares', {
  id: serial('id').primaryKey(),
  calendarId: integer('calendar_id').references(() => calendarsTable.id).notNull(),
  userId: integer('user_id').references(() => usersTable.id).notNull(),
  permission: varchar('permission', { length: 20 }).notNull().default('view'), // 'view', 'edit', 'manage'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 4. EVENTS TABLE (Enhanced)
// ================================
export const eventsTable = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  timezone: varchar('timezone', { length: 100 }).default('America/New_York'),
  location: text('location').default(''),

  // User and Calendar associations
  createdBy: integer('created_by').references(() => usersTable.id), // Nullable for backward compatibility
  calendarId: integer('calendar_id').references(() => calendarsTable.id),

  // Event properties
  isAllDay: boolean('is_all_day').default(false),
  conferenceLink: text('conference_link').default(''),
  color: text('color'), // Individual event color override

  // Recurrence
  isRecurring: boolean('is_recurring').default(false),
  recurrenceId: integer('recurrence_id').references(() => recurrencePatternsTable.id),
  recurringEventId: integer('recurring_event_id'), // Parent event ID for recurring instances

  // Status
  status: varchar('status', { length: 20 }).default('confirmed'), // 'confirmed', 'tentative', 'cancelled'

  // Legacy fields for backward compatibility
  attendees: text('attendees').default('[]'), // JSON string - kept for backward compatibility
  reminders: text('reminders').default('[]'), // JSON string - kept for backward compatibility
  eventType: varchar('event_type', { length: 50 }).default('event'),
  date: timestamp('date'), // Old field for backward compatibility

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 5. RECURRENCE PATTERNS TABLE (New)
// ================================
export const recurrencePatternsTable = pgTable('recurrence_patterns', {
  id: serial('id').primaryKey(),
  rrule: text('rrule').notNull(), // RFC 5545 RRULE format
  frequency: varchar('frequency', { length: 20 }).notNull(), // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
  interval: integer('interval').default(1),
  count: integer('count'), // Number of occurrences (null = infinite)
  until: timestamp('until'), // End date for recurrence
  byDay: text('by_day'), // e.g., 'MO,WE,FR' for weekly
  byMonthDay: text('by_month_day'), // e.g., '1,15' for monthly
  byMonth: text('by_month'), // e.g., '1,6,12' for yearly
  exceptions: text('exceptions').default('[]'), // JSON array of exception dates
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// 6. EVENT ATTENDEES TABLE (New)
// ================================
export const eventAttendeesTable = pgTable('event_attendees', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => eventsTable.id).notNull(),
  userId: integer('user_id').references(() => usersTable.id),
  email: text('email').notNull(), // For external guests without user accounts
  name: text('name'),
  responseStatus: varchar('response_status', { length: 20 }).default('needsAction'), // 'needsAction', 'accepted', 'declined', 'tentative'
  isOrganizer: boolean('is_organizer').default(false),
  isOptional: boolean('is_optional').default(false),
  comment: text('comment'), // Optional comment on RSVP
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ================================
// 7. REMINDERS TABLE (New)
// ================================
export const remindersTable = pgTable('reminders', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => eventsTable.id).notNull(),
  userId: integer('user_id').references(() => usersTable.id).notNull(),
  method: varchar('method', { length: 20 }).notNull(), // 'popup', 'email', 'sms'
  minutesBefore: integer('minutes_before').notNull().default(30),
  isSent: boolean('is_sent').default(false),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// 8. ACTIVITY LOGS TABLE (New)
// ================================
export const activityLogsTable = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usersTable.id).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'event', 'calendar', 'share'
  entityId: integer('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // 'created', 'updated', 'deleted', 'shared', 'rsvp_changed'
  changes: json('changes'), // JSON object with before/after values
  metadata: json('metadata'), // Additional context
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// 9. ATTACHMENTS TABLE (Enhanced)
// ================================
export const attachmentsTable = pgTable('attachments', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => eventsTable.id),
  uploadedBy: integer('uploaded_by').references(() => usersTable.id),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: varchar('file_type', { length: 100 }),
  fileSize: integer('file_size'), // In bytes
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// 10. NOTIFICATIONS TABLE (New)
// ================================
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usersTable.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'event_invitation', 'event_updated', 'event_cancelled', 'reminder', 'calendar_shared'
  title: text('title').notNull(),
  message: text('message').notNull(),
  relatedEntityType: varchar('related_entity_type', { length: 50 }), // 'event', 'calendar'
  relatedEntityId: integer('related_entity_id'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  actionUrl: text('action_url'), // URL to navigate to when clicked
  metadata: json('metadata'), // Additional data
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ================================
// RELATIONS
// ================================

// User Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  calendars: many(calendarsTable),
  createdEvents: many(eventsTable),
  calendarShares: many(calendarSharesTable),
  eventAttendances: many(eventAttendeesTable),
  reminders: many(remindersTable),
  activityLogs: many(activityLogsTable),
  notifications: many(notificationsTable),
  uploadedAttachments: many(attachmentsTable),
}));

// Calendar Relations
export const calendarsRelations = relations(calendarsTable, ({ one, many }) => ({
  owner: one(usersTable, {
    fields: [calendarsTable.ownerId],
    references: [usersTable.id],
  }),
  events: many(eventsTable),
  shares: many(calendarSharesTable),
}));

// Calendar Shares Relations
export const calendarSharesRelations = relations(calendarSharesTable, ({ one }) => ({
  calendar: one(calendarsTable, {
    fields: [calendarSharesTable.calendarId],
    references: [calendarsTable.id],
  }),
  user: one(usersTable, {
    fields: [calendarSharesTable.userId],
    references: [usersTable.id],
  }),
}));

// Event Relations
export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [eventsTable.createdBy],
    references: [usersTable.id],
  }),
  calendar: one(calendarsTable, {
    fields: [eventsTable.calendarId],
    references: [calendarsTable.id],
  }),
  recurrencePattern: one(recurrencePatternsTable, {
    fields: [eventsTable.recurrenceId],
    references: [recurrencePatternsTable.id],
  }),
  attendees: many(eventAttendeesTable),
  reminders: many(remindersTable),
  attachments: many(attachmentsTable),
}));

// Recurrence Pattern Relations
export const recurrencePatternsRelations = relations(recurrencePatternsTable, ({ many }) => ({
  events: many(eventsTable),
}));

// Event Attendees Relations
export const eventAttendeesRelations = relations(eventAttendeesTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [eventAttendeesTable.eventId],
    references: [eventsTable.id],
  }),
  user: one(usersTable, {
    fields: [eventAttendeesTable.userId],
    references: [usersTable.id],
  }),
}));

// Reminders Relations
export const remindersRelations = relations(remindersTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [remindersTable.eventId],
    references: [eventsTable.id],
  }),
  user: one(usersTable, {
    fields: [remindersTable.userId],
    references: [usersTable.id],
  }),
}));

// Activity Logs Relations
export const activityLogsRelations = relations(activityLogsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [activityLogsTable.userId],
    references: [usersTable.id],
  }),
}));

// Attachments Relations
export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [attachmentsTable.eventId],
    references: [eventsTable.id],
  }),
  uploader: one(usersTable, {
    fields: [attachmentsTable.uploadedBy],
    references: [usersTable.id],
  }),
}));

// Notifications Relations
export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [notificationsTable.userId],
    references: [usersTable.id],
  }),
}));
