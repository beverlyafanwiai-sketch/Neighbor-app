import type { EventItem } from '../data/mock';
import { parseEventStart } from './ics';

// Returns a short relative-time label ("Today", "Tomorrow", "In 3 days"...)
// for an upcoming event, or null once its start time has passed.
export function getCountdownLabel(event: EventItem): string | null {
  const start = parseEventStart(event);
  const diffMs = start.getTime() - Date.now();
  if (diffMs <= 0) return null;

  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) return 'Today';
  if (diffHours < 48) return 'Tomorrow';

  const diffDays = Math.ceil(diffHours / 24);
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 14) return 'In 1 week';
  return `In ${Math.round(diffDays / 7)} weeks`;
}
