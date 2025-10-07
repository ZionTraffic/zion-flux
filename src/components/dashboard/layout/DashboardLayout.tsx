import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "@/components/ui/Header";

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdate?: Date | null;
  currentWorkspace?: string | null;
  onWorkspaceChange?: (workspaceId: string) => Promise<void>;
}

export const DashboardLayout = ({
  children,
  onRefresh,
  isRefreshing,
  lastUpdate,
  currentWorkspace,
  onWorkspaceChange,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-60 transition-all duration-300">
        {/* Header */}
        <Header
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          lastUpdate={lastUpdate}
          currentWorkspace={currentWorkspace}
          onWorkspaceChange={onWorkspaceChange}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 mt-12">
          <div className="glass rounded-2xl p-6 text-center border border-border/50">
            <p className="text-sm text-muted-foreground">
              Zion Analytics &copy; 2025 - Premium Dashboard
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
