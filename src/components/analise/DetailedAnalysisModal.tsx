import { useState } from "react";
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
import { useWorkspace } from "@/contexts/WorkspaceContext";

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

  const [selectedConversation, setSelectedConversation] = useState(conversation);
  const { currentWorkspaceId } = useWorkspace();

  const handleTagUpdated = (newTag: string) => {
    setSelectedConversation({ ...selectedConversation, tag: newTag });
  };

  // Calculate metrics
  const engagementScore = calculateEngagement(selectedConversation);
  const qualityScore = calculateQualityScore(selectedConversation);
  const messageCount = selectedConversation.messages?.length || 0;
  const qualificationRate = selectedConversation.qualified ? 100 : 0;
  
  // Generate insights
  const activities = generateActivityTimeline(selectedConversation);
  const riskFactors = identifyRiskFactors(selectedConversation);
  const opportunities = selectedConversation.positives || [];

  const isActive = !selectedConversation.endedAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <AnalysisHeader
          leadName={selectedConversation.leadName}
          phone={selectedConversation.phone}
          email={selectedConversation.email}
          status={selectedConversation.status}
          tag={selectedConversation.tag}
          startedAt={selectedConversation.startedAt}
          endedAt={selectedConversation.endedAt}
          isActive={isActive}
          conversationId={selectedConversation.id}
          onTagUpdated={handleTagUpdated}
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
                conversation={selectedConversation}
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
              <WhatsAppTab messages={selectedConversation.messages || []} />
            </TabsContent>

            <TabsContent value="insights" className="m-0">
              <InsightsTab
                conversationId={selectedConversation.id}
                workspaceId={currentWorkspaceId || ''}
                messages={selectedConversation.messages || []}
              />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
