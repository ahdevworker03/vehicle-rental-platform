import { useState } from "react";
import { useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Logout button rendered in the AppShell top-right on small viewports and
 * inside the desktop sidebar. Kept in an always-accessible location.
 */
export function LogoutButton({ className }: { className?: string }) {
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
      className={cn("gap-1.5 text-muted-foreground", className)}
      aria-label="تسجيل الخروج"
    >
      {submitting ? <Spinner /> : <LogOut className="size-4" />}
      <span className="text-xs">خروج</span>
    </Button>
  );
}
