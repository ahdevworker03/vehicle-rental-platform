/**
 * Shared formatting helpers.
 * Import these instead of redefining per-page.
 */

type FormatNumberOptions = Intl.NumberFormatOptions;

export const ARABIC_MONTH_NAMES = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
] as const;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const BUSINESS_TIME_ZONE = "Asia/Beirut";
const DATE_FORMATTER_UTC = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  numberingSystem: "latn",
  timeZone: "UTC",
});
const DATE_FORMATTER_BUSINESS = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  numberingSystem: "latn",
  timeZone: BUSINESS_TIME_ZONE,
});
const TIME_FORMATTER_BUSINESS = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  numberingSystem: "latn",
  timeZone: BUSINESS_TIME_ZONE,
});

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function dateParts(value: string | Date): { day: string; month: string; year: string } {
  const dateOnly = typeof value === "string" && DATE_ONLY_PATTERN.test(value);
  const date = dateOnly ? new Date(`${value}T00:00:00Z`) : toDate(value);
  const parts = (dateOnly ? DATE_FORMATTER_UTC : DATE_FORMATTER_BUSINESS).formatToParts(date);

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

/** Full business date with Western digits: DD/MM/YYYY. */
export function formatDate(value: string | Date): string {
  const { day, month, year } = dateParts(value);
  return `${day}/${month}/${year}`;
}

/** Date and time for activity/history records in the Beirut business timezone. */
export function formatDateTime(value: string | Date): string {
  const time = TIME_FORMATTER_BUSINESS.format(toDate(value));

  return `${formatDate(value)} — ${time}`;
}

/** Backwards-compatible shared name used by existing Arabic RTL screens. */
export const formatDateAr = formatDate;

/** Format a selected business date for a native date input. */
export function formatDateInputValue(value: string | Date): string {
  const { day, month, year } = dateParts(value);
  return `${year}-${month}-${day}`;
}

/** Format a month/year period label with the product's Arabic month names. */
export function formatMonthYear(month: number, year: number): string {
  return `${ARABIC_MONTH_NAMES[month] ?? ""} ${formatNumber(year, { useGrouping: false })}`;
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
