import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileSpreadsheet, FileText, BarChart3, Loader2 } from "lucide-react";
import { useExportData } from "@/hooks/useExportData";
import { ExportDateModal } from "./ExportDateModal";

interface ExportDropdownProps {
  tenantId: string;
  tenantName?: string;
  startDate?: Date;
  endDate?: Date;
  kpis?: any;
  showKPIsOption?: boolean;
  disabled?: boolean;
}

export function ExportDropdown({
  tenantId,
  tenantName = 'SIEG',
  startDate,
  endDate,
  kpis,
  showKPIsOption = false,
  disabled = false
}: ExportDropdownProps) {
  const { exportConversations, exportKPIs, isExporting } = useExportData();
  const [dateModalOpen, setDateModalOpen] = useState(false);

  function handleExportWithDates(start: Date, end: Date) {
    exportConversations(tenantId, start, end, 'csv');
    setDateModalOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="glass hover:glass-medium"
            disabled={disabled || isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Exportar Dados</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDateModalOpen(true)}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Exportar CSV</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => exportConversations(tenantId, startDate, endDate, 'excel')}
            disabled={isExporting}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Excel (.xls)</span>
          </DropdownMenuItem>

          {showKPIsOption && kpis && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => exportKPIs(kpis, tenantName, startDate, endDate, 'excel')}
                disabled={isExporting}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>KPIs (.xls)</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDateModal
        open={dateModalOpen}
        onOpenChange={setDateModalOpen}
        onExport={handleExportWithDates}
        isExporting={isExporting}
      />
    </>
  );
}
