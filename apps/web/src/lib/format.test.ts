import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateAr,
  formatDateShort,
  formatDateTime,
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
  it("renders a business date as DD-MM-YYYY", () => {
    const date = new Date(2025, 0, 15, 12);
    expect(formatDate(date)).toBe("15-01-2025");
    expect(formatDateAr(date)).toBe("15-01-2025");
  });

  it("renders the agreed date and time format", () => {
    expect(formatDateTime(new Date(2025, 1, 3, 13, 5))).toBe("03-02-2025 — 1:05 PM");
  });

  it("keeps compact dates in Western digits", () => {
    expect(formatDateShort(new Date(2025, 0, 15, 12))).toBe("15-01");
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
