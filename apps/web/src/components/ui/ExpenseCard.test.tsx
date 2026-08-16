import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseCard } from "./ExpenseCard";
import type { ExpenseResponse } from "@workspace/api-client-react";

function makeExpense(overrides: Partial<ExpenseResponse>): ExpenseResponse {
  return {
    id: "e1",
    vehicleId: null,
    expenseDate: "2026-08-20T09:00:00Z",
    amount: 50,
    category: "FUEL",
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
    ...overrides,
  };
}

describe("ExpenseCard", () => {
  it("renders the category label, amount, and date", () => {
    render(
      <ExpenseCard
        expense={makeExpense()}
        vehicleName=""
        vehiclePlate=""
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("وقود")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
  });

  it("renders the associated vehicle when present", () => {
    render(
      <ExpenseCard
        expense={makeExpense({ vehicleId: "v1" })}
        vehicleName="Toyota Corolla"
        vehiclePlate="12345"
        onClick={() => {}}
      />,
    );

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
  });

  it("does not render the vehicle row for an organization-level expense", () => {
    render(
      <ExpenseCard
        expense={makeExpense({ vehicleId: null })}
        vehicleName="Toyota Corolla"
        vehiclePlate="12345"
        onClick={() => {}}
      />,
    );

    expect(screen.queryByText("Toyota Corolla")).not.toBeInTheDocument();
  });

  it("invokes onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <ExpenseCard
        expense={makeExpense()}
        vehicleName=""
        vehiclePlate=""
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByText("وقود"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
