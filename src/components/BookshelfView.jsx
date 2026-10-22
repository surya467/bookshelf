import React from 'react';
import BookCard from './BookCard';

export default function BookshelfView({ seriesList, standaloneBooks, onInspectBook, onToggleRead }) {
  return (
    <div className="space-y-12 pb-12">
      {seriesList.map((series) => (
        <div key={series.id} className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-black/[0.06]">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                {series.name}
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                {series.author} &bull; {series.readCount} of {series.totalCount} read
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1d1d1f]">
              {series.completionPercent}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {series.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onInspect={onInspectBook}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        </div>
      ))}

      {standaloneBooks && standaloneBooks.length > 0 && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="mb-6 pb-4 border-b border-black/[0.06]">
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
              Standalone & Companion Books
            </h3>
            <p className="text-xs text-[#86868b] mt-0.5">
              Individual works and companion pieces from your collection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {standaloneBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onInspect={onInspectBook}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
