import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { LogoutButton } from "./LogoutButton";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="max-w-[480px] mx-auto h-[100dvh] flex flex-col bg-background relative overflow-hidden shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <div className="flex justify-end px-4 pt-2">
          <LogoutButton />
        </div>
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
