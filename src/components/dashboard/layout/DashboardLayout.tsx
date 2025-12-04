import { ReactNode } from "react";
import { Header } from "@/components/ui/Header";
import logoZionIcon from "@/assets/logo-zion-icon.png";

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
      <main className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 mt-8 sm:mt-12">
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/50">
          <div className="flex items-center justify-center gap-3">
            <img src={logoZionIcon} alt="Zion Traffic" className="h-8 w-auto" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              © Copyright 2025 Zion Traffic v1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
