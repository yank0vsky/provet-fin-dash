import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TodaySummarySection } from "@/components/TodaySummarySection";
import { ARAgingSection } from "@/components/ARAgingSection";
import { ClaimsPipelineSection } from "@/components/ClaimsPipelineSection";
import { ClientDrawer } from "@/components/ClientDrawer";
import { ChatDrawer } from "@/components/ChatDrawer";
import { MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const Index = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<{ type: 'dashboard' | 'revenue-trend' | 'ar-aging' | 'claims-pipeline'; title: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const handleTimestampUpdate = (timestamp: string) => {
    setLastUpdated(timestamp);
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      return format(toZonedTime(new Date(timestamp), 'Europe/Lisbon'), 'MMM d, yyyy HH:mm');
    } catch (error) {
      return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time insights into your clinic's financial performance
            </p>
            {lastUpdated && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => setChatContext({ type: 'dashboard', title: 'Financial Dashboard' })}
          >
            <MessageSquare className="h-4 w-4" />
            Chat with this data
          </Button>
        </div>

        <TodaySummarySection
          onChatClick={() => setChatContext({ type: 'revenue-trend', title: "Today's Revenue Trend" })}
          onTimestampUpdate={handleTimestampUpdate}
        />
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
