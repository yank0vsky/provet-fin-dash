import { useQuery } from "@tanstack/react-query";
import { ARAging } from "@/types/kpis";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatMoney, formatCompactMoney } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface ARAgingSectionProps {
  onClientClick: (clientId: string) => void;
  onChatClick?: () => void;
}

export function ARAgingSection({ onClientClick, onChatClick }: ARAgingSectionProps) {
  const { data, isLoading } = useQuery<ARAging>({
    queryKey: ['ar-aging'],
    queryFn: async () => {
      const res = await fetch('/api/ar-aging');
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

  const chartData = data.buckets.map(bucket => ({
    bucket: bucket.label,
    amount: bucket.amount.amount,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AR Aging</h3>
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
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="bucket" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`€${value.toLocaleString()}`, 'Amount']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--warning))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Top 10 Overdue</h4>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
            {data.topOverdue.map((client) => (
              <div 
                key={client.clientId}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium truncate">{client.clientName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      {client.daysOverdue}d
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatCompactMoney(client.amount)}
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onClientClick(client.clientId)}
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
