import { db } from '../db/drizzle';
import { calendarsTable, eventsTable } from '../db/schema';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

async function addOtherCalendars() {
  console.log('Adding other calendars...');

  try {
    // Add "Other calendars" that are not in the primary group
    const otherCalendars = [
      {
        name: 'Holidays in India',
        color: '#0B8043',
        description: 'Indian national holidays and festivals',
        isVisible: true,
      },
      {
        name: 'Work Projects',
        color: '#D50000',
        description: 'Project deadlines and milestones',
        isVisible: true,
      },
      {
        name: 'Gym & Fitness',
        color: '#F4511E',
        description: 'Workout sessions and fitness goals',
        isVisible: true,
      },
      {
        name: 'Team Calendar',
        color: '#E67C73',
        description: 'Shared team events and meetings',
        isVisible: false,
      },
      {
        name: 'Personal Goals',
        color: '#8E24AA',
        description: 'Personal development and goals',
        isVisible: false,
      },
    ];

    // Insert calendars and get their IDs
    const calendarIds: { [key: string]: number } = {};

    for (const calendar of otherCalendars) {
      const result = await db.insert(calendarsTable).values(calendar).returning({ id: calendarsTable.id });
      calendarIds[calendar.name] = result[0].id;
      console.log(`Created calendar "${calendar.name}" with ID ${result[0].id}`);
    }

    // Add some sample events for these calendars
    console.log('Adding sample events for other calendars...');

    const events = [];
    const currentYear = dayjs().year();

    // Holidays in India (2025)
    const indianHolidays = [
      { date: '2025-01-26', name: 'Republic Day' },
      { date: '2025-03-14', name: 'Holi' },
      { date: '2025-04-14', name: 'Ambedkar Jayanti' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-08-15', name: 'Independence Day' },
      { date: '2025-08-27', name: 'Janmashtami' },
      { date: '2025-10-02', name: 'Gandhi Jayanti' },
      { date: '2025-10-21', name: 'Diwali' },
      { date: '2025-11-05', name: 'Guru Nanak Jayanti' },
      { date: '2025-12-25', name: 'Christmas' },
    ];

    for (const holiday of indianHolidays) {
      events.push({
        title: holiday.name,
        description: 'National Holiday',
        startDate: new Date(`${holiday.date}T00:00:00`),
        endDate: new Date(`${holiday.date}T23:59:59`),
        calendarId: calendarIds['Holidays in India'],
        isAllDay: true,
        color: '#0B8043',
      });
    }

    // Work Projects - Monthly milestones
    for (let month = 0; month < 12; month++) {
      const milestoneDate = dayjs().year(2025).month(month).date(15);
      events.push({
        title: `Q${Math.floor(month / 3) + 1} Project Milestone`,
        description: 'Project review and milestone check',
        startDate: milestoneDate.hour(14).minute(0).toDate(),
        endDate: milestoneDate.hour(16).minute(0).toDate(),
        calendarId: calendarIds['Work Projects'],
        color: '#D50000',
      });
    }

    // Gym & Fitness - 3 times a week (Mon, Wed, Fri)
    for (let week = 0; week < 52; week++) {
      const weekStart = dayjs().year(2025).week(week);

      // Monday
      const monday = weekStart.day(1);
      if (monday.year() === 2025) {
        events.push({
          title: 'Morning Workout',
          description: 'Strength training',
          startDate: monday.hour(6).minute(0).toDate(),
          endDate: monday.hour(7).minute(0).toDate(),
          calendarId: calendarIds['Gym & Fitness'],
          color: '#F4511E',
        });
      }

      // Wednesday
      const wednesday = weekStart.day(3);
      if (wednesday.year() === 2025) {
        events.push({
          title: 'Cardio Session',
          description: 'Running and cycling',
          startDate: wednesday.hour(6).minute(0).toDate(),
          endDate: wednesday.hour(7).minute(0).toDate(),
          calendarId: calendarIds['Gym & Fitness'],
          color: '#F4511E',
        });
      }

      // Friday
      const friday = weekStart.day(5);
      if (friday.year() === 2025) {
        events.push({
          title: 'Yoga Class',
          description: 'Flexibility and meditation',
          startDate: friday.hour(6).minute(0).toDate(),
          endDate: friday.hour(7).minute(0).toDate(),
          calendarId: calendarIds['Gym & Fitness'],
          color: '#F4511E',
        });
      }
    }

    // Team Calendar - Bi-weekly team sync
    for (let week = 0; week < 52; week += 2) {
      const weekStart = dayjs().year(2025).week(week);
      const thursday = weekStart.day(4);

      if (thursday.year() === 2025) {
        events.push({
          title: 'Team Sync',
          description: 'Bi-weekly team sync meeting',
          startDate: thursday.hour(15).minute(0).toDate(),
          endDate: thursday.hour(16).minute(0).toDate(),
          calendarId: calendarIds['Team Calendar'],
          color: '#E67C73',
        });
      }
    }

    // Personal Goals - Monthly reviews
    for (let month = 0; month < 12; month++) {
      const reviewDate = dayjs().year(2025).month(month).endOf('month');
      events.push({
        title: 'Monthly Goal Review',
        description: 'Review progress on personal goals',
        startDate: reviewDate.hour(20).minute(0).toDate(),
        endDate: reviewDate.hour(21).minute(0).toDate(),
        calendarId: calendarIds['Personal Goals'],
        color: '#8E24AA',
      });
    }

    // Insert all events in batches
    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await db.insert(eventsTable).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
    }

    console.log(`Successfully added ${otherCalendars.length} calendars and ${events.length} events!`);
    process.exit(0);
  } catch (error) {
    console.error('Error adding other calendars:', error);
    process.exit(1);
  }
}

addOtherCalendars();
