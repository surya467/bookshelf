import React, { useState } from 'react';
import { Star, ExternalLink, Edit3, BookOpen } from 'lucide-react';
import { formatPrice } from '../services/priceDiscovery';

// Fallback pastel color palettes for books without covers
const FALLBACK_PALETTES = [
  { bg: 'from-amber-100 to-rose-200', border: 'border-rose-300', icon: '📖', text: 'text-amber-950' },
  { bg: 'from-indigo-100 to-purple-200', border: 'border-purple-300', icon: '✨', text: 'text-indigo-950' },
  { bg: 'from-emerald-100 to-teal-200', border: 'border-teal-300', icon: '🌿', text: 'text-emerald-950' },
  { bg: 'from-sky-100 to-blue-200', border: 'border-blue-300', icon: '🌙', text: 'text-sky-950' },
  { bg: 'from-rose-100 to-pink-200', border: 'border-pink-300', icon: '🌸', text: 'text-pink-950' },
  { bg: 'from-violet-100 to-fuchsia-200', border: 'border-fuchsia-300', icon: '🔮', text: 'text-violet-950' },
];

export default function CuteBookCard({ book, currency = 'USD', onClick, isPriciest = false }) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Deterministic palette index based on title
  const hash = (book.title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length];

  const hasValidImage = book.coverUrl && !imgError;

  return (
    <div
      onClick={() => onClick(book)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer select-none transition-all duration-300 ease-out transform hover:-translate-y-2 hover:scale-[1.02]"
    >
      {/* Crown badge for priciest book */}
      {isPriciest && (
        <div className="absolute -top-3.5 -left-2 z-20 flex items-center gap-1 bg-amber-400 text-amber-950 font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-bounce">
          <span>👑</span>
          <span>Priciest Gem</span>
        </div>
      )}

      {/* Floating Price Pill */}
      <div className="absolute -top-2.5 -right-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-sm border-2 border-pink-300/80 text-pink-600 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-full shadow-md group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500 transition-all">
        <span>{formatPrice(book.price, currency)}</span>
      </div>

      {/* Book Cover Container with 3D Book styling */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_35px_rgba(244,114,182,0.22)] transition-all duration-300 border border-amber-900/10 bg-amber-50">
        {/* Book spine lighting overlay */}
        <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 left-2 w-[1px] bg-white/30 z-10 pointer-events-none" />

        {/* Cover artwork or cute fallback */}
        {hasValidImage ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${palette.bg} p-4 flex flex-col justify-between border-2 ${palette.border} rounded-2xl`}>
            <div className="flex justify-between items-start">
              <span className="text-2xl">{palette.icon}</span>
              <BookOpen className="w-4 h-4 text-slate-400/80" />
            </div>
            
            <div className="my-auto text-left">
              <p className={`font-bold text-sm leading-tight line-clamp-3 ${palette.text}`}>
                {book.title}
              </p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                {book.author}
              </p>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
              <span>{book.binding || 'Paperback'}</span>
              <span>{book.pages ? `${book.pages}p` : ''}</span>
            </div>
          </div>
        )}

        {/* Hover info overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent p-3 flex flex-col justify-end text-white transition-opacity duration-200 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-bold text-xs sm:text-sm line-clamp-2 drop-shadow-sm">
            {book.title}
          </p>
          <p className="text-xs text-slate-200/90 line-clamp-1 mt-0.5">
            {book.author}
          </p>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[11px]">
            {book.avgRating > 0 ? (
              <div className="flex items-center gap-1 text-amber-300 font-semibold">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>{book.avgRating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-slate-300">{book.pages ? `${book.pages} pages` : 'Goodreads'}</span>
            )}

            <span className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm flex items-center gap-1">
              Details
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Mini Caption */}
      <div className="mt-2 text-center px-1">
        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {book.title}
        </h4>
        <p className="text-[11px] text-slate-500 line-clamp-1">
          {book.author}
        </p>
      </div>
    </div>
  );
}
