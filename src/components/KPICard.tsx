import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function KPICard({ title, value, change, subtitle, className }: KPICardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
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
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
