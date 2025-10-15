import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { formatNumber } from "@/lib/formatters";

interface DSOTrendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Array<{ ts: string; value: number }>;
}

export function DSOTrendDialog({ open, onOpenChange, data }: DSOTrendDialogProps) {
  const chartData = data.map(point => ({
    date: format(new Date(point.ts), 'MMM dd'),
    dso: point.value,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>DSO Trend (Last 30 Days)</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                label={{ value: 'Days', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatNumber(value, 1), 'DSO']}
              />
              <Line 
                type="monotone" 
                dataKey="dso" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
