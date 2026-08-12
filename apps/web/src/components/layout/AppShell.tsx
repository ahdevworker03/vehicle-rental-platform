import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { LogoutButton } from "./LogoutButton";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="max-w-[480px] mx-auto h-[100dvh] flex flex-col bg-background relative overflow-hidden shadow-2xl">
      <div className="absolute top-3 right-3 z-50">
        <LogoutButton />
      </div>
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
