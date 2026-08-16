import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MaintenanceCard, type MaintenanceCardStatus } from "./MaintenanceCard";
import type { MaintenanceResponse } from "@workspace/api-client-react";

function makeRecord(overrides: Partial<MaintenanceResponse>): MaintenanceResponse {
  return {
    id: "m1",
    vehicleId: "v1",
    type: "PREVENTIVE_SERVICE",
    status: "SCHEDULED",
    maintenanceDate: "2026-08-20T09:00:00Z",
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

function renderCard(
  record: MaintenanceResponse,
  displayStatus: MaintenanceCardStatus,
  handlers: Partial<{
    onMarkComplete: () => void;
    onOpen: () => void;
    onToggle: () => void;
  }> = {},
  expanded = false,
) {
  return render(
    <MaintenanceCard
      record={record}
      displayStatus={displayStatus}
      vehicleName="Toyota Corolla"
      vehiclePlate="12345"
      isExpanded={expanded}
      onToggle={handlers.onToggle ?? (() => {})}
      onMarkComplete={handlers.onMarkComplete}
      onOpen={handlers.onOpen}
    />,
  );
}

describe("MaintenanceCard", () => {
  it("renders the type label, vehicle, and maintenance date", () => {
    renderCard(makeRecord(), "upcoming");
    expect(screen.getByText("صيانة وقائية")).toBeInTheDocument();
    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
  });

  it("shows the persisted status label when expanded", () => {
    renderCard(makeRecord({ status: "COMPLETED" }), "completed", {}, true);
    expect(screen.getByText("مكتملة")).toBeInTheDocument();
  });

  it("shows cost and vendor when available", () => {
    renderCard(
      makeRecord({ cost: 150, vendor: "ورشة النور" }),
      "upcoming",
      {},
      true,
    );
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("ورشة النور")).toBeInTheDocument();
  });

  it("shows replaced parts with quantity when available", () => {
    renderCard(
      makeRecord({
        replacedParts: [{ name: "بواجي", brand: "Bosch", quantity: 4 }],
      }),
      "upcoming",
      {},
      true,
    );
    expect(screen.getByText(/بواجي \(Bosch\) ×4/)).toBeInTheDocument();
  });

  it("invokes onMarkComplete for a non-completed record", () => {
    const onMarkComplete = vi.fn();
    renderCard(makeRecord(), "upcoming", { onMarkComplete }, true);

    const button = screen.getByText("تم الإنجاز");
    fireEvent.click(button);

    expect(onMarkComplete).toHaveBeenCalledTimes(1);
  });

  it("does not render the complete action for a completed record", () => {
    renderCard(makeRecord({ status: "COMPLETED" }), "completed", {
      onMarkComplete: vi.fn(),
    }, true);
    expect(screen.queryByText("تم الإنجاز")).not.toBeInTheDocument();
  });
});
