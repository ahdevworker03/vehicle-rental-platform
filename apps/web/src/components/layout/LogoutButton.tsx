import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Temporary logout button used to verify the authentication infrastructure
 * before the full application UI is implemented. Rendered in an always-visible
 * location (top-right of the AppShell).
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    if (submitting) return;
    setSubmitting(true);

    try {
      await logout();
      setLocation("/login", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={submitting}
      className="gap-1.5 text-muted-foreground"
      aria-label="تسجيل الخروج"
    >
      {submitting ? <Spinner /> : <LogOut className="size-4" />}
      <span className="text-xs">خروج</span>
    </Button>
  );
}
