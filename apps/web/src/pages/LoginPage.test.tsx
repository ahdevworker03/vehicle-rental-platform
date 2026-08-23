import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/pages/LoginPage";

vi.mock("@/providers/AuthProvider", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/login", vi.fn()],
}));

describe("LoginPage", () => {
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
});
