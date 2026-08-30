import { ReactNode } from "react";
import { PageContainer } from "./PageContainer";
import { BottomNavigation } from "./BottomNavigation";
import { AppSidebar } from "./AppSidebar";
import { TabletNavigationRail } from "./TabletNavigationRail";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only fixed start-4 top-4 z-[60] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only"
      >
        الانتقال إلى المحتوى الرئيسي
      </a>
      <AppSidebar />
      <TabletNavigationRail />
      <SidebarInset id="main-content" tabIndex={-1}>
        <div className="flex h-[100dvh] min-w-0 flex-col overflow-hidden bg-background">
          <div className="min-w-0 flex-1 overflow-x-clip overflow-y-auto pb-[calc(3.5rem+env(safe-area-inset-bottom))] scrollbar-hide md:pb-0">
            <PageContainer className="py-3 sm:py-4 lg:py-6">
              {children}
            </PageContainer>
          </div>
          <BottomNavigation />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
