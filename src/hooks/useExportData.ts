import { useState } from 'react';
import { supabase as centralSupabase } from '@/integrations/supabase/client';
import { 
  exportToCSV, 
  exportToExcel, 
  ExportColumn,
  formatDateForExport,
  formatCurrencyForExport,
  formatPhoneForExport
} from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  /**
   * Exporta dados de conversas do SIEG
   */
  const exportConversations = async (
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    format: 'csv' | 'excel' = 'excel'
  ) => {
    setIsExporting(true);
    
    try {
      // Buscar dados do Supabase
      let query = (centralSupabase as any)
        .from('tenant_conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      // Aplicar filtros de data
      if (startDate) {
        const startISO = new Date(startDate.setHours(0, 0, 0, 0)).toISOString();
        query = query.gte('created_at', startISO);
      }
      
      if (endDate) {
        const endNext = new Date(endDate);
        endNext.setDate(endNext.getDate() + 1);
        const endISO = new Date(endNext.setHours(0, 0, 0, 0)).toISOString();
        query = query.lt('created_at', endISO);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) {
        toast({
          title: "⚠️ Sem dados",
          description: "Não há dados para exportar no período selecionado",
          variant: "destructive",
        });
        return;
      }

      // Definir colunas para exportação
      const columns: ExportColumn[] = [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { 
          key: 'phone', 
          label: 'Telefone',
          format: formatPhoneForExport
        },
        { key: 'tag', label: 'Tag/Estágio' },
        { key: 'analista', label: 'Analista' },
        { key: 'csat', label: 'CSAT' },
        { 
          key: 'valor_em_aberto', 
          label: 'Valor Pendente',
          format: formatCurrencyForExport
        },
        { 
          key: 'valor_recuperado_ia', 
          label: 'Recuperado pela IA',
          format: formatCurrencyForExport
        },
        { 
          key: 'valor_recuperado_humano', 
          label: 'Recuperado pelo Agente',
          format: formatCurrencyForExport
        },
        { key: 'source', label: 'Origem' },
        { 
          key: 'started', 
          label: 'Data Início',
          format: formatDateForExport
        },
        { 
          key: 'data_transferencia', 
          label: 'Data Transferência',
          format: formatDateForExport
        },
        { 
          key: 'data_conclusao', 
          label: 'Data Conclusão',
          format: formatDateForExport
        },
        { key: 'tempo_primeira_resposta', label: 'Tempo 1ª Resposta' },
        { key: 'tempo_medio_resposta', label: 'Tempo Médio Resposta' },
        { key: 'followup_count', label: 'Qtd Follow-ups' },
        { key: 'status_followup', label: 'Status Follow-up' },
        { key: 'validation_status', label: 'Status Validação' },
        { key: 'payment_type', label: 'Tipo Pagamento' },
        { 
          key: 'created_at', 
          label: 'Data Criação',
          format: formatDateForExport
        },
      ];

      // Gerar nome do arquivo
      const dateStr = startDate && endDate
        ? `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`
        : new Date().toISOString().split('T')[0];
      
      const filename = `sieg_conversas_${dateStr}`;

      // Exportar
      if (format === 'csv') {
        exportToCSV(data, columns, filename);
      } else {
        exportToExcel(data, columns, filename, 'Conversas SIEG');
      }

      toast({
        title: "✅ Exportação concluída!",
        description: `Arquivo ${format.toUpperCase()} gerado com sucesso`,
      });

    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "❌ Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Exporta resumo de KPIs
   */
  const exportKPIs = async (
    kpis: any,
    tenantName: string,
    startDate?: Date,
    endDate?: Date,
    format: 'csv' | 'excel' = 'excel'
  ) => {
    setIsExporting(true);
    
    try {
      const data = [
        {
          metrica: 'Total de Leads',
          valor: kpis.totalLeads || 0
        },
        {
          metrica: 'Leads Qualificados',
          valor: kpis.qualifiedLeads || 0
        },
        {
          metrica: 'Taxa de Qualificação (%)',
          valor: (kpis.qualificationRate || 0).toFixed(2)
        },
        {
          metrica: 'Valores Pendentes',
          valor: formatCurrencyForExport(kpis.valorTotalPendente || 0)
        },
        {
          metrica: 'Recuperado pela IA',
          valor: formatCurrencyForExport(kpis.valorRecuperadoIA || 0)
        },
        {
          metrica: 'Recuperado pelo Agente',
          valor: formatCurrencyForExport(kpis.valorRecuperadoHumano || 0)
        },
        {
          metrica: 'Total Recuperado',
          valor: formatCurrencyForExport(kpis.valorTotalRecuperado || 0)
        }
      ];

      const columns: ExportColumn[] = [
        { key: 'metrica', label: 'Métrica' },
        { key: 'valor', label: 'Valor' }
      ];

      const dateStr = startDate && endDate
        ? `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`
        : new Date().toISOString().split('T')[0];
      
      const filename = `sieg_kpis_${dateStr}`;

      if (format === 'csv') {
        exportToCSV(data, columns, filename);
      } else {
        exportToExcel(data, columns, filename, 'KPIs SIEG');
      }

      toast({
        title: "✅ Exportação concluída!",
        description: `KPIs exportados em ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Erro ao exportar KPIs:', error);
      toast({
        title: "❌ Erro na exportação",
        description: "Não foi possível exportar os KPIs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportConversations,
    exportKPIs,
    isExporting
  };
}
