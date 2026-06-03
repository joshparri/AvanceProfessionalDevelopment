import { addDays, isBefore, startOfDay, startOfWeek } from 'date-fns';

export const getUpcomingMondayAndWednesday = (now = new Date()) => {
  const today = startOfDay(now);
  const mondayThisWeek = startOfWeek(today, { weekStartsOn: 1 });
  const wednesdayThisWeek = addDays(mondayThisWeek, 2);
  const nextMonday = addDays(mondayThisWeek, 7);
  const nextWednesday = addDays(wednesdayThisWeek, 7);

  const candidates = [mondayThisWeek, wednesdayThisWeek, nextMonday, nextWednesday];
  const upcoming = candidates.filter((date) => !isBefore(date, today));

  return [upcoming[0], upcoming[1]] as [Date, Date];
};
