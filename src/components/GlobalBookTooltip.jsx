import React from 'react';
import { Star } from 'lucide-react';

export default function GlobalBookTooltip({ activeHover, isNight = false }) {
  if (!activeHover || !activeHover.book || !activeHover.rect) return null;

  const { book, rect } = activeHover;
  const isRead = !!book.isRead;
  const isWantToRead = !!book.isWantToRead;

  // Calculate coordinates with safety boundaries
  const tooltipWidth = 230;
  let left = rect.left + rect.width / 2 - tooltipWidth / 2;
  // Prevent clipping off screen edges
  left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

  // If there's enough room above, place above; otherwise place below
  const placeBelow = rect.top < 135;
  const top = placeBelow ? rect.bottom + 10 : undefined;
  const bottom = !placeBelow ? window.innerHeight - rect.top + 10 : undefined;

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
      className="animate-fadeIn select-none pointer-events-none"
    >
      {/* Museum Archive / Architectural Index Card */}
      <div className="p-3 rounded-xl bg-[#14151b]/95 backdrop-blur-xl border border-white/15 text-white shadow-[0_15px_35px_rgba(0,0,0,0.55)]">
        {/* Micro Category & Volume */}
        <div className="flex items-center justify-between text-[9px] font-mono tracking-widest text-neutral-400 uppercase mb-1">
          <span className="truncate max-w-[150px]">
            {book.seriesName || 'Standalone'}
          </span>
          {book.order !== undefined && book.order !== null && (
            <span className="text-neutral-500">
              #{book.order === 0 ? 'P' : book.order}
            </span>
          )}
        </div>

        {/* Book Title */}
        <h4 className="text-xs font-semibold text-neutral-100 leading-snug line-clamp-2">
          {book.title}
        </h4>
        <p className="text-[10px] text-neutral-400 mt-0.5 truncate">{book.author}</p>

        {/* Minimalist Status & Rating */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px]">
          {isRead ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Completed
            </span>
          ) : isWantToRead ? (
            <span className="text-amber-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Want to Read
            </span>
          ) : (
            <span className="text-neutral-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 inline-block" />
              Missing Tome
            </span>
          )}

          {book.rating > 0 ? (
            <span className="text-neutral-300 font-mono text-[9px] flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {book.rating}
            </span>
          ) : (
            <span className="text-neutral-500 text-[9px]">Click to inspect</span>
          )}
        </div>
      </div>
    </div>
  );
}
