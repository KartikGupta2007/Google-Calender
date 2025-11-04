import { db } from '../db/drizzle';
import { calendarsTable, eventsTable } from '../db/schema';
import { sql, eq } from 'drizzle-orm';

async function removeDuplicateCalendars() {
  console.log('Removing duplicate calendars from database...');

  try {
    // Get all calendars
    const allCalendars = await db.select().from(calendarsTable);
    console.log(`Found ${allCalendars.length} total calendars`);

    // Group by name
    const calendarsByName = new Map<string, typeof allCalendars>();
    for (const calendar of allCalendars) {
      if (!calendarsByName.has(calendar.name)) {
        calendarsByName.set(calendar.name, []);
      }
      calendarsByName.get(calendar.name)!.push(calendar);
    }

    // Find and delete duplicates (keep the first one of each name)
    let deletedCount = 0;
    let reassignedEvents = 0;

    for (const [name, calendars] of calendarsByName.entries()) {
      if (calendars.length > 1) {
        console.log(`Found ${calendars.length} instances of "${name}"`);

        // Keep the first one, delete the rest
        const keepCalendar = calendars[0];
        const toDelete = calendars.slice(1);

        for (const calendar of toDelete) {
          // First, reassign all events from this calendar to the one we're keeping
          const result = await db
            .update(eventsTable)
            .set({ calendarId: keepCalendar.id })
            .where(eq(eventsTable.calendarId, calendar.id));

          console.log(`  Reassigned events from duplicate "${name}" (ID: ${calendar.id}) to ID: ${keepCalendar.id}`);

          // Now delete the duplicate calendar
          await db.delete(calendarsTable).where(eq(calendarsTable.id, calendar.id));
          console.log(`  Deleted duplicate "${name}" (ID: ${calendar.id})`);
          deletedCount++;
        }
      }
    }

    console.log(`\nSuccessfully removed ${deletedCount} duplicate calendars!`);
    console.log(`Remaining unique calendars: ${calendarsByName.size}`);

    process.exit(0);
  } catch (error) {
    console.error('Error removing duplicate calendars:', error);
    process.exit(1);
  }
}

removeDuplicateCalendars();
