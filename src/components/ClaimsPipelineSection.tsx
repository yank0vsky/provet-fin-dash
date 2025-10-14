import { useQuery } from "@tanstack/react-query";
import { ClaimsSummary } from "@/types/kpis";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatMoney, formatNumber, formatPercent } from "@/lib/formatters";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  CREATED: 'hsl(var(--secondary))',
  SENT: 'hsl(var(--primary))',
  WAITING: 'hsl(var(--warning))',
  READY: 'hsl(var(--accent))',
  REJECTED: 'hsl(var(--destructive))',
  PAID: 'hsl(var(--success))',
};

export function ClaimsPipelineSection() {
  const navigate = useNavigate();
  
  const { data, isLoading } = useQuery<ClaimsSummary>({
    queryKey: ['claims-summary'],
    queryFn: async () => {
      const res = await fetch('/api/claims-summary');
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-[300px] bg-muted rounded" />
      </Card>
    );
  }

  const chartData = data.pipeline.map(item => ({
    status: item.status,
    count: item.count,
    amount: item.total.amount,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reimbursement Pipeline</h3>
        <Button onClick={() => navigate('/claims')}>
          Open Full Tracker
        </Button>
      </div>

      <div className="grid gap-4 mb-4 md:grid-cols-3">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Total Open</p>
          <p className="text-2xl font-bold">{formatMoney(data.kpis.totalOpenAmount)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Avg Days Open</p>
          <p className="text-2xl font-bold">{formatNumber(data.kpis.avgDaysOpen, 1)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">Rejection Rate (30d)</p>
          <p className="text-2xl font-bold">{formatPercent(data.kpis.rejectionRate30d)}</p>
        </div>
      </div>

      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="status" 
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
              formatter={(value: number, name: string) => {
                if (name === 'count') return [value, 'Claims'];
                return [`€${value.toLocaleString()}`, 'Amount'];
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.status as keyof typeof statusColors]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
