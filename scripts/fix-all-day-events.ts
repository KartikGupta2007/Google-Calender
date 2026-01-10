import { db } from "../db/drizzle";
import { eventsTable } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function fixAllDayEvents() {
  console.log('Finding events that should be all-day...\n');

  // Get all events
  const allEvents = await db.select().from(eventsTable);

  let fixedCount = 0;

  for (const event of allEvents) {
    if (event.startDate && event.endDate) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);

      // Check if event starts at midnight (00:00) and ends at 23:59
      // OR if the event spans exactly 24 hours starting from midnight
      const startsAtMidnight = start.getHours() === 0 && start.getMinutes() === 0;
      const endsAtEndOfDay = (end.getHours() === 23 && end.getMinutes() === 59) ||
                             (end.getHours() === 0 && end.getMinutes() === 0);

      const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const isFullDay = durationInHours >= 23 && durationInHours <= 24;

      // If it looks like an all-day event but isn't marked as such
      if (startsAtMidnight && (endsAtEndOfDay || isFullDay) && !event.isAllDay) {
        await db
          .update(eventsTable)
          .set({ isAllDay: true })
          .where(eq(eventsTable.id, event.id));

        console.log(`✓ Fixed: "${event.title}" on ${start.toDateString()}`);
        fixedCount++;
      }
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} events to be all-day events!`);
  process.exit(0);
}

fixAllDayEvents().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
