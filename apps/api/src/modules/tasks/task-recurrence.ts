import type { TaskRecurrenceUnit } from "./task.types";

const BUSINESS_TIME_ZONE = "Asia/Beirut";
const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

interface DateTimeParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

function getBeirutParts(date: Date): DateTimeParts {
  const values = Object.fromEntries(
    dateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
    millisecond: date.getUTCMilliseconds(),
  };
}

function partsAsUtc(parts: DateTimeParts): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond,
  );
}

function matchesParts(left: DateTimeParts, right: DateTimeParts): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second &&
    left.millisecond === right.millisecond
  );
}

function timezoneOffsetAt(date: Date): number {
  return partsAsUtc(getBeirutParts(date)) - date.getTime();
}

function beirutDateTimeToInstant(parts: DateTimeParts): Date {
  const desired = partsAsUtc(parts);
  const offsets = new Set(
    [-86_400_000, 0, 86_400_000].map((offset) =>
      timezoneOffsetAt(new Date(desired + offset)),
    ),
  );
  const matchingInstants = [...offsets]
    .map((offset) => new Date(desired - offset))
    .filter((candidate) => matchesParts(getBeirutParts(candidate), parts));

  if (matchingInstants.length > 0) {
    return new Date(
      Math.min(...matchingInstants.map((candidate) => candidate.getTime())),
    );
  }

  let candidate = desired;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = getBeirutParts(new Date(candidate));
    const adjustment = desired - partsAsUtc(actual);
    if (adjustment === 0) return new Date(candidate);
    candidate += adjustment;
  }

  return new Date(candidate);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function nextTaskDueDate(
  dueDate: Date,
  interval: number,
  unit: TaskRecurrenceUnit,
): Date {
  const current = getBeirutParts(dueDate);

  if (unit === "MONTH") {
    const monthIndex = current.year * 12 + current.month - 1 + interval;
    const year = Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    return beirutDateTimeToInstant({
      ...current,
      year,
      month,
      day: Math.min(current.day, daysInMonth(year, month)),
    });
  }

  const calendar = new Date(
    Date.UTC(
      current.year,
      current.month - 1,
      current.day + interval * (unit === "WEEK" ? 7 : 1),
      current.hour,
      current.minute,
      current.second,
      current.millisecond,
    ),
  );

  return beirutDateTimeToInstant({
    year: calendar.getUTCFullYear(),
    month: calendar.getUTCMonth() + 1,
    day: calendar.getUTCDate(),
    hour: calendar.getUTCHours(),
    minute: calendar.getUTCMinutes(),
    second: calendar.getUTCSeconds(),
    millisecond: calendar.getUTCMilliseconds(),
  });
}

function beirutBusinessDate(date: Date): string {
  const parts = getBeirutParts(date);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export { beirutBusinessDate, nextTaskDueDate };
