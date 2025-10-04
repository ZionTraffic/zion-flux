import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConnectionTestResult {
  rpcTest: {
    success: boolean;
    responseTime: number;
    rowCount: number;
    data: any;
    error?: string;
  };
  viewTest: {
    success: boolean;
    responseTime: number;
    rowCount: number;
    data: any;
    error?: string;
  };
  functionExists: boolean;
  dataDisplayed: boolean;
}

export function useSupabaseConnectionTest(workspaceId: string) {
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(true);

  useEffect(() => {
    async function runConnectionTest() {
      console.log('🔍 Iniciando teste de conexão Supabase...');
      console.log('📍 Workspace ID:', workspaceId);
      
      const result: ConnectionTestResult = {
        rpcTest: {
          success: false,
          responseTime: 0,
          rowCount: 0,
          data: null,
        },
        viewTest: {
          success: false,
          responseTime: 0,
          rowCount: 0,
          data: null,
        },
        functionExists: false,
        dataDisplayed: false,
      };

      // Teste 1: RPC kpi_totais_periodo
      console.log('\n📊 Teste 1: Executando kpi_totais_periodo...');
      const rpcStartTime = performance.now();
      
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { data: rpcData, error: rpcError } = await supabase.rpc('kpi_totais_periodo', {
          p_workspace_id: workspaceId,
          p_from: startDate.toISOString().split('T')[0],
          p_to: endDate.toISOString().split('T')[0],
        });

        const rpcEndTime = performance.now();
        result.rpcTest.responseTime = rpcEndTime - rpcStartTime;

        if (rpcError) {
          result.rpcTest.error = rpcError.message;
          result.functionExists = false;
          console.error('❌ Erro na RPC:', rpcError.message);
        } else {
          result.rpcTest.success = true;
          result.rpcTest.data = rpcData;
          result.rpcTest.rowCount = Array.isArray(rpcData) ? rpcData.length : (rpcData ? 1 : 0);
          result.functionExists = true;
          
          console.log('✅ RPC executada com sucesso!');
          console.log('⏱️  Tempo de resposta:', result.rpcTest.responseTime.toFixed(2), 'ms');
          console.log('📈 Linhas retornadas:', result.rpcTest.rowCount);
          console.log('📦 Dados:', rpcData);
        }
      } catch (error: any) {
        result.rpcTest.error = error.message;
        console.error('❌ Erro ao executar RPC:', error);
      }

      // Teste 2: View kpi_overview_daily
      console.log('\n📊 Teste 2: Executando query na view kpi_overview_daily...');
      const viewStartTime = performance.now();
      
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { data: viewData, error: viewError } = await supabase
          .from('kpi_overview_daily')
          .select('day, leads_recebidos, leads_qualificados, leads_followup, leads_descartados, investimento, cpl')
          .eq('workspace_id', workspaceId)
          .gte('day', startDate.toISOString())
          .order('day', { ascending: true });

        const viewEndTime = performance.now();
        result.viewTest.responseTime = viewEndTime - viewStartTime;

        if (viewError) {
          result.viewTest.error = viewError.message;
          console.error('❌ Erro na view:', viewError.message);
        } else {
          result.viewTest.success = true;
          result.viewTest.data = viewData;
          result.viewTest.rowCount = viewData?.length || 0;
          
          console.log('✅ Query na view executada com sucesso!');
          console.log('⏱️  Tempo de resposta:', result.viewTest.responseTime.toFixed(2), 'ms');
          console.log('📈 Linhas retornadas:', result.viewTest.rowCount);
          console.log('📦 Dados:', viewData);
        }
      } catch (error: any) {
        result.viewTest.error = error.message;
        console.error('❌ Erro ao executar query na view:', error);
      }

      // Verificar se há dados para exibir
      result.dataDisplayed = (result.rpcTest.rowCount > 0 || result.viewTest.rowCount > 0);

      // Resumo do teste
      console.log('\n📋 RESUMO DO TESTE DE CONEXÃO:');
      console.log('─────────────────────────────────────────');
      console.log('✓ Função kpi_totais_periodo encontrada:', result.functionExists ? '✅ SIM' : '❌ NÃO');
      console.log('✓ Dados disponíveis para exibição:', result.dataDisplayed ? '✅ SIM' : '❌ NÃO');
      console.log('─────────────────────────────────────────');
      console.log('Teste RPC:');
      console.log('  - Status:', result.rpcTest.success ? '✅ Sucesso' : '❌ Falhou');
      console.log('  - Tempo:', result.rpcTest.responseTime.toFixed(2), 'ms');
      console.log('  - Linhas:', result.rpcTest.rowCount);
      if (result.rpcTest.error) console.log('  - Erro:', result.rpcTest.error);
      console.log('─────────────────────────────────────────');
      console.log('Teste View:');
      console.log('  - Status:', result.viewTest.success ? '✅ Sucesso' : '❌ Falhou');
      console.log('  - Tempo:', result.viewTest.responseTime.toFixed(2), 'ms');
      console.log('  - Linhas:', result.viewTest.rowCount);
      if (result.viewTest.error) console.log('  - Erro:', result.viewTest.error);
      console.log('─────────────────────────────────────────\n');

      setTestResult(result);
      setTesting(false);
    }

    runConnectionTest();
  }, [workspaceId]);

  return { testResult, testing };
}
