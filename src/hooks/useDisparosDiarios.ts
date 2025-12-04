import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface DisparoDiario {
  data: string;
  quantidade: number;
  dataFormatada: string;
}

interface UseDisparosDiariosReturn {
  disparos: DisparoDiario[];
  total: number;
  media: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDisparosDiarios = (
  _tenantId?: string,
  dateFrom?: Date,
  dateTo?: Date
): UseDisparosDiariosReturn => {
  const { currentTenant } = useTenant();
  const [disparos, setDisparos] = useState<DisparoDiario[]>([]);
  const [total, setTotal] = useState(0);
  const [media, setMedia] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = _tenantId || currentTenant?.id;

  const fetchDisparos = useCallback(async () => {
    if (!tenantId) {
      setDisparos([]);
      setTotal(0);
      setMedia(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Definir período
      const endDate = dateTo || new Date();
      const startDate = dateFrom || subDays(endDate, 30);

      console.log('📊 [Disparos] Buscando de', format(startDate, 'dd/MM'), 'até', format(endDate, 'dd/MM'));

      // Buscar disparos do banco
      const { data, error: queryError } = await (supabase as any)
        .from('disparos')
        .select('enviado_em')
        .eq('empresa_id', tenantId)
        .gte('enviado_em', startDate.toISOString())
        .lte('enviado_em', endDate.toISOString())
        .order('enviado_em', { ascending: true });

      if (queryError) {
        console.error('❌ [Disparos] Erro:', queryError);
        // Se tabela não existe ou está vazia, retornar vazio sem erro
        if (queryError.code === '42P01' || queryError.message?.includes('does not exist')) {
          setDisparos([]);
          setTotal(0);
          setMedia(0);
          return;
        }
        setError('Erro ao carregar disparos');
        return;
      }

      // Agrupar por dia
      const porDia: Record<string, number> = {};
      
      (data || []).forEach((d: any) => {
        if (d.enviado_em) {
          const dia = format(new Date(d.enviado_em), 'yyyy-MM-dd');
          porDia[dia] = (porDia[dia] || 0) + 1;
        }
      });

      // Converter para array
      const disparosArray: DisparoDiario[] = Object.entries(porDia).map(([data, quantidade]) => ({
        data,
        quantidade,
        dataFormatada: format(new Date(data), 'dd/MM', { locale: ptBR }),
      }));

      // Ordenar por data
      disparosArray.sort((a, b) => a.data.localeCompare(b.data));

      // Calcular totais
      const totalDisparos = disparosArray.reduce((acc, d) => acc + d.quantidade, 0);
      const mediaDisparos = disparosArray.length > 0 ? totalDisparos / disparosArray.length : 0;

      console.log('✅ [Disparos] Total:', totalDisparos, '| Dias:', disparosArray.length);

      setDisparos(disparosArray);
      setTotal(totalDisparos);
      setMedia(Math.round(mediaDisparos));
    } catch (err) {
      console.error('❌ [Disparos] Erro inesperado:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, dateFrom, dateTo]);

  useEffect(() => {
    fetchDisparos();
  }, [fetchDisparos]);

  return { disparos, total, media, isLoading, error, refetch: fetchDisparos };
};
