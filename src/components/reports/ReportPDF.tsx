import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ReportData } from '@/hooks/useReportData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    padding: 8,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  kpiCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1 solid #e2e8f0',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderBottom: '1 solid #cbd5e1',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCell: {
    fontSize: 10,
    flex: 1,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    flex: 1,
    color: '#475569',
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 11,
    marginBottom: 6,
    color: '#334155',
    flexDirection: 'row',
  },
  bullet: {
    marginRight: 5,
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

interface ReportPDFProps {
  data: ReportData;
}

export function ReportPDF({ data }: ReportPDFProps) {
  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Performance</Text>
          <Text style={styles.subtitle}>Workspace: {data.workspace.name}</Text>
          <Text style={styles.subtitle}>
            Período: {format(new Date(data.period.from), 'dd/MM/yyyy')} até {format(new Date(data.period.to), 'dd/MM/yyyy')}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em: {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* KPIs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Leads Recebidos</Text>
              <Text style={styles.kpiValue}>{data.kpis.leadsRecebidos}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Leads Qualificados</Text>
              <Text style={styles.kpiValue}>{data.kpis.leadsQualificados}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Em Follow-up</Text>
              <Text style={styles.kpiValue}>{data.kpis.leadsFollowup}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Descartados</Text>
              <Text style={styles.kpiValue}>{data.kpis.leadsDescartados}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Investimento Total</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.kpis.investimento)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>CPL Médio</Text>
              <Text style={styles.kpiValue}>{formatCurrency(data.kpis.cpl)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Taxa de Conversão</Text>
              <Text style={styles.kpiValue}>{formatPercentage(data.kpis.taxaConversao)}</Text>
            </View>
          </View>
        </View>

        {/* Daily Performance Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempenho Diário</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellHeader}>Data</Text>
              <Text style={styles.tableCellHeader}>Leads</Text>
              <Text style={styles.tableCellHeader}>Investimento</Text>
              <Text style={styles.tableCellHeader}>CPL</Text>
            </View>
            {data.dailyData.slice(0, 10).map((day, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{day.day}</Text>
                <Text style={styles.tableCell}>{day.leads}</Text>
                <Text style={styles.tableCell}>{formatCurrency(day.investment)}</Text>
                <Text style={styles.tableCell}>{formatCurrency(day.cpl)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas de IA</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Índice de Satisfação</Text>
              <Text style={styles.kpiValue}>{formatPercentage(data.aiMetrics.satisfactionIndex)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tempo Médio de Resposta</Text>
              <Text style={styles.kpiValue}>{Math.round(data.aiMetrics.avgResponseTime)}s</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Conversas Treináveis</Text>
              <Text style={styles.kpiValue}>{data.aiMetrics.trainableCount}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Conversas Críticas</Text>
              <Text style={styles.kpiValue}>{data.aiMetrics.criticalConversations}</Text>
            </View>
          </View>
        </View>

        {/* Insights Section */}
        {data.insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights Detectados</Text>
            <View style={styles.list}>
              {data.insights.map((insight, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text>{insight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recommendations Section */}
        {data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Recomendadas</Text>
            <View style={styles.list}>
              {data.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Zion Analytics - Todos os direitos reservados</Text>
          <Text>Relatório gerado automaticamente pela plataforma Zion Analytics Premium</Text>
        </View>
      </Page>
    </Document>
  );
}
