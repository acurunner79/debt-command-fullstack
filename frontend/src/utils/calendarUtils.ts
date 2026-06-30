export type CalendarDay = {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
};

export function getMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function getCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDaysInMonth = lastDayOfMonth.getDate();

  const days: CalendarDay[] = [];

  for (let index = startDayOfWeek - 1; index >= 0; index -= 1) {
    const date = new Date(year, month, -index);

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const date = new Date(year, month, day);

    days.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  while (days.length % 7 !== 0) {
    const lastDate = days[days.length - 1].date;
    const date = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate() + 1
    );

    days.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
    });
  }

  return days;
}

export function getPreviousMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
}

export function getNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}