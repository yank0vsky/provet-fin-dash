import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TodaySummarySection } from "@/components/TodaySummarySection";
import { ARAgingSection } from "@/components/ARAgingSection";
import { ClaimsPipelineSection } from "@/components/ClaimsPipelineSection";
import { ClientDrawer } from "@/components/ClientDrawer";
import { ChatDrawer } from "@/components/ChatDrawer";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<{ type: 'dashboard' | 'revenue-trend' | 'ar-aging' | 'claims-pipeline'; title: string } | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time insights into your clinic's financial performance
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setChatContext({ type: 'dashboard', title: 'Financial Dashboard' })}
          >
            <MessageSquare className="h-4 w-4" />
            Chat with this data
          </Button>
        </div>

        <TodaySummarySection onChatClick={() => setChatContext({ type: 'revenue-trend', title: "Today's Revenue Trend" })} />
        <ARAgingSection 
          onClientClick={setSelectedClientId}
          onChatClick={() => setChatContext({ type: 'ar-aging', title: 'AR Aging' })}
        />
        <ClaimsPipelineSection onChatClick={() => setChatContext({ type: 'claims-pipeline', title: 'Claims Pipeline' })} />
      </div>

      <ClientDrawer
        clientId={selectedClientId}
        open={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
      />

      <ChatDrawer
        open={!!chatContext}
        onClose={() => setChatContext(null)}
        context={chatContext}
      />
    </DashboardLayout>
  );
};

export default Index;
