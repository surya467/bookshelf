import React, { useState } from 'react';
import { ChevronRight, Check, Lock, ShoppingCart, Star } from 'lucide-react';

export default function BookCard({ book, onInspect, onToggleRead }) {
  const [imgError, setImgError] = useState(false);
  const isRead = book.isRead;
  const hasCover = book.coverUrl && !imgError;

  return (
    <div
      onClick={() => onInspect(book)}
      className="group relative cursor-pointer select-none transition-all duration-300 ease-out transform hover:-translate-y-2 flex-shrink-0"
    >
      {/* Outer Card with Soft Ambient Diffuse Shadow */}
      <div
        className={`relative aspect-[1/1.55] w-full min-w-[210px] max-w-[260px] rounded-[28px] overflow-hidden transition-all duration-300 bg-[#12141a] ${
          isRead
            ? 'shadow-[0_20px_45px_-12px_rgba(0,0,0,0.22)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.32)]'
            : 'shadow-[0_15px_35px_-10px_rgba(0,0,0,0.14)] group-hover:shadow-[0_25px_45px_-12px_rgba(0,0,0,0.24)]'
        }`}
      >
        {/* Layer 1: Ambient Blurred Backdrop (Ensures color harmony and full card bleed) */}
        {hasCover && (
          <img
            src={book.coverUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover filter blur-2xl scale-125 opacity-40 transition-transform duration-700 group-hover:scale-135 pointer-events-none ${
              !isRead ? 'grayscale contrast-125 brightness-75' : ''
            }`}
          />
        )}

        {/* Layer 2: Dedicated Cover Stage - Preserves 100% of the book cover without ANY cropping */}
        <div className="absolute inset-x-0 top-0 bottom-24 p-4 flex items-center justify-center z-10">
          {hasCover ? (
            <div className="relative h-full w-full flex items-center justify-center">
              <img
                src={book.coverUrl}
                alt={book.title}
                onError={() => setImgError(true)}
                className={`max-h-full max-w-full object-contain rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out group-hover:scale-105 ${
                  !isRead ? 'filter grayscale contrast-110 brightness-95' : ''
                }`}
                loading="lazy"
              />
            </div>
          ) : (
            <div
              className={`w-full h-full rounded-2xl p-5 flex flex-col justify-between shadow-inner ${
                isRead
                  ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white'
                  : 'bg-gradient-to-br from-stone-500 via-stone-600 to-stone-700 text-white filter grayscale'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                {book.seriesName || 'Volume'}
              </span>
              <div className="my-auto">
                <h4 className="font-semibold text-base leading-tight line-clamp-3">
                  {book.title}
                </h4>
                <p className="text-xs text-white/70 mt-1 line-clamp-1">{book.author}</p>
              </div>
              <span className="text-[10px] text-white/50">{book.year || 'Edition'}</span>
            </div>
          )}
        </div>

        {/* Top Badges (Apple Minimalist Glass Pills) */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-30 pointer-events-none">
          {book.order !== undefined && book.order !== null && (
            <span className="bg-black/50 backdrop-blur-md text-white/90 font-medium text-[10px] px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
              Book {book.order === 0 ? 'Prequel' : `#${book.order}`}
            </span>
          )}

          {isRead ? (
            <span className="bg-white/90 backdrop-blur-md text-[#1d1d1f] font-semibold text-[10px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Check className="w-3 h-3 text-[#0071e3] stroke-[3]" />
              <span>Read</span>
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md text-white/80 font-medium text-[10px] px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1 shadow-sm">
              <Lock className="w-3 h-3 text-white/80" />
              <span>Missing</span>
            </span>
          )}
        </div>

        {/* Bottom Dark Gradient & Metadata Overlay (Exact Reference Pill Layout) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-10 pb-4 px-4 flex flex-col justify-end z-20">
          {/* Book Title */}
          <h3 className="font-bold text-base sm:text-lg text-white leading-tight line-clamp-1 tracking-tight drop-shadow-sm">
            {book.title}
          </h3>

          {/* Subtitle / Metadata */}
          <p className="text-xs text-white/70 mt-0.5 font-normal line-clamp-1 flex items-center gap-1.5">
            <span>{book.author}</span>
            <span>&bull;</span>
            <span>{book.pages ? `${book.pages}p` : (book.year || 'Classic')}</span>
          </p>

          {/* Frosted Action Button (Matching "Explore Now >") */}
          <div className="mt-3 flex items-center gap-2">
            {!isRead ? (
              <>
                <a
                  href={book.purchaseLinks?.[0]?.url || `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-white/15 hover:bg-white/25 active:bg-white/30 backdrop-blur-md text-white font-medium text-xs py-2 px-3.5 rounded-2xl flex items-center justify-between border border-white/15 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-white/90" />
                    <span>Buy Book</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/70" />
                </a>

                {/* Mark as read quick checkmark */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRead(book);
                  }}
                  title="Mark as Read"
                  className="bg-white/15 hover:bg-white/30 text-white p-2 rounded-2xl border border-white/15 backdrop-blur-md transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="w-full bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium text-xs py-2 px-3.5 rounded-2xl flex items-center justify-between border border-white/15 transition-all">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>{book.rating ? `${book.rating}.0 Rating` : 'Completed'}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-white/70" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
