import React from 'react';
import { ShoppingCart, ExternalLink, Check, Lock } from 'lucide-react';
import { getPurchaseLinks } from '../services/openLibrary';

export default function MissingTomesMarket({ seriesList, onInspectBook, onToggleRead }) {
  const missingBooks = [];
  seriesList.forEach((series) => {
    series.books.forEach((book) => {
      if (!book.isRead) {
        missingBooks.push({
          ...book,
          seriesName: series.name,
          seriesUniverse: series.universe,
        });
      }
    });
  });

  const totalCost = missingBooks.reduce((acc, b) => acc + (b.price || 14.99), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Overview Banner */}
      <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
            Wishlist & Procurement
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            Missing Books
          </h2>
          <p className="text-sm text-[#86868b] mt-1 max-w-xl">
            Volumes needed to complete your active series. Quick purchase links available across major booksellers.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#f5f5f7] px-6 py-4 rounded-2xl border border-black/[0.03]">
          <div>
            <div className="text-xs text-[#86868b]">Missing</div>
            <div className="text-2xl font-semibold text-[#1d1d1f]">{missingBooks.length}</div>
          </div>
          <div className="w-[1px] h-8 bg-black/[0.08]" />
          <div>
            <div className="text-xs text-[#86868b]">Estimated Total</div>
            <div className="text-2xl font-semibold text-[#1d1d1f]">${totalCost.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Missing Books Grid */}
      {missingBooks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[32px] border border-black/[0.04]">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-[#34c759]">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1d1d1f]">All Series Complete</h3>
          <p className="text-sm text-[#86868b] mt-1">
            You have read every single volume in the series on your shelf.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingBooks.map((book) => {
            const purchaseLinks = book.purchaseLinks || getPurchaseLinks(book.title, book.author, book.isbn13 || book.isbn);

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl p-5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex gap-5 items-center"
              >
                {/* Greyed-out cover */}
                <div
                  onClick={() => onInspectBook(book)}
                  className="relative aspect-[1/1.45] w-20 shrink-0 rounded-xl overflow-hidden cursor-pointer shadow-sm filter grayscale contrast-110 brightness-95"
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#e5e5ea] flex items-center justify-center text-[10px] text-[#86868b] p-1 text-center">
                      {book.title}
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    #{book.order}
                  </div>
                </div>

                {/* Details & Links */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-[#0071e3] uppercase tracking-wider">
                    {book.seriesName} &bull; Book #{book.order}
                  </div>
                  <h4
                    onClick={() => onInspectBook(book)}
                    className="text-base font-semibold text-[#1d1d1f] hover:text-[#0071e3] cursor-pointer mt-0.5 truncate transition-colors"
                  >
                    {book.title}
                  </h4>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    {book.author} &bull; ~${book.price ? book.price.toFixed(2) : '14.99'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    <a
                      href={purchaseLinks[0]?.url || `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Buy on Amazon</span>
                      <ExternalLink className="w-3 h-3 text-white/70" />
                    </a>

                    <a
                      href={purchaseLinks[1]?.url || `https://bookshop.org/search?keywords=${encodeURIComponent(book.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] text-xs font-medium px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 border border-black/[0.04]"
                    >
                      <span>Bookshop.org</span>
                    </a>

                    <button
                      onClick={() => onToggleRead(book)}
                      className="text-xs text-[#86868b] hover:text-[#0071e3] ml-auto font-medium"
                    >
                      Mark Read
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
