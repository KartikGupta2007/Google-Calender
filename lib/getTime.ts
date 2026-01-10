import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);

export const isCurrentDay = (day: dayjs.Dayjs) => {
  const today = dayjs();
  return day.year() === today.year() &&
         day.month() === today.month() &&
         day.date() === today.date();
};

export const getMonth = (month = dayjs().month(), year = dayjs().year()) => {
  const firstDayofMonth = dayjs(new Date(year, month, 1)).startOf("month").day();
  const daysInMonth = dayjs(new Date(year, month, 1)).daysInMonth();

  // Calculate how many weeks we need
  // We need to show from the first day (which might be offset) through all days in the month
  const totalCells = firstDayofMonth + daysInMonth;
  const weeksNeeded = Math.ceil(totalCells / 7);

  let dayCounter = -firstDayofMonth;

  // Generate only the necessary weeks (typically 5 or 6)
  return Array.from({ length: weeksNeeded }, () =>
    Array.from({ length: 7 }, () => dayjs(new Date(year, month, ++dayCounter))),
  );
};

export const getYear = (year: number) => {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    month: monthIndex,
    monthName: dayjs(new Date(year, monthIndex, 1)).format("MMMM"),
    grid: getMonth(monthIndex, year),
  }));
};

export const getWeekDays = (date: dayjs.Dayjs) => {
  const startOfWeek = date.startOf("week");

  const weekDates = [];

  // Loop through the 7 days of the week
  for (let i = 0; i < 7; i++) {
    const currentDate = startOfWeek.add(i, "day");
    weekDates.push({
      currentDate,
      today:
        currentDate.toDate().toDateString() === dayjs().toDate().toDateString(),
      isCurrentDay,
    });
  }

  return weekDates;
};

export const getHours = Array.from({ length: 24 }, (_, i) =>
  dayjs().startOf("day").add(i, "hour"),
);


// Function to generate weeks of the month dynamically


export const getWeeks  = (monthIndex: number, year = dayjs().year()) => {
  const firstDayOfMonth = dayjs(new Date(year, monthIndex, 1));
  const lastDayOfMonth = dayjs(new Date(year, monthIndex + 1, 0)); // Last day of the month

  const weeks: number[] = [];

  // Loop from the first day to the last day of the month
  let currentDay = firstDayOfMonth;
  while (
    currentDay.isBefore(lastDayOfMonth) ||
    currentDay.isSame(lastDayOfMonth)
  ) {
    const weekNumber = currentDay.week();   //This requires the WeekOfYear plugin to work as imported above
    if (!weeks.includes(weekNumber)) {
      weeks.push(weekNumber);
    }
    currentDay = currentDay.add(1, "day"); // Move to the next day
  }

  return weeks;
}