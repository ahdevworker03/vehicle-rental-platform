import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge status mapping", () => {
  it("renders the Arabic label for each status", () => {
    render(
      <>
        <StatusBadge status="available" />
        <StatusBadge status="rented" />
        <StatusBadge status="maintenance" />
        <StatusBadge status="upcoming" />
        <StatusBadge status="overdue" />
      </>
    );
    expect(screen.getByText("متاحة")).toBeInTheDocument();
    expect(screen.getByText("مؤجرة")).toBeInTheDocument();
    expect(screen.getByText("في الصيانة")).toBeInTheDocument();
    expect(screen.getByText("قادمة")).toBeInTheDocument();
    expect(screen.getByText("متأخرة")).toBeInTheDocument();
  });

  it("styles upcoming with the shared warning token, not the information token", () => {
    render(<StatusBadge status="upcoming" />);
    const badge = screen.getByText("قادمة");
    expect(badge.className).toContain("status-warning-bg");
    expect(badge.className).not.toContain("status-info-bg");
  });

  it("uses the approved light semantic treatment for vehicle statuses", () => {
    render(
      <>
        <StatusBadge status="AVAILABLE" />
        <StatusBadge status="RENTED" />
        <StatusBadge status="MAINTENANCE" />
        <StatusBadge status="OUT_OF_SERVICE" />
      </>,
    );

    expect(screen.getByText("متاحة").className).toContain("status-positive-bg");
    expect(screen.getByText("مؤجرة").className).toContain("status-info-bg");
    expect(screen.getByText("في الصيانة").className).toContain("status-warning-bg");
    expect(screen.getByText("خارج الخدمة").className).toContain("status-danger-bg");
  });
});
