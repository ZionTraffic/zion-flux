import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";

interface QualificacaoPDFProps {
  kpis: {
    totalLeads: number;
    qualificationRate: number;
    qualifiedLeads: number;
  };
  charts: {
    dailyLeads: Array<{ day: string; value: number }>;
    stageDistribution: Array<{ name: string; value: number }>;
    dailyQualified: Array<{ day: string; value: number }>;
    funnelData: Array<{ id: string; label: string; value: number }>;
  };
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
  logo: {
    width: 120,
    height: 40,
    marginBottom: 15,
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
    gap: 15,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1 solid #e5e7eb",
  },
  kpiLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
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
    fontSize: 10,
    color: "#374151",
  },
  tableCellHeader: {
    fontSize: 10,
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

export const QualificacaoPDF = ({
  kpis,
  charts,
  dateRange,
  workspaceName,
}: QualificacaoPDFProps) => {
  const formatDate = (date?: Date) => {
    return date ? format(date, "dd/MM/yyyy") : "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Qualificação de Leads</Text>
          <Text style={styles.subtitle}>Workspace: {workspaceName || "Não especificado"}</Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(dateRange?.from)} - {formatDate(dateRange?.to)}
          </Text>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Indicadores Principais</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total de Leads</Text>
              <Text style={styles.kpiValue}>{kpis.totalLeads}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Taxa de Qualificação</Text>
              <Text style={styles.kpiValue}>{kpis.qualificationRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Qualificados</Text>
              <Text style={styles.kpiValue}>{kpis.qualifiedLeads}</Text>
            </View>
          </View>
        </View>

        {/* Daily Leads Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Novos Leads por Dia</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 1 }]}>Data</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Quantidade</Text>
            </View>
            {charts.dailyLeads.slice(-10).map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {item.day}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stage Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Distribuição por Estágio</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Estágio</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Leads</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>%</Text>
            </View>
            {charts.stageDistribution.map((item, index) => {
              const total = charts.stageDistribution.reduce((sum, s) => sum + s.value, 0);
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{item.value}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Funnel Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Funil de Conversão</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { flex: 2 }]}>Estágio</Text>
              <Text style={[styles.tableCellHeader, { flex: 1, textAlign: "right" }]}>Leads</Text>
            </View>
            {charts.funnelData.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.label}</Text>
                <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{item.value}</Text>
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
