import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Lightbulb, Loader2, RefreshCw, FileText, BarChart3 } from "lucide-react";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InsightsTabProps {
  conversationId: number;
  workspaceId: string;
  messages: any[];
}

export const InsightsTab = ({ conversationId, workspaceId, messages }: InsightsTabProps) => {
  const { analysis, isLoading, error, refetch } = useAnalysisData(conversationId, workspaceId, messages);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="p-4 rounded-full bg-indigo-500/20">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Analisando conversa com IA...</h3>
          <p className="text-sm text-muted-foreground">
            Isso pode levar alguns segundos
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma análise disponível para esta conversa.
          </AlertDescription>
        </Alert>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Analisar Agora
        </Button>
      </div>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Resumo da Conversa */}
      {analysis.summary && (
        <Card className="p-6 glass border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">📝 Resumo da Conversa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Scores da Análise */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">📊 Avaliação da Conversa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 glass border border-purple-500/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Coerência</p>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score_coerencia)}`}>
                {analysis.score_coerencia || '--'}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass border border-indigo-500/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Fluxo</p>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score_fluxo)}`}>
                {analysis.score_fluxo || '--'}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass border border-cyan-500/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Humanização</p>
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score_humanizacao)}`}>
                {analysis.score_humanizacao || '--'}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Problemas Identificados */}
      {analysis.issues && analysis.issues.length > 0 && (
        <Card className="p-6 glass border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                ⚠️ Problemas Identificados
                <Badge variant="secondary">{analysis.issues.length}</Badge>
              </h3>
              <ul className="space-y-2">
                {analysis.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-muted-foreground">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Sugestões de Melhoria */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card className="p-6 glass border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Lightbulb className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                💡 Sugestões de Melhoria
                <Badge variant="secondary">{analysis.suggestions.length}</Badge>
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Botão para Reanalisar */}
      <div className="flex justify-center pt-4">
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reanalisar esta Conversa
        </Button>
      </div>
    </div>
  );
};
