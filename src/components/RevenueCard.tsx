import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatMoney, formatNumber } from "@/lib/formatters";
import { Money } from "@/types/kpis";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RevenueCardProps {
  revenueToday: Money;
  revenueLastWeekSameDay: Money;
  revenueThisWeek: Money;
  revenueLastWeek: Money;
  className?: string;
}

export function RevenueCard({ 
  revenueToday, 
  revenueLastWeekSameDay,
  revenueThisWeek,
  revenueLastWeek,
  className 
}: RevenueCardProps) {
  const [view, setView] = useState<'today' | 'week'>('today');
  
  const changeTodayPercent = ((revenueToday.amount - revenueLastWeekSameDay.amount) / revenueLastWeekSameDay.amount) * 100;
  const changeWeekPercent = ((revenueThisWeek.amount - revenueLastWeek.amount) / revenueLastWeek.amount) * 100;

  const isToday = view === 'today';
  const currentRevenue = isToday ? revenueToday : revenueThisWeek;
  const changePercent = isToday ? changeTodayPercent : changeWeekPercent;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              Revenue {isToday ? '(Today)' : '(This Week)'}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs whitespace-pre-line">
                  <p className="text-sm">
                    {isToday 
                      ? `Revenue (Today)\n\nTotal value of invoices finalized today (local time).\n\nNot affected by whether they are already paid.`
                      : `Revenue (This Week)\n\nTotal value of invoices finalized this week (Monday to Sunday).`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'today' | 'week')}>
            <TabsList className="h-7">
              <TabsTrigger value="today" className="text-xs px-2 h-6">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2 h-6">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-baseline space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">{formatMoney(currentRevenue)}</h2>
          <div className={cn(
            "flex items-center text-sm font-medium",
            changePercent >= 0 ? "text-success" : "text-destructive"
          )}>
            {changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span>{changePercent >= 0 ? '+' : ''}{formatNumber(changePercent, 1)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {isToday ? 'vs last week same day' : 'vs last week'}
        </p>
      </div>
    </Card>
  );
}
