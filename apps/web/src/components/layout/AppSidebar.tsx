import { Link, useLocation } from "wouter";
import { Home, Car, Users, FileText, Wrench } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "الرئيسية", icon: Home, route: "/" },
  { label: "السيارات", icon: Car, route: "/vehicles" },
  { label: "العملاء", icon: Users, route: "/customers" },
  { label: "الإيجارات", icon: FileText, route: "/rentals" },
  { label: "الصيانة", icon: Wrench, route: "/maintenance" },
] as const;

function isActiveRoute(location: string, route: string): boolean {
  return route === "/" ? location === "/" : location.startsWith(route);
}

function AppSidebarLink({ item }: { item: (typeof NAV_ITEMS)[number] }) {
  const [location] = useLocation();
  const active = isActiveRoute(location, item.route);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link href={item.route} aria-current={active ? "page" : undefined}>
          <Icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * Desktop navigation. Uses the existing shadcn Sidebar with `collapsible="none"`
 * so it renders as an in-flow column (no offcanvas/mobile drawer), and is shown
 * only at `lg` where BottomNavigation is hidden.
 */
export function AppSidebar() {
  return (
    <Sidebar collapsible="none" className="hidden lg:flex">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            ن
          </div>
          <span className="text-sm font-bold text-foreground">نظام التأجير</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <AppSidebarLink key={item.route} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="px-2">
          <LogoutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
