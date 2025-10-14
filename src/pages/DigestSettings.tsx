import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DigestSettings as DigestSettingsType } from "@/types/kpis";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

const daysOfWeek = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const times = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

export default function DigestSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<DigestSettingsType | null>(null);

  const { isLoading } = useQuery<DigestSettingsType>({
    queryKey: ['digest-settings'],
    queryFn: async () => {
      const res = await fetch('/api/digest-settings');
      const data = await res.json();
      setSettings(data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: DigestSettingsType) => {
      const res = await fetch('/api/digest-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digest-settings'] });
      toast.success("Settings saved successfully");
    },
  });

  const handleSave = () => {
    if (settings) {
      mutation.mutate(settings);
    }
  };

  if (isLoading || !settings) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <Card className="p-6">
            <div className="h-40 bg-muted rounded" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digest Settings</h1>
          <p className="text-muted-foreground">Configure your weekly invoice summary email</p>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled" className="text-base">
                  Weekly Invoice Summary
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly email with invoice and payment summaries
                </p>
              </div>
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
              />
            </div>

            {settings.enabled && (
              <>
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={String(settings.dayOfWeek)}
                    onValueChange={(value) =>
                      setSettings({ ...settings, dayOfWeek: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time (Europe/Lisbon)</Label>
                  <Select
                    value={settings.time24h}
                    onValueChange={(value) =>
                      setSettings({ ...settings, time24h: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {times.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Preview
                  </h4>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
                    <p className="font-medium">Subject: Weekly Invoice Summary - Lisbon Clinic</p>
                    <div className="text-muted-foreground space-y-1">
                      <p>Hi there,</p>
                      <p>Here's your weekly financial summary:</p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>Total Revenue: €XX,XXX</li>
                        <li>Cash Collected: €XX,XXX</li>
                        <li>Accounts Receivable: €XX,XXX</li>
                        <li>DSO: XX.X days</li>
                      </ul>
                      <p className="mt-2">
                        View detailed reports in your dashboard →
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="gap-2"
              >
                {mutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
