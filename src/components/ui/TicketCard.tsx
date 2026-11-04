import React from 'react';
import { Calendar, MapPin, QrCode, Download, ExternalLink } from 'lucide-react';
import type { TicketInstance } from '../../types/api';
import { formatDate } from '../../utils/format';
import Badge from './Badge';

interface TicketCardProps {
  ticket: TicketInstance;
  onView?: (ticket: TicketInstance) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onView }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'success';
      case 'Used': return 'default';
      case 'Expired': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="relative bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row group">
      {/* Decorative ticket notch left */}
      <div className="hidden md:block absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-zinc-50 dark:bg-[#070709] rounded-r-full border-r border-y border-zinc-200/80 dark:border-white/10 z-10" />
      {/* Decorative ticket notch right */}
      <div className="hidden md:block absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-zinc-50 dark:bg-[#070709] rounded-l-full border-l border-y border-zinc-200/80 dark:border-white/10 z-10" />

      {/* Cover Image / Left Segment */}
      <div className="relative w-full md:w-52 h-40 md:h-auto flex-shrink-0 overflow-hidden">
        <img 
          src={ticket.eventImageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} 
          alt={ticket.eventTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent md:hidden" />
        <div className="absolute top-3 left-3">
          <Badge variant={getStatusVariant(ticket.status)}>
            {ticket.status}
          </Badge>
        </div>
      </div>

      {/* Ticket info / Center Segment */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-zinc-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#E31B23] tracking-wider uppercase px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              {ticket.ticketTypeName}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white mt-2 line-clamp-1">
            {ticket.eventTitle}
          </h3>
          <div className="mt-3.5 space-y-2">
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span>{formatDate(ticket.eventDate)}</span>
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{ticket.eventVenue}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-white/5 flex justify-between items-center text-xs font-mono text-zinc-400 dark:text-zinc-500">
          <span>TICKET ID: <strong className="text-zinc-700 dark:text-zinc-300 font-bold">{ticket.ticketId}</strong></span>
        </div>
      </div>

      {/* QR Code / Right Segment */}
      <div className="p-5 sm:p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-zinc-50/70 dark:bg-white/[0.02] md:w-48 flex-shrink-0">
        <div className="flex flex-col items-center justify-center border border-zinc-200 dark:border-white/10 p-3 rounded-2xl bg-white dark:bg-zinc-900 shadow-inner">
          <QrCode className="w-16 h-16 sm:w-18 sm:h-18 text-zinc-900 dark:text-zinc-100" />
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1.5 font-bold tracking-wider">GATE PASS</span>
        </div>

        <div className="flex flex-row md:flex-col gap-2 w-auto md:w-full">
          {onView && (
            <button
              onClick={() => onView(ticket)}
              className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span>View</span>
            </button>
          )}
          <button
            onClick={() => {
              if (onView) {
                onView(ticket);
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 py-2.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
