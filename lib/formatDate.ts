import { format } from "date-fns";
import { uz } from "date-fns/locale";

/**
 * Convert Firestore Timestamp to JS Date safely.
 * Handles: Firestore Timestamp objects, seconds-based objects, Date objects, null/undefined.
 */
export function toDate(
  timestamp: { seconds: number; nanoseconds?: number } | Date | null | undefined
): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if ("seconds" in timestamp) return new Date(timestamp.seconds * 1000);
  return null;
}

/** "15-aprel 2026" */
export function formatDateUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "d-MMMM yyyy", { locale: uz });
}

/** "15-aprel 2026, 14:30" */
export function formatDateTimeUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "d-MMMM yyyy, HH:mm", { locale: uz });
}

/** "14:30" */
export function formatTimeUz(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "HH:mm", { locale: uz });
}

/** "15.04.2026" — short format for tables */
export function formatDateShort(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "dd.MM.yyyy", { locale: uz });
}

/** "15.04.2026, 14:30" — short with time for tables */
export function formatDateTimeShort(
  timestamp: { seconds: number } | Date | null | undefined
): string {
  const date = toDate(timestamp);
  if (!date) return "—";
  return format(date, "dd.MM.yyyy, HH:mm", { locale: uz });
}

/** Get start of today in local time */
export function getTodayStart(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/** Get start of this week (Monday) */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Get start of this month */
export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
