import type { EventItem, EventRecurrence } from '../data/mock';

const INTERVAL_DAYS: Record<EventRecurrence, number> = {
  weekly: 7,
  biweekly: 14,
};

export const RECURRENCE_LABEL: Record<EventRecurrence, string> = {
  weekly: 'Repeats weekly',
  biweekly: 'Repeats every 2 weeks',
};

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// event.day/month are display-only strings with no year attached. This
// finds the nearest occurrence of that day-of-month on or after `now`,
// rolling into next year if the date has already passed this year.
export function anchorDate(event: EventItem, now: Date): Date {
  const monthIndex = MONTH_NAMES.indexOf(event.month.toUpperCase());
  const day = Number(event.day);
  if (monthIndex === -1 || Number.isNaN(day)) return startOfDay(now);

  const today = startOfDay(now);
  let candidate = new Date(today.getFullYear(), monthIndex, day);
  if (candidate < today) {
    candidate = new Date(today.getFullYear() + 1, monthIndex, day);
  }
  return candidate;
}

export function getUpcomingOccurrences(event: EventItem, now: Date, count = 3): Date[] {
  if (!event.recurrence) return [];
  const interval = INTERVAL_DAYS[event.recurrence];
  const today = startOfDay(now);

  let next = anchorDate(event, now);
  while (next < today) {
    next = addDays(next, interval);
  }
  next = addDays(next, (event.skipCount ?? 0) * interval);

  const occurrences: Date[] = [];
  for (let i = 0; i < count; i++) {
    occurrences.push(addDays(next, i * interval));
  }
  return occurrences;
}

export function formatOccurrence(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// All dates (one-off or recurring) this event lands on within
// [rangeStart, rangeEnd) -- used to place dots on a calendar month grid.
export function getEventOccurrencesInRange(
  event: EventItem,
  now: Date,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  if (!event.recurrence) {
    const date = anchorDate(event, now);
    return date >= rangeStart && date < rangeEnd ? [date] : [];
  }

  const interval = INTERVAL_DAYS[event.recurrence];
  const today = startOfDay(now);
  let next = anchorDate(event, now);
  while (next < today) next = addDays(next, interval);
  next = addDays(next, (event.skipCount ?? 0) * interval);

  while (next >= rangeStart) next = addDays(next, -interval);
  while (next < rangeStart) next = addDays(next, interval);

  const occurrences: Date[] = [];
  let guard = 0;
  while (next < rangeEnd && guard < 60) {
    occurrences.push(next);
    next = addDays(next, interval);
    guard++;
  }
  return occurrences;
}
