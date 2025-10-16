import { useQuery } from "@tanstack/react-query";
import { ARAging } from "@/types/kpis";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatMoney, formatCompactMoney } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Filter, Send, FileText } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ARAgingSectionProps {
  onClientClick: (clientId: string) => void;
  onChatClick?: () => void;
}

export function ARAgingSection({ onClientClick, onChatClick }: ARAgingSectionProps) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ARAging>({
    queryKey: ['ar-aging'],
    queryFn: async () => {
      const res = await fetch('/api/ar-aging');
      const result = await res.json();

      // Update timestamp when data is loaded
      if (result.asOf) {
        setLastUpdated(result.asOf);
      }

      return result;
    },
  });

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      return format(toZonedTime(new Date(timestamp), 'Europe/Lisbon'), 'MMM d, yyyy HH:mm');
    } catch (error) {
      return null;
    }
  };

  const handleViewAccounts = (bucket: string) => {
    setSelectedBucket(bucket);
    toast.info(`Viewing accounts aged ${bucket} days`);
  };

  const handleSendBulkStatements = () => {
    if (!selectedBucket) {
      toast.error("Please select a bucket first");
      return;
    }
    toast.success(`Bulk statements sent for ${selectedBucket} days overdue accounts`);
  };

  const handleSendStatement = (clientId: string, clientName: string) => {
    toast.success(`Statement sent to ${clientName}`);
  };

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
        <div>
          <h3 className="text-lg font-semibold">AR Aging</h3>
        </div>
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
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendStatement(client.clientId, client.clientName)}
                          className="gap-1"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Send
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Send statement to {client.clientName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onClientClick(client.clientId)}
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons below chart */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      View Accounts {selectedBucket && `(${selectedBucket}d)`}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleViewAccounts('0-30')}>
                      0-30 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewAccounts('31-60')}>
                      31-60 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewAccounts('61-90')}>
                      61-90 days
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewAccounts('>90')}>
                      Over 90 days
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Filter and view accounts by aging bucket</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendBulkStatements}
                  disabled={!selectedBucket}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Bulk Statements
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Send statements to all clients in the selected aging bucket</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {selectedBucket && (
          <div className="text-sm text-muted-foreground">
            {data?.buckets.find(b => b.label === selectedBucket)?.amount.amount.toLocaleString()} € in selected bucket
          </div>
        )}
      </div>
    </Card>
  );
}
