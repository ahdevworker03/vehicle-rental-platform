import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";

const login = vi.fn();

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ login }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/login", vi.fn()],
}));

describe("LoginPage", () => {
  beforeEach(() => {
    login.mockReset();
  });

  it("associates the visible labels with the login controls", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("البريد الإلكتروني*")).toHaveAttribute(
      "id",
      "login-email",
    );
    expect(screen.getByLabelText("كلمة المرور*")).toHaveAttribute(
      "id",
      "login-password",
    );
  });

  it("uses a submit control and does not expose public company registration", () => {
    render(<LoginPage />);

    expect(screen.getByRole("button", { name: "دخول" })).toHaveAttribute(
      "type",
      "submit",
    );
    expect(screen.queryByText("إنشاء حساب الشركة")).not.toBeInTheDocument();
  });

  it("shows authentication failures as alert feedback", async () => {
    login.mockRejectedValueOnce(new Error("failed"));
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("البريد الإلكتروني*"), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText("كلمة المرور*"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: "دخول" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("حدث خطأ في الاتصال بالخادم.");
  });
});
