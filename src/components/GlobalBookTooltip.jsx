import React from 'react';
import { Check, Bookmark, Lock, Star } from 'lucide-react';

export default function GlobalBookTooltip({ activeHover }) {
  if (!activeHover || !activeHover.book || !activeHover.rect) return null;

  const { book, rect } = activeHover;
  const isRead = !!book.isRead;
  const isWantToRead = !!book.isWantToRead;

  // Calculate coordinates with safety boundaries
  const tooltipWidth = 240;
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  // Prevent clipping off screen edges
  left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

  // If there's enough room above, place above; otherwise place below
  const placeBelow = rect.top < 140;
  const top = placeBelow ? rect.bottom + 12 : undefined;
  const bottom = !placeBelow ? window.innerHeight - rect.top + 12 : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${left}px`,
        top: top !== undefined ? `${top}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
        width: `${tooltipWidth}px`,
        zIndex: 99999,
        pointerEvents: 'none',
      }}
      className="animate-fadeIn select-none"
    >
      <div className="p-3 rounded-2xl bg-[#14161f]/95 backdrop-blur-2xl border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(0,113,227,0.25)]">
        {/* Series & Order Badge */}
        <div className="flex items-center justify-between gap-1 mb-1 text-[10px]">
          <span className="text-[#0071e3] font-semibold tracking-wide uppercase truncate max-w-[150px]">
            {book.seriesName ? `${book.seriesName}` : 'Individual Work'}
          </span>
          {book.order !== undefined && book.order !== null && (
            <span className="font-mono text-white/50 bg-white/10 px-1.5 py-0.2 rounded text-[9px]">
              Vol #{book.order === 0 ? 'P' : book.order}
            </span>
          )}
        </div>

        {/* Title & Author */}
        <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2">
          {book.title}
        </h4>
        <p className="text-[10px] text-white/60 mt-0.5 truncate">{book.author}</p>

        {/* Status and Rating Footer */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[10px]">
          {isRead ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-2.5 h-2.5 stroke-[3]" /> Read
            </span>
          ) : isWantToRead ? (
            <span className="text-[#0071e3] font-medium flex items-center gap-1 bg-[#0071e3]/10 px-2 py-0.5 rounded-full border border-[#0071e3]/20">
              <Bookmark className="w-2.5 h-2.5 fill-[#0071e3]" /> Want to Read
            </span>
          ) : (
            <span className="text-white/50 font-medium flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              <Lock className="w-2.5 h-2.5" /> Missing Tome
            </span>
          )}

          {book.rating > 0 ? (
            <span className="text-amber-400 font-medium flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" /> {book.rating}★
            </span>
          ) : (
            <span className="text-white/40 text-[9px]">Click for details</span>
          )}
        </div>
      </div>
    </div>
  );
}
