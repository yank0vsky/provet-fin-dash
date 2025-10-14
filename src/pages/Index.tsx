import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TodaySummarySection } from "@/components/TodaySummarySection";
import { ARAgingSection } from "@/components/ARAgingSection";
import { ClaimsPipelineSection } from "@/components/ClaimsPipelineSection";
import { ClientDrawer } from "@/components/ClientDrawer";

const Index = () => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into your clinic's financial performance
          </p>
        </div>

        <TodaySummarySection />
        <ARAgingSection onClientClick={setSelectedClientId} />
        <ClaimsPipelineSection />
      </div>

      <ClientDrawer
        clientId={selectedClientId}
        open={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
      />
    </DashboardLayout>
  );
};

export default Index;
