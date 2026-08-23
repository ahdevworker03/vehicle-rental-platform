/**
 * Shared formatting helpers.
 * Import these instead of redefining per-page.
 */

type FormatNumberOptions = Intl.NumberFormatOptions;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function dateParts(value: string | Date): { day: string; month: string; year: string } {
  const date = toDate(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    numberingSystem: "latn",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return { day: part("day"), month: part("month"), year: part("year") };
}

/** Format a number with Western digits for Arabic RTL interfaces. */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/** Format a USD amount consistently across the product: USD 1,500. */
export function formatUsd(value: number): string {
  return `USD ${formatNumber(value)}`;
}

/** Backwards-compatible shared name used by existing screens. */
export const formatCurrency = formatUsd;

/** Full business date with Western digits: DD-MM-YYYY. */
export function formatDate(value: string | Date): string {
  const { day, month, year } = dateParts(value);
  return `${day}-${month}-${year}`;
}

/** Date and time for activity/history records: DD-MM-YYYY — HH:MM AM/PM. */
export function formatDateTime(value: string | Date): string {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    numberingSystem: "latn",
  }).format(toDate(value));

  return `${formatDate(value)} — ${time}`;
}

/** Backwards-compatible shared name used by existing Arabic RTL screens. */
export const formatDateAr = formatDate;

/** Compact date for cards and timeline rows: DD-MM. */
export function formatDateShort(value: string | Date): string {
  const { day, month } = dateParts(value);
  return `${day}-${month}`;
}

/** Two-letter initials from a name: "أحمد محمد" → "أم" */
export function formatInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}
