import { Badge } from "@/components/ui/badge";
import { ClaimStatus } from "@/types/kpis";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  CREATED: { label: 'Created', className: 'bg-secondary text-secondary-foreground' },
  SENT: { label: 'Sent', className: 'bg-primary/10 text-primary' },
  WAITING: { label: 'Waiting', className: 'bg-warning/10 text-warning' },
  READY: { label: 'Ready', className: 'bg-accent/10 text-accent' },
  REJECTED: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
  PAID: { label: 'Paid', className: 'bg-success/10 text-success' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
