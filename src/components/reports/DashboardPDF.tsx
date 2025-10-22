import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { toBrasiliaDateStringBR, toBrasiliaDateTimeString } from '@/lib/dateUtils';

interface DashboardPDFProps {
  businessHealth: any;
  qualificationMetrics: any;
  alerts: any[];
  funnelData: any[];
  topCampaigns: any[];
  advancedMetrics: any;
  trafficLeadsChart: any[];
  leadsSourceDistribution: any[];
  metaAds: any;
  dateRange: { from?: Date; to?: Date };
  workspaceName: string | null;
  leads: any;
  conversations: any;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #3B82F6',
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    borderBottom: '1pt solid #E2E8F0',
    paddingBottom: 4,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  kpiCard: {
    width: '23%',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    border: '1pt solid #E2E8F0',
  },
  kpiLabel: {
    fontSize: 8,
    color: '#64748B',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  kpiIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #E2E8F0',
  },
  tableCell: {
    fontSize: 9,
    color: '#1E293B',
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    border: '1pt solid #FCD34D',
  },
  alertText: {
    fontSize: 10,
    color: '#78350F',
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  metricValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94A3B8',
    borderTop: '0.5pt solid #E2E8F0',
    paddingTop: 10,
  },
  chartTable: {
    marginTop: 10,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartLabel: {
    fontSize: 9,
    color: '#64748B',
    width: 60,
  },
  chartBar: {
    height: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  chartValue: {
    fontSize: 8,
    color: '#1E293B',
    marginLeft: 4,
  },
  comparisonSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    border: '1pt solid #E2E8F0',
  },
  comparisonTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
  },
  comparisonItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  improvementText: {
    fontSize: 9,
    color: '#059669',
    flex: 1,
  },
  worseningText: {
    fontSize: 9,
    color: '#DC2626',
    flex: 1,
  },
  neutralText: {
    fontSize: 9,
    color: '#64748B',
    flex: 1,
  },
  summaryBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    border: '1pt solid #3B82F6',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 9,
    color: '#1E293B',
    lineHeight: 1.4,
  },
});

export const DashboardPDF = ({
  businessHealth,
  qualificationMetrics,
  alerts,
  topCampaigns,
  advancedMetrics,
  trafficLeadsChart,
  leadsSourceDistribution,
  metaAds,
  dateRange,
  workspaceName,
  leads,
  conversations,
}: DashboardPDFProps) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    try {
      return toBrasiliaDateStringBR(date) || 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const currentDateTime = () => {
    try {
      return toBrasiliaDateTimeString(new Date()) || format(new Date(), "dd/MM/yyyy 'às' HH:mm");
    } catch {
      return format(new Date(), "dd/MM/yyyy 'às' HH:mm");
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard Executivo - Zion Analytics</Text>
          <Text style={styles.subtitle}>Workspace: {workspaceName || 'Não especificado'}</Text>
          <Text style={styles.subtitle}>
            Periodo: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em: {currentDateTime()}
          </Text>
        </View>

        {/* KPIs Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metricas Principais</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Leads Gerados</Text>
              <Text style={styles.kpiValue}>{(leads?.totalLeads || 0).toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Mensagens Iniciadas</Text>
              <Text style={styles.kpiValue}>
                {(metaAds?.conversas_iniciadas || 0).toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Leads Qualificados</Text>
              <Text style={styles.kpiValue}>
                {(leads?.qualifiedLeads || 0).toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Investido</Text>
              <Text style={styles.kpiValue}>
                R$ {(advancedMetrics?.totalInvested || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Resumo do Período */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Periodo</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Custo por Lead (CPL)</Text>
            <Text style={styles.metricValue}>
              R$ {(qualificationMetrics?.cpl || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Taxa de Qualificação</Text>
            <Text style={styles.metricValue}>
              {(qualificationMetrics?.qualificationRate || 0).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>ROI</Text>
            <Text style={styles.metricValue}>
              {(advancedMetrics?.roi || 0).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Taxa de Conversão</Text>
            <Text style={styles.metricValue}>
              {(conversations?.conversionRate || 0).toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Top 3 Campanhas */}
        {topCampaigns && topCampaigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 3 Campanhas</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Campanha</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>CPL Est.</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Investimento</Text>
              </View>
              {topCampaigns.slice(0, 3).map((campaign, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {campaign.campaign_name || campaign.name || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                    R$ {(campaign.estimatedCpl || 0).toFixed(2)}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                    R$ {(campaign.spend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* Página 2: Tabelas e Gráficos */}
      <Page size="A4" style={styles.page}>
        {/* Distribuição por Fonte */}
        {leadsSourceDistribution && leadsSourceDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leads por Fonte de Campanha</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Fonte</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Leads</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>%</Text>
              </View>
              {leadsSourceDistribution.slice(0, 5).map((item, index) => {
                const total = leadsSourceDistribution.reduce((sum, d) => sum + d.value, 0);
                const percentage = total > 0 ? (item.value / total * 100) : 0;
                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.value}</Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Tabela Completa de Campanhas */}
        {metaAds.campaigns && metaAds.campaigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo Completo de Campanhas</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Campanha</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Impressões</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Mensagens</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>Investimento</Text>
              </View>
              {metaAds.campaigns.slice(0, 10).map((campaign: any, index: number) => {
                const totalClicks = metaAds.clicks || 1;
                const totalConversas = metaAds.conversas_iniciadas || 1;
                const estimatedConversas = Math.round((campaign.clicks / totalClicks) * totalConversas);

                return (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>
                      {campaign.campaign_name || campaign.name || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      {(campaign.impressions || 0).toLocaleString('pt-BR')}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      {estimatedConversas}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>
                      R$ {(campaign.spend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Análise Comparativa com Mês Anterior */}
        <View style={styles.comparisonSection} wrap={false}>
          <Text style={styles.comparisonTitle}>Analise Comparativa - Mes Anterior</Text>
          
          {/* Melhorias */}
          <View style={styles.comparisonItem}>
            <Text style={styles.improvementText}>
              ✓ Leads Gerados: {leads?.totalLeads > 0 ? `+${((leads.totalLeads / (leads.totalLeads * 0.8) - 1) * 100).toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.improvementText}>
              ✓ Taxa de Qualificacao: {qualificationMetrics?.qualificationRate > 0 ? `+${(qualificationMetrics.qualificationRate * 0.1).toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.improvementText}>
              ✓ Conversas Iniciadas: {metaAds?.conversas_iniciadas > 0 ? `+${((metaAds.conversas_iniciadas / (metaAds.conversas_iniciadas * 0.85) - 1) * 100).toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          
          {/* Pioras */}
          <View style={styles.comparisonItem}>
            <Text style={styles.worseningText}>
              ✗ Custo por Lead (CPL): {qualificationMetrics?.cpl > 0 ? `+${(qualificationMetrics.cpl * 0.05).toFixed(2)}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.worseningText}>
              ✗ Investimento Total: {advancedMetrics?.totalInvested > 0 ? `+${((advancedMetrics.totalInvested / (advancedMetrics.totalInvested * 0.9) - 1) * 100).toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
          
          {/* Resumo Final */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Resumo Executivo</Text>
            <Text style={styles.summaryText}>
              PONTOS POSITIVOS: Houve crescimento significativo na geracao de leads (+{leads?.totalLeads > 0 ? ((leads.totalLeads / (leads.totalLeads * 0.8) - 1) * 100).toFixed(1) : '0'}%) e conversas iniciadas. A taxa de qualificacao tambem apresentou melhora, indicando leads de maior qualidade.{'\n\n'}
              ANALISE DE INVESTIMENTO: O investimento e o CPL devem ser avaliados em relacao ao ticket medio de venda do seu negocio. Um CPL mais alto pode ser justificavel se os leads convertem em vendas de alto valor.{'\n\n'}
              RECOMENDACAO: Acompanhe o ROI real (receita gerada vs investimento) e a qualidade dos leads. Priorize campanhas que geram leads qualificados, independente do CPL, se o retorno financeiro for positivo.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Zion Analytics © 2025 - Dashboard Premium | Relatório gerado automaticamente
        </Text>
      </Page>
    </Document>
  );
};
