import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string | React.ReactNode;
  tooltipContent?: string;
  className?: string;
}

export function KPICard({ title, value, change, subtitle, tooltipContent, className }: KPICardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {tooltipContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs whitespace-pre-line">
                  <p className="text-sm">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
          {change && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              change.positive ? "text-success" : "text-destructive"
            )}>
              {change.positive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{change.value}</span>
            </div>
          )}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">
            {typeof subtitle === 'string' ? subtitle : subtitle}
          </div>
        )}
      </div>
    </Card>
  );
}
