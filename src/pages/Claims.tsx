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
import { Search, ExternalLink } from "lucide-react";

export default function Claims() {
  const [insurer, setInsurer] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery<ClaimsSummary>({
    queryKey: ['claims-summary', insurer, location, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (insurer !== 'all') params.append('insurer', insurer);
      if (location !== 'all') params.append('location', location);
      if (status !== 'all') params.append('status', status);
      const res = await fetch(`/api/claims-summary?${params}`);
      return res.json();
    },
  });

  const filteredClaims = data?.items.filter(claim =>
    searchTerm === "" ||
    claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const insurers = ['all', 'AdSaúde', 'Multicare', 'Médis', 'AdvanceCare', 'Medicare'];
  const locations = ['all', 'Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  const statuses = ['all', 'CREATED', 'SENT', 'WAITING', 'READY', 'REJECTED', 'PAID'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reimbursement Tracker</h1>
          <p className="text-muted-foreground">Monitor and manage insurance claims</p>
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
                      filteredClaims.map((claim) => (
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
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
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
