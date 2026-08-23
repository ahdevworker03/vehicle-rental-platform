// Shared formatting helpers for the rental-ops exploration.
// LOCKED GLOBAL DECISIONS: Western numerals only, USD currency, Day-Month-Year dates,
// English AM/PM time, Levantine Arabic month names, English vehicle names & plates.

export const arabicMonths = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
  "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول",
] as const;

/** Converts any Arabic-Indic digits in a string to Western digits. Use defensively on any dynamic text. */
export function toWesternDigits(input: string): string {
  const map: Record<string, string> = { "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9" };
  return input.replace(/[٠-٩]/g, (d) => map[d] ?? d);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** "18 آب 2024" */
export function formatDateLong(day: number, month1to12: number, year: number): string {
  return `${day} ${arabicMonths[month1to12 - 1]} ${year}`;
}

/** "18-08-2024" — Day-Month-Year, always Western numerals. */
export function formatDateCompact(day: number, month1to12: number, year: number): string {
  return `${pad2(day)}-${pad2(month1to12)}-${year}`;
}

/** "10 AM" / "9:30 AM" / "6 PM" — English AM/PM, no leading zero on the hour. */
export function formatTime(hour24: number, minute = 0): string {
  const period = hour24 >= 12 ? "PM" : "AM";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return minute === 0 ? `${hour12} ${period}` : `${hour12}:${pad2(minute)} ${period}`;
}

/** "18-08-2024 — 10 AM" — date and time visually connected with an em-dash, never a comma. */
export function formatDateTime(day: number, month1to12: number, year: number, hour24: number, minute = 0): string {
  return `${formatDateCompact(day, month1to12, year)} — ${formatTime(hour24, minute)}`;
}

/** "1,250 USD" — Western thousands separator, currency code trailing the amount. */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} USD`;
}

/** "B 245781" — one English letter + Western-numeral block, space-separated. */
export function formatPlate(letter: string, digits: string): string {
  return `${letter} ${digits}`;
}
