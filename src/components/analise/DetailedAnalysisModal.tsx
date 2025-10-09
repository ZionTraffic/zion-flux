import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisHeader } from "./components/AnalysisHeader";
import { VisaoGeralTab } from "./tabs/VisaoGeralTab";
import { WhatsAppTab } from "./tabs/WhatsAppTab";
import { InsightsTab } from "./tabs/InsightsTab";
import {
  calculateEngagement,
  calculateQualityScore,
  generateActivityTimeline,
  identifyRiskFactors
} from "@/utils/conversationMetrics";

interface DetailedAnalysisModalProps {
  conversation: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DetailedAnalysisModal = ({
  conversation,
  open,
  onOpenChange
}: DetailedAnalysisModalProps) => {
  if (!conversation) return null;

  // Calculate metrics
  const engagementScore = calculateEngagement(conversation);
  const qualityScore = calculateQualityScore(conversation);
  const messageCount = conversation.messages?.length || 0;
  const qualificationRate = conversation.qualified ? 100 : 0;
  
  // Generate insights
  const activities = generateActivityTimeline(conversation);
  const riskFactors = identifyRiskFactors(conversation);
  const opportunities = conversation.positives || [];

  const isActive = !conversation.endedAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <AnalysisHeader
          leadName={conversation.leadName}
          phone={conversation.phone}
          email={conversation.email}
          status={conversation.status}
          tag={conversation.tag}
          startedAt={conversation.startedAt}
          endedAt={conversation.endedAt}
          isActive={isActive}
        />

        <Tabs defaultValue="visao-geral" className="flex-1 overflow-hidden">
          <div className="px-6 border-b border-border/50">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="visao-geral" className="m-0">
              <VisaoGeralTab
                conversation={conversation}
                engagementScore={engagementScore}
                qualityScore={qualityScore}
                messageCount={messageCount}
                qualificationRate={qualificationRate}
                activities={activities}
                riskFactors={riskFactors}
                opportunities={opportunities}
              />
            </TabsContent>

            <TabsContent value="whatsapp" className="m-0">
              <WhatsAppTab messages={conversation.messages || []} />
            </TabsContent>

            <TabsContent value="insights" className="m-0">
              <InsightsTab
                conversation={conversation}
                qualityScore={qualityScore}
                engagementScore={engagementScore}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
