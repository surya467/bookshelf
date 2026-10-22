import React, { useState, useRef } from 'react';
import { Lock, Bookmark, Check } from 'lucide-react';

export default function Book3D({
  book,
  onInspect,
  onToggleRead,
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

  // Size variations: compact (default for 300-400 books per shelf) vs showcase
  const sizeClasses =
    size === 'compact'
      ? 'w-[58px] sm:w-[68px] md:w-[76px]'
      : size === 'showcase'
      ? 'w-[84px] sm:w-[98px] md:w-[110px]'
      : 'w-[68px] sm:w-[78px] md:w-[86px]';

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
        className={`relative ${sizeClasses} aspect-[1/1.52] rounded-r-[4px] rounded-l-[1.5px] transition-all duration-300 ease-out transform ${
          isHovered
            ? '-translate-y-3.5 scale-[1.05] rotate-[-0.8deg] book-3d-shadow-hover'
            : 'book-3d-shadow'
        }`}
      >
        {/* Book Body: Cover Image or Fallback Jacket */}
        <div className="relative w-full h-full overflow-hidden rounded-r-[4px] rounded-l-[1.5px] bg-[#121318]">
          {hasCover ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                !isRead ? 'filter grayscale contrast-115 brightness-75 opacity-75' : 'brightness-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full p-2.5 flex flex-col justify-between text-white ${
                isRead
                  ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950'
                  : 'bg-gradient-to-br from-zinc-800 via-zinc-900 to-black filter grayscale opacity-75'
              }`}
            >
              <span className="text-[8px] uppercase tracking-wider text-white/50 font-mono truncate">
                {book.seriesName || 'Volume'}
              </span>
              <div className="my-auto">
                <h4 className="font-semibold text-[10px] leading-tight line-clamp-3 text-white/90">
                  {book.title}
                </h4>
                <p className="text-[8px] text-white/60 mt-0.5 line-clamp-1">{book.author}</p>
              </div>
              <span className="text-[8px] text-white/40 font-mono">{book.year || 'Tome'}</span>
            </div>
          )}

          {/* Book Spine Highlight (Left Edge Curvature) */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 via-white/20 via-black/15 to-transparent pointer-events-none z-20" />
          {/* Vertical Spine Hinge Crease */}
          <div className="absolute inset-y-0 left-1.5 w-[1px] bg-black/40 pointer-events-none z-20" />
          <div className="absolute inset-y-0 left-2 w-[1px] bg-white/25 pointer-events-none z-20" />

          {/* Top Edge Paper Trim Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#fbfbfa]/80 pointer-events-none z-20" />

          {/* Diagonal Cover Sheen / Light Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none z-10" />

          {/* Missing or Want-to-Read Overlay Badge on Shelf */}
          {!isRead && (
            <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center p-1 pointer-events-none z-20">
              <div className="w-6 h-6 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 shadow-md">
                {isWantToRead ? (
                  <Bookmark className="w-3 h-3 text-[#0071e3] fill-[#0071e3]/30" />
                ) : (
                  <Lock className="w-3 h-3 text-white/80" />
                )}
              </div>
              <span className="text-[8px] font-medium text-white/90 mt-1 drop-shadow bg-black/60 px-1.5 py-0.2 rounded-full border border-white/10">
                {isWantToRead ? 'Want' : 'Missing'}
              </span>
            </div>
          )}

          {/* Volume Order Badge on Shelf */}
          {book.order !== undefined && book.order !== null && (
            <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
              <span className="bg-black/70 backdrop-blur-md text-white/90 text-[8px] font-mono px-1 py-0.2 rounded border border-white/10 shadow-sm">
                #{book.order === 0 ? 'P' : book.order}
              </span>
            </div>
          )}
        </div>

        {/* Contact Shadow Underneath Book on Shelf */}
        <div className="absolute -bottom-1.5 inset-x-1.5 h-2 bg-black/80 blur-[2.5px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
