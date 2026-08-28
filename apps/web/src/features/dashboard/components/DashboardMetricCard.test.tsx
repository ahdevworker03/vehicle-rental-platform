import { render, screen } from "@testing-library/react";
import { Car } from "lucide-react";
import { describe, expect, it } from "vitest";
import { DashboardMetricCard } from "./DashboardMetricCard";

describe("DashboardMetricCard", () => {
  it("does not display a potentially misleading value while loading", () => {
    render(
      <DashboardMetricCard
        label="المبالغ المستحقة"
        value="USD 0"
        context="إجمالي الأرصدة"
        icon={Car}
        state="loading"
      />,
    );

    expect(
      screen.getByLabelText("جارٍ تحميل المبالغ المستحقة"),
    ).toBeInTheDocument();
    expect(screen.queryByText("USD 0")).not.toBeInTheDocument();
  });

  it("shows a clear value and context when data is ready", () => {
    render(
      <DashboardMetricCard
        label="الإيجارات النشطة"
        value="4"
        context="عقود قيد التنفيذ"
        icon={Car}
      />,
    );

    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("عقود قيد التنفيذ")).toBeInTheDocument();
  });
});
