import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavigationDrawer } from "./NavigationDrawer";

vi.mock("./LogoutButton", () => ({
  LogoutButton: () => <button type="button">تسجيل الخروج</button>,
}));

describe("NavigationDrawer", () => {
  it("reserves header space for the logical-end close button", () => {
    render(<NavigationDrawer open onOpenChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "إغلاق" })).toHaveClass(
      "absolute",
      "end-4",
      "top-4",
      "size-11",
    );
    expect(screen.getByText("كل الوحدات").parentElement?.parentElement).toHaveClass(
      "pe-12",
    );
  });

  it("closes through the close button and Escape", () => {
    const onOpenChange = vi.fn();
    render(<NavigationDrawer open onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    onOpenChange.mockClear();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
