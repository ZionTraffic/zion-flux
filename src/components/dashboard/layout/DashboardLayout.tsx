import { ReactNode } from "react";
import { Header } from "@/components/ui/Header";

interface DashboardLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdate?: Date | null;
  onExportPdf?: () => void;
  isExporting?: boolean;
}

export const DashboardLayout = ({
  children,
  onRefresh,
  isRefreshing,
  lastUpdate,
  onExportPdf,
  isExporting,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen w-full">
      {/* Header */}
      <Header
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        lastUpdate={lastUpdate}
        onExportPdf={onExportPdf}
        isExporting={isExporting}
      />

      {/* Page Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion Analytics &copy; 2025 - Premium Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};
