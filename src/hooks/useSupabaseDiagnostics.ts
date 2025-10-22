import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DiagnosticsResult {
  status: "checking" | "ok" | "error";
  details: string;
  errorType?: "connection" | "rpc" | "tables" | "permissions" | "unknown";
}

export function useSupabaseDiagnostics() {
  const [result, setResult] = useState<DiagnosticsResult>({
    status: "checking",
    details: "Verificando conexão com o banco de dados...",
  });

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setResult({
          status: "checking",
          details: "🔍 Testando conexão básica...",
        });

        // 1️⃣ Teste básico de conexão - verifica se consegue acessar a tabela workspaces
        const { data: workspacesData, error: workspacesError } = await supabase
          .from("workspaces")
          .select("id")
          .limit(1);

        if (workspacesError) {
          throw {
            type: "connection",
            message: `Erro de conexão: ${workspacesError.message}`,
          };
        }

        setResult({
          status: "checking",
          details: "🔍 Verificando tabelas essenciais...",
        });

        // 2️⃣ Teste de tabelas essenciais
        const { error: kpiError } = await supabase
          .from("kpi_overview_daily")
          .select("workspace_id")
          .limit(1);

        if (kpiError) {
          throw {
            type: "tables",
            message: `Tabela 'kpi_overview_daily' não encontrada ou sem permissões.`,
          };
        }

        const { error: leadsError } = await supabase
          .from("leads")
          .select("id")
          .limit(1);

        if (leadsError) {
          throw {
            type: "tables",
            message: `Tabela 'leads' não encontrada ou sem permissões.`,
          };
        }

        setResult({
          status: "checking",
          details: "🔍 Testando função RPC...",
        });

        // 3️⃣ Teste da função RPC
        const testDate = new Date();
        const endDate = testDate.toISOString().split("T")[0];
        const startDate = new Date(testDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const { error: rpcError } = await supabase.rpc("kpi_totais_periodo", {
          p_workspace_id: "3f14bb25-0eda-4c58-8486-16b96dca6f9e",
          p_from: startDate,
          p_to: endDate,
        });

        if (rpcError) {
          if (rpcError.message.includes("function") || rpcError.message.includes("does not exist")) {
            throw {
              type: "rpc",
              message: `Função RPC 'kpi_totais_periodo' não encontrada no banco de dados.`,
            };
          }
          // Se não é erro de função não existir, pode ser permissão ou outro erro
          console.warn("RPC warning:", rpcError);
        }

        // ✅ Tudo OK!
        setResult({
          status: "ok",
          details: "✅ Conexão com banco de dados verificada com sucesso!",
        });
      } catch (err: any) {
        console.error("Database diagnostics error:", err);
        setResult({
          status: "error",
          details: err.message || "❌ Erro desconhecido ao verificar banco de dados",
          errorType: err.type || "unknown",
        });
      }
    }

    runDiagnostics();
  }, []);

  return result;
}
