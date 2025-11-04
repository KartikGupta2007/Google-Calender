import { db } from '../db/drizzle';
import { eventsTable, calendarsTable } from '../db/schema';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

// Google Calendar color palette
const EVENT_COLORS = {
  // Kartik Gupta calendar events
  teamMeeting: '#039BE5',      // Blue - Team meetings
  codeReview: '#7986CB',       // Lavender - Code reviews
  retrospective: '#33B679',    // Green - Retrospectives
  businessReview: '#F6BF26',   // Yellow - Business reviews
  performance: '#E67C73',      // Red - Performance reviews
  oneOnOne: '#8E24AA',         // Purple - 1-on-1s
  health: '#F4511E',           // Dark orange - Health appointments
  dental: '#EF6C00',           // Orange - Dental appointments

  // Birthday events
  birthday: '#0B8043',         // Dark green - All birthdays

  // Family events
  familyDinner: '#7986CB',     // Lavender - Family dinners
  newYear: '#E67C73',          // Red - New Year
  holi: '#F6BF26',             // Yellow - Holi
  diwali: '#F4511E',           // Dark orange - Diwali
  christmas: '#E67C73',        // Red - Christmas
  vacation: '#039BE5',         // Blue - Vacations

  // Task events
  utilityBills: '#F4511E',     // Dark orange - Utility bills
  creditCard: '#E67C73',       // Red - Credit card
  grocery: '#33B679',          // Green - Grocery
  carService: '#F6BF26',       // Yellow - Car service
  houseCleaning: '#7986CB',    // Lavender - House cleaning
  taxFiling: '#E67C73',        // Red - Tax filing
  carInsurance: '#F6BF26',     // Yellow - Car insurance
  healthInsurance: '#039BE5',  // Blue - Health insurance
};

// Helper function to generate events for specific calendars over 20 years
async function generateEvents(calendarIds: { cal1: number; cal2: number; cal3: number; cal4: number }) {
  const events = [];
  const startYear = dayjs().subtract(10, 'years');
  const endYear = dayjs().add(10, 'years');

  // Generate events for Kartik Gupta calendar (work, appointments, meetings)
  for (let year = startYear.year(); year <= endYear.year(); year++) {
    // Weekly team meetings (every Monday)
    for (let month = 0; month < 12; month++) {
      const firstDay = dayjs().year(year).month(month).date(1);
      const daysInMonth = firstDay.daysInMonth();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs().year(year).month(month).date(day);

        // Monday team meetings
        if (date.day() === 1) {
          const startDate = date.hour(10).minute(0).toDate();
          const endDate = date.hour(11).minute(0).toDate();
          events.push({
            title: 'Team Standup Meeting',
            description: 'Weekly team sync-up to discuss progress and blockers',
            startDate,
            endDate,
            calendarId: calendarIds.cal1,
            eventType: 'event',
            isAllDay: false,
            color: EVENT_COLORS.teamMeeting,
          });
        }

        // Wednesday code reviews
        if (date.day() === 3) {
          const startDate = date.hour(14).minute(0).toDate();
          const endDate = date.hour(15).minute(30).toDate();
          events.push({
            title: 'Code Review Session',
            description: 'Review pull requests and provide feedback',
            startDate,
            endDate,
            calendarId: calendarIds.cal1,
            eventType: 'event',
            isAllDay: false,
            color: EVENT_COLORS.codeReview,
          });
        }

        // Friday retrospectives (last Friday of month)
        if (date.day() === 5 && date.date() > daysInMonth - 7) {
          const startDate = date.hour(16).minute(0).toDate();
          const endDate = date.hour(17).minute(0).toDate();
          events.push({
            title: 'Sprint Retrospective',
            description: 'Reflect on the sprint and identify improvements',
            startDate,
            endDate,
            calendarId: calendarIds.cal1,
            eventType: 'event',
            isAllDay: false,
            color: EVENT_COLORS.retrospective,
          });
        }
      }
    }

    // Quarterly business reviews
    [2, 5, 8, 11].forEach(month => {
      const startDate = dayjs().year(year).month(month).date(15).hour(11).minute(0).toDate();
      const endDate = dayjs().year(year).month(month).date(15).hour(13).minute(0).toDate();
      events.push({
        title: 'Quarterly Business Review',
        description: 'Review quarterly goals, metrics, and plan for next quarter',
        startDate,
        endDate,
        calendarId: calendarIds.cal1,
        eventType: 'event',
        isAllDay: false,
        color: EVENT_COLORS.businessReview,
      });
    });

    // Annual performance reviews
    events.push({
      title: 'Annual Performance Review',
      description: 'Year-end performance discussion and goal setting',
      startDate: dayjs().year(year).month(11).date(20).hour(14).minute(0).toDate(),
      endDate: dayjs().year(year).month(11).date(20).hour(16).minute(0).toDate(),
      calendarId: calendarIds.cal1,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.performance,
    });

    // Monthly 1-on-1s with manager
    for (let month = 0; month < 12; month++) {
      events.push({
        title: '1-on-1 with Manager',
        description: 'Monthly check-in and career development discussion',
        startDate: dayjs().year(year).month(month).date(5).hour(15).minute(0).toDate(),
        endDate: dayjs().year(year).month(month).date(5).hour(15).minute(30).toDate(),
        calendarId: calendarIds.cal1,
        eventType: 'event',
        isAllDay: false,
        color: EVENT_COLORS.oneOnOne,
      });
    }

    // Doctor appointments (semi-annual)
    events.push({
      title: 'Annual Health Checkup',
      description: 'Routine physical examination',
      startDate: dayjs().year(year).month(2).date(10).hour(9).minute(30).toDate(),
      endDate: dayjs().year(year).month(2).date(10).hour(11).minute(0).toDate(),
      calendarId: calendarIds.cal1,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.health,
    });

    events.push({
      title: 'Dental Cleaning',
      description: 'Regular dental checkup and cleaning',
      startDate: dayjs().year(year).month(8).date(15).hour(10).minute(0).toDate(),
      endDate: dayjs().year(year).month(8).date(15).hour(11).minute(0).toDate(),
      calendarId: calendarIds.cal1,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.dental,
    });
  }

  // Generate birthdays (recurring every year)
  const birthdayList = [
    { name: 'Mom', month: 3, day: 15 },
    { name: 'Dad', month: 7, day: 22 },
    { name: 'Sister', month: 11, day: 8 },
    { name: 'Best Friend Raj', month: 5, day: 12 },
    { name: 'Grandmother', month: 1, day: 25 },
    { name: 'Grandfather', month: 9, day: 30 },
    { name: 'Cousin Priya', month: 6, day: 18 },
    { name: 'Uncle Sharma', month: 10, day: 5 },
  ];

  for (let year = startYear.year(); year <= endYear.year(); year++) {
    birthdayList.forEach(person => {
      const startDate = dayjs().year(year).month(person.month).date(person.day).hour(0).minute(0).toDate();
      const endDate = dayjs().year(year).month(person.month).date(person.day).hour(23).minute(59).toDate();
      events.push({
        title: `${person.name}'s Birthday`,
        description: `Birthday celebration for ${person.name}`,
        startDate,
        endDate,
        calendarId: calendarIds.cal2,
        eventType: 'event',
        isAllDay: true,
        color: EVENT_COLORS.birthday,
      });
    });
  }

  // Generate family events
  for (let year = startYear.year(); year <= endYear.year(); year++) {
    // Monthly family dinners (first Sunday)
    for (let month = 0; month < 12; month++) {
      const firstDay = dayjs().year(year).month(month).date(1);
      let firstSunday = firstDay;
      while (firstSunday.day() !== 0) {
        firstSunday = firstSunday.add(1, 'day');
      }

      events.push({
        title: 'Family Dinner',
        description: 'Monthly family get-together',
        startDate: firstSunday.hour(19).minute(0).toDate(),
        endDate: firstSunday.hour(21).minute(0).toDate(),
        calendarId: calendarIds.cal3,
        eventType: 'event',
        isAllDay: false,
        color: EVENT_COLORS.familyDinner,
      });
    }

    // Major festivals and holidays
    events.push({
      title: 'New Year Celebration',
      description: 'Family New Year party',
      startDate: dayjs().year(year).month(0).date(1).hour(0).minute(0).toDate(),
      endDate: dayjs().year(year).month(0).date(1).hour(23).minute(59).toDate(),
      calendarId: calendarIds.cal3,
      eventType: 'event',
      isAllDay: true,
      color: EVENT_COLORS.newYear,
    });

    events.push({
      title: 'Holi Celebration',
      description: 'Festival of colors with family',
      startDate: dayjs().year(year).month(2).date(8).hour(10).minute(0).toDate(),
      endDate: dayjs().year(year).month(2).date(8).hour(18).minute(0).toDate(),
      calendarId: calendarIds.cal3,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.holi,
    });

    events.push({
      title: 'Diwali Celebration',
      description: 'Festival of lights - family gathering',
      startDate: dayjs().year(year).month(10).date(12).hour(18).minute(0).toDate(),
      endDate: dayjs().year(year).month(10).date(12).hour(23).minute(0).toDate(),
      calendarId: calendarIds.cal3,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.diwali,
    });

    events.push({
      title: 'Christmas Celebration',
      description: 'Christmas family brunch',
      startDate: dayjs().year(year).month(11).date(25).hour(9).minute(0).toDate(),
      endDate: dayjs().year(year).month(11).date(25).hour(14).minute(0).toDate(),
      calendarId: calendarIds.cal3,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.christmas,
    });

    // Summer vacation
    events.push({
      title: 'Family Summer Vacation',
      description: 'Annual family trip',
      startDate: dayjs().year(year).month(5).date(15).hour(8).minute(0).toDate(),
      endDate: dayjs().year(year).month(5).date(22).hour(20).minute(0).toDate(),
      calendarId: calendarIds.cal3,
      eventType: 'event',
      isAllDay: false,
      color: EVENT_COLORS.vacation,
    });
  }

  // Generate tasks
  for (let year = startYear.year(); year <= endYear.year(); year++) {
    // Monthly recurring tasks
    for (let month = 0; month < 12; month++) {
      // Pay bills
      events.push({
        title: 'Pay Utility Bills',
        description: 'Monthly electricity, water, and internet bills',
        startDate: dayjs().year(year).month(month).date(1).hour(9).minute(0).toDate(),
        endDate: dayjs().year(year).month(month).date(1).hour(10).minute(0).toDate(),
        calendarId: calendarIds.cal4,
        eventType: 'task',
        isAllDay: false,
        color: EVENT_COLORS.utilityBills,
      });

      events.push({
        title: 'Pay Credit Card Bill',
        description: 'Monthly credit card payment',
        startDate: dayjs().year(year).month(month).date(5).hour(10).minute(0).toDate(),
        endDate: dayjs().year(year).month(month).date(5).hour(11).minute(0).toDate(),
        calendarId: calendarIds.cal4,
        eventType: 'task',
        isAllDay: false,
        color: EVENT_COLORS.creditCard,
      });

      // Grocery shopping (bi-weekly)
      const weeksInMonth = Math.ceil(dayjs().year(year).month(month).daysInMonth() / 7);
      for (let week = 0; week < weeksInMonth; week += 2) {
        const shopDay = 7 + (week * 7);
        if (shopDay <= dayjs().year(year).month(month).daysInMonth()) {
          events.push({
            title: 'Grocery Shopping',
            description: 'Buy groceries for the week',
            startDate: dayjs().year(year).month(month).date(shopDay).hour(10).minute(0).toDate(),
            endDate: dayjs().year(year).month(month).date(shopDay).hour(12).minute(0).toDate(),
            calendarId: calendarIds.cal4,
            eventType: 'task',
            isAllDay: false,
            color: EVENT_COLORS.grocery,
          });
        }
      }

      // Car maintenance (quarterly)
      if ([2, 5, 8, 11].includes(month)) {
        events.push({
          title: 'Car Service',
          description: 'Quarterly car maintenance and checkup',
          startDate: dayjs().year(year).month(month).date(10).hour(14).minute(0).toDate(),
          endDate: dayjs().year(year).month(month).date(10).hour(16).minute(0).toDate(),
          calendarId: calendarIds.cal4,
          eventType: 'task',
          isAllDay: false,
          color: EVENT_COLORS.carService,
        });
      }

      // House cleaning (weekly on Saturdays)
      const daysInMonth = dayjs().year(year).month(month).daysInMonth();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = dayjs().year(year).month(month).date(day);
        if (date.day() === 6) { // Saturday
          events.push({
            title: 'Deep House Cleaning',
            description: 'Weekly deep cleaning of the house',
            startDate: date.hour(9).minute(0).toDate(),
            endDate: date.hour(12).minute(0).toDate(),
            calendarId: calendarIds.cal4,
            eventType: 'task',
            isAllDay: false,
            color: EVENT_COLORS.houseCleaning,
          });
        }
      }
    }

    // Annual tasks
    events.push({
      title: 'File Income Tax Returns',
      description: 'Annual tax filing deadline',
      startDate: dayjs().year(year).month(2).date(31).hour(10).minute(0).toDate(),
      endDate: dayjs().year(year).month(2).date(31).hour(12).minute(0).toDate(),
      calendarId: calendarIds.cal4,
      eventType: 'task',
      isAllDay: false,
      color: EVENT_COLORS.taxFiling,
    });

    events.push({
      title: 'Renew Car Insurance',
      description: 'Annual car insurance renewal',
      startDate: dayjs().year(year).month(3).date(1).hour(9).minute(0).toDate(),
      endDate: dayjs().year(year).month(3).date(1).hour(10).minute(0).toDate(),
      calendarId: calendarIds.cal4,
      eventType: 'task',
      isAllDay: false,
      color: EVENT_COLORS.carInsurance,
    });

    events.push({
      title: 'Renew Health Insurance',
      description: 'Annual health insurance renewal',
      startDate: dayjs().year(year).month(6).date(1).hour(9).minute(0).toDate(),
      endDate: dayjs().year(year).month(6).date(1).hour(10).minute(0).toDate(),
      calendarId: calendarIds.cal4,
      eventType: 'task',
      isAllDay: false,
      color: EVENT_COLORS.healthInsurance,
    });
  }

  return events;
}

async function seed() {
  console.log('Starting seed...');

  try {
    // First, ensure the 4 calendars exist
    console.log('Creating calendars...');

    const calendarData = [
      { name: 'Kartik Gupta', color: '#039BE5', description: 'Personal calendar' },
      { name: 'Birthdays', color: '#0B8043', description: 'Birthday reminders' },
      { name: 'Family', color: '#7986CB', description: 'Family events and celebrations' },
      { name: 'Tasks', color: '#F6BF26', description: 'Tasks and reminders' },
    ];

    const calendarIds: { cal1: number; cal2: number; cal3: number; cal4: number } = {
      cal1: 0,
      cal2: 0,
      cal3: 0,
      cal4: 0,
    };

    // Check if calendars exist, if not create them
    for (let i = 0; i < calendarData.length; i++) {
      const existing = await db.select().from(calendarsTable).where(eq(calendarsTable.name, calendarData[i].name));

      if (existing.length > 0) {
        // Calendar exists, use its ID
        const key = `cal${i + 1}` as keyof typeof calendarIds;
        calendarIds[key] = existing[0].id;
        console.log(`Calendar "${calendarData[i].name}" already exists with ID ${existing[0].id}`);
      } else {
        // Create new calendar
        const result = await db.insert(calendarsTable).values({
          name: calendarData[i].name,
          color: calendarData[i].color,
          description: calendarData[i].description,
          isVisible: true,
        }).returning({ id: calendarsTable.id });

        const key = `cal${i + 1}` as keyof typeof calendarIds;
        calendarIds[key] = result[0].id;
        console.log(`Created calendar "${calendarData[i].name}" with ID ${result[0].id}`);
      }
    }

    // Clear existing events
    await db.delete(eventsTable);
    console.log('Cleared existing events');

    // Generate and insert events
    const events = await generateEvents(calendarIds);
    console.log(`Generated ${events.length} events`);

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await db.insert(eventsTable).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
    }

    console.log('Seed completed successfully!');
    console.log(`Total calendars: ${Object.keys(calendarIds).length}`);
    console.log(`Total events: ${events.length}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
