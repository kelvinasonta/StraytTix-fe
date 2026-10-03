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
    <div className="relative bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row">
      {/* Decorative ticket notch left */}
      <div className="hidden md:block absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-brand-bg rounded-r-full border-r border-y border-zinc-150 z-10" />
      {/* Decorative ticket notch right */}
      <div className="hidden md:block absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-8 bg-brand-bg rounded-l-full border-l border-y border-zinc-150 z-10" />

      {/* Cover Image / Left Segment */}
      <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
        <img 
          src={ticket.eventImageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500'} 
          alt={ticket.eventTitle} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={getStatusVariant(ticket.status)}>
            {ticket.status}
          </Badge>
        </div>
      </div>

      {/* Ticket info / Center Segment */}
      <div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-zinc-200">
        <div>
          <span className="text-xs font-black text-[#E31B23] tracking-wider uppercase">
            {ticket.ticketTypeName}
          </span>
          <h3 className="text-lg font-bold text-zinc-950 mt-1 line-clamp-1">
            {ticket.eventTitle}
          </h3>
          <div className="mt-3.5 space-y-2">
            <p className="text-sm text-zinc-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-400" />
              {formatDate(ticket.eventDate)}
            </p>
            <p className="text-sm text-zinc-600 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span className="truncate">{ticket.eventVenue}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-zinc-100 flex justify-between items-center text-xs font-mono text-zinc-400">
          <span>TICKET ID: {ticket.ticketId}</span>
        </div>
      </div>

      {/* QR Code / Right Segment */}
      <div className="p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 bg-zinc-50/60 md:w-44 flex-shrink-0">
        <div className="flex flex-col items-center justify-center border border-zinc-200 p-3 rounded-xl bg-white shadow-inner">
          <QrCode className="w-18 h-18 text-zinc-900" />
          <span className="text-[10px] font-mono text-zinc-400 mt-1.5 font-bold">SCAN QR</span>
        </div>

        <div className="flex flex-row md:flex-col gap-2.5 w-auto md:w-full">
          {onView && (
            <button
              onClick={() => onView(ticket)}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" /> View
            </button>
          )}
          <button
            onClick={() => alert('Download Ticket stub PDF initiated.')}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
