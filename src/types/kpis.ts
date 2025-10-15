export type Currency = 'EUR' | 'SEK' | 'NOK' | 'DKK' | 'GBP';

export interface Money {
  amount: number;
  currency: Currency;
}

export interface CashBreakdown {
  card: Money;
  cash: Money;
  provetPay: Money;
  other: Money;
}

export interface TodaySummary {
  asOf: string;
  revenueToday: Money;
  revenueLastWeekSameDay: Money;
  revenueThisWeek: Money;
  revenueLastWeek: Money;
  revenueTarget: Money;
  cashCollectedToday: Money;
  cashBreakdown: CashBreakdown;
  accountsReceivableNow: Money;
  dsoRolling30: number;
  dsoSparkline: Array<{ ts: string; value: number }>;
  revenueSparkline: Array<{ ts: string; value: number }>;
}

export interface ARAgingBucket {
  label: '0-30' | '31-60' | '61-90' | '>90';
  amount: Money;
}

export interface ARAging {
  asOf: string;
  buckets: ARAgingBucket[];
  topOverdue: Array<{
    clientId: string;
    clientName: string;
    daysOverdue: number;
    amount: Money;
  }>;
}

export type ClaimStatus = 'CREATED' | 'SENT' | 'WAITING' | 'READY' | 'REJECTED' | 'PAID';

export interface Claim {
  id: string;
  patientName: string;
  insurer: string;
  location: string;
  status: ClaimStatus;
  amount: Money;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimsSummary {
  asOf: string;
  pipeline: Array<{
    status: ClaimStatus;
    count: number;
    total: Money;
  }>;
  kpis: {
    totalOpenAmount: Money;
    avgDaysOpen: number;
    rejectionRate30d: number;
  };
  items: Claim[];
}

export interface DigestSettings {
  enabled: boolean;
  dayOfWeek: number;
  time24h: string;
  timezone: string;
}

export interface ClientDetail {
  clientId: string;
  clientName: string;
  balance: Money;
  lastPaymentDate: string | null;
  invoices: Array<{
    id: string;
    date: string;
    amount: Money;
    daysOverdue: number;
  }>;
}
