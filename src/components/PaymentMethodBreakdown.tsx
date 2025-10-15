import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CashBreakdown } from "@/types/kpis";
import { formatMoney } from "@/lib/formatters";
import { CheckCircle2 } from "lucide-react";

interface PaymentMethodBreakdownProps {
  breakdown: CashBreakdown;
  children: React.ReactNode;
}

export function PaymentMethodBreakdown({ breakdown, children }: PaymentMethodBreakdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Payment Method Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Card</span>
              <span className="font-medium">{formatMoney(breakdown.card)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Cash</span>
              <span className="font-medium">{formatMoney(breakdown.cash)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b bg-accent/5 -mx-3 px-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Provet Pay</span>
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Instant
                </Badge>
              </div>
              <span className="font-medium">{formatMoney(breakdown.provetPay)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Other</span>
              <span className="font-medium">{formatMoney(breakdown.other)}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
