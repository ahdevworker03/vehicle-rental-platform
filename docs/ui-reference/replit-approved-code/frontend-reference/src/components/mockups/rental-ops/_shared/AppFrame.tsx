import type { ReactNode } from "react";
import "./theme.css";
import { Sidebar, TabletRail } from "./Sidebar";
import { MobileNav } from "./MobileNav";

/**
 * Shared app chrome for every rental-ops screen. `variant` fixes the frame to one
 * breakpoint so each canvas frame demonstrates one deliberate responsive state
 * (this is a static mockup, not a live-resizing app).
 */
export function AppFrame({
  variant,
  active,
  children,
  mobileNavForceOpen = false,
}: {
  variant: "desktop" | "tablet" | "mobile";
  active: string;
  children: ReactNode;
  mobileNavForceOpen?: boolean;
}) {
  if (variant === "mobile") {
    return (
      <div className="rental-ops relative flex h-screen w-full flex-col overflow-hidden" dir="rtl">
        <div className="rental-ops-scroll flex-1 overflow-y-auto">{children}</div>
        <MobileNav active={active} forceOpen={mobileNavForceOpen} />
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div className="rental-ops flex h-screen w-full overflow-hidden" dir="rtl">
        <TabletRail active={active} />
        <div className="rental-ops-scroll flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="rental-ops flex h-screen w-full overflow-hidden" dir="rtl">
      <Sidebar active={active} />
      <div className="rental-ops-scroll flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
