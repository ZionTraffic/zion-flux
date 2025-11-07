import { useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useTenant } from '@/contexts/TenantContext';
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
  const { currentTenant } = useTenant();
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
      // Usar workspace atual se não fornecido
      const wsId = workspaceId || currentTenant?.id || null;
      const tenantSlug =
        wsId && wsId === currentTenant?.id
          ? currentTenant?.slug
          : currentTenant?.slug;

      // Descobrir tabela por workspace
      let tableName: string = 'historico_conversas';
      if (wsId) {
        tableName = tenantSlug === 'asf'
          ? 'conversas_asf'
          : tenantSlug === 'sieg'
            ? 'conversas_sieg_financeiro'
            : 'historico_conversas';
        logger.info('Updating tag', { tableName, conversationId, newTag, tenantId: wsId, slug: tenantSlug });
      }

      // Verificar se o registro existe antes de atualizar
      const { data: existingRecord, error: checkError } = await (supabase.from as any)(tableName)
        .select('id, tag')
        .eq('id', conversationId)
        .maybeSingle();
      
      if (checkError) {
        logger.error('Error checking if record exists', { checkError, tableName, conversationId });
        throw new Error('Erro ao verificar registro');
      }
      
      if (!existingRecord) {
        logger.error('Record not found', { tableName, conversationId });
        throw new Error(`Registro com ID ${conversationId} não encontrado na tabela ${tableName}`);
      }
      
      logger.info('Record found, current tag:', { existingRecord });

      // Tentar atualizar usando RPC (função do Supabase) para contornar RLS
      try {
        const { error: rpcError, data: rpcData } = await supabase.rpc('update_conversation_tag', {
          p_table_name: tableName,
          p_conversation_id: conversationId,
          p_new_tag: newTag
        });

        if (!rpcError && rpcData) {
          logger.info('Tag updated via RPC successfully', { rpcData });
          toast({
            title: "Sucesso",
            description: "Tag atualizada com sucesso!",
          });
          return { success: true };
        }
        
        logger.warn('RPC not available, falling back to direct update', { rpcError });
      } catch (rpcErr) {
        logger.warn('RPC failed, trying direct update', { rpcErr });
      }

      // Fallback: tentar update direto
      const { error, data } = await (supabase.from as any)(tableName)
        .update({ tag: newTag })
        .eq('id', conversationId)
        .select();

      if (error) {
        logger.error('Error updating tag in database', { 
          error, 
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          tableName, 
          conversationId, 
          newTag 
        });
        
        // Mensagem mais clara sobre permissões
        if (error.message?.includes('permission') || error.code === '42501') {
          throw new Error('Sem permissão para atualizar tags. Contate o administrador.');
        }
        
        throw error;
      }
      
      if (!data || data.length === 0) {
        logger.error('No rows updated - RLS policy blocking', { tableName, conversationId, newTag });
        throw new Error('Política de segurança (RLS) bloqueou a atualização. Contate o administrador para ajustar as permissões.');
      }
      
      logger.info('Tag updated successfully', { data, rowsUpdated: data.length });

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
