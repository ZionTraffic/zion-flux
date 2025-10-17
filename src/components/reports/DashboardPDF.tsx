import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

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
    marginBottom: 30,
    borderBottom: '2pt solid #3B82F6',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    borderBottom: '1pt solid #E2E8F0',
    paddingBottom: 6,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  kpiCard: {
    width: '23%',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    border: '1pt solid #E2E8F0',
  },
  kpiLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 18,
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
    color: '#FFFFFF',
    fontWeight: 'bold',
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
    return date ? format(date, 'dd/MM/yyyy') : 'N/A';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Dashboard Executivo - Zion Analytics</Text>
          <Text style={styles.subtitle}>Workspace: {workspaceName || 'N/A'}</Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </Text>
          <Text style={styles.subtitle}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </Text>
        </View>

        {/* KPIs Principais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Métricas Principais</Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>🎯</Text>
              <Text style={styles.kpiLabel}>Leads Gerados</Text>
              <Text style={styles.kpiValue}>{(leads?.totalLeads || 0).toLocaleString('pt-BR')}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>💬</Text>
              <Text style={styles.kpiLabel}>Mensagens Iniciadas</Text>
              <Text style={styles.kpiValue}>
                {(metaAds?.conversas_iniciadas || 0).toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>💎</Text>
              <Text style={styles.kpiLabel}>Leads Qualificados</Text>
              <Text style={styles.kpiValue}>
                {(leads?.qualifiedLeads || 0).toLocaleString('pt-BR')}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>💰</Text>
              <Text style={styles.kpiLabel}>Total Investido</Text>
              <Text style={styles.kpiValue}>
                R$ {(advancedMetrics?.totalInvested || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Resumo do Período */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumo do Período</Text>
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

        {/* Insights Estratégicos */}
        {alerts && alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Insights Estratégicos</Text>
            {alerts.slice(0, 5).map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <Text style={styles.alertText}>
                  {alert.type === 'success' ? '✅' : alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Top 3 Campanhas */}
        {topCampaigns && topCampaigns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top 3 Campanhas</Text>
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
        {/* Tráfego vs Leads (últimos 7 dias) */}
        {trafficLeadsChart && trafficLeadsChart.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Tráfego vs Leads (Últimos 7 Dias)</Text>
            <View style={styles.chartTable}>
              {trafficLeadsChart.slice(-7).map((item, index) => (
                <View key={index} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>
                    {format(new Date(item.date), 'dd/MM')}
                  </Text>
                  <View style={{ flexDirection: 'row', flex: 1, gap: 4 }}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          width: `${(item.traffic / Math.max(...trafficLeadsChart.map(d => d.traffic))) * 100}%`,
                          backgroundColor: '#00d4ff',
                        },
                      ]}
                    >
                      <Text style={styles.chartValue}>{item.traffic}</Text>
                    </View>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          width: `${(item.leads / Math.max(...trafficLeadsChart.map(d => d.leads))) * 100}%`,
                          backgroundColor: '#ff1493',
                        },
                      ]}
                    >
                      <Text style={styles.chartValue}>{item.leads}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Distribuição por Fonte */}
        {leadsSourceDistribution && leadsSourceDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Leads por Fonte de Campanha</Text>
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
            <Text style={styles.sectionTitle}>📋 Resumo Completo de Campanhas</Text>
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

        {/* Footer */}
        <Text style={styles.footer}>
          Zion Analytics © 2025 - Dashboard Premium | Relatório gerado automaticamente
        </Text>
      </Page>
    </Document>
  );
};
