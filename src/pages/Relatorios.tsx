import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout/DashboardLayout';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { ReportContent } from '@/components/reports/ReportContent';
import { ReportActions } from '@/components/reports/ReportActions';
import { useReportData } from '@/hooks/useReportData';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { subDays } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import { ReportPDF } from '@/components/reports/ReportPDF';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Relatorios() {
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const [fromDate, setFromDate] = useState(subDays(new Date(), 30));
  const [toDate, setToDate] = useState(new Date());
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, isLoading, error } = useReportData(
    currentWorkspaceId || '',
    fromDate,
    toDate
  );

  const handleGeneratePdf = async () => {
    if (!data) {
      toast.error('Nenhum dado disponível para gerar o relatório');
      return;
    }

    setIsGenerating(true);
    try {
      const blob = await pdf(<ReportPDF data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${data.workspace.name}-${format(fromDate, 'yyyy-MM-dd')}-${format(toDate, 'yyyy-MM-dd')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout
      currentWorkspace={currentWorkspaceId}
      onWorkspaceChange={setCurrentWorkspaceId}
      onRefresh={() => window.location.reload()}
      isRefreshing={false}
      lastUpdate={new Date()}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-2">
              Gere e exporte relatórios personalizados de performance
            </p>
          </div>
        </div>

        <ReportHeader
          workspaceId={currentWorkspaceId}
          onWorkspaceChange={setCurrentWorkspaceId}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-6 border border-destructive/50">
            <p className="text-destructive">Erro ao carregar dados: {error}</p>
          </div>
        ) : data ? (
          <>
            <ReportActions
              onGeneratePdf={handleGeneratePdf}
              isGenerating={isGenerating}
            />
            <ReportContent data={data} />
          </>
        ) : (
          <div className="glass rounded-2xl p-6 border border-border/50">
            <p className="text-muted-foreground">
              Selecione um workspace e período para visualizar o relatório
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
