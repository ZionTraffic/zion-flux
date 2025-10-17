import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

interface TrafegoPDFProps {
  totals: {
    impressions: number;
    spend: number;
    cpc: number;
    conversas_iniciadas: number;
    ctr: number;
    clicks: number;
  };
  daily: Array<{
    date: string;
    impressions: number;
    spend: number;
    conversas_iniciadas: number;
  }>;
  campaigns: Array<{
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    funnelStage: 'topo' | 'meio' | 'fundo';
  }>;
  dateRange?: { from?: Date; to?: Date };
  workspaceName?: string | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #e5e7eb",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    borderLeft: "4 solid #3b82f6",
    paddingLeft: 8,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  kpiCard: {
    width: "31%",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1 solid #e5e7eb",
  },
  kpiLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  tableCell: {
    fontSize: 9,
    color: "#374151",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
    borderTop: "1 solid #e5e7eb",
    paddingTop: 10,
  },
});

export const TrafegoPDF = ({
  totals,
  daily,
  campaigns,
  dateRange,
  workspaceName,
}: TrafegoPDFProps) => {
  const formatDate = (date?: Date) => {
    return date ? format(date, "dd/MM/yyyy") : "N/A";
  };

  const cpcConversa = totals.conversas_iniciadas > 0 
    ? totals.spend / totals.conversas_iniciadas 
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Tráfego - Meta Ads</Text>
          <Text style={styles.subtitle}>Workspace: {workspaceName || "Não especificado"}</Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(dateRange?.from)} - {formatDate(dateRange?.to)}
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Métricas Principais</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Impressões</Text>
              <Text style={styles.kpiValue}>{totals.impressions.toLocaleString("pt-BR")}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Investimento</Text>
              <Text style={styles.kpiValue}>R$ {totals.spend.toFixed(2)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>CPC Médio</Text>
              <Text style={styles.kpiValue}>R$ {totals.cpc.toFixed(2)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Custo por Conversa</Text>
              <Text style={styles.kpiValue}>R$ {cpcConversa.toFixed(2)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>CTR Médio</Text>
              <Text style={styles.kpiValue}>{totals.ctr.toFixed(2)}%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Conversas Iniciadas</Text>
              <Text style={styles.kpiValue}>{totals.conversas_iniciadas.toLocaleString("pt-BR")}</Text>
            </View>
          </View>
        </View>

        {/* Daily Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Desempenho Diário (Últimos 10 dias)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Data</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Impressões</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Gasto (R$)</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Conversas</Text>
            </View>
            {daily.slice(-10).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {format(new Date(item.date), "dd/MM/yyyy")}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.impressions.toLocaleString("pt-BR")}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.spend.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.conversas_iniciadas}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Campaigns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Principais Campanhas</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 3 }]}>Campanha</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Gasto (R$)</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Cliques</Text>
            </View>
            {campaigns.slice(0, 15).map((campaign, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{campaign.name}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {campaign.spend.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {campaign.clicks}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")} • Zion Analytics
        </Text>
      </Page>
    </Document>
  );
};
