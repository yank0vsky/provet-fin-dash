import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClaimsSummary, Claim } from "@/types/kpis";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatNumber, formatPercent } from "@/lib/formatters";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Search, ExternalLink, Clock, Send, Eye, Bell, Download, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Claims() {
  const [insurer, setInsurer] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ClaimsSummary>({
    queryKey: ['claims-summary', insurer, location, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (insurer !== 'all') params.append('insurer', insurer);
      if (location !== 'all') params.append('location', location);
      if (status !== 'all') params.append('status', status);
      const res = await fetch(`/api/claims-summary?${params}`);
      const result = await res.json();

      // Update timestamp when data is loaded
      if (result.asOf) {
        handleTimestampUpdate(result.asOf);
      }

      return result;
    },
  });

  const filteredClaims = data?.items.filter(claim =>
    searchTerm === "" ||
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleTimestampUpdate = (timestamp: string) => {
    setLastUpdated(timestamp);
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return null;
    try {
      return format(toZonedTime(new Date(timestamp), 'Europe/Lisbon'), 'MMM d, yyyy HH:mm');
    } catch (error) {
      return null;
    }
  };

  const getClaimAction = (status: ClaimStatus) => {
    switch (status) {
      case 'CREATED':
        return {
          label: 'Review & Send',
          icon: Send,
          variant: 'default' as const,
          action: () => toast.success(`Claim marked as sent to insurer`)
        };
      case 'SENT':
        return {
          label: 'Track Status',
          icon: Eye,
          variant: 'outline' as const,
          action: () => toast.info(`Checking delivery status...`)
        };
      case 'WAITING':
        return {
          label: 'Nudge Insurer',
          icon: Bell,
          variant: 'outline' as const,
          action: () => toast.success(`Follow-up sent to insurer`)
        };
      case 'READY':
        return {
          label: 'Download Payment',
          icon: Download,
          variant: 'default' as const,
          action: () => toast.success(`Payment details downloaded`)
        };
      case 'REJECTED':
        return {
          label: 'Review & Resubmit',
          icon: AlertCircle,
          variant: 'destructive' as const,
          action: () => toast.info(`Opening claim for review and resubmission`)
        };
      case 'PAID':
        return {
          label: 'View Details',
          icon: CheckCircle,
          variant: 'outline' as const,
          action: () => toast.info(`Opening payment confirmation`)
        };
      default:
        return {
          label: 'View',
          icon: ExternalLink,
          variant: 'ghost' as const,
          action: () => toast.info(`Opening claim details`)
        };
    }
  };

  const getClaimTooltip = (status: ClaimStatus) => {
    switch (status) {
      case 'CREATED':
        return 'Review claim details and submit to insurance company';
      case 'SENT':
        return 'Check if the claim was received and acknowledged';
      case 'WAITING':
        return 'Send a follow-up reminder to the insurer';
      case 'READY':
        return 'Download payment voucher or remittance advice';
      case 'REJECTED':
        return 'Review rejection reason and resubmit corrected claim';
      case 'PAID':
        return 'View payment confirmation and receipt details';
      default:
        return 'View detailed claim information';
    }
  };

  const insurers = ['all', 'AdSaúde', 'Multicare', 'Médis', 'AdvanceCare', 'Medicare'];
  const locations = ['all', 'Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  const statuses = ['all', 'CREATED', 'SENT', 'WAITING', 'READY', 'REJECTED', 'PAID'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Tracker</h1>
          <p className="text-muted-foreground">Monitor and manage insurance claims</p>
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
        </div>

        {data && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Open</p>
              <p className="text-2xl font-bold">{formatMoney(data.kpis.totalOpenAmount)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Avg Days Open</p>
              <p className="text-2xl font-bold">{formatNumber(data.kpis.avgDaysOpen, 1)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Rejection Rate (30d)</p>
              <p className="text-2xl font-bold">{formatPercent(data.kpis.rejectionRate30d)}</p>
            </Card>
          </div>
        )}

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by claim ID or patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={insurer} onValueChange={setInsurer}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Insurer" />
                </SelectTrigger>
                <SelectContent>
                  {insurers.map(i => (
                    <SelectItem key={i} value={i}>
                      {i === 'all' ? 'All Insurers' : i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(l => (
                    <SelectItem key={l} value={l}>
                      {l === 'all' ? 'All Locations' : l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(s => (
                    <SelectItem key={s} value={s}>
                      {s === 'all' ? 'All Statuses' : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Insurer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No claims found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClaims.map((claim) => {
                        const claimAction = getClaimAction(claim.status);
                        const ActionIcon = claimAction.icon;

                        return (
                          <TableRow key={claim.id}>
                            <TableCell className="font-medium">{claim.id}</TableCell>
                            <TableCell>{claim.patientName}</TableCell>
                            <TableCell>{claim.insurer}</TableCell>
                            <TableCell>{claim.location}</TableCell>
                            <TableCell>
                              <StatusBadge status={claim.status} />
                            </TableCell>
                            <TableCell>{formatMoney(claim.amount)}</TableCell>
                            <TableCell>
                              {format(toZonedTime(new Date(claim.createdAt), 'Europe/Lisbon'), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              {format(toZonedTime(new Date(claim.updatedAt), 'Europe/Lisbon'), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant={claimAction.variant}
                                      onClick={claimAction.action}
                                      className="gap-1"
                                    >
                                      <ActionIcon className="h-3.5 w-3.5" />
                                      {claimAction.label}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-sm">
                                      {getClaimTooltip(claim.status)}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
