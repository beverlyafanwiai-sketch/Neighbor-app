export type SchedulePreset = {
  label: string;
  compute: (now: Date) => Date;
};

function atTime(date: Date, hours: number, minutes = 0) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  { label: 'Tonight, 8:00 PM', compute: (now) => atTime(now, 20, 0) },
  { label: 'Tomorrow morning, 8:00 AM', compute: (now) => atTime(addDays(now, 1), 8, 0) },
  { label: 'Tomorrow evening, 6:00 PM', compute: (now) => atTime(addDays(now, 1), 18, 0) },
  {
    label: 'This weekend, 10:00 AM',
    compute: (now) => {
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
      return atTime(addDays(now, daysUntilSaturday), 10, 0);
    },
  },
];

export function getAvailablePresets(now: Date): SchedulePreset[] {
  return SCHEDULE_PRESETS.filter((preset) => preset.compute(now).getTime() > now.getTime());
}

export function formatScheduledFor(date: Date): string {
  const datePart = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}
