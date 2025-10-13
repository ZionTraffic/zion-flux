import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAnalyzeConversation() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeConversation = async (
    conversationId: number,
    messages: any[],
    workspaceId: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      console.log('🚀 Iniciando análise da conversa:', conversationId);
      
      const { data, error } = await supabase.functions.invoke('analisar_fluxo_ia', {
        body: {
          workspace_id: workspaceId,
          conversa_id: conversationId,
          mensagens: messages
        }
      });

      if (error) {
        console.error('❌ Erro ao analisar conversa:', error);
        throw error;
      }

      console.log('✅ Análise concluída:', data);

      toast({
        title: '✅ Análise concluída!',
        description: 'A conversa foi analisada com sucesso pela IA.',
      });

      return data;
    } catch (error) {
      console.error('❌ Erro na análise:', error);
      toast({
        title: '❌ Erro na análise',
        description: error instanceof Error ? error.message : 'Não foi possível analisar a conversa.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzeConversation, isAnalyzing };
}
