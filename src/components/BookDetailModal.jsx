import React, { useState } from 'react';
import { X, Check, Lock, ShoppingCart, ExternalLink, Star } from 'lucide-react';
import { getPurchaseLinks } from '../services/openLibrary';

export default function BookDetailModal({ book, onClose, onToggleRead }) {
  if (!book) return null;

  const [imgError, setImgError] = useState(false);
  const isRead = book.isRead;
  const purchaseLinks = book.purchaseLinks || getPurchaseLinks(book.title, book.author, book.isbn13 || book.isbn);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black/[0.06] rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Perfectly Fitted Cover Stage */}
        <div className="p-8 md:w-5/12 bg-[#f5f5f7] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-black/[0.04]">
          <div className="relative max-h-[340px] w-full flex items-center justify-center">
            {book.coverUrl && !imgError ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                onError={() => setImgError(true)}
                className={`max-h-[320px] max-w-full object-contain rounded-2xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.22)] ${
                  !isRead ? 'filter grayscale contrast-110 brightness-95' : ''
                }`}
              />
            ) : (
              <div className="w-48 h-64 bg-[#e5e5ea] rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                <p className="font-semibold text-sm text-[#1d1d1f]">{book.title}</p>
                <p className="text-xs text-[#86868b] mt-1">{book.author}</p>
              </div>
            )}
          </div>

          {/* Toggle Read Button */}
          <button
            onClick={() => onToggleRead(book)}
            className={`mt-6 w-full py-2.5 px-4 rounded-full font-medium text-xs transition-all active:scale-95 shadow-sm ${
              isRead
                ? 'bg-white hover:bg-[#e5e5ea] text-[#1d1d1f] border border-black/[0.06]'
                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
            }`}
          >
            {isRead ? 'Mark as Unread' : 'Mark as Read'}
          </button>
        </div>

        {/* Right Side: Details & Store Links */}
        <div className="p-8 md:w-7/12 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider">
                {book.seriesName ? `${book.seriesName} &bull; Book #${book.order || book.seriesNumber}` : 'Standalone Volume'}
              </span>

              {isRead ? (
                <span className="text-[11px] font-semibold text-[#34c759] bg-[#34c759]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Read</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Unread</span>
                </span>
              )}
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] leading-snug">
              {book.title}
            </h3>
            <p className="text-sm text-[#86868b] mt-1">
              By <span className="text-[#1d1d1f] font-medium">{book.author}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-[#86868b]">
              {book.year && (
                <span className="bg-[#f5f5f7] px-3 py-1 rounded-full border border-black/[0.03]">
                  {book.year}
                </span>
              )}
              {book.pages && (
                <span className="bg-[#f5f5f7] px-3 py-1 rounded-full border border-black/[0.03]">
                  {book.pages} pages
                </span>
              )}
              {isRead && book.rating > 0 && (
                <span className="bg-[#f5f5f7] px-3 py-1 rounded-full border border-black/[0.03] text-[#1d1d1f] font-semibold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#0071e3] text-[#0071e3]" />
                  {book.rating}.0 Rating
                </span>
              )}
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">
                Overview
              </h4>
              <p className="text-xs sm:text-sm text-[#1d1d1f]/80 leading-relaxed mt-1 line-clamp-4">
                {book.description ||
                  `Part of the ${book.seriesName || 'literary'} collection by ${book.author}. Complete this volume to expand your library and master the series.`}
              </p>
            </div>
          </div>

          {/* Direct Purchasing Links */}
          <div className="mt-8 pt-5 border-t border-black/[0.06]">
            <div className="text-xs font-semibold text-[#86868b] mb-2.5">
              Purchase Options:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {purchaseLinks.slice(0, 4).map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] text-xs font-medium transition-all"
                >
                  <span>{link.name}</span>
                  <ExternalLink className="w-3 h-3 text-[#86868b]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
