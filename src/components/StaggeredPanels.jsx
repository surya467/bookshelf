import React, { useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Bookmark } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * StaggeredPanels: Vertical Cinematic Panoramic Panels.
 * Directly inspired by Reference Image 1 ("Content" Staggered Panels).
 * Features tall vertical comic/book artwork panels with staggered vertical offsets,
 * capsule volume pills, and editorial metadata.
 */
export default function StaggeredPanels({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  activeFilter = 'all',
  onInspectBook,
  onToggleRead,
}) {
  const scrollRef = useRef(null);

  // Flatten and filter books
  const books = useMemo(() => {
    const list = [];
    seriesList.forEach((s) => {
      s.books.forEach((b) => {
        list.push({ ...b, seriesName: s.name });
      });
    });
    standaloneBooks.forEach((b) => list.push({ ...b, seriesName: 'Standalone' }));
    wantToReadStandalone.forEach((b) => list.push({ ...b, seriesName: 'Wishlist' }));

    return list.filter((b) => {
      if (activeFilter === 'read') return b.isRead;
      if (activeFilter === 'tbr') return !b.isRead && b.isWantToRead;
      if (activeFilter === 'missing') return !b.isRead && !b.isWantToRead;
      return true;
    });
  }, [seriesList, standaloneBooks, wantToReadStandalone, activeFilter]);

  const scroll = (dir) => {
    soundFX.playClick();
    if (scrollRef.current) {
      const offset = dir === 'left' ? -460 : 460;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Accent colors for chapter pills (like in Image 1: red, green, blue, yellow accents)
  const pillColors = [
    'border-[#ff2d55] text-[#ff2d55]',
    'border-[#30d158] text-[#30d158]',
    'border-[#0a84ff] text-[#0a84ff]',
    'border-[#ffd60a] text-[#ffd60a]',
    'border-[#bf5af2] text-[#bf5af2]',
    'border-[#ff9f0a] text-[#ff9f0a]',
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none animate-fadeIn">
      {/* Editorial Header (Script "Content" style from Image 1) */}
      <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-10">
        <div>
          <h2 className="font-editorial italic text-4xl sm:text-6xl text-white font-bold tracking-tight">
            Content
          </h2>
          <p className="font-mono-meta text-xs text-neutral-400 mt-1">
            STAGGERED PANELS &bull; {books.length} VOLUMES
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all shadow active:scale-95"
            title="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all shadow active:scale-95"
            title="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Staggered Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-start gap-6 sm:gap-8 overflow-x-auto pb-12 pt-8 px-4 scrollbar-none scroll-smooth"
      >
        {books.map((book, idx) => {
          // Stagger vertical offset: alternating heights from Image 1
          const staggerOffset = (idx % 3 === 0) ? 'translate-y-0' : (idx % 3 === 1) ? 'translate-y-8 sm:translate-y-12' : '-translate-y-4 sm:-translate-y-6';
          const pillColor = pillColors[idx % pillColors.length];
          const isRead = !!book.isRead;
          const isWant = !!book.isWantToRead;

          return (
            <div
              key={book.id || `panel-${idx}`}
              onClick={() => onInspectBook(book)}
              className={`flex-shrink-0 w-36 sm:w-48 flex flex-col cursor-pointer group transition-transform duration-500 ${staggerOffset}`}
            >
              {/* Tall Vertical Panel Card */}
              <div
                className={`relative w-full aspect-[1/2.4] rounded-sm overflow-hidden bg-[#12131c] border border-white/15 mylar-sleeve shadow-[0_12px_35px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform duration-400 ${
                  !isRead ? 'filter grayscale-[0.8] brightness-85' : 'brightness-100'
                }`}
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover pointer-events-none"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1c1d29] to-[#0d0e14] text-white">
                    <span className="font-mono-meta text-[8px] text-[#ff2d55]">{book.seriesName}</span>
                    <h4 className="font-impact text-xs uppercase leading-tight line-clamp-4">{book.title}</h4>
                    <span className="font-mono-meta text-[8px] text-neutral-400">{book.author}</span>
                  </div>
                )}

                {/* Subtle Gradient Fade at bottom of panel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Capsule Pill Button Underneath (Image 1 style) */}
              <div className="mt-4 flex flex-col">
                <div className="w-full py-1.5 px-3 rounded-sm bg-black/80 border border-white/20 flex items-center justify-center text-center shadow-md">
                  <span className="font-editorial italic font-bold text-xs text-white tracking-wide">
                    {book.order !== undefined && book.order !== null ? `Chapter ${book.order}` : `Volume #${idx + 1}`}
                  </span>
                </div>

                {/* Accent Color Underline Line */}
                <div className={`w-full h-0.5 mt-1 border-b-2 ${pillColor}`} />

                {/* Title & Metadata */}
                <div className="mt-2.5">
                  <h5 className="font-impact text-xs sm:text-sm text-neutral-200 tracking-wide uppercase truncate group-hover:text-[#ff2d55] transition-colors">
                    {book.title}
                  </h5>
                  <p className="font-mono-meta text-[10px] text-neutral-400 truncate mt-0.5">
                    {book.author}
                  </p>
                  <p className="font-mono-meta text-[9px] text-neutral-500 truncate">
                    {book.seriesName}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
