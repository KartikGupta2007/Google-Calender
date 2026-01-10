import { db } from "../db/drizzle";
import { eventsTable } from "../db/schema";

async function addHolidays() {
  const holidays = [
    { date: '2025-01-26', name: 'Republic Day' },
    { date: '2025-03-14', name: 'Holi' },
    { date: '2025-03-31', name: 'Id-Ul-Fitr (Ramadan)' },
    { date: '2025-04-10', name: 'Mahavir Jayanti' },
    { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti' },
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-05-12', name: 'Buddha Purnima' },
    { date: '2025-06-07', name: 'Id-Ul-Zuha (Bakrid)' },
    { date: '2025-07-06', name: 'Muharram' },
    { date: '2025-08-15', name: 'Independence Day' },
    { date: '2025-08-16', name: 'Parsi New Year' },
    { date: '2025-08-27', name: 'Janmashtami' },
    { date: '2025-09-05', name: 'Milad-Un-Nabi' },
    { date: '2025-10-02', name: 'Mahatma Gandhi Jayanti' },
    { date: '2025-10-02', name: 'Dussehra' },
    { date: '2025-10-21', name: 'Diwali' },
    { date: '2025-11-05', name: 'Guru Nanak Jayanti' },
    { date: '2025-12-25', name: 'Christmas' },
  ];

  console.log('Adding holidays to database...');

  for (const holiday of holidays) {
    try {
      const startDate = new Date(`${holiday.date}T00:00:00`);
      const endDate = new Date(`${holiday.date}T23:59:59`);

      await db.insert(eventsTable).values({
        title: holiday.name,
        description: 'National Holiday',
        startDate,
        endDate,
        location: '',
        isAllDay: true,
        eventType: 'event',
        attendees: '[]',
        reminders: '[]',
        conferenceLink: '',
      });

      console.log(`✓ Added: ${holiday.name} on ${holiday.date}`);
    } catch (error) {
      console.error(`✗ Failed to add ${holiday.name}:`, error);
    }
  }

  console.log('\n✅ Holidays added successfully!');
  process.exit(0);
}

addHolidays().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
