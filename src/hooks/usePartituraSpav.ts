import { useState, useEffect } from 'react';

interface PartituraSpavData {
  leadsRetornaram: number;
  valorRecuperado: number;
  valorPendente: number;
  percentualAvanco: number;
  metaDiaria: number;
}

interface UsePartituraSpavReturn {
  data: PartituraSpavData;
  isLoading: boolean;
  error: string | null;
}

export const usePartituraSpav = (
  _tenantId: string,
  _dateFrom?: Date,
  _dateTo?: Date
): UsePartituraSpavReturn => {
  const [data, setData] = useState<PartituraSpavData>({
    leadsRetornaram: 0,
    valorRecuperado: 0,
    valorPendente: 0,
    percentualAvanco: 0,
    metaDiaria: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dados mock para demonstração
        const leadsRetornaram = Math.floor(Math.random() * 50) + 20;
        const valorRecuperado = Math.floor(Math.random() * 15000) + 5000;
        const valorPendente = Math.floor(Math.random() * 50000) + 20000;
        const metaDiaria = 25000;
        const percentualAvanco = Math.round((valorRecuperado / metaDiaria) * 100);

        setData({
          leadsRetornaram,
          valorRecuperado,
          valorPendente,
          percentualAvanco,
          metaDiaria,
        });
      } catch (err) {
        console.error('Erro ao buscar dados SPAV:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [_tenantId, _dateFrom, _dateTo]);

  return { data, isLoading, error };
};
