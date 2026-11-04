import React, { useState, useMemo } from 'react';
import { Check, Bookmark, ShoppingBag, ExternalLink, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * ComicVerseCatalog: High-Octane Collectible Catalog Grid.
 * Directly inspired by Reference Image 3 (Comic Verse Catalog).
 * Features massive bold editorial typography ("CATALOG"), collectible Mylar plastic
 * sleeve sheen, corner tape accents, filter chips, and series grouping.
 */
export default function ComicVerseCatalog({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  activeFilter = 'all', // 'all' | 'read' | 'tbr' | 'completed' | 'missing'
  onChangeFilter,
  onInspectBook,
  onToggleRead,
}) {
  const [hoveredBookId, setHoveredBookId] = useState(null);

  // Group and filter books
  const filteredData = useMemo(() => {
    let series = seriesList.map((s) => ({
      ...s,
      books: s.books.filter((b) => {
        if (activeFilter === 'read') return b.isRead;
        if (activeFilter === 'tbr') return !b.isRead && b.isWantToRead;
        if (activeFilter === 'missing') return !b.isRead && !b.isWantToRead;
        return true;
      }),
    })).filter((s) => {
      if (activeFilter === 'completed') return s.isCompleted;
      return s.books.length > 0;
    });

    let singles = [
      ...standaloneBooks,
      ...wantToReadStandalone,
    ].filter((b) => {
      if (activeFilter === 'read') return b.isRead;
      if (activeFilter === 'tbr') return !b.isRead && b.isWantToRead;
      if (activeFilter === 'missing') return !b.isRead && !b.isWantToRead;
      return true;
    });

    // Remove duplicates from singles
    const seen = new Set();
    singles = singles.filter((b) => {
      const key = b.id || b.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return { series, singles };
  }, [seriesList, standaloneBooks, wantToReadStandalone, activeFilter]);

  const totalFilteredCount = useMemo(() => {
    let count = filteredData.singles.length;
    filteredData.series.forEach((s) => (count += s.books.length));
    return count;
  }, [filteredData]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none animate-fadeIn">
      {/* Series Sections */}
      {filteredData.series.map((s) => {
        const readInSeries = s.books.filter((b) => b.isRead).length;
        const totalInSeries = s.books.length;
        const isComplete = s.isCompleted;

        return (
          <div key={s.id} className="mb-14 sm:mb-16">
            {/* Series Subheader with Punchy Typography */}
            <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="w-3 h-3 bg-[#ff2d55] rounded-sm transform rotate-45" />
                <h3 className="font-display text-2xl sm:text-4xl tracking-wide uppercase text-white">
                  {s.name}
                </h3>
                {isComplete && (
                  <span className="bg-[#34c759] text-black font-impact text-xs uppercase px-2.5 py-0.5 rounded-sm tracking-wider">
                    COMPLETE COLLECTION
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono-meta text-xs text-neutral-400">
                  {readInSeries}/{totalInSeries} VOLUMES
                </span>
                <div className="w-20 sm:w-28 h-2 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="h-full bg-gradient-to-r from-[#ff2d55] to-[#ff9500] transition-all duration-500"
                    style={{ width: `${totalInSeries > 0 ? (readInSeries / totalInSeries) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Collectible Book Grid (4 Columns Desktop / 2 Columns Mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {s.books.map((book, idx) => (
                <ComicCard
                  key={book.id || `${s.id}-${idx}`}
                  book={book}
                  isHovered={hoveredBookId === book.id}
                  onHoverChange={(hov) => setHoveredBookId(hov ? book.id : null)}
                  onInspect={() => onInspectBook(book)}
                  onToggleRead={() => onToggleRead(book)}
                  hasTape={idx === 0 || book.order === 1} // Tape on corner of key issues
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Standalone Singles Section */}
      {filteredData.singles.length > 0 && (
        <div className="mb-14 sm:mb-16">
          <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-[#0071e3] rounded-sm transform rotate-45" />
              <h3 className="font-display text-2xl sm:text-4xl tracking-wide uppercase text-white">
                SINGLE EDITIONS & GRAPHIC NOVELS
              </h3>
            </div>
            <span className="font-mono-meta text-xs text-neutral-400">
              {filteredData.singles.length} EDITIONS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {filteredData.singles.map((book, idx) => (
              <ComicCard
                key={book.id || `single-${idx}`}
                book={book}
                isHovered={hoveredBookId === book.id}
                onHoverChange={(hov) => setHoveredBookId(hov ? book.id : null)}
                onInspect={() => onInspectBook(book)}
                onToggleRead={() => onToggleRead(book)}
                hasTape={idx % 3 === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalFilteredCount === 0 && (
        <div className="text-center py-20 bg-white/[0.02] border border-white/10 rounded-3xl p-8">
          <h4 className="font-display text-3xl text-neutral-400">NO TOMES MATCH CURRENT FILTER</h4>
          <p className="text-xs text-neutral-500 font-mono-meta mt-2">
            Switch filter tabs above to view other volumes in your archive.
          </p>
          <button
            onClick={() => onChangeFilter('all')}
            className="mt-6 px-5 py-2.5 bg-[#ff2d55] text-white font-impact text-xs uppercase tracking-wider rounded-sm hover:bg-[#e02649] transition-colors"
          >
            VIEW ALL ITEMS
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * ComicCard: High-Energy Collectible Book Cover Card.
 * Exact match to Comic Verse Catalog Cards in Reference Image 3.
 */
function ComicCard({ book, isHovered, onHoverChange, onInspect, onToggleRead, hasTape = false }) {
  const isRead = !!book.isRead;
  const isWantToRead = !!book.isWantToRead;
  const hasCover = !!book.coverUrl;

  return (
    <div
      onMouseEnter={() => {
        soundFX.playSwoosh();
        onHoverChange(true);
      }}
      onMouseLeave={() => onHoverChange(false)}
      className="group relative cursor-pointer flex flex-col"
    >
      {/* Cover Image Container with Mylar Plastic Sleeve Sheen */}
      <div
        onClick={onInspect}
        className={`relative aspect-[1/1.52] w-full rounded-md overflow-hidden bg-[#12131b] border border-white/15 mylar-sleeve card-collectible ${
          !isRead ? 'filter grayscale-[0.8] contrast-105 brightness-85' : 'brightness-100'
        }`}
      >
        {/* Comic Scotch Tape Accent on Corner */}
        {hasTape && <div className="tape-corner" />}

        {/* Cover Artwork */}
        {hasCover ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1c1d29] via-[#14151f] to-[#0c0d14] text-white">
            <span className="font-mono-meta text-[9px] uppercase tracking-wider text-[#ff2d55]">
              {book.seriesName || 'ARCHIVAL ISSUE'}
            </span>
            <div>
              <h4 className="font-impact text-sm sm:text-base leading-tight uppercase line-clamp-3">
                {book.title}
              </h4>
              <p className="font-mono-meta text-[10px] text-neutral-400 mt-1 line-clamp-1">{book.author}</p>
            </div>
            <span className="font-mono-meta text-[9px] text-neutral-500">{book.year || 'SPECIAL'}</span>
          </div>
        )}

        {/* Volume / Issue Pill Badge (Top Left) */}
        {book.order !== undefined && book.order !== null && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-black/85 backdrop-blur-md text-white font-impact text-[11px] px-2 py-0.5 rounded tracking-wide border border-white/20">
              #{book.order === 0 ? 'PROLOGUE' : book.order}
            </span>
          </div>
        )}

        {/* Read / Want to Read / Price Status Tag (Bottom Right overlay) */}
        <div className="absolute bottom-2 right-2 z-20">
          {isRead ? (
            <span className="bg-[#34c759] text-black font-impact text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>READ</span>
            </span>
          ) : isWantToRead ? (
            <span className="bg-[#ff9500] text-black font-impact text-[10px] px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Bookmark className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>WANT</span>
            </span>
          ) : (
            <span className="bg-black/80 backdrop-blur-md text-white/80 font-mono-meta text-[10px] px-2 py-0.5 rounded border border-white/20">
              ~${book.price ? book.price.toFixed(2) : '14.99'}
            </span>
          )}
        </div>

        {/* Spine Bevel & Subtle Dark Edge */}
        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/70 to-transparent pointer-events-none z-10" />
      </div>

      {/* Typography Details Below Card */}
      <div className="mt-2.5 px-0.5">
        <div className="flex items-center justify-between gap-2">
          <h5
            onClick={onInspect}
            className="font-impact text-sm sm:text-base tracking-wide text-neutral-100 group-hover:text-[#ff2d55] transition-colors truncate"
          >
            {book.title}
          </h5>

          {/* Quick Mark Read Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead();
            }}
            className={`p-1 rounded transition-colors flex-shrink-0 ${
              isRead
                ? 'text-[#34c759] hover:text-white'
                : 'text-neutral-500 hover:text-white'
            }`}
            title={isRead ? 'Mark Unread' : 'Mark as Read'}
          >
            <Check className={`w-3.5 h-3.5 ${isRead ? 'stroke-[3]' : 'opacity-60'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between font-mono-meta text-[11px] text-neutral-400 mt-0.5">
          <span className="truncate">{book.author}</span>
          {book.year && <span className="text-neutral-500 flex-shrink-0">{book.year}</span>}
        </div>
      </div>
    </div>
  );
}
