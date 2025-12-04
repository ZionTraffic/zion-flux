import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Clock, 
  ArrowRight, 
  User, 
  Building2,
  Phone,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useJornadaLeads, type JornadaLead, type MetricasEstagio } from '@/hooks/useJornadaLeads';

const ITEMS_PER_PAGE = 25;

// Cores e ícones por estágio
const ESTAGIO_CONFIG: Record<string, { 
  cor: string; 
  bg: string; 
  label: string;
  descricao: string;
}> = {
  'T1': { 
    cor: 'text-red-600', 
    bg: 'bg-red-100 border-red-200', 
    label: 'T1 - Sem Resposta',
    descricao: 'Aguardando primeira resposta'
  },
  'T2': { 
    cor: 'text-blue-600', 
    bg: 'bg-blue-100 border-blue-200', 
    label: 'T2 - Respondido',
    descricao: 'Lead respondeu à IA'
  },
  'T3': { 
    cor: 'text-emerald-600', 
    bg: 'bg-emerald-100 border-emerald-200', 
    label: 'T3 - Pago IA',
    descricao: 'Pagamento confirmado via IA'
  },
  'T4': { 
    cor: 'text-amber-600', 
    bg: 'bg-amber-100 border-amber-200', 
    label: 'T4 - Transferido',
    descricao: 'Transferido para atendimento humano'
  },
  'T5': { 
    cor: 'text-purple-600', 
    bg: 'bg-purple-100 border-purple-200', 
    label: 'T5 - Suspensão',
    descricao: 'Passível de suspensão'
  },
};

function getEstagioConfig(estagio: string | null) {
  if (!estagio) return { cor: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: 'Indefinido', descricao: '' };
  return ESTAGIO_CONFIG[estagio] || { cor: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', label: estagio, descricao: '' };
}

function formatarData(dataStr: string): string {
  const data = new Date(dataStr);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatarTempo(segundos: number | null): string {
  if (!segundos || segundos === 0) return '-';
  if (segundos < 60) return `${Math.round(segundos)}s`;
  if (segundos < 3600) return `${Math.round(segundos / 60)}min`;
  if (segundos < 86400) return `${(segundos / 3600).toFixed(1)}h`;
  return `${(segundos / 86400).toFixed(1)} dias`;
}

// Componente de Timeline da Jornada
function JornadaTimeline({ jornada }: { jornada: JornadaLead }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {/* Header do Lead */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{jornada.nome}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{jornada.telefone}</span>
              {jornada.nome_empresa && (
                <>
                  <span>•</span>
                  <Building2 className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{jornada.nome_empresa}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Estágio Atual */}
          <Badge className={`${getEstagioConfig(jornada.historico[jornada.historico.length - 1]?.estagio_novo).bg} ${getEstagioConfig(jornada.historico[jornada.historico.length - 1]?.estagio_novo).cor} border`}>
            {getEstagioConfig(jornada.historico[jornada.historico.length - 1]?.estagio_novo).label}
          </Badge>
          
          {/* Etapas */}
          <span className="text-sm text-muted-foreground">
            {jornada.historico.length} etapa{jornada.historico.length !== 1 ? 's' : ''}
          </span>
          
          <ArrowRight className={`h-4 w-4 transition-transform ${expandido ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Timeline Expandida */}
      {expandido && (
        <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-4">
          {jornada.historico.map((etapa, index) => {
            const config = getEstagioConfig(etapa.estagio_novo);
            const isUltimo = index === jornada.historico.length - 1;
            
            return (
              <div key={etapa.id} className="relative">
                {/* Bolinha na timeline */}
                <div className={`absolute -left-[13px] w-4 h-4 rounded-full border-2 ${isUltimo ? 'bg-primary border-primary' : 'bg-white border-primary/50'}`} />
                
                <div className="ml-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${config.bg} ${config.cor} border text-xs`}>
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatarData(etapa.criado_em)}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-muted-foreground">
                    {etapa.tag_anterior && (
                      <span className="flex items-center gap-1">
                        <span className="line-through opacity-50">{etapa.tag_anterior}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{etapa.tag_nova}</span>
                      </span>
                    )}
                    {!etapa.tag_anterior && (
                      <span>Entrada: {etapa.tag_nova}</span>
                    )}
                  </div>
                  
                  {etapa.tempo_no_estagio_anterior > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Tempo no estágio anterior: {formatarTempo(etapa.tempo_no_estagio_anterior)}</span>
                    </div>
                  )}
                  
                  <div className="mt-1 text-xs text-muted-foreground">
                    Por: {etapa.criado_por}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// Componente de Métricas
function MetricasCard({ metricas }: { metricas: MetricasEstagio[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Métricas por Estágio</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metricas.map((m) => {
          const config = getEstagioConfig(m.estagio);
          return (
            <div key={m.estagio} className={`p-3 rounded-lg border ${config.bg}`}>
              <p className={`text-xs font-medium ${config.cor}`}>{config.label}</p>
              <p className="text-2xl font-bold mt-1">{m.total_entradas}</p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Média: {m.tempo_medio_formatado}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Componente Principal
export function JornadaLeadSection() {
  const [busca, setBusca] = useState('');
  const [telefoneFilter, setTelefoneFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const { jornadas, metricas, isLoading, refetch } = useJornadaLeads(telefoneFilter);

  // Paginação
  const totalPages = Math.ceil(jornadas.length / ITEMS_PER_PAGE);
  const paginatedJornadas = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return jornadas.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [jornadas, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleBuscar = () => {
    setTelefoneFilter(busca || undefined);
    setCurrentPage(1); // Reset para página 1 ao buscar
  };

  const handleLimpar = () => {
    setBusca('');
    setTelefoneFilter(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Jornada do Cliente</h2>
          <p className="text-muted-foreground">
            Acompanhe a evolução de cada cliente pelos estágios
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button onClick={handleBuscar} size="sm">
            Buscar
          </Button>
          {telefoneFilter && (
            <Button onClick={handleLimpar} variant="outline" size="sm">
              Limpar
            </Button>
          )}
          <Button onClick={refetch} variant="ghost" size="icon">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Métricas */}
      {metricas.length > 0 && <MetricasCard metricas={metricas} />}

      {/* Lista de Jornadas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jornadas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {telefoneFilter 
              ? `Nenhum lead encontrado com o telefone "${telefoneFilter}"`
              : 'Nenhuma jornada registrada ainda'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {jornadas.length} cliente{jornadas.length !== 1 ? 's' : ''} encontrado{jornadas.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
          </p>
          
          {paginatedJornadas.map((jornada) => (
            <JornadaTimeline key={jornada.lead_id} jornada={jornada} />
          ))}
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {/* Primeira página */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant={currentPage === 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(1)}
                      className="w-8 h-8 p-0"
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="px-1 text-muted-foreground">...</span>}
                  </>
                )}
                
                {/* Páginas ao redor da atual */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                  .map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))
                }
                
                {/* Última página */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="px-1 text-muted-foreground">...</span>}
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
