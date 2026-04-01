import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'

export const SALON_TZ = 'America/New_York'

/** Format a UTC/ISO date string in Eastern Time using date-fns format tokens. */
export function formatET(date: string | Date, fmt: string): string {
  return formatInTimeZone(date, SALON_TZ, fmt)
}

/** Convert a local "wall-clock" Date (picked in ET context) to a proper UTC Date.
 *  Use when the user selects a date + time meaning Eastern Time. */
export function etToUTC(date: Date): Date {
  return fromZonedTime(date, SALON_TZ)
}

/** Convert a UTC/ISO date to a Date whose local fields reflect Eastern Time. */
export function utcToET(date: string | Date): Date {
  return toZonedTime(date, SALON_TZ)
}
