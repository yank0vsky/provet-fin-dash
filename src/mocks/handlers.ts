import { http, HttpResponse } from 'msw';
import { TodaySummary, ARAging, ClaimsSummary, DigestSettings, ClientDetail, ClaimStatus } from '@/types/kpis';

const mockTodaySummary: TodaySummary = {
  asOf: new Date().toISOString(),
  revenueToday: { amount: 12450, currency: 'EUR' },
  revenueLastWeekSameDay: { amount: 10200, currency: 'EUR' },
  revenueThisWeek: { amount: 58300, currency: 'EUR' },
  revenueLastWeek: { amount: 52100, currency: 'EUR' },
  revenueTarget: { amount: 65000, currency: 'EUR' },
  cashCollectedToday: { amount: 8300, currency: 'EUR' },
  cashBreakdown: {
    card: { amount: 4200, currency: 'EUR' },
    cash: { amount: 1500, currency: 'EUR' },
    provetPay: { amount: 2300, currency: 'EUR' },
    other: { amount: 300, currency: 'EUR' },
  },
  accountsReceivableNow: { amount: 45600, currency: 'EUR' },
  dsoRolling30: 32.4,
  dsoSparkline: Array.from({ length: 30 }, (_, i) => ({
    ts: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    value: 30 + Math.sin(i / 5) * 8 + Math.random() * 4,
  })),
  revenueSparkline: Array.from({ length: 24 }, (_, i) => ({
    ts: new Date(new Date().setHours(i, 0, 0, 0)).toISOString(),
    value: Math.floor(Math.random() * 1000) + 200,
  })),
};

const mockARAging: ARAging = {
  asOf: new Date().toISOString(),
  buckets: [
    { label: '0-30', amount: { amount: 18500, currency: 'EUR' } },
    { label: '31-60', amount: { amount: 12300, currency: 'EUR' } },
    { label: '61-90', amount: { amount: 8900, currency: 'EUR' } },
    { label: '>90', amount: { amount: 5900, currency: 'EUR' } },
  ],
  topOverdue: [
    { clientId: '1', clientName: 'Silva Medical Clinic', daysOverdue: 67, amount: { amount: 3200, currency: 'EUR' } },
    { clientId: '2', clientName: 'Porto Health Center', daysOverdue: 52, amount: { amount: 2850, currency: 'EUR' } },
    { clientId: '3', clientName: 'Lisbon Dental Care', daysOverdue: 48, amount: { amount: 2400, currency: 'EUR' } },
    { clientId: '4', clientName: 'Braga Wellness', daysOverdue: 45, amount: { amount: 2100, currency: 'EUR' } },
    { clientId: '5', clientName: 'Coimbra Physio', daysOverdue: 38, amount: { amount: 1950, currency: 'EUR' } },
    { clientId: '6', clientName: 'Faro Medical Group', daysOverdue: 36, amount: { amount: 1800, currency: 'EUR' } },
    { clientId: '7', clientName: 'Aveiro Health', daysOverdue: 34, amount: { amount: 1650, currency: 'EUR' } },
    { clientId: '8', clientName: 'Setúbal Clinic', daysOverdue: 31, amount: { amount: 1500, currency: 'EUR' } },
    { clientId: '9', clientName: 'Évora Medical', daysOverdue: 29, amount: { amount: 1400, currency: 'EUR' } },
    { clientId: '10', clientName: 'Guimarães Care', daysOverdue: 27, amount: { amount: 1300, currency: 'EUR' } },
  ],
};

const generateMockClaims = (count: number): any[] => {
  const statuses: ClaimStatus[] = ['CREATED', 'SENT', 'WAITING', 'READY', 'REJECTED', 'PAID'];
  const insurers = ['AdSaúde', 'Multicare', 'Médis', 'AdvanceCare', 'Medicare'];
  const locations = ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'];
  const patients = [
    'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Ferreira', 'Carlos Oliveira',
    'Sofia Rodrigues', 'Miguel Alves', 'Teresa Pereira', 'António Sousa', 'Inês Martins'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `CLM-${String(i + 1).padStart(5, '0')}`,
    patientName: patients[Math.floor(Math.random() * patients.length)],
    insurer: insurers[Math.floor(Math.random() * insurers.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    amount: { amount: Math.floor(Math.random() * 5000) + 500, currency: 'EUR' },
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const mockClaims = generateMockClaims(150);

const calculatePipeline = (claims: any[]) => {
  const statuses: ClaimStatus[] = ['CREATED', 'SENT', 'WAITING', 'READY', 'REJECTED', 'PAID'];
  return statuses.map(status => {
    const filtered = claims.filter(c => c.status === status);
    return {
      status,
      count: filtered.length,
      total: {
        amount: filtered.reduce((sum, c) => sum + c.amount.amount, 0),
        currency: 'EUR' as const,
      },
    };
  });
};

const mockClaimsSummary: ClaimsSummary = {
  asOf: new Date().toISOString(),
  pipeline: calculatePipeline(mockClaims),
  kpis: {
    totalOpenAmount: {
      amount: mockClaims
        .filter(c => ['CREATED', 'SENT', 'WAITING', 'READY'].includes(c.status))
        .reduce((sum, c) => sum + c.amount.amount, 0),
      currency: 'EUR',
    },
    avgDaysOpen: 18.5,
    rejectionRate30d: 0.08,
  },
  items: mockClaims,
};

let mockDigestSettings: DigestSettings = {
  enabled: true,
  dayOfWeek: 1,
  time24h: '09:00',
  timezone: 'Europe/Lisbon',
};

const mockClientDetails: Record<string, ClientDetail> = {
  '1': {
    clientId: '1',
    clientName: 'Silva Medical Clinic',
    balance: { amount: 3200, currency: 'EUR' },
    lastPaymentDate: '2024-08-15',
    invoices: [
      { id: 'INV-001', date: '2024-07-10', amount: { amount: 1200, currency: 'EUR' }, daysOverdue: 67 },
      { id: 'INV-002', date: '2024-08-05', amount: { amount: 2000, currency: 'EUR' }, daysOverdue: 42 },
    ],
  },
};

export const handlers = [
  http.get('/api/today-summary', () => {
    return HttpResponse.json(mockTodaySummary, { status: 200 });
  }),

  http.get('/api/ar-aging', () => {
    return HttpResponse.json(mockARAging, { status: 200 });
  }),

  http.get('/api/claims-summary', ({ request }) => {
    const url = new URL(request.url);
    const insurer = url.searchParams.get('insurer');
    const location = url.searchParams.get('location');
    const status = url.searchParams.get('status');

    let filteredClaims = [...mockClaims];

    if (insurer && insurer !== 'all') {
      filteredClaims = filteredClaims.filter(c => c.insurer === insurer);
    }
    if (location && location !== 'all') {
      filteredClaims = filteredClaims.filter(c => c.location === location);
    }
    if (status && status !== 'all') {
      filteredClaims = filteredClaims.filter(c => c.status === status);
    }

    const filtered: ClaimsSummary = {
      ...mockClaimsSummary,
      pipeline: calculatePipeline(filteredClaims),
      items: filteredClaims,
    };

    return HttpResponse.json(filtered, { status: 200 });
  }),

  http.get('/api/digest-settings', () => {
    return HttpResponse.json(mockDigestSettings, { status: 200 });
  }),

  http.put('/api/digest-settings', async ({ request }) => {
    const body = await request.json() as DigestSettings;
    mockDigestSettings = body;
    return HttpResponse.json(mockDigestSettings, { status: 200 });
  }),

  http.get('/api/clients/:clientId', ({ params }) => {
    const { clientId } = params;
    const client = mockClientDetails[clientId as string];
    if (!client) {
      return HttpResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return HttpResponse.json(client, { status: 200 });
  }),

  http.get('/api/claims/:claimId', ({ params }) => {
    const { claimId } = params;
    const claim = mockClaims.find(c => c.id === claimId);
    if (!claim) {
      return HttpResponse.json({ error: 'Claim not found' }, { status: 404 });
    }
    return HttpResponse.json(claim, { status: 200 });
  }),
];
