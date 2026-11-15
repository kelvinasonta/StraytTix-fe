import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

interface PaginationProps {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange, loading }) => {
  if (!meta || meta.last_page <= 1) {
    return null;
  }

  const { current_page, last_page, total, from, to } = meta;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= last_page; i++) {
      if (
        i === 1 ||
        i === last_page ||
        (i >= current_page - delta && i <= current_page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-zinc-950/60 border-t border-zinc-800/80 text-xs">
      {/* Range summary */}
      <div className="text-zinc-400 font-mono text-[11px]">
        Showing <span className="font-bold text-white">{from || 0}</span> to{' '}
        <span className="font-bold text-white">{to || 0}</span> of{' '}
        <span className="font-bold text-white">{total || 0}</span> entries
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={current_page === 1 || loading}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          title="First Page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1 || loading}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-zinc-600 font-mono">
                  ...
                </span>
              );
            }
            const isCurrent = p === current_page;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                disabled={loading || isCurrent}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-rose-600 text-white shadow-xs pointer-events-none'
                    : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page || loading}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Next Page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(last_page)}
          disabled={current_page === last_page || loading}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Last Page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

