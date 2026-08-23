import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationDrawer } from "./NavigationDrawer";
import {
  MOBILE_PRIMARY_NAVIGATION,
  type NavigationItem,
  isMobileMoreRoute,
  isNavigationRouteActive,
} from "./navigation";

function NavTab({ tab }: { tab: NavigationItem }) {
  const [location] = useLocation();
  const isActive = isNavigationRouteActive(location, tab.route);
  const Icon = tab.icon;

  return (
    <Link
      href={tab.route}
      aria-current={isActive ? "page" : undefined}
      className="flex-1"
    >
      <div className="flex min-h-14 flex-col items-center justify-center gap-1 py-2">
        <Icon
          className={cn(
            "size-5",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
          strokeWidth={isActive ? 2.5 : 2}
          aria-hidden="true"
        />
        <span
          className={cn(
            "text-[11px] font-medium leading-tight",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          {tab.label}
        </span>
      </div>
    </Link>
  );
}

export function BottomNavigation() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = isMobileMoreRoute(location);

  return (
    <>
      <nav
        aria-label="التنقل الرئيسي"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 px-1">
          {MOBILE_PRIMARY_NAVIGATION.map((tab) => (
            <NavTab key={tab.route} tab={tab} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="المزيد من وحدات النظام"
            aria-expanded={moreOpen}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium leading-tight transition-colors",
              moreActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Menu
              className="size-5"
              strokeWidth={moreActive ? 2.5 : 2}
              aria-hidden="true"
            />
            <span>المزيد</span>
          </button>
        </div>
      </nav>
      <NavigationDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
