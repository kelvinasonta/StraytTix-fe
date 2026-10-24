import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  FileText,
  BarChart3,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Database
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  title: string;
  category: 'financial' | 'ticketing' | 'moderation' | 'compliance';
  description: string;
  format: 'CSV' | 'XLSX' | 'PDF';
  frequency: 'On-Demand' | 'Daily Automated' | 'Monthly';
  lastGenerated: string;
}

interface ExportJob {
  id: string;
  name: string;
  generated_by: string;
  date_range: string;
  format: 'CSV' | 'XLSX';
  status: 'completed' | 'processing' | 'failed';
  file_size: string;
  download_url: string;
  created_at: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'rep-fin-reconcile',
    title: 'Financial Settlement & Reconciliation Ledger',
    category: 'financial',
    description: 'Breakdown of gross ticket sales, platform take rates, Paystack/Flutterwave gateway processing fees, and organizer net payouts.',
    format: 'CSV',
    frequency: 'On-Demand',
    lastGenerated: 'Today, 04:30 UTC'
  },
  {
    id: 'rep-ticket-audit',
    title: 'Comprehensive Ticket Issuance & Gate Check-in Audit',
    category: 'ticketing',
    description: 'Detailed record of every issued pass, cryptographic QR hash, offline scanner check-in timestamps, and invalidations.',
    format: 'CSV',
    frequency: 'Daily Automated',
    lastGenerated: 'Yesterday, 23:59 UTC'
  },
  {
    id: 'rep-kyc-ndpr',
    title: 'NDPR Compliance & Organizer KYC Register',
    category: 'compliance',
    description: 'Record of verified Nigerian organizers, CAC registration numbers, reviewer signatures, and verified tax credentials.',
    format: 'PDF',
    frequency: 'Monthly',
    lastGenerated: '2026-10-01'
  },
  {
    id: 'rep-moderation-log',
    title: 'Content Moderation & Incident Report History',
    category: 'moderation',
    description: 'Audit of flagged events, user suspensions, takedown justifications, and appeal outcomes.',
    format: 'CSV',
    frequency: 'On-Demand',
    lastGenerated: '3 days ago'
  }
];

const INITIAL_JOBS: ExportJob[] = [
  {
    id: 'job-901',
    name: 'Q3 2026 Platform Gross Revenue & Fees.csv',
    generated_by: 'Alex Morgan (Super Admin)',
    date_range: 'Jul 1, 2026 – Sep 30, 2026',
    format: 'CSV',
    status: 'completed',
    file_size: '14.8 MB',
    download_url: '#',
    created_at: '2026-10-14 18:20:10'
  },
  {
    id: 'job-902',
    name: 'Lagos Tech Fest 2026 Gate Check-in Log.csv',
    generated_by: 'Sarah Connor (Support Admin)',
    date_range: 'Oct 14, 2026 – Oct 15, 2026',
    format: 'CSV',
    status: 'completed',
    file_size: '3.2 MB',
    download_url: '#',
    created_at: '2026-10-15 03:00:00'
  }
];

export const ReportsPage: React.FC = () => {
  const [jobs, setJobs] = useState<ExportJob[]>(INITIAL_JOBS);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleTriggerExport = (template: ReportTemplate) => {
    setIsGenerating(template.id);
    setTimeout(() => {
      const newJob: ExportJob = {
        id: `job-${Date.now()}`,
        name: `${template.title.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`,
        generated_by: 'Active Administrator',
        date_range: 'Last 30 Days',
        format: 'CSV',
        status: 'completed',
        file_size: '5.4 MB',
        download_url: '#',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      setJobs((prev) => [newJob, ...prev]);
      setIsGenerating(null);
      setActionNotice(`Report "${template.title}" successfully compiled and ready for secure download.`);
      setTimeout(() => setActionNotice(null), 4000);
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-rose-500" />
              <span>Data Export & Compliance Reporting Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Generate authoritative financial ledgers, ticket validation audit logs, and NDPR compliance registers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Retention Policy: <strong className="text-emerald-400">7 Years (CBN/FIRS)</strong>
            </span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 1. REPORT GENERATION TEMPLATES */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-rose-500" />
            <span>Authoritative Report Templates</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-mono font-bold uppercase block">
                      {tmpl.category}
                    </span>
                    <h3 className="font-bold text-sm text-white">{tmpl.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300">
                    {tmpl.format}
                  </span>
                </div>

                <p className="text-xs text-zinc-400">{tmpl.description}</p>

                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Frequency: {tmpl.frequency}</span>
                  <button
                    disabled={isGenerating === tmpl.id}
                    onClick={() => handleTriggerExport(tmpl)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className={`w-3.5 h-3.5 ${isGenerating === tmpl.id ? 'animate-bounce' : ''}`} />
                    <span>{isGenerating === tmpl.id ? 'Compiling File...' : 'Generate Export'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. RECENT EXPORT JOBS */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Recent Compiled Export Files</span>
          </h2>

          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4">Generated By</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created At</th>
                    <th className="py-3 px-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300 font-mono text-[11px]">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>{job.name}</span>
                      </td>

                      <td className="py-3 px-4 text-zinc-400 font-sans text-xs">{job.date_range}</td>

                      <td className="py-3 px-4 font-sans text-xs text-zinc-300">{job.generated_by}</td>

                      <td className="py-3 px-4 text-zinc-400">{job.file_size}</td>

                      <td className="py-3 px-4 font-sans">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      </td>

                      <td className="py-3 px-4 text-zinc-500">{job.created_at}</td>

                      <td className="py-3 px-4 text-right">
                        <a
                          href={job.download_url}
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`Downloading encrypted file: ${job.name}`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-rose-400" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
