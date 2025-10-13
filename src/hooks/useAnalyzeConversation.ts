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

      console.log('📤 Enviando para análise:', {
        workspace_id: workspaceId,
        conversa_id: conversationId,
        total_mensagens: formattedMessages.length
      });

      // Obter o token de autenticação atual
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Fazer chamada HTTP direta para a edge function
      const response = await fetch(
        'https://wrebkgazdlyjenbpexnc.supabase.co/functions/v1/analisar_fluxo_ia',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
          },
          body: JSON.stringify({
            workspace_id: workspaceId,
            conversa_id: conversationId,
            mensagens: formattedMessages
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

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
