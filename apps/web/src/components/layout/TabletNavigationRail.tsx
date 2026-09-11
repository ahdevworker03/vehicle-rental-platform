import { Link, useLocation } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ALL_NAVIGATION_ITEMS, isNavigationRouteActive } from "./navigation";
import { LogoutButton } from "./LogoutButton";

/**
 * The deliberate 768–1023px navigation state: every existing module remains
 * one click away without consuming the desktop sidebar's content width.
 */
export function TabletNavigationRail() {
  const [location] = useLocation();

  return (
    <aside className="hidden h-dvh w-20 shrink-0 flex-col border-s border-sidebar-border bg-sidebar text-sidebar-foreground md:flex lg:hidden">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
          <img
            src="/brand/symbols/markab-symbol.png"
            alt=""
            className="size-8 object-contain"
          />
          <span className="sr-only">مَركب</span>
        </span>
      </div>

      <nav
        aria-label="التنقل الرئيسي"
        className="scrollbar-hide flex-1 overflow-y-auto px-2 py-3"
      >
        <ul className="space-y-1">
          {ALL_NAVIGATION_ITEMS.map((item) => {
            const active = isNavigationRouteActive(location, item.route);
            const Icon = item.icon;

            return (
              <li key={item.route} className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.route}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-center text-[10px] font-medium leading-tight transition-colors focus-visible:outline-none",
                        active
                          ? "bg-white/10 text-white"
                          : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white active:bg-white/10",
                      )}
                    >
                      {active && (
                        <span
                          className="absolute inset-y-2 end-0 w-0.5 rounded-full bg-white"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className="size-[18px] shrink-0"
                        strokeWidth={active ? 2.4 : 2}
                        aria-hidden="true"
                      />
                      <span className="line-clamp-1 w-full">
                        {item.shortLabel}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="left">{item.label}</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <LogoutButton className="size-12 justify-center px-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&>span]:sr-only" />
      </div>
    </aside>
  );
}
