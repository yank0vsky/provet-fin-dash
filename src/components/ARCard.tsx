import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
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

interface ARCardProps {
  arNow: Money;
  arTarget: Money;
  className?: string;
}

export function ARCard({ arNow, arTarget, className }: ARCardProps) {
  const [view, setView] = useState<'now' | 'gap'>('now');
  
  const arGap = arNow.amount - arTarget.amount;
  const arGapPercent = (arGap / arTarget.amount) * 100;

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              {view === 'now' ? 'AR (Now)' : 'AR Target Gap'}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs whitespace-pre-line">
                  <p className="text-sm">
                    {view === 'now' 
                      ? `AR (Now)\n\nOutstanding balance on finalized invoices right now.\n\nIncludes partial balances; excludes amounts already covered by credit notes and applied prepayments.`
                      : `AR Target Gap\n\nDifference between current AR and target AR.\n\nNegative (below target) is better.`
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as 'now' | 'gap')}>
            <TabsList className="h-7">
              <TabsTrigger value="now" className="text-xs px-2 h-6">Now</TabsTrigger>
              <TabsTrigger value="gap" className="text-xs px-2 h-6">Gap</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {view === 'now' ? (
          <>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tight">{formatMoney(arNow)}</h2>
            </div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold tracking-tight">
                {arGap >= 0 ? '+' : ''}{formatMoney({ amount: Math.abs(arGap), currency: arTarget.currency })}
              </h2>
              <div className={cn(
                "flex items-center text-sm font-medium",
                arGap <= 0 ? "text-success" : "text-destructive"
              )}>
                <span>{formatNumber(Math.abs(arGapPercent), 1)}% {arGap >= 0 ? 'above' : 'below'}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Target: {formatMoney(arTarget)}</p>
          </>
        )}
      </div>
    </Card>
  );
}
