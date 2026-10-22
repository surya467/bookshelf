import React, { useState } from 'react';
import BookCard from './BookCard';
import { ChevronRight, Filter } from 'lucide-react';

export default function SeriesCard({ series, onInspectBook, onToggleRead }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'missing' | 'read'

  const { name, author, universe, books, readCount, totalCount, missingCount, completionPercent, isCompleted } = series;

  const filteredBooks = books.filter((b) => {
    if (filterMode === 'missing') return !b.isRead;
    if (filterMode === 'read') return b.isRead;
    return true;
  });

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
      {/* Series Header (Apple Clean Minimal Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/[0.06]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            {universe || 'Series Collection'}
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
            {name}
          </h2>
          <p className="text-sm text-[#86868b] mt-0.5">
            By <span className="text-[#1d1d1f] font-medium">{author}</span>
          </p>
        </div>

        {/* Progress Bar & Filter Controls */}
        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#86868b]">
              {readCount} of {totalCount} read
            </span>
            <span className="text-xs font-semibold text-[#1d1d1f]">
              {completionPercent}%
            </span>
          </div>

          {/* Minimal Apple Progress Track */}
          <div className="w-full sm:w-56 h-1.5 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted ? 'bg-[#34c759]' : 'bg-[#0071e3]'
              }`}
              style={{ width: `${Math.max(4, completionPercent)}%` }}
            />
          </div>

          {/* Segmented Control Pill (iOS / macOS Style) */}
          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-full border border-black/[0.03] text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterMode('read')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filterMode === 'read'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Read ({readCount})
            </button>
            <button
              onClick={() => setFilterMode('missing')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                filterMode === 'missing'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display (Exact Reference Layout) */}
      <div className="mt-8 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none">
        <div className="flex gap-6 items-stretch min-w-max sm:min-w-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onInspect={onInspectBook}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
