import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("renders a placeholder when no date is selected", () => {
    render(<DatePicker value="" onChange={vi.fn()} placeholder="اختر تاريخًا" />);

    expect(screen.getByRole("button", { name: "اختر تاريخًا" })).toBeInTheDocument();
  });

  it("displays a date-only value as DD/MM/YYYY with Western digits", () => {
    render(<DatePicker value="2026-09-02" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "02/09/2026" })).toBeInTheDocument();
  });

  it("uses the Lebanese Arabic month caption", () => {
    render(<DatePicker id="date" value="2026-09-02" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "02/09/2026" }));

    expect(screen.getByText("أيلول 2026")).toBeInTheDocument();
    expect(screen.getByText("اثنين")).toBeInTheDocument();
    expect(screen.getByText("ثلاثاء")).toBeInTheDocument();
  });

  it("returns a selected calendar day as YYYY-MM-DD and closes", async () => {
    const onChange = vi.fn();
    render(<DatePicker id="date" value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "اختر تاريخًا" }));
    fireEvent.click(document.querySelector('button[data-day="2026-09-15"]')!);

    expect(onChange).toHaveBeenCalledWith("2026-09-15");
    await waitFor(() => {
      expect(screen.queryByText("أيلول 2026")).not.toBeInTheDocument();
    });
  });

  it("disables dates outside min and max without changing the value", () => {
    render(
      <DatePicker
        value="2026-09-15"
        onChange={vi.fn()}
        min="2026-09-10"
        max="2026-09-20"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "15/09/2026" }));

    expect(document.querySelector('button[data-day="2026-09-09"]')).toBeDisabled();
    expect(document.querySelector('button[data-day="2026-09-21"]')).toBeDisabled();
    expect(screen.getByRole("button", { name: "15/09/2026" })).toBeInTheDocument();
  });

  it("supports keyboard navigation, Escape, and returns focus to the trigger", async () => {
    render(<DatePicker id="date" value="2026-09-02" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "02/09/2026" });

    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByText("أيلول 2026")).toBeInTheDocument();

    const day = document.querySelector<HTMLButtonElement>('button[data-day="2026-09-02"]')!;
    day.focus();
    fireEvent.keyDown(day, { key: "ArrowRight", code: "ArrowRight" });
    await waitFor(() => {
      expect(document.activeElement).toHaveAttribute("data-day", "2026-09-01");
    });

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    await waitFor(() => {
      expect(screen.queryByText("أيلول 2026")).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("keeps date-only values stable without timezone conversion", () => {
    const onChange = vi.fn();
    render(<DatePicker value="2025-01-15" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "15/01/2025" }));
    const day = document.querySelector<HTMLButtonElement>('button[data-day="2025-01-16"]')!;
    day.click();

    expect(onChange).toHaveBeenCalledWith("2025-01-16");
  });
});
