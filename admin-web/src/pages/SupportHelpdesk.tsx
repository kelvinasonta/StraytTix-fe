import React, { useState } from 'react';
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
  Plus,
  RefreshCw,
  X
} from 'lucide-react';

interface SupportCase {
  id: string;
  case_number: string;
  subject: string;
  customer_name: string;
  customer_email: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  assigned_to: string;
  created_at: string;
  messages: {
    sender: string;
    role: 'customer' | 'agent' | 'system';
    text: string;
    timestamp: string;
  }[];
}

const SAMPLE_CASES: SupportCase[] = [
  {
    id: 'sup-001',
    case_number: 'TIC-8812',
    subject: 'Did not receive QR ticket email after payment',
    customer_name: 'David Okafor',
    customer_email: 'david.okafor@gmail.com',
    priority: 'high',
    status: 'open',
    category: 'Ticket Delivery',
    assigned_to: 'Alex Morgan',
    created_at: '2026-11-12 09:35:00',
    messages: [
      {
        sender: 'David Okafor',
        role: 'customer',
        text: 'I purchased 2 VIP tickets for the Afrobeats Symphony but have not received the QR code email. Payment was debited from my GTBank account.',
        timestamp: '09:35:00',
      },
    ],
  },
  {
    id: 'sup-002',
    case_number: 'TIC-8813',
    subject: 'Organizer bank account change verification',
    customer_name: 'Artful Media Support',
    customer_email: 'finance@artfulmedia.ng',
    priority: 'medium',
    status: 'in_progress',
    category: 'KYC / Banking',
    assigned_to: 'Superadmin',
    created_at: '2026-11-12 07:12:00',
    messages: [
      {
        sender: 'Artful Media Support',
        role: 'customer',
        text: 'We updated our corporate payout bank account to Zenith Bank and need manual administrative sign-off.',
        timestamp: '07:12:00',
      },
    ],
  },
];

export const SupportHelpdesk: React.FC = () => {
  const [cases, setCases] = useState<SupportCase[]>(SAMPLE_CASES);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedCase) return;

    const newMsg = {
      sender: 'Superadmin (Platform Staff)',
      role: 'agent' as const,
      text: replyText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              status: 'in_progress',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setSelectedCase((prev) =>
      prev ? { ...prev, status: 'in_progress', messages: [...prev.messages, newMsg] } : null
    );
    setReplyText('');
  };

  const handleResolve = (id: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c))
    );
    setSelectedCase((prev) => (prev ? { ...prev, status: 'resolved' } : null));
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <LifeBuoy className="w-6 h-6 text-rose-500" />
            <span>Attendee & Organizer Support Helpdesk</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Centralized dispute resolution, ticket delivery resends, organizer onboarding assistance, and case tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
            {cases.filter((c) => c.status === 'open').length} Open Tickets
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject, customer name or case #..."
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'open', 'in_progress', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold transition border ${
                statusFilter === st
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {item.case_number}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                    {item.subject}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="text-white font-medium">{item.customer_name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{item.customer_email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        item.priority === 'high' || item.priority === 'critical'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                        item.status === 'open'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : item.status === 'in_progress'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCase(item)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-semibold transition"
                    >
                      View Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Thread Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-rose-500" />
                  <span>
                    {selectedCase.case_number} • {selectedCase.subject}
                  </span>
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  From: {selectedCase.customer_name} ({selectedCase.customer_email})
                </span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="space-y-3 max-h-72 overflow-y-auto p-1">
              {selectedCase.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    msg.role === 'customer'
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200'
                      : 'bg-rose-950/30 border-rose-800/40 text-rose-200 ml-6'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span className="font-bold">{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type official administrative response or dispatch action..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-between items-center">
                {selectedCase.status !== 'resolved' ? (
                  <button
                    onClick={() => handleResolve(selectedCase.id)}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition"
                  >
                    Mark Resolved
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400">Case Resolved</span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

