import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Ticket,
  ShoppingBag,
  Building,
  Send,
  MessageSquare,
  FileText,
  Eye,
  Plus
} from 'lucide-react';

interface SupportCase {
  id: string;
  case_number: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved';
  category: 'ticket_access' | 'duplicate_charge' | 'refund_claim' | 'organizer_dispute' | 'event_cancellation';
  assigned_to: string;
  order_reference?: string;
  ticket_number?: string;
  event_title?: string;
  created_at: string;
  updated_at: string;
  messages: {
    sender: string;
    role: 'customer' | 'agent' | 'system';
    text: string;
    timestamp: string;
  }[];
}

const INITIAL_CASES: SupportCase[] = [
  {
    id: 'case-001',
    case_number: 'SUP-2026-4019',
    subject: 'Cannot download ticket pass PDF after Paystack debit',
    customer_name: 'Tunde Adeleke',
    customer_email: 'tunde.adeleke@gmail.com',
    priority: 'high',
    status: 'in_progress',
    category: 'ticket_access',
    assigned_to: 'Alex Morgan (Support)',
    order_reference: 'EOS-2026-9021-AF',
    ticket_number: 'TK-2026-09281-AA',
    event_title: 'Lagos Tech Fest 2026 (VIP Pass)',
    created_at: '2026-10-15 03:45:00',
    updated_at: '2026-10-15 04:10:00',
    messages: [
      {
        sender: 'Tunde Adeleke',
        role: 'customer',
        text: 'Hello, my account was debited ₦75,000 for VIP pass but the confirmation page showed a gateway timeout and I have no email receipt.',
        timestamp: '2026-10-15 03:45:00'
      },
      {
        sender: 'Alex Morgan',
        role: 'agent',
        text: 'Investigating order ref EOS-2026-9021-AF with Paystack webhook logs. Payment verified. Re-dispatching signed pass PDF to your email now.',
        timestamp: '2026-10-15 04:10:00'
      }
    ]
  },
  {
    id: 'case-002',
    case_number: 'SUP-2026-4020',
    subject: 'Organizer rescheduled concert by 3 weeks — requesting emergency refund',
    customer_name: 'Chioma Okonkwo',
    customer_email: 'chioma.o@outlook.com',
    priority: 'critical',
    status: 'open',
    category: 'event_cancellation',
    assigned_to: 'Unassigned',
    order_reference: 'EOS-2026-9022-BC',
    event_title: 'Afrobeats Symphony & Soundscape',
    created_at: '2026-10-15 04:30:00',
    updated_at: '2026-10-15 04:30:00',
    messages: [
      {
        sender: 'Chioma Okonkwo',
        role: 'customer',
        text: 'The organizer SoundPulse announced the concert is moved to November. I will be out of the country. Please refund my table reservation of ₦150,000.',
        timestamp: '2026-10-15 04:30:00'
      }
    ]
  },
  {
    id: 'case-003',
    case_number: 'SUP-2026-4021',
    subject: 'Gate scanner rejected QR code at venue entrance',
    customer_name: 'Ibrahim Danladi',
    customer_email: 'ibrahim.d@kano.gov.ng',
    priority: 'high',
    status: 'resolved',
    category: 'ticket_access',
    assigned_to: 'Sarah Connor (Support)',
    ticket_number: 'TK-2026-09283-CC',
    event_title: 'Abuja Fintech Summit',
    created_at: '2026-10-14 11:00:00',
    updated_at: '2026-10-14 11:40:00',
    messages: [
      {
        sender: 'Ibrahim Danladi',
        role: 'customer',
        text: 'Standing at gate B, bouncer says ticket shows invalidated.',
        timestamp: '2026-10-14 11:00:00'
      },
      {
        sender: 'Sarah Connor',
        role: 'agent',
        text: 'Re-issued fresh cryptographic QR code hash. Attendee admitted successfully at 11:35.',
        timestamp: '2026-10-14 11:40:00'
      }
    ]
  }
];

export const SupportPage: React.FC = () => {
  const [cases, setCases] = useState<SupportCase[]>(INITIAL_CASES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendReply = () => {
    if (!selectedCase || !replyText.trim()) return;

    const newMsg = {
      sender: 'Active Support Admin',
      role: 'agent' as const,
      text: replyText.trim(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: 'in_progress',
              messages: [...c.messages, newMsg],
              updated_at: newMsg.timestamp
            }
          : c
      )
    );

    setSelectedCase((prev) =>
      prev
        ? {
            ...prev,
            status: 'in_progress',
            messages: [...prev.messages, newMsg],
            updated_at: newMsg.timestamp
          }
        : null
    );

    setReplyText('');
    setActionNotice('Support update sent to customer email & incident timeline recorded.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'resolved' } : c))
    );
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase((prev) => (prev ? { ...prev, status: 'resolved' } : null));
    }
    setActionNotice('Case marked RESOLVED and closed.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getPriorityBadge = (p: SupportCase['priority']) => {
    switch (p) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (s: SupportCase['status']) => {
    switch (s) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Open
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
            Waiting
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <LifeBuoy className="w-6 h-6 text-rose-500" />
              <span>Customer Support & Incident Desk</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Investigate attendee ticket delivery failures, payment disputes, event rescheduling claims, and assigned agent notes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              Open Cases: <strong className="text-amber-400">1</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
              In Progress: <strong className="text-cyan-400">1</strong>
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by Case #, Subject, Customer Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-zinc-900/40 border border-zinc-850 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Linked Entity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No support tickets found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {c.case_number}
                        <span className="text-[10px] text-zinc-500 block">{c.created_at}</span>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <span className="text-white font-bold block truncate">{c.subject}</span>
                        <span className="text-zinc-500 text-[11px] block truncate">
                          Assigned: {c.assigned_to}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{c.customer_name}</span>
                        <span className="text-zinc-500 text-[11px] block">{c.customer_email}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {c.order_reference && (
                          <span className="text-rose-400 block truncate">Order: {c.order_reference}</span>
                        )}
                        {c.ticket_number && (
                          <span className="text-cyan-400 block truncate">Pass: {c.ticket_number}</span>
                        )}
                        {c.event_title && (
                          <span className="text-zinc-400 block truncate">{c.event_title}</span>
                        )}
                      </td>

                      <td className="py-3 px-4">{getPriorityBadge(c.priority)}</td>

                      <td className="py-3 px-4">{getStatusBadge(c.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedCase(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Workspace</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Workspace Modal */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-white font-mono">{selectedCase.case_number}</span>
                    {getPriorityBadge(selectedCase.priority)}
                    {getStatusBadge(selectedCase.status)}
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200 mt-1">{selectedCase.subject}</h3>
                  <span className="text-xs text-zinc-500">
                    Opened by {selectedCase.customer_name} ({selectedCase.customer_email})
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Linked Context Box */}
              {(selectedCase.order_reference || selectedCase.ticket_number || selectedCase.event_title) && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 grid grid-cols-3 gap-2 text-xs font-mono">
                  {selectedCase.order_reference && (
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Order Ref</span>
                      <strong className="text-rose-400">{selectedCase.order_reference}</strong>
                    </div>
                  )}
                  {selectedCase.ticket_number && (
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Ticket Pass</span>
                      <strong className="text-cyan-400">{selectedCase.ticket_number}</strong>
                    </div>
                  )}
                  {selectedCase.event_title && (
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-sans">Event</span>
                      <strong className="text-white truncate block">{selectedCase.event_title}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation Feed */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Incident Message History
                </span>
                <div className="space-y-2.5 max-h-60 overflow-y-auto p-1">
                  {selectedCase.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        m.role === 'customer'
                          ? 'bg-zinc-900/60 border border-zinc-800 mr-8 text-zinc-300'
                          : 'bg-rose-950/30 border border-rose-800/60 ml-8 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="font-bold">{m.sender} ({m.role.toUpperCase()})</strong>
                        <span className="text-zinc-500 font-mono">{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Box */}
              {selectedCase.status !== 'resolved' ? (
                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <label className="text-[11px] font-bold text-zinc-300 block">Agent Response & Investigation Action</label>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official response or internal resolution action..."
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleResolveCase(selectedCase.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Case Resolved</span>
                    </button>

                    <button
                      disabled={!replyText.trim()}
                      onClick={handleSendReply}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply & Dispatch</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>This incident has been resolved and closed.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
