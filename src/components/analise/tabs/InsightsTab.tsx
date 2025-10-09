import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { getQualityScoreColor, getQualityScoreLabel } from "@/utils/conversationMetrics";

interface InsightsTabProps {
  conversation: any;
  qualityScore: number;
  engagementScore: number;
}

export const InsightsTab = ({
  conversation,
  qualityScore,
  engagementScore
}: InsightsTabProps) => {
  const positives = conversation.positives || [];
  const negatives = conversation.negatives || [];
  const aiSuggestions = conversation.suggestions || [];
  const adSuggestions = conversation.adSuggestions || [];
  
  const sentimentScore = positives.length > 0 
    ? (positives.length / (positives.length + negatives.length)) * 100 
    : 50;

  return (
    <div className="space-y-6 p-6">
      {/* Quality Score Card */}
      <Card className="p-6 glass border border-border/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Score de Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                {getQualityScoreLabel(qualityScore)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${getQualityScoreColor(qualityScore)}`}>
              {qualityScore}
            </p>
            <p className="text-sm text-muted-foreground">de 100</p>
          </div>
        </div>
        <Progress value={qualityScore} className="h-2" />
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 glass border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h4 className="font-semibold">Engajamento</h4>
          </div>
          <p className="text-3xl font-bold mb-2">{engagementScore}%</p>
          <Progress value={engagementScore} className="h-2" />
        </Card>

        <Card className="p-6 glass border border-border/50">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h4 className="font-semibold">Sentimento</h4>
          </div>
          <p className="text-3xl font-bold mb-2">{sentimentScore.toFixed(0)}%</p>
          <Progress value={sentimentScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {sentimentScore >= 70 ? 'Muito Positivo' : 
             sentimentScore >= 50 ? 'Positivo' : 
             sentimentScore >= 30 ? 'Neutro' : 'Negativo'}
          </p>
        </Card>
      </div>

      {/* Análise de Sentimento Detalhada */}
      <Card className="p-6 glass border border-border/50 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          Análise de Sentimento
        </h3>
        
        <div className="space-y-4">
          {/* Score Visual */}
          {conversation.sentimentScore !== undefined && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Score de Sentimento</span>
                <span className="font-bold text-lg">
                  {conversation.sentimentScore > 0 ? '+' : ''}{conversation.sentimentScore}
                </span>
              </div>
              <Progress 
                value={(conversation.sentimentScore + 100) / 2} 
                className="h-3" 
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>-100 (Negativo)</span>
                <span>0 (Neutro)</span>
                <span>+100 (Positivo)</span>
              </div>
            </div>
          )}
          
          {/* Distribuição de Feedback */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-3xl font-bold text-emerald-400">
                {positives.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Pontos Positivos</div>
            </div>
            <div className="text-center p-4 rounded-lg border border-red-500/20 bg-red-500/5">
              <div className="text-3xl font-bold text-red-400">
                {negatives.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Pontos Negativos</div>
            </div>
          </div>
          
          {/* Intensidade/Confiança */}
          {conversation.sentimentIntensity && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
              <span className="text-sm font-medium">Confiança da Análise</span>
              <Badge 
                variant={
                  conversation.sentimentIntensity === 'alta' ? 'default' : 
                  conversation.sentimentIntensity === 'média' ? 'secondary' : 
                  'outline'
                }
                className="capitalize"
              >
                {conversation.sentimentIntensity}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Pontos Fortes */}
      {positives.length > 0 && (
        <Card className="p-6 glass border border-emerald-500/30 bg-emerald-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Pontos Fortes
          </h3>
          <div className="grid gap-3">
            {positives.map((positive: string, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{positive}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pontos de Melhoria */}
      {negatives.length > 0 && (
        <Card className="p-6 glass border border-amber-500/30 bg-amber-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            Pontos de Melhoria
          </h3>
          <div className="grid gap-3">
            {negatives.map((negative: string, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{negative}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="p-6 glass border border-blue-500/30 bg-blue-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-400" />
            Sugestões da IA para Atendimento
          </h3>
          <div className="grid gap-3">
            {aiSuggestions.map((suggestion: string, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5"
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ad Suggestions */}
      {adSuggestions.length > 0 && (
        <Card className="p-6 glass border border-purple-500/30 bg-purple-500/5">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Sugestões para Anúncios
          </h3>
          <div className="grid gap-3">
            {adSuggestions.map((suggestion: string, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5"
              >
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recomendações Personalizadas */}
      <Card className="p-6 glass border border-border/50 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Recomendações Personalizadas
        </h3>
        <div className="space-y-3">
          {qualityScore < 50 && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <p className="text-sm">
                <strong>Atenção:</strong> O score de qualidade está baixo. Revise os pontos de melhoria e implemente as sugestões da IA.
              </p>
            </div>
          )}
          
          {engagementScore < 40 && (
            <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <p className="text-sm">
                <strong>Dica:</strong> Trabalhe para aumentar o engajamento com respostas mais rápidas e personalizadas.
              </p>
            </div>
          )}
          
          {!conversation.qualified && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
              <p className="text-sm">
                <strong>Oportunidade:</strong> Este lead não foi qualificado. Revise os critérios de qualificação e ajuste a abordagem.
              </p>
            </div>
          )}
          
          {conversation.qualified && (
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-sm">
                <strong>Sucesso:</strong> Lead qualificado! Continue com o follow-up personalizado para maximizar a conversão.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
