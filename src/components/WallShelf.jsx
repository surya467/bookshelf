import React from 'react';
import Book3D from './Book3D';

export default function WallShelf({
  series,
  isStandalone = false,
  standaloneBooks = [],
  isWantToReadShelf = false,
  wantToReadBooks = [],
  onInspectBook,
  onToggleRead,
}) {
  // Case 1: Standalone Read Works
  if (isStandalone) {
    if (!standaloneBooks || standaloneBooks.length === 0) return null;

    return (
      <div className="relative mb-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-semibold tracking-wider uppercase text-[#1d1d1f]">
              Standalone Completed Works
            </h3>
            <span className="text-xs text-[#86868b] font-normal">
              &bull; Individual Finished Volumes
            </span>
          </div>
          <span className="text-xs text-[#86868b] font-medium">
            {standaloneBooks.length} Volumes
          </span>
        </div>

        <div className="relative w-full overflow-x-auto pb-0 pt-6 px-6 sm:px-12 scrollbar-none">
          <div className="flex items-end gap-5 sm:gap-7 min-w-max mx-auto justify-start sm:justify-center">
            {standaloneBooks.map((book) => (
              <Book3D
                key={book.id}
                book={book}
                onInspect={onInspectBook}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-[96%] mx-auto z-0 -mt-1">
          <div className="h-2 w-full bg-gradient-to-b from-[#f4f3ef] to-[#ffffff] border-t border-white/60" />
          <div className="h-3.5 w-full bg-white border-t border-black/[0.04] border-b border-black/[0.08] shelf-shadow" />
        </div>
      </div>
    );
  }

  // Case 2: Standalone Want-to-Read Wishlist Works
  if (isWantToReadShelf) {
    if (!wantToReadBooks || wantToReadBooks.length === 0) return null;

    return (
      <div className="relative mb-20 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm sm:text-base font-semibold tracking-wider uppercase text-[#0071e3]">
              Want to Read &bull; Standalone Wishlist
            </h3>
            <span className="text-xs text-[#86868b] font-normal">
              &bull; From your Goodreads to-read shelf
            </span>
          </div>
          <span className="text-xs text-[#86868b] font-medium">
            {wantToReadBooks.length} Books
          </span>
        </div>

        <div className="relative w-full overflow-x-auto pb-0 pt-6 px-6 sm:px-12 scrollbar-none">
          <div className="flex items-end gap-5 sm:gap-7 min-w-max mx-auto justify-start sm:justify-center">
            {wantToReadBooks.map((book) => (
              <Book3D
                key={book.id}
                book={book}
                onInspect={onInspectBook}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-[96%] mx-auto z-0 -mt-1">
          <div className="h-2 w-full bg-gradient-to-b from-[#f4f3ef] to-[#ffffff] border-t border-white/60" />
          <div className="h-3.5 w-full bg-white border-t border-black/[0.04] border-b border-black/[0.08] shelf-shadow" />
        </div>
      </div>
    );
  }

  // Case 3: Series Shelf (Contains Read books + Want-to-Read books + Missing in the same series!)
  const { name, author, books, readCount, totalCount, completionPercent } = series;

  return (
    <div className="relative mb-20 animate-fadeIn">
      {/* Series Header Label above the shelf */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-baseline justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm sm:text-base font-semibold tracking-wider uppercase text-[#1d1d1f]">
            {name}
          </h3>
          <span className="text-xs text-[#86868b] font-normal">
            &bull; {author}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#86868b]">
          <span className="font-medium text-[#1d1d1f]">{readCount} of {totalCount} Read</span>
          <span className="text-[11px] font-mono text-[#0071e3]">({completionPercent}%)</span>
        </div>
      </div>

      {/* Books Display Area (Resting on the Shelf Ledge) */}
      <div className="relative w-full overflow-x-auto pb-0 pt-6 px-6 sm:px-12 scrollbar-none">
        <div className="flex items-end gap-5 sm:gap-7 min-w-max mx-auto justify-start sm:justify-center">
          {books.map((book) => (
            <Book3D
              key={book.id}
              book={book}
              onInspect={onInspectBook}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      </div>

      {/* Architectural Floating Picture-Ledge Shelf */}
      <div className="relative w-full max-w-[96%] mx-auto z-0 -mt-1">
        <div className="h-2 w-full bg-gradient-to-b from-[#f4f3ef] to-[#ffffff] border-t border-white/60" />
        <div className="h-3.5 w-full bg-white border-t border-black/[0.04] border-b border-black/[0.08] shelf-shadow" />
      </div>
    </div>
  );
}
