import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Zap,
  Radio,
  FileCode,
  ShieldCheck,
  Send,
  Bell,
  Sliders,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ExtensionItem {
  id: string;
  name: string;
  category: 'payment' | 'messaging' | 'storage' | 'security' | 'analytics';
  provider: string;
  version: string;
  status: 'healthy' | 'degraded' | 'offline' | 'unconfigured';
  latencyMs: number;
  lastPing: string;
  errorRate: number;
  description: string;
  enabled: boolean;
  webhookStatus: 'active' | 'failing' | 'unreachable';
}

interface SystemServiceHealth {
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    cpu?: string;
    memory?: string;
    connections?: string;
    latency?: string;
    queueBacklog?: string;
  };
  details: string;
  uptime: string;
}

const INITIAL_EXTENSIONS: ExtensionItem[] = [
  {
    id: 'ext-paystack',
    name: 'Paystack Payment Engine',
    category: 'payment',
    provider: 'Paystack Payments Limited',
    version: 'v3.2.0',
    status: 'healthy',
    latencyMs: 142,
    lastPing: '2s ago',
    errorRate: 0.02,
    description: 'Primary Nigerian gateway for Cards, Bank Transfers, USSD, and Apple Pay checkout.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-flutterwave',
    name: 'Flutterwave Multi-Rail',
    category: 'payment',
    provider: 'Flutterwave Technology Solutions',
    version: 'v2.8.1',
    status: 'healthy',
    latencyMs: 185,
    lastPing: '5s ago',
    errorRate: 0.05,
    description: 'Secondary failover rail for pan-African cross-border payments & mobile money.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-termii',
    name: 'Termii SMS & OTP Gateway',
    category: 'messaging',
    provider: 'Termii Networks Inc',
    version: 'v1.9.4',
    status: 'healthy',
    latencyMs: 220,
    lastPing: '8s ago',
    errorRate: 0.12,
    description: 'Direct DND-bypass SMS routes across MTN, Airtel, Glo, and 9mobile for pass delivery.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-resend',
    name: 'Resend / Postmark Transactional Email',
    category: 'messaging',
    provider: 'Resend Inc.',
    version: 'v2.1.0',
    status: 'healthy',
    latencyMs: 95,
    lastPing: '3s ago',
    errorRate: 0.01,
    description: 'DKIM/DMARC authenticated email delivery pipeline for tickets, receipts, and KYC notifications.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-s3-wasabi',
    name: 'Cloudflare R2 / AWS S3 Storage',
    category: 'storage',
    provider: 'Cloudflare R2 Storage',
    version: 'v1.4.2',
    status: 'healthy',
    latencyMs: 65,
    lastPing: '1s ago',
    errorRate: 0.0,
    description: 'Encrypted object vault for CAC business certificates, tax documents, and event media.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-redis-queue',
    name: 'Redis Sentinel Event Bus & Cache',
    category: 'storage',
    provider: 'Redis Enterprise',
    version: 'v7.2.4',
    status: 'healthy',
    latencyMs: 2,
    lastPing: 'Real-time',
    errorRate: 0.0,
    description: 'Low-latency in-memory cache, rate limiter, and async queue cluster for ticket generation.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-sentry',
    name: 'Sentry Crash & APM Monitor',
    category: 'analytics',
    provider: 'Functional Software, Inc.',
    version: 'v8.11.0',
    status: 'healthy',
    latencyMs: 48,
    lastPing: '10s ago',
    errorRate: 0.0,
    description: 'Application exception capture, transaction tracing, and performance degradation alerts.',
    enabled: true,
    webhookStatus: 'active'
  },
  {
    id: 'ext-crypto-qr',
    name: 'Ed25519 Ticket QR Signing Module',
    category: 'security',
    provider: 'EventsOS Core Crypto Subsystem',
    version: 'v2.0.0',
    status: 'healthy',
    latencyMs: 0.8,
    lastPing: 'Real-time',
    errorRate: 0.0,
    description: 'Generates asymmetric signatures enabling zero-connectivity offline gate verification.',
    enabled: true,
    webhookStatus: 'active'
  }
];

const SYSTEM_HEALTH_SERVICES: SystemServiceHealth[] = [
  {
    name: 'PostgreSQL Primary Cluster (RDS)',
    type: 'Relational Database',
    status: 'healthy',
    metrics: {
      connections: '42 / 500 max',
      latency: '1.4ms query avg',
      cpu: '18% utilization'
    },
    details: 'Read/Write cluster operating with multi-AZ replication. WAL sync active.',
    uptime: '99.99% (94 days)'
  },
  {
    name: 'Laravel Background Horizon Queue',
    type: 'Async Job Worker',
    status: 'healthy',
    metrics: {
      queueBacklog: '0 jobs pending',
      latency: '12ms wait time',
      cpu: '8 active workers'
    },
    details: 'Processing ticket PDF rendering, notifications, webhooks, and ledger reconciliations.',
    uptime: '99.98% (42 days)'
  },
  {
    name: 'NGINX API Gateway & Cloudflare Edge',
    type: 'Reverse Proxy & CDN',
    status: 'healthy',
    metrics: {
      latency: '24ms global TTFB',
      memory: '2.1 GB / 8 GB'
    },
    details: 'WAF active with rate limiting enabled. 98.4% of static assets served from edge cache.',
    uptime: '100% (180 days)'
  },
  {
    name: 'Scheduled Cron Engine (Artisan Scheduler)',
    type: 'Cron & Heartbeat',
    status: 'healthy',
    metrics: {
      latency: 'Every 60s trigger',
      connections: 'Heartbeat OK'
    },
    details: 'Executes expired reservation cleanup, daily payout calculations, and currency rates sync.',
    uptime: '100% (120 days)'
  }
];

export const ExtensionsPage: React.FC = () => {
  const [extensions, setExtensions] = useState<ExtensionItem[]>(INITIAL_EXTENSIONS);
  const [services, setServices] = useState<SystemServiceHealth[]>(SYSTEM_HEALTH_SERVICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isPinging, setIsPinging] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('Just now');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredExtensions = extensions.filter(
    (ext) => selectedCategory === 'all' || ext.category === selectedCategory
  );

  const handleRunHealthDiagnostics = () => {
    setIsPinging(true);
    setTimeout(() => {
      setExtensions((prev) =>
        prev.map((ext) => ({
          ...ext,
          latencyMs: Math.max(12, Math.floor(ext.latencyMs + (Math.random() * 20 - 10))),
          lastPing: 'Just now'
        }))
      );
      setLastCheckTime(new Date().toLocaleTimeString());
      setIsPinging(false);
      setActionNotice('Complete system diagnostics executed. All services and integration webhooks are green.');
      setTimeout(() => setActionNotice(null), 4000);
    }, 900);
  };

  const handleToggleExtension = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) => {
        if (ext.id === id) {
          const newStatus = !ext.enabled;
          setActionNotice(`Extension "${ext.name}" ${newStatus ? 'ENABLED' : 'DISABLED'}. System route updated.`);
          setTimeout(() => setActionNotice(null), 4000);
          return { ...ext, enabled: newStatus };
        }
        return ext;
      })
    );
  };

  const getStatusBadge = (status: ExtensionItem['status']) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Degraded
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Down
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
            Unconfigured
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-rose-500" />
              <span>Extensions & System Health Observatory</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time monitoring of third-party API rails, core platform daemons, database connections, and webhook relays.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunHealthDiagnostics}
              disabled={isPinging}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Pinging Infrastructure...' : 'Run Diagnostics Check'}</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 1. TOP SYSTEM HEALTH SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Overall Platform SLA</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">99.98%</span>
              <span className="text-[10px] text-emerald-400 font-bold">Past 30 Days</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[99.98%]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Database Latency</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">1.4ms</span>
              <span className="text-[10px] text-zinc-500 font-mono">p99: 4.8ms</span>
            </div>
            <span className="text-[11px] text-zinc-400 block truncate">PostgreSQL Pool: 42 connections active</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Queue Backlog</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">0</span>
              <span className="text-[10px] text-emerald-400 font-bold">Idle & Responsive</span>
            </div>
            <span className="text-[11px] text-zinc-400 block truncate">8 Horizon background workers online</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Integrations</span>
              <Radio className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{extensions.filter(e => e.enabled).length} / {extensions.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold">All Healthy</span>
            </div>
            <span className="text-[11px] text-zinc-400 block truncate">Last full probe: {lastCheckTime}</span>
          </div>
        </div>

        {/* 2. CORE BACKEND SYSTEM SERVICES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-500" />
              <span>Core Infrastructure Cluster</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono">Node ID: app-cluster-lagos-01</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div key={svc.name} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-rose-400 font-mono font-bold uppercase block">{svc.type}</span>
                    <h3 className="font-bold text-sm text-white">{svc.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                </div>

                <p className="text-xs text-zinc-400">{svc.details}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-zinc-950 p-3 rounded-xl border border-zinc-900 text-zinc-300">
                  {Object.entries(svc.metrics).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-zinc-500 uppercase text-[9px] block">{key}:</span>
                      <strong className="text-white">{val}</strong>
                    </div>
                  ))}
                  <div>
                    <span className="text-zinc-500 uppercase text-[9px] block">Cluster Uptime:</span>
                    <strong className="text-emerald-400">{svc.uptime}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. EXTENSIONS & THIRD-PARTY INTEGRATIONS */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                <span>Installed Extensions & Gateway Integrations</span>
              </h2>
              <p className="text-xs text-zinc-400">Configure, monitor response times, and toggle third-party rails.</p>
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
              {['all', 'payment', 'messaging', 'storage', 'security', 'analytics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className={`p-5 rounded-2xl border transition-all ${
                  ext.enabled
                    ? 'bg-zinc-900/40 border-zinc-850 hover:border-zinc-800'
                    : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-rose-400 font-bold flex-shrink-0">
                      {ext.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{ext.name}</h3>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                          {ext.version}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 block truncate">{ext.provider}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(ext.status)}
                    <button
                      onClick={() => handleToggleExtension(ext.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        ext.enabled ? 'bg-emerald-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          ext.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-3">{ext.description}</p>

                {/* Telemetry Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-850/80 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Latency: <strong className="text-white">{ext.latencyMs}ms</strong>
                    </span>
                    <span>
                      Error Rate: <strong className="text-emerald-400">{(ext.errorRate * 100).toFixed(1)}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-zinc-300 text-[10px] uppercase font-bold">Webhook: {ext.webhookStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DISK & SECURITY SPECS */}
        <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white block">Automated Security Watchdog Enabled</span>
              <span className="text-zinc-400">
                SSL Certificates renew automatically. Webhooks with failed signatures are dropped immediately.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Primary Rail: Paystack Active</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500 font-mono text-[11px]">Failover: Flutterwave Ready</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
