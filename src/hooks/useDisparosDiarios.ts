import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
}

export const useDisparosDiarios = (
  _tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
): UseDisparosDiariosReturn => {
  const [disparos, setDisparos] = useState<DisparoDiario[]>([]);
  const [total, setTotal] = useState(0);
  const [media, setMedia] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisparos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Usar período fornecido ou padrão (últimos 30 dias)
        const endDate = dateTo || new Date();
        const startDate = dateFrom || subDays(endDate, 30);

        // Gerar dados para cada dia do período
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        
        const disparosArray: DisparoDiario[] = days.map((day) => {
          // Gerar quantidade aleatória entre 15 e 45 disparos por dia
          const quantidade = Math.floor(Math.random() * 31) + 15;
          
          return {
            data: format(day, 'yyyy-MM-dd'),
            quantidade,
            dataFormatada: format(day, 'dd/MM', { locale: ptBR }),
          };
        });

        // Calcular totais
        const totalDisparos = disparosArray.reduce((acc, d) => acc + d.quantidade, 0);
        const mediaDisparos = disparosArray.length > 0 ? totalDisparos / disparosArray.length : 0;

        setDisparos(disparosArray);
        setTotal(totalDisparos);
        setMedia(Math.round(mediaDisparos));
      } catch (err) {
        console.error('Erro ao buscar disparos diários:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisparos();
  }, [dateFrom, dateTo]);

  return { disparos, total, media, isLoading, error };
};
