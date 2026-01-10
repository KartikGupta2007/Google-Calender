'use server'

import { db } from "@/db/drizzle";
import { eventsTable, recurrencePatternsTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { generateRRule, RecurrencePattern, generateOccurrences } from "@/lib/rrule-utils";

/**
 * Create a recurring event with pattern
 */
export async function createRecurringEvent(
  eventData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    createdBy: number;
    calendarId?: number;
    isAllDay?: boolean;
    timezone?: string;
  },
  recurrencePattern: RecurrencePattern
): Promise<{ error: string } | { success: boolean; eventId?: number; recurrenceId?: number }> {
  try {
    // Generate RRULE string
    const rrule = generateRRule(recurrencePattern);

    // Create recurrence pattern
    const recurrenceResult = await db.insert(recurrencePatternsTable).values({
      rrule,
      frequency: recurrencePattern.frequency,
      interval: recurrencePattern.interval || 1,
      count: recurrencePattern.count || null,
      until: recurrencePattern.until || null,
      byDay: recurrencePattern.byDay?.join(',') || null,
      byMonthDay: recurrencePattern.byMonthDay?.join(',') || null,
      byMonth: recurrencePattern.byMonth?.join(',') || null,
      exceptions: '[]',
    }).returning({ id: recurrencePatternsTable.id });

    const recurrenceId = recurrenceResult[0].id;

    // Create parent event
    const eventResult = await db.insert(eventsTable).values({
      ...eventData,
      isRecurring: true,
      recurrenceId,
      status: 'confirmed',
    }).returning({ id: eventsTable.id });

    const parentEventId = eventResult[0].id;

    // Generate occurrences (first 50 instances)
    const occurrences = generateOccurrences(eventData.startDate, recurrencePattern, 50);

    // Create event instances for first occurrences (skip the first one as it's the parent)
    const duration = eventData.endDate.getTime() - eventData.startDate.getTime();

    const instancePromises = occurrences.slice(1).map(occurrenceDate => {
      const instanceEndDate = new Date(occurrenceDate.getTime() + duration);

      return db.insert(eventsTable).values({
        ...eventData,
        startDate: occurrenceDate,
        endDate: instanceEndDate,
        isRecurring: false,
        recurringEventId: parentEventId,
        recurrenceId,
      });
    });

    await Promise.all(instancePromises);

    revalidatePath("/");
    return { success: true, eventId: parentEventId, recurrenceId };
  } catch (error) {
    console.error('Error creating recurring event:', error);
    return { error: 'Failed to create recurring event' };
  }
}

/**
 * Update a single occurrence of a recurring event
 */
export async function updateSingleOccurrence(
  eventId: number,
  updates: Partial<typeof eventsTable.$inferInsert>
): Promise<{ error: string } | { success: boolean }> {
  try {
    await db
      .update(eventsTable)
      .set({
        ...updates,
        isRecurring: false, // Break the link to make it standalone
        recurringEventId: null,
        recurrenceId: null,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, eventId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating single occurrence:', error);
    return { error: 'Failed to update occurrence' };
  }
}

/**
 * Update all future occurrences of a recurring event
 */
export async function updateFutureOccurrences(
  parentEventId: number,
  fromDate: Date,
  updates: Partial<typeof eventsTable.$inferInsert>
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Get all instances of this recurring event
    const instances = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.recurringEventId, parentEventId));

    // Update instances that start on or after fromDate
    const updatePromises = instances
      .filter(instance => instance.startDate && instance.startDate >= fromDate)
      .map(instance =>
        db
          .update(eventsTable)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(eventsTable.id, instance.id))
      );

    await Promise.all(updatePromises);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating future occurrences:', error);
    return { error: 'Failed to update future occurrences' };
  }
}

/**
 * Update all occurrences of a recurring event
 */
export async function updateAllOccurrences(
  parentEventId: number,
  updates: Partial<typeof eventsTable.$inferInsert>,
  newRecurrencePattern?: RecurrencePattern
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Update parent event
    await db
      .update(eventsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, parentEventId));

    // Update all instances
    await db
      .update(eventsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.recurringEventId, parentEventId));

    // Update recurrence pattern if provided
    if (newRecurrencePattern) {
      const parentEvent = await db
        .select()
        .from(eventsTable)
        .where(eq(eventsTable.id, parentEventId));

      if (parentEvent[0]?.recurrenceId) {
        const rrule = generateRRule(newRecurrencePattern);

        await db
          .update(recurrencePatternsTable)
          .set({
            rrule,
            frequency: newRecurrencePattern.frequency,
            interval: newRecurrencePattern.interval || 1,
            count: newRecurrencePattern.count || null,
            until: newRecurrencePattern.until || null,
            byDay: newRecurrencePattern.byDay?.join(',') || null,
            byMonthDay: newRecurrencePattern.byMonthDay?.join(',') || null,
            byMonth: newRecurrencePattern.byMonth?.join(',') || null,
          })
          .where(eq(recurrencePatternsTable.id, parentEvent[0].recurrenceId));
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error updating all occurrences:', error);
    return { error: 'Failed to update all occurrences' };
  }
}

/**
 * Delete a single occurrence (add to exceptions)
 */
export async function deleteSingleOccurrence(
  eventId: number
): Promise<{ error: string } | { success: boolean }> {
  try {
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId));

    if (event.length === 0) {
      return { error: 'Event not found' };
    }

    // If it has a recurrence pattern, add to exceptions
    if (event[0].recurrenceId && event[0].startDate) {
      const exceptionDate = event[0].startDate.toISOString().split('T')[0];

      const pattern = await db
        .select()
        .from(recurrencePatternsTable)
        .where(eq(recurrencePatternsTable.id, event[0].recurrenceId));

      if (pattern.length > 0) {
        const exceptions = JSON.parse(pattern[0].exceptions || '[]');
        exceptions.push(exceptionDate);

        await db
          .update(recurrencePatternsTable)
          .set({ exceptions: JSON.stringify(exceptions) })
          .where(eq(recurrencePatternsTable.id, event[0].recurrenceId));
      }
    }

    // Delete the instance
    await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error deleting single occurrence:', error);
    return { error: 'Failed to delete occurrence' };
  }
}

/**
 * Delete all future occurrences
 */
export async function deleteFutureOccurrences(
  parentEventId: number,
  fromDate: Date
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Get all instances of this recurring event
    const instances = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.recurringEventId, parentEventId));

    // Delete instances that start on or after fromDate
    const deletePromises = instances
      .filter(instance => instance.startDate && instance.startDate >= fromDate)
      .map(instance =>
        db.delete(eventsTable).where(eq(eventsTable.id, instance.id))
      );

    await Promise.all(deletePromises);

    // Update recurrence pattern to end before fromDate
    const parentEvent = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, parentEventId));

    if (parentEvent[0]?.recurrenceId) {
      await db
        .update(recurrencePatternsTable)
        .set({ until: fromDate })
        .where(eq(recurrencePatternsTable.id, parentEvent[0].recurrenceId));
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error deleting future occurrences:', error);
    return { error: 'Failed to delete future occurrences' };
  }
}

/**
 * Delete all occurrences of a recurring event
 */
export async function deleteAllOccurrences(
  parentEventId: number
): Promise<{ error: string } | { success: boolean }> {
  try {
    // Delete all instances
    await db
      .delete(eventsTable)
      .where(eq(eventsTable.recurringEventId, parentEventId));

    // Get parent event to find recurrence pattern
    const parentEvent = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, parentEventId));

    // Delete recurrence pattern
    if (parentEvent[0]?.recurrenceId) {
      await db
        .delete(recurrencePatternsTable)
        .where(eq(recurrencePatternsTable.id, parentEvent[0].recurrenceId));
    }

    // Delete parent event
    await db.delete(eventsTable).where(eq(eventsTable.id, parentEventId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error('Error deleting all occurrences:', error);
    return { error: 'Failed to delete all occurrences' };
  }
}
