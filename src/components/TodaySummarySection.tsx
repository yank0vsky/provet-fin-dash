import { useQuery } from "@tanstack/react-query";
import { TodaySummary } from "@/types/kpis";
import { KPICard } from "./KPICard";
import { ARCard } from "./ARCard";
import { RevenueCard } from "./RevenueCard";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatMoney, formatNumber } from "@/lib/formatters";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { MessageSquare, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentMethodBreakdown } from "./PaymentMethodBreakdown";
import { DSOTrendDialog } from "./DSOTrendDialog";
import { useState } from "react";

interface TodaySummarySectionProps {
  onChatClick?: () => void;
}

export function TodaySummarySection({ onChatClick }: TodaySummarySectionProps) {
  const [dsoDialogOpen, setDsoDialogOpen] = useState(false);
  
  const { data, isLoading } = useQuery<TodaySummary>({
    queryKey: ['today-summary'],
    queryFn: async () => {
      const res = await fetch('/api/today-summary');
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }


  const chartData = data.revenueSparkline.map(point => ({
    time: format(toZonedTime(new Date(point.ts), 'Europe/Lisbon'), 'HH:mm'),
    value: point.value,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <RevenueCard 
          revenueToday={data.revenueToday}
          revenueLastWeekSameDay={data.revenueLastWeekSameDay}
          revenueThisWeek={data.revenueThisWeek}
          revenueLastWeek={data.revenueLastWeek}
        />
        <PaymentMethodBreakdown breakdown={data.cashBreakdown}>
          <div className="cursor-pointer">
            <KPICard
              title="Cash Collected (Today)"
              value={formatMoney(data.cashCollectedToday)}
              subtitle={
                <div className="flex items-center gap-1.5">
                  <span>Click to view breakdown</span>
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Provet Pay
                  </Badge>
                </div>
              }
              tooltipContent={`Cash Collected (Today)\n\nPayments received today across all methods (card, cash, Provet Pay).\n\nProvet Pay amounts are instantly reconciled.`}
            />
          </div>
        </PaymentMethodBreakdown>
        <ARCard 
          arNow={data.accountsReceivableNow}
          arTarget={data.accountsReceivableTarget}
        />
        <div className="cursor-pointer" onClick={() => setDsoDialogOpen(true)}>
          <KPICard
            title="DSO (30D)"
            value={formatNumber(data.dsoRolling30, 1)}
            subtitle={
              <div className="flex items-center gap-1.5 text-primary">
                <TrendingUp className="h-3 w-3" />
                <span>Click to view trend</span>
              </div>
            }
            tooltipContent={`DSO (30D)\n\nEstimated days to collect based on the last 30 days of credit sales and receipts.\n\nApproximation: (Average AR over 30D / Net credit sales 30D) × 30.\n\nLower is better.`}
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Revenue Trend</h3>
          {onChatClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChatClick}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          )}
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`€${formatNumber(value)}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <DSOTrendDialog 
        open={dsoDialogOpen} 
        onOpenChange={setDsoDialogOpen}
        data={data.dsoSparkline}
      />
    </div>
  );
}
