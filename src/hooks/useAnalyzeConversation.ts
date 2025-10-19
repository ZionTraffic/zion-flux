import { useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export function useAnalyzeConversation() {
  const { supabase } = useDatabase();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeConversation = async (
    conversationId: number,
    messages: any[],
    workspaceId: string
  ) => {
    setIsAnalyzing(true);
    
    try {
      logger.info('Starting conversation analysis', { conversationId });
      
      // Formatar e validar mensagens
      const formattedMessages = messages
        .filter(msg => msg?.content)
        .map(msg => ({
          role: msg.role || 'user',
          content: String(msg.content),
          timestamp: msg.timestamp
        }));

      if (formattedMessages.length === 0) {
        throw new Error('Nenhuma mensagem válida para analisar');
      }

      logger.info('Sending for analysis', {
        workspace_id: workspaceId,
        conversa_id: conversationId,
        total_mensagens: formattedMessages.length
      });

      // Usar o método invoke do Supabase client
      const { data, error } = await supabase.functions.invoke('analisar_fluxo_ia', {
        body: {
          workspace_id: workspaceId,
          conversa_id: conversationId,
          mensagens: formattedMessages
        }
      });

      if (error) {
        logger.error('Edge function error', error);
        throw new Error(error.message || 'Erro ao invocar função de análise');
      }

      logger.info('Analysis completed successfully', data);

      toast({
        title: '✅ Análise concluída!',
        description: 'A conversa foi analisada com sucesso pela IA.',
      });

      return data;
    } catch (error) {
      logger.error('Analysis failed', error);
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
