import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TagMapping {
  external_tag: string;
  internal_stage: string;
  display_label: string;
  description: string | null;
  display_order: number;
}

export function useTagMappings(tenantId: string | null) {
  const [mappings, setMappings] = useState<TagMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const fetchMappings = async () => {
      try {
        setLoading(true);
        
        // Usar query direta sem tipagem (tabela não está nos tipos gerados)
        const { data, error: fetchError } = await (supabase as any)
          .from('tenant_tag_mappings')
          .select('external_tag, internal_stage, display_label, description, display_order')
          .eq('tenant_id', tenantId)
          .eq('active', true)
          .order('display_order');

        if (fetchError) throw fetchError;

        setMappings((data || []) as TagMapping[]);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar mapeamentos de tags:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, [tenantId]);

  /**
   * Converte tag externa (do webhook) para stage interno
   */
  const getStageFromTag = (externalTag: string): string => {
    if (!externalTag) return 'novo_lead';
    
    const mapping = mappings.find(
      m => m.external_tag.toLowerCase() === externalTag.toLowerCase()
    );
    
    return mapping?.internal_stage || 'novo_lead';
  };

  /**
   * Retorna o label de exibição para uma tag externa
   */
  const getDisplayLabel = (externalTag: string): string => {
    if (!externalTag) return 'Novo Lead';
    
    const mapping = mappings.find(
      m => m.external_tag.toLowerCase() === externalTag.toLowerCase()
    );
    
    return mapping?.display_label || externalTag;
  };

  /**
   * Retorna a descrição de uma tag
   */
  const getDescription = (externalTag: string): string | null => {
    const mapping = mappings.find(
      m => m.external_tag.toLowerCase() === externalTag.toLowerCase()
    );
    
    return mapping?.description || null;
  };

  /**
   * Retorna todas as tags agrupadas por stage
   */
  const getTagsByStage = (stage: string): TagMapping[] => {
    return mappings.filter(m => m.internal_stage === stage);
  };

  /**
   * Retorna lista de stages únicos configurados
   */
  const getUniqueStages = (): string[] => {
    const stages = [...new Set(mappings.map(m => m.internal_stage))];
    return stages.sort((a, b) => {
      const orderA = mappings.find(m => m.internal_stage === a)?.display_order || 0;
      const orderB = mappings.find(m => m.internal_stage === b)?.display_order || 0;
      return orderA - orderB;
    });
  };

  return {
    mappings,
    loading,
    error,
    getStageFromTag,
    getDisplayLabel,
    getDescription,
    getTagsByStage,
    getUniqueStages,
  };
}
