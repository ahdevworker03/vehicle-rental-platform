import { Link, useLocation } from "wouter";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAVIGATION_GROUPS, isNavigationRouteActive } from "./navigation";
import { LogoutButton } from "./LogoutButton";

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

/**
 * Full navigation surface used by compact navigation patterns. Links close the
 * sheet on selection, preserving the Radix focus-return behavior for keyboard users.
 */
export function NavigationDrawer({
  open,
  onOpenChange,
  title = "كل الوحدات",
}: NavigationDrawerProps) {
  const [location] = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-0 p-0 sm:max-w-none"
        aria-describedby="navigation-drawer-description"
      >
        <SheetHeader className="border-b border-border px-5 py-5 text-start">
          <div className="flex items-center gap-3 pe-12">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
              <img
                src="/brand/symbols/markab-symbol.png"
                alt=""
                className="size-8 object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">مَركب</p>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription id="navigation-drawer-description">
                إدارة عمليات تأجير المركبات
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <nav
          aria-label="كل وحدات النظام"
          className="scrollbar-hide flex-1 overflow-y-auto px-3 py-4"
        >
          {NAVIGATION_GROUPS.map((group) => (
            <section
              key={group.label}
              aria-labelledby={`drawer-${group.label}`}
              className="mb-5 last:mb-0"
            >
              <h2
                id={`drawer-${group.label}`}
                className="mb-2 px-2 text-xs font-semibold text-muted-foreground"
              >
                {group.label}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isNavigationRouteActive(location, item.route);
                  const Icon = item.icon;

                  return (
                    <li key={item.route}>
                      <SheetClose asChild>
                        <Link
                          href={item.route}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-secondary text-secondary-foreground"
                              : "text-foreground hover:bg-muted active:bg-muted",
                          )}
                        >
                          <Icon
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <LogoutButton className="w-full justify-start" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
