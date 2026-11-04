import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * Jewel3DRail: 3D Diagonal Acrylic Showcase Rail.
 * Directly inspired by Pinterest Reference (video3.mp4).
 * Books glide along a refractive illuminated acrylic glass track with ambient light
 * reflections, depth elevation, and tactile Japanese Obi bands.
 */
export default function Jewel3DRail({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  activeTab = 'library',
  onInspectBook,
  onToggleRead,
}) {
  const scrollRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Flatten books for the continuous jewel rail
  const allBooks = React.useMemo(() => {
    const list = [];
    if (activeTab === 'library') {
      seriesList
        .filter((s) => s.books.some((b) => b.isRead))
        .forEach((s) => {
          s.books.forEach((b) => list.push({ ...b, seriesName: s.name }));
        });
      standaloneBooks
        .filter((b) => b.isRead)
        .forEach((b) => list.push({ ...b, seriesName: 'Standalone' }));
    } else {
      seriesList
        .filter((s) => !s.books.some((b) => b.isRead) && s.books.some((b) => b.isWantToRead))
        .forEach((s) => {
          s.books.forEach((b) => list.push({ ...b, seriesName: s.name }));
        });
      const tbrSet = new Set();
      [...standaloneBooks.filter((b) => !b.isRead && b.isWantToRead), ...wantToReadStandalone.filter((b) => !b.isRead)].forEach((b) => {
        const id = b.id || b.title;
        if (!tbrSet.has(id)) {
          tbrSet.add(id);
          list.push({ ...b, seriesName: 'Wishlist' });
        }
      });
    }
    return list;
  }, [seriesList, standaloneBooks, wantToReadStandalone, activeTab]);

  const scroll = (direction) => {
    soundFX.playClick();
    if (scrollRef.current) {
      const offset = direction === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn select-none">
      {/* Rail Showcase Controls Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0071e3] shadow-[0_0_8px_#0071e3]" />
            <h3 className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white">
              Acrylic Jewel Showcase
            </h3>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
            Gliding perspective track &bull; {allBooks.length} Editions on Rail
          </p>
        </div>

        {/* Scroll Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Angled Rail Stage */}
      <div className="relative w-full py-10 perspective-1200 overflow-hidden">
        {/* Glowing Acrylic Rail Track Surface */}
        <div
          ref={scrollRef}
          className="flex items-end gap-6 sm:gap-8 overflow-x-auto pb-12 pt-6 px-6 sm:px-12 scrollbar-none scroll-smooth preserve-3d"
          style={{
            transform: 'rotateX(8deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {allBooks.map((book, idx) => {
            const isHovered = hoveredId === book.id;
            const isRead = !!book.isRead;
            const isWant = !!book.isWantToRead;

            return (
              <div
                key={book.id || `jewel-${idx}`}
                onMouseEnter={() => {
                  soundFX.playSwoosh();
                  setHoveredId(book.id);
                }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onInspectBook(book)}
                className="group relative cursor-pointer flex-shrink-0 transition-transform duration-400 preserve-3d"
              >
                {/* 3D Standing Book on Track */}
                <div
                  className={`relative w-36 sm:w-44 aspect-[1/1.55] rounded-r-xl rounded-l-md transition-all duration-400 ease-out preserve-3d ${
                    isHovered
                      ? '-translate-y-6 scale-[1.06] shadow-[0_30px_60px_rgba(0,0,0,0.85)]'
                      : 'shadow-[0_16px_35px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {/* Book Body: Cover Artwork or Fallback */}
                  <div className="relative w-full h-full rounded-r-xl rounded-l-md overflow-hidden bg-[#15161f] border-t border-r border-white/20">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${
                          !isRead ? 'filter grayscale-[0.8] brightness-80' : 'brightness-100'
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1b1e2a] to-[#0f1118] text-white">
                        <span className="text-[9px] uppercase tracking-wider text-white/50 font-mono">
                          {book.seriesName}
                        </span>
                        <div>
                          <h4 className="font-editorial text-xs font-bold leading-snug line-clamp-3">
                            {book.title}
                          </h4>
                          <p className="text-[9px] text-white/60 mt-1 line-clamp-1">{book.author}</p>
                        </div>
                        <span className="text-[9px] font-mono text-white/40">{book.year || 'Tome'}</span>
                      </div>
                    )}

                    {/* Book Spine Bevel (Left Edge) */}
                    <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/80 via-white/10 to-transparent pointer-events-none z-20" />

                    {/* Top Page Trim */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-[#f5f0e6] opacity-80 pointer-events-none z-20" />

                    {/* Obi Belly Band for TBR / Missing */}
                    {isWant && !isRead && (
                      <div className="absolute inset-x-0 bottom-4 z-20 pointer-events-none">
                        <div className="py-1 px-2 bg-[#1e2029]/95 backdrop-blur-md border-y border-amber-500/40 text-center shadow-lg">
                          <span className="text-[8.5px] font-mono tracking-widest font-bold text-amber-300">
                            WANT TO READ
                          </span>
                        </div>
                      </div>
                    )}

                    {!isRead && !isWant && (
                      <div className="absolute inset-x-0 bottom-4 z-20 pointer-events-none">
                        <div className="py-1 px-2 bg-black/70 backdrop-blur-md border-y border-white/20 text-center">
                          <span className="text-[8.5px] font-mono tracking-widest text-white/70">
                            MISSING
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Volume Badge */}
                    {book.order !== undefined && book.order !== null && (
                      <div className="absolute top-2 right-2 z-20">
                        <span className="bg-black/75 backdrop-blur-md text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow border border-white/15">
                          #{book.order === 0 ? 'P' : book.order}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Refractive Ambient Shadow on Acrylic Rail */}
                  <div
                    className={`absolute -bottom-4 inset-x-2 h-6 rounded-full blur-md transition-opacity duration-300 pointer-events-none ${
                      isHovered
                        ? 'bg-[#0071e3]/30 opacity-100 scale-110'
                        : 'bg-black/80 opacity-70'
                    }`}
                  />
                </div>

                {/* Subtitle Beneath Rail */}
                <div className="w-36 sm:w-44 mt-3 text-center transition-opacity duration-300">
                  <h5 className="font-editorial text-xs font-semibold text-neutral-200 truncate group-hover:text-[#0071e3]">
                    {book.title}
                  </h5>
                  <p className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">
                    {book.author}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Acrylic Glass Base Rail Bar */}
        <div className="w-full h-3 rounded-full acrylic-track-surface relative -mt-8 z-0 pointer-events-none" />
      </div>
    </div>
  );
}
