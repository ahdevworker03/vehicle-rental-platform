import { fireEvent, render, screen } from "@testing-library/react";
import { Bell } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { InlineFeedback } from "./FeedbackState";

describe("InlineFeedback", () => {
  it.each([
    ["info", "status", "bg-status-info-bg", "info"],
    ["success", "status", "bg-status-positive-bg", "circle-check"],
    ["warning", "status", "bg-status-warning-bg", "triangle-alert"],
    ["error", "alert", "bg-status-danger-bg", "circle-alert"],
  ] as const)("renders the %s variant with its semantic styling and default icon", (variant, role, tokenClass, iconName) => {
    render(<InlineFeedback variant={variant}>رسالة</InlineFeedback>);

    const feedback = screen.getByRole(role);
    expect(feedback).toHaveClass(tokenClass);
    expect(feedback.querySelector(`svg.lucide-${iconName}`)).toBeInTheDocument();
  });

  it("uses a custom icon without replacing its variant styling", () => {
    render(<InlineFeedback variant="warning" icon={Bell}>رسالة</InlineFeedback>);

    const feedback = screen.getByRole("status");
    expect(feedback).toHaveClass("bg-status-warning-bg");
    expect(feedback.querySelector("svg.lucide-bell")).toBeInTheDocument();
    expect(feedback.querySelector("svg.lucide-triangle-alert")).not.toBeInTheDocument();
  });

  it("does not render a close button by default", () => {
    render(<InlineFeedback>رسالة</InlineFeedback>);

    expect(screen.queryByRole("button", { name: "إغلاق" })).not.toBeInTheDocument();
  });

  it("renders an accessible close button and calls onDismiss", () => {
    const onDismiss = vi.fn();
    render(<InlineFeedback variant="error" onDismiss={onDismiss}>رسالة</InlineFeedback>);

    const closeButton = screen.getByRole("button", { name: "إغلاق" });
    expect(closeButton.tagName).toBe("BUTTON");
    closeButton.focus();
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("keeps canonical variant styling when callers add a className", () => {
    render(<InlineFeedback variant="error" className="mt-4">رسالة</InlineFeedback>);

    expect(screen.getByRole("alert")).toHaveClass("mt-4", "bg-status-danger-bg", "border-status-danger/25");
  });

});
