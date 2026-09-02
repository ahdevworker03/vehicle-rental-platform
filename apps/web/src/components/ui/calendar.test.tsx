import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("uses the Lebanese Arabic month caption and Western day numerals", () => {
    const { container } = render(<Calendar mode="single" month={new Date(2025, 9, 1)} />);

    expect(screen.getByText("تشرين الأول 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wednesday, October 1st, 2025/ })).toBeInTheDocument();
    expect(container.querySelector('[data-slot="calendar"]')).toHaveAttribute("dir", "rtl");
  });

  it("keeps accessible navigation controls in the calendar header row", () => {
    render(<Calendar mode="single" month={new Date(2025, 9, 1)} />);
    const caption = screen.getByText("تشرين الأول 2025");
    const previous = screen.getByRole("button", { name: /previous/i });
    const next = screen.getByRole("button", { name: /next/i });

    expect(previous).toBeInTheDocument();
    expect(next).toBeInTheDocument();
    expect(previous.parentElement).toBe(caption.parentElement?.parentElement);
    expect(next.parentElement).toBe(caption.parentElement?.parentElement);
  });

  it("renders compact Arabic weekday labels", () => {
    render(<Calendar mode="single" month={new Date(2025, 9, 1)} />);

    expect(screen.getByText("أحد")).toBeInTheDocument();
    expect(screen.getByText("اثنين")).toBeInTheDocument();
    expect(screen.getByText("ثلاثاء")).toBeInTheDocument();
    expect(screen.getByText("أربعاء")).toBeInTheDocument();
    expect(screen.getByText("خميس")).toBeInTheDocument();
    expect(screen.getByText("جمعة")).toBeInTheDocument();
    expect(screen.getByText("سبت")).toBeInTheDocument();
  });

  it("keeps a readable seven-column day grid with Western digits", () => {
    const { container } = render(<Calendar mode="single" month={new Date(2025, 9, 1)} />);
    const calendar = container.querySelector('[data-slot="calendar"]');
    const dayButtons = Array.from(container.querySelectorAll("button[data-day]"));

    expect(calendar).toHaveClass("[--cell-size:2.5rem]");
    expect(dayButtons.length).toBeGreaterThanOrEqual(28);
    expect(container.querySelectorAll(".rdp-week")[0]).toHaveClass("grid-cols-7");
    expect(dayButtons.every((button) => button.className.includes("size-[--cell-size]"))).toBe(true);
    expect(dayButtons.every((button) => /^\d+$/.test(button.textContent ?? ""))).toBe(true);
  });

  it("keeps day buttons keyboard accessible", () => {
    render(<Calendar mode="single" month={new Date(2025, 9, 1)} />);

    const day = screen.getByRole("button", { name: /Wednesday, October 15th, 2025/ });
    day.focus();

    expect(document.activeElement).toBe(day);
    expect(day).toHaveAttribute("data-day", "2025-10-15");
  });
});
