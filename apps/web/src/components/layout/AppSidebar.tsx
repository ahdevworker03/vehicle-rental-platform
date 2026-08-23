import { Link, useLocation } from "wouter";
import { Building2 } from "lucide-react";
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
import {
  NAVIGATION_GROUPS,
  type NavigationItem,
  isNavigationRouteActive,
} from "./navigation";

function AppSidebarLink({ item }: { item: NavigationItem }) {
  const [location] = useLocation();
  const active = isNavigationRouteActive(location, item.route);
  const Icon = item.icon;

  return (
    <SidebarMenuItem className="relative">
      {active && (
        <span
          className="absolute inset-y-1 end-0 z-10 w-0.5 rounded-full bg-white"
          aria-hidden="true"
        />
      )}
      <SidebarMenuButton
        asChild
        isActive={active}
        size="lg"
        className="gap-3 rounded-lg px-3"
      >
        <Link href={item.route} aria-current={active ? "page" : undefined}>
          <Icon className="size-[18px]" aria-hidden="true" />
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
    <Sidebar
      side="right"
      collapsible="none"
      className="hidden h-dvh w-64 border-s border-sidebar-border lg:flex"
    >
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-white">
              نظام التأجير
            </p>
            <p className="mt-1 truncate text-xs text-sidebar-foreground/65">
              إدارة تأجير المركبات
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-hide overflow-y-auto px-3 py-4">
        {NAVIGATION_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="mb-4 p-0 last:mb-0">
            <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold text-sidebar-foreground/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <AppSidebarLink key={item.route} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <div>
          <LogoutButton className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
