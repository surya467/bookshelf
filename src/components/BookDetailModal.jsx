import React, { useState } from 'react';
import { X, Check, Lock, ShoppingCart, ExternalLink, Star, Bookmark } from 'lucide-react';
import { getPurchaseLinks } from '../services/openLibrary';

export default function BookDetailModal({ book, onClose, onToggleRead }) {
  if (!book) return null;

  const [imgError, setImgError] = useState(false);
  const isRead = !!book.isRead;
  const isWantToRead = !!book.isWantToRead;
  const purchaseLinks = book.purchaseLinks || getPurchaseLinks(book.title, book.author, book.isbn13 || book.isbn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#111318] border border-white/10 rounded-[28px] shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Cover Display */}
        <div className="p-6 md:w-5/12 bg-[#0c0d12] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="relative max-h-[300px] w-full flex items-center justify-center">
            {book.coverUrl && !imgError ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                onError={() => setImgError(true)}
                className={`max-h-[280px] max-w-full object-contain rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] ${
                  !isRead ? 'filter grayscale contrast-110 brightness-85' : ''
                }`}
              />
            ) : (
              <div className="w-44 h-60 bg-[#161820] border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                <p className="font-semibold text-xs text-white/90">{book.title}</p>
                <p className="text-[10px] text-white/50 mt-1">{book.author}</p>
              </div>
            )}
          </div>

          {/* Toggle Read Button */}
          <button
            onClick={() => onToggleRead(book)}
            className={`mt-6 w-full py-2.5 px-4 rounded-xl font-medium text-xs transition-all active:scale-95 shadow-sm ${
              isRead
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
            }`}
          >
            {isRead ? 'Mark as Unread' : isWantToRead ? 'Mark as Read ✓' : 'Mark as Read'}
          </button>
        </div>

        {/* Right Side: Details & Store Links */}
        <div className="p-6 sm:p-8 md:w-7/12 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold text-[#0071e3] uppercase tracking-wider">
                {book.seriesName ? `${book.seriesName} • #${book.order || book.seriesNumber}` : 'Individual Work'}
              </span>

              {isRead ? (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Read</span>
                </span>
              ) : isWantToRead ? (
                <span className="text-[10px] font-semibold text-[#0071e3] bg-[#0071e3]/10 border border-[#0071e3]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bookmark className="w-3 h-3 fill-[#0071e3]" />
                  <span>Want to Read</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Missing</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white leading-snug">
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              By <span className="text-white/80 font-medium">{book.author}</span>
            </p>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 mt-4 py-2.5 px-3.5 bg-white/5 rounded-xl border border-white/5 text-[11px] text-white/70">
              {book.year && (
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Year</span>
                  <span className="font-medium text-white/90">{book.year}</span>
                </div>
              )}
              {book.pages > 0 && (
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Length</span>
                  <span className="font-medium text-white/90">{book.pages} pages</span>
                </div>
              )}
              {book.rating > 0 && (
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">My Rating</span>
                  <span className="font-medium text-amber-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> {book.rating}/5
                  </span>
                </div>
              )}
              {book.dateRead && (
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Finished</span>
                  <span className="font-medium text-white/90">{book.dateRead}</span>
                </div>
              )}
            </div>
          </div>

          {/* Store Links */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
              Purchase or Borrow Online
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {purchaseLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-xs text-white/80 transition-all"
                >
                  <span className="font-medium text-[11px] truncate">{link.name}</span>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
