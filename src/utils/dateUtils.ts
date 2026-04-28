/**
 * Date & time utilities for CodeBrainPro.
 */

/**
 * Format a Date as "Feb 04, 2025".
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a Date as "5:41 PM".
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Return ISO 8601 timestamp string.
 */
export function toISO(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Return "YYYY-MM-DD" from a Date (used for file naming).
 */
export function toDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Return "YYYY/MM" from a Date.
 */
export function toYearMonth(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}/${m}`;
}

/**
 * Return the ISO week number for a date.
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Format active minutes as "4h 32m".
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Get the start of the day (00:00:00) for a given date.
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the start of the week (Monday 00:00:00).
 */
export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a duration in minutes as a string like "1w2d4hr40m".
 * Examples:
 *   10000 -> "1w" (if exactly 1 week)
 *   10080 -> "1w" (7 days)
 *   10081 -> "1w1m"
 *   2880 -> "2d"
 *   2920 -> "2d40m"
 *   10060 -> "1w10m"
 *   0 -> "0m"
 */
export function formatFullDuration(minutes: number): string {
  if (minutes <= 0 || isNaN(minutes)) return '0m';
  const parts: string[] = [];
  const MINUTES_IN_WEEK = 7 * 24 * 60;
  const MINUTES_IN_DAY = 24 * 60;
  const MINUTES_IN_HOUR = 60;

  const weeks = Math.floor(minutes / MINUTES_IN_WEEK);
  if (weeks > 0) {
    parts.push(`${weeks}w`);
    minutes -= weeks * MINUTES_IN_WEEK;
  }
  const days = Math.floor(minutes / MINUTES_IN_DAY);
  if (days > 0) {
    parts.push(`${days}d`);
    minutes -= days * MINUTES_IN_DAY;
  }
  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  if (hours > 0) {
    parts.push(`${hours}hr`);
    minutes -= hours * MINUTES_IN_HOUR;
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join('');
}
