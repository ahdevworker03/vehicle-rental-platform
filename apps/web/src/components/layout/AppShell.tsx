import { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";
import { PageContainer } from "./PageContainer";
import { BottomNavigation } from "./BottomNavigation";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 no-scrollbar">
            <div className="flex justify-end px-4 pt-2 lg:hidden">
              <LogoutButton />
            </div>
            <PageContainer className="py-4 lg:py-6">{children}</PageContainer>
          </main>
          <BottomNavigation />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
