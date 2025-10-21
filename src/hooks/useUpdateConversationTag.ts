import { useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

const VALID_TAGS = [
  'T1 - NOVO LEAD',
  'T2 - QUALIFICANDO',
  'T3 - QUALIFICADO',
  'T4 - FOLLOW-UP',
  'T5 - DESQUALIFICADO'
] as const;

export const useUpdateConversationTag = () => {
  const { supabase } = useDatabase();
  const [isUpdating, setIsUpdating] = useState(false);

  // workspaceId é opcional para manter compatibilidade
  const updateTag = async (conversationId: number, newTag: string, workspaceId?: string) => {
    if (!VALID_TAGS.includes(newTag as any)) {
      toast({
        title: "Erro",
        description: "Tag inválida selecionada",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsUpdating(true);
    
    try {
      // Descobrir tabela por workspace quando fornecido
      let tableName: string = 'historico_conversas';
      if (workspaceId) {
        const { data: ws } = await supabase
          .from('workspaces')
          .select('slug')
          .eq('id', workspaceId)
          .maybeSingle();
        tableName = ws?.slug === 'asf' ? 'conversas_asf' : ws?.slug === 'sieg' ? 'conversas_sieg_financeiro' : 'historico_conversas';
      }

      const { error } = await (supabase.from as any)(tableName)
        .update({ tag: newTag })
        .eq('id', conversationId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tag atualizada com sucesso!",
      });

      return { success: true };
    } catch (error) {
      logger.error('Error updating tag', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tag",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateTag, isUpdating };
};
