import React, { useState } from 'react';
import { ShoppingCart, Check, Lock, Star, ChevronRight, Bookmark } from 'lucide-react';

export default function Book3D({ book, onInspect, onToggleRead }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isRead = book.isRead;
  const isWantToRead = book.isWantToRead;
  const hasCover = book.coverUrl && !imgError;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onInspect(book)}
      className="group relative cursor-pointer select-none flex-shrink-0 transition-all duration-300 ease-out z-10 hover:z-40"
    >
      {/* 3D Physical Book Structure */}
      <div
        className={`relative w-[125px] sm:w-[145px] md:w-[165px] aspect-[1/1.55] rounded-r-[5px] rounded-l-[2px] transition-all duration-300 ease-out transform ${
          isHovered
            ? '-translate-y-4 scale-[1.04] rotate-[-1.5deg] book-3d-shadow-hover'
            : 'book-3d-shadow'
        }`}
      >
        {/* Cover Image or Fallback Jacket */}
        <div className="relative w-full h-full overflow-hidden rounded-r-[5px] rounded-l-[2px] bg-[#1a1c23]">
          {hasCover ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                !isRead ? 'filter grayscale contrast-110 brightness-90 opacity-80' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full p-4 flex flex-col justify-between text-white ${
                isRead
                  ? 'bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900'
                  : 'bg-gradient-to-br from-stone-500 via-stone-600 to-stone-700 filter grayscale'
              }`}
            >
              <span className="text-[9px] uppercase tracking-wider text-white/60 font-mono">
                {book.seriesName || 'Volume'}
              </span>
              <div className="my-auto">
                <h4 className="font-semibold text-xs leading-tight line-clamp-3">
                  {book.title}
                </h4>
                <p className="text-[10px] text-white/70 mt-1 line-clamp-1">{book.author}</p>
              </div>
              <span className="text-[9px] text-white/50 font-mono">{book.year || 'Tome'}</span>
            </div>
          )}

          {/* Book Spine Highlight (Left Edge Curvature) */}
          <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-white/20 via-black/10 to-transparent pointer-events-none z-20" />
          {/* Vertical Spine Hinge Crease */}
          <div className="absolute inset-y-0 left-2 w-[1px] bg-black/25 pointer-events-none z-20" />
          <div className="absolute inset-y-0 left-[9px] w-[1px] bg-white/20 pointer-events-none z-20" />

          {/* Top Edge Paper Trim Highlight */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[#fbfbfa]/90 pointer-events-none z-20" />

          {/* Diagonal Cover Sheen / Light Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none z-10" />

          {/* Missing or Want-to-Read Overlay Badge on Shelf */}
          {!isRead && (
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-2 pointer-events-none z-20">
              <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-md">
                {isWantToRead ? (
                  <Bookmark className="w-4 h-4 text-[#0071e3]" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <span className="text-[9px] font-medium text-white/90 mt-1 drop-shadow bg-black/40 px-2 py-0.5 rounded-full">
                {isWantToRead ? 'Want to Read' : 'Missing'}
              </span>
            </div>
          )}

          {/* Volume Order Badge on Shelf */}
          {book.order !== undefined && book.order !== null && (
            <div className="absolute top-2 right-2 z-20 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow-sm">
                #{book.order === 0 ? 'P' : book.order}
              </span>
            </div>
          )}
        </div>

        {/* Contact Shadow Underneath Book */}
        <div className="absolute -bottom-2 inset-x-2 h-2.5 bg-black/40 blur-[3px] rounded-full pointer-events-none" />
      </div>

      {/* Floating Hover Card / Tooltip (Appears ONLY on hover!) */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.25)] border border-black/[0.08] transition-all duration-300 pointer-events-auto ${
          isHovered
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tooltip Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r border-b border-black/[0.08] rotate-45" />

        {/* Header / Series Order */}
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-semibold text-[#0071e3] uppercase tracking-wider">
            {book.seriesName ? `${book.seriesName} &bull; Book #${book.order}` : 'Standalone'}
          </span>
          {isRead ? (
            <span className="flex items-center gap-1 text-[#34c759] font-semibold bg-[#34c759]/10 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Read</span>
            </span>
          ) : isWantToRead ? (
            <span className="flex items-center gap-1 text-[#0071e3] font-medium bg-[#0071e3]/10 px-2 py-0.5 rounded-full">
              <Bookmark className="w-3 h-3" />
              <span>Want to Read</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#86868b] font-medium bg-[#f5f5f7] px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              <span>Missing</span>
            </span>
          )}
        </div>

        {/* Book Title & Author */}
        <h4 className="font-semibold text-sm text-[#1d1d1f] leading-snug line-clamp-2">
          {book.title}
        </h4>
        <p className="text-xs text-[#86868b] mt-0.5">
          {book.author} &bull; {book.pages ? `${book.pages}p` : (book.year || 'Classic')}
        </p>

        {/* Hover Action Bar */}
        <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center gap-2">
          {!isRead ? (
            <>
              <a
                href={book.purchaseLinks?.[0]?.url || `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium py-1.5 px-3 rounded-xl flex items-center justify-between transition-all shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Book</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead(book);
                }}
                title="Mark as Read"
                className="p-1.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] rounded-xl border border-black/[0.06] transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onInspect(book)}
              className="w-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] text-xs font-medium py-1.5 px-3 rounded-xl flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-[#0071e3] text-[#0071e3]" />
                <span>{book.rating ? `${book.rating}.0 Rating` : 'Completed'}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
