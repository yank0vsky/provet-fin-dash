import { useQuery } from "@tanstack/react-query";
import { ClientDetail } from "@/types/kpis";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { FileText, Send } from "lucide-react";
import { toast } from "sonner";

interface ClientDrawerProps {
  clientId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ClientDrawer({ clientId, open, onClose }: ClientDrawerProps) {
  const { data, isLoading } = useQuery<ClientDetail>({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${clientId}`);
      return res.json();
    },
    enabled: !!clientId,
  });

  const handleGenerateStatement = () => {
    toast.success("Statement generated (mock)");
  };

  const handleSendPayLink = () => {
    toast.success("Payment link sent (mock)");
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl">
        {isLoading || !data ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{data.clientName}</SheetTitle>
              <SheetDescription>Client ID: {data.clientId}</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold">{formatMoney(data.balance)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    <p className="text-lg font-medium">
                      {data.lastPaymentDate 
                        ? format(toZonedTime(new Date(data.lastPaymentDate), 'Europe/Lisbon'), 'MMM d, yyyy')
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Outstanding Invoices</h4>
                <div className="space-y-2">
                  {data.invoices.map((invoice) => (
                    <div key={invoice.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(toZonedTime(new Date(invoice.date), 'Europe/Lisbon'), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMoney(invoice.amount)}</p>
                          <p className="text-xs text-destructive">{invoice.daysOverdue}d overdue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateStatement} 
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Statement
                </Button>
                <Button 
                  onClick={handleSendPayLink}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Pay Link
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
