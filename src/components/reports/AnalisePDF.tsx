import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

interface AnalisePDFProps {
  conversations: Array<{
    leadName: string;
    phone: string;
    product?: string;
    sentiment: string;
    tag?: string;
    status?: string;
    summary: string;
    duration: number;
    startedAt: Date;
  }>;
  stats: {
    totalConversations: number;
    conversionRate: number;
    averageDuration: number;
  };
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
  conversationCard: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1 solid #e5e7eb",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  conversationName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  conversationMeta: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  conversationSummary: {
    fontSize: 10,
    color: "#374151",
    marginTop: 6,
  },
  badge: {
    fontSize: 8,
    padding: "3 6",
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    color: "#374151",
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

export const AnalisePDF = ({
  conversations,
  stats,
  workspaceName,
}: AnalisePDFProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const sentimentLabel = (sentiment: string) => {
    if (sentiment === "positive") return "Positivo";
    if (sentiment === "neutral") return "";
    return "Negativo";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Análise de Conversas</Text>
          <Text style={styles.subtitle}>Workspace: {workspaceName || "Não especificado"}</Text>
          <Text style={styles.subtitle}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </Text>
        </View>

        {/* Stats KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estatísticas Gerais</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total de Conversas</Text>
              <Text style={styles.kpiValue}>{stats.totalConversations}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Taxa de Conversão</Text>
              <Text style={styles.kpiValue}>{stats.conversionRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tempo Médio</Text>
              <Text style={styles.kpiValue}>{formatDuration(stats.averageDuration)}</Text>
            </View>
          </View>
        </View>

        {/* Conversations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Conversas Analisadas (Top 20)</Text>
          {conversations.slice(0, 20).map((conv, index) => (
            <View key={index} style={styles.conversationCard}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName}>{conv.leadName}</Text>
                <Text style={styles.badge}>{sentimentLabel(conv.sentiment)}</Text>
              </View>
              <Text style={styles.conversationMeta}>
                {conv.product || "Sem produto"} • {conv.phone}
              </Text>
              <Text style={styles.conversationMeta}>
                {format(conv.startedAt, "dd/MM/yyyy HH:mm")} • Duração: {formatDuration(conv.duration)}
              </Text>
              <Text style={styles.conversationMeta}>
                Status: {conv.tag || conv.status || "N/A"}
              </Text>
              <Text style={styles.conversationSummary}>{conv.summary}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")} • Zion Analytics
        </Text>
      </Page>
    </Document>
  );
};
