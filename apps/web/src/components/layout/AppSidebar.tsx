import { Link, useLocation } from "wouter";
import { BarChart3, Car, ClipboardList, FileText, Home, ReceiptText, Users, Wrench } from "lucide-react";
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
  { label: "لوحة التحكم", icon: Home, route: "/" },
  { label: "المركبات", icon: Car, route: "/vehicles" },
  { label: "العملاء", icon: Users, route: "/customers" },
  { label: "الإيجارات", icon: FileText, route: "/rentals" },
  { label: "الصيانة", icon: Wrench, route: "/maintenance" },
  { label: "المصاريف", icon: ReceiptText, route: "/expenses" },
  { label: "المهام", icon: ClipboardList, route: "/tasks" },
  { label: "التحليلات", icon: BarChart3, route: "/analytics" },
  { label: "التقارير", icon: FileText, route: "/reports" },
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
    <Sidebar side="right" collapsible="none" className="hidden lg:flex">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-sm font-bold text-white">
            ن
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">نظام التأجير</span>
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
          <LogoutButton className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
