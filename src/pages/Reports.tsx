import { useState } from "react";
import { subDays } from "date-fns";
import { Header } from "@/components/ui/Header";
import { ReportHeader } from "@/components/reports/ReportHeader";
import { ReportContent } from "@/components/reports/ReportContent";
import { ReportActions } from "@/components/reports/ReportActions";
import { useReportData } from "@/hooks/useReportData";
import { toast } from "sonner";

const Reports = () => {
  const [workspaceId, setWorkspaceId] = useState("3f14bb25-0eda-4c58-8486-16b96dca6f9e");
  const [fromDate, setFromDate] = useState(subDays(new Date(), 30));
  const [toDate, setToDate] = useState(new Date());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data, isLoading, error } = useReportData(workspaceId, fromDate, toDate);

  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    toast.info("Gerando PDF...");
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPdf(false);
      toast.success("PDF gerado com sucesso!");
      toast.info("Funcionalidade de download será implementada em breve");
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-2">Carregando dados...</div>
          <p className="text-muted-foreground">Compilando relatório estratégico</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2 text-red-500">Erro ao carregar dados</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={() => window.location.reload()} 
        isRefreshing={false} 
        lastUpdate={new Date()}
        currentWorkspace={workspaceId}
        onWorkspaceChange={setWorkspaceId}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Relatórios Estratégicos</h1>
          <p className="text-muted-foreground">
            Análise completa e consolidada de todos os módulos
          </p>
        </div>

        {/* Report Configuration */}
        <ReportHeader
          workspaceId={workspaceId}
          onWorkspaceChange={setWorkspaceId}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />

        {/* Export Actions */}
        <ReportActions
          onGeneratePdf={handleGeneratePdf}
          isGenerating={isGeneratingPdf}
        />

        {/* Report Content */}
        <ReportContent data={data} />
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-6 mt-12">
        <div className="glass rounded-2xl p-6 text-center border border-border/50">
          <p className="text-sm text-muted-foreground">
            Zion App &copy; 2025 - Relatórios Estratégicos Inteligentes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Reports;
