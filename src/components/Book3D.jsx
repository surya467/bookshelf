import React, { useState, useRef } from 'react';

export default function Book3D({
  book,
  onInspect,
  size = 'default',
  onHoverStart,
  onHoverEnd,
}) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const isRead = !!book.isRead;
  const isWantToRead = !!book.isWantToRead;
  const hasCover = book.coverUrl && !imgError;

  // Proportional sizing
  const sizeClasses =
    size === 'compact'
      ? 'w-[58px] sm:w-[68px] md:w-[74px]'
      : size === 'showcase'
      ? 'w-[84px] sm:w-[98px] md:w-[108px]'
      : 'w-[66px] sm:w-[76px] md:w-[84px]';

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      onHoverStart(book, rect);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverEnd) {
      onHoverEnd();
    }
  };

  return (
    <div
      ref={containerRef}
      id={`book-${book.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onInspect(book)}
      className="group relative cursor-pointer select-none flex-shrink-0 transition-all duration-300 ease-out z-10 hover:z-40"
    >
      {/* 3D Physical Book Structure */}
      <div
        className={`relative ${sizeClasses} aspect-[1/1.52] rounded-r-[3.5px] rounded-l-[1.5px] transition-all duration-300 ease-out transform ${
          isHovered
            ? '-translate-y-3.5 scale-[1.04] rotate-[-0.8deg] book-3d-dark-hover'
            : 'book-3d-dark'
        }`}
      >
        {/* Book Body: Cover Image or Fallback Jacket */}
        <div className="relative w-full h-full overflow-hidden rounded-r-[3.5px] rounded-l-[1.5px] bg-[#17181e]">
          {hasCover ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${
                !isRead ? 'filter grayscale-[0.85] contrast-105 brightness-90 opacity-80' : 'brightness-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full p-2.5 flex flex-col justify-between text-white pointer-events-none ${
                isRead
                  ? 'bg-gradient-to-br from-[#1e2330] via-[#282d3e] to-[#12141c]'
                  : 'bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 filter grayscale opacity-75'
              }`}
            >
              <span className="text-[8px] uppercase tracking-wider text-white/50 font-mono truncate">
                {book.seriesName || 'Volume'}
              </span>
              <div className="my-auto">
                <h4 className="font-semibold text-[10px] leading-tight line-clamp-3 text-white/95">
                  {book.title}
                </h4>
                <p className="text-[8px] text-white/60 mt-0.5 line-clamp-1">{book.author}</p>
              </div>
              <span className="text-[8px] text-white/40 font-mono">{book.year || 'Tome'}</span>
            </div>
          )}

          {/* Left Book Spine Crease & Shadow */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/50 via-white/10 to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 left-1.5 w-[1px] bg-black/40 pointer-events-none z-20" />

          {/* Top Paper Page Trim Line */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#eae6dc]/80 pointer-events-none z-20" />

          {/* Subtle Right Edge Bevel */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-white/20 pointer-events-none z-20" />

          {/* Diagonal Cover Sheen / Texture Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent pointer-events-none z-10" />

          {/* TACTILE JAPANESE OBI PAPER BELLY BAND for Want-To-Read */}
          {isWantToRead && !isRead && (
            <div className="absolute inset-x-0 bottom-3.5 z-25 pointer-events-none select-none">
              <div className="relative py-1 px-1 bg-[#20222a]/95 backdrop-blur-sm border-y border-amber-500/35 shadow-[0_2px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
                <span className="text-[7.5px] sm:text-[8px] font-mono tracking-widest uppercase font-semibold text-amber-300 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-400 inline-block shadow-[0_0_4px_rgba(251,191,36,0.6)]" />
                  WANT TO READ
                </span>
              </div>
            </div>
          )}

          {/* Minimalist Missing Tome Paper Band */}
          {!isRead && !isWantToRead && (
            <div className="absolute inset-x-0 bottom-3.5 z-25 pointer-events-none select-none">
              <div className="relative py-1 px-1 bg-black/65 backdrop-blur-sm border-y border-white/20 flex items-center justify-center">
                <span className="text-[7.5px] sm:text-[8px] font-mono tracking-widest uppercase font-medium text-white/80">
                  MISSING
                </span>
              </div>
            </div>
          )}

          {/* Volume Order Badge on Shelf */}
          {book.order !== undefined && book.order !== null && (
            <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
              <span className="bg-black/70 backdrop-blur-md text-white text-[8px] font-mono px-1 py-0.2 rounded shadow-sm border border-white/15">
                #{book.order === 0 ? 'P' : book.order}
              </span>
            </div>
          )}
        </div>

        {/* Realistic Book Contact Shadow onto Shelf */}
        <div className="absolute -bottom-1.5 inset-x-1 h-2 bg-black/65 blur-[2.5px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
