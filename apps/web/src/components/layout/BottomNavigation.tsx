import { Link, useLocation } from "wouter";
import { Home, Car, Users, FileText, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "الرئيسية", icon: Home,     route: "/" },
  { label: "السيارات",  icon: Car,      route: "/vehicles" },
  { label: "العملاء",   icon: Users,    route: "/customers" },
  { label: "الإيجارات", icon: FileText, route: "/rentals" },
  { label: "الصيانة",   icon: Wrench,   route: "/maintenance" },
] as const;

/** Extracted so hooks are called at the top level of a component, not inside .map() */
function NavTab({ tab }: { tab: (typeof TABS)[number] }) {
  const [location] = useLocation();
  // Home is exact-match only; all other tabs match their prefix
  const isActive =
    tab.route === "/" ? location === "/" : location.startsWith(tab.route);
  const Icon = tab.icon;

  return (
    <Link
      href={tab.route}
      aria-current={isActive ? "page" : undefined}
      className="flex-1"
    >
      <div className="flex flex-col items-center justify-center py-2 min-h-[56px] gap-1">
        <Icon
          className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")}
          strokeWidth={isActive ? 2.5 : 2}
          style={isActive ? { fill: "currentColor", fillOpacity: 0.1 } : {}}
        />
        <span
          className={cn(
            "text-[11px] font-medium",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {tab.label}
        </span>
      </div>
    </Link>
  );
}

export function BottomNavigation() {
  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-border z-50 lg:hidden"
    >
      <div className="max-w-[480px] mx-auto flex justify-between items-center px-2">
        {TABS.map((tab) => (
          <NavTab key={tab.route} tab={tab} />
        ))}
      </div>
    </nav>
  );
}
