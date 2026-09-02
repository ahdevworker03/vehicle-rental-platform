import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateAr,
  formatDateTime,
  formatMonthYear,
  formatInitials,
  formatNumber,
  formatUsd,
} from "./format";

describe("money and number formatting", () => {
  it("formats USD amounts with Western numerals and grouping", () => {
    expect(formatCurrency(1500000)).toBe("USD 1,500,000");
    expect(formatUsd(25.5)).toBe("USD 25.5");
  });

  it("keeps Western numerals for Arabic RTL presentation", () => {
    expect(formatNumber(1234567.89)).toBe("1,234,567.89");
  });
});

describe("date formatting", () => {
  it("renders dates as DD/MM/YYYY with Western numerals", () => {
    const date = new Date("2025-01-15T12:00:00Z");
    expect(formatDate(date)).toBe("15/01/2025");
    expect(formatDateAr(date)).toBe("15/01/2025");
  });

  it("renders date and time in the Beirut business timezone", () => {
    expect(formatDateTime("2025-02-03T13:05:00Z")).toBe("03/02/2025 — 3:05 PM");
  });

  it("keeps date-only values stable without timezone shifting", () => {
    expect(formatDate("2025-01-15")).toBe("15/01/2025");
  });

  it("formats the product month names with Western year digits", () => {
    expect(formatMonthYear(9, 2025)).toBe("تشرين الأول 2025");
  });
});

describe("formatInitials", () => {
  it("returns the first letter of the first two words", () => {
    expect(formatInitials("أحمد محمد")).toBe("أم");
  });

  it("returns a single letter for a one-word name", () => {
    expect(formatInitials("أحمد")).toBe("أ");
  });

  it("ignores extra whitespace between words", () => {
    expect(formatInitials("  أحمد   محمد  ")).toBe("أم");
  });
});
