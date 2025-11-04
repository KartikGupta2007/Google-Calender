import { db } from "../db/drizzle";
import { eventsTable } from "../db/schema";

async function checkEvents() {
  console.log('Checking events in database...\n');

  const allEvents = await db.select().from(eventsTable);

  console.log(`Total events: ${allEvents.length}\n`);

  allEvents.forEach((event, index) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;

    console.log(`${index + 1}. ${event.title}`);
    console.log(`   Start: ${start.toLocaleString()}`);
    console.log(`   End: ${end ? end.toLocaleString() : 'N/A'}`);
    console.log(`   isAllDay: ${event.isAllDay}`);
    console.log('');
  });

  process.exit(0);
}

checkEvents().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
