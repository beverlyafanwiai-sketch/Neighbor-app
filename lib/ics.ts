import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { EventItem } from '../data/mock';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const EVENT_DURATION_MS = 2 * 60 * 60 * 1000;

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function parseEventStart(event: EventItem): Date {
  const monthIndex = MONTHS.indexOf(event.month.toUpperCase());
  const day = parseInt(event.day, 10);

  let hour = 18;
  let minute = 0;
  const timeMatch = event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
    const meridiem = timeMatch[3].toUpperCase();
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let candidate = new Date(now.getFullYear(), monthIndex, day, hour, minute);
  if (candidate < today) {
    candidate = new Date(now.getFullYear() + 1, monthIndex, day, hour, minute);
  }
  return candidate;
}

function formatLocal(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function formatUTC(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

export function buildIcs(event: EventItem): string {
  const start = parseEventStart(event);
  const end = new Date(start.getTime() + EVENT_DURATION_MS);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Neighbor//Event//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@neighbor-app`,
    `DTSTAMP:${formatUTC(new Date())}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(event.location)}`,
    `DESCRIPTION:${escapeText(`${event.description}\n\n${event.hostLabel}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function icsFilename(event: EventItem): string {
  const slug = event.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug || 'event'}.ics`;
}

export async function addEventToCalendar(event: EventItem): Promise<void> {
  const ics = buildIcs(event);
  const filename = icsFilename(event);

  if (Platform.OS === 'web') {
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(ics);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/calendar', dialogTitle: 'Add to calendar' });
  }
}
