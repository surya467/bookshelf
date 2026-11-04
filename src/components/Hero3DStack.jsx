import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Bookmark, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * Hero3DStack: Tactile Isometric 3D Book Slab Stack.
 * Directly inspired by Pinterest Reference (pin2_image.jpg & video1.mp4).
 * Spines face forward with gold/silver foil typography, while top covers recede
 * in physical 3D isometric perspective with soft contact shadows on the slab below.
 */
export default function Hero3DStack({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  activeTab = 'library',
  onInspectBook,
  onToggleRead,
}) {
  const [collapsedSeries, setCollapsedSeries] = useState({});
  const [hoveredBookId, setHoveredBookId] = useState(null);

  const toggleSeriesCollapse = (seriesId) => {
    soundFX.playClick();
    setCollapsedSeries((prev) => ({
      ...prev,
      [seriesId]: !prev[seriesId],
    }));
  };

  // Filter series based on tab
  const displaySeries = React.useMemo(() => {
    if (activeTab === 'library') {
      return seriesList.filter((s) => s.books.some((b) => b.isRead));
    } else {
      return seriesList
        .filter((s) => !s.books.some((b) => b.isRead))
        .filter((s) => s.books.some((b) => b.isWantToRead));
    }
  }, [seriesList, activeTab]);

  const displayStandalone = React.useMemo(() => {
    if (activeTab === 'library') {
      return standaloneBooks.filter((b) => b.isRead);
    } else {
      const fromStandalone = standaloneBooks.filter((b) => !b.isRead && b.isWantToRead);
      const fromWant = wantToReadStandalone.filter((b) => !b.isRead);
      const seen = new Set();
      const list = [];
      for (const b of [...fromStandalone, ...fromWant]) {
        const id = b.id || b.title;
        if (!seen.has(id)) {
          seen.add(id);
          list.push(b);
        }
      }
      return list;
    }
  }, [standaloneBooks, wantToReadStandalone, activeTab]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-10 animate-fadeIn">
      {/* Series Groups Stack */}
      {displaySeries.map((series) => {
        const isCollapsed = !!collapsedSeries[series.id];
        const readInSeries = series.books.filter((b) => b.isRead).length;
        const totalInSeries = series.books.length;
        const isFullyComplete = readInSeries === totalInSeries;

        return (
          <div
            key={series.id}
            className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-hidden"
          >
            {/* Ambient Background Aura */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#0071e3]/10 blur-3xl pointer-events-none" />

            {/* Series Header Bar */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap select-none">
              <div
                onClick={() => toggleSeriesCollapse(series.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-xl bg-white/10 group-hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-neutral-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-300" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-[#0071e3] transition-colors">
                      {series.name}
                    </h3>
                    {isFullyComplete && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Complete</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {series.universe || 'Anthology'} &bull; {readInSeries} of {totalInSeries} Tomes Read
                  </span>
                </div>
              </div>

              {/* Progress Mini Meter */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {Math.round((readInSeries / totalInSeries) * 100)}% Archived
                  </span>
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#0071e3] to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${(readInSeries / totalInSeries) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Isometric 3D Slab Cascade */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4 pt-2 pb-4"
                >
                  {series.books.map((book, index) => (
                    <BookSlab3D
                      key={book.id || `${series.id}-${index}`}
                      book={book}
                      isHovered={hoveredBookId === book.id}
                      onHoverChange={(hov) => setHoveredBookId(hov ? book.id : null)}
                      onInspect={() => onInspectBook(book)}
                      onToggleRead={() => onToggleRead(book)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Standalone Books Stack */}
      {displayStandalone.length > 0 && (
        <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] p-5 sm:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 mb-6 select-none">
            <div>
              <h3 className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-white">
                {activeTab === 'library' ? 'Individual Masterpieces' : 'Wishlist Editions'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                {displayStandalone.length} Standalone Works
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2 pb-4">
            {displayStandalone.map((book, index) => (
              <BookSlab3D
                key={book.id || `standalone-${index}`}
                book={book}
                isHovered={hoveredBookId === book.id}
                onHoverChange={(hov) => setHoveredBookId(hov ? book.id : null)}
                onInspect={() => onInspectBook(book)}
                onToggleRead={() => onToggleRead(book)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual 3D Isometric Book Slab.
 * Renders physical thickness, spine with foil lettering, and receding 3D perspective cover plane.
 */
function BookSlab3D({ book, isHovered, onHoverChange, onInspect, onToggleRead }) {
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
      onClick={onInspect}
      className="group relative cursor-pointer select-none perspective-1200 transition-transform duration-300"
    >
      {/* 3D Slab Container */}
      <div
        className={`relative w-full rounded-2xl transition-all duration-400 ease-out preserve-3d ${
          isHovered
            ? 'transform -translate-y-2 scale-[1.012] shadow-[0_20px_45px_rgba(0,0,0,0.7)]'
            : 'shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
        }`}
      >
        {/* Receding Top Plane (Isometric Cover Surface receding in 3D perspective) */}
        <div
          className="relative h-20 sm:h-24 w-full rounded-t-2xl overflow-hidden origin-bottom transition-all duration-400"
          style={{
            transform: 'perspective(900px) rotateX(46deg)',
            transformOrigin: 'bottom center',
            marginBottom: '-14px',
            background: isRead
              ? 'linear-gradient(180deg, #181b26 0%, #12141c 100%)'
              : 'linear-gradient(180deg, #1e2029 0%, #101117 100%)',
          }}
        >
          {/* Cover Artwork on Receding Plane */}
          {hasCover && (
            <img
              src={book.coverUrl}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-top opacity-35 transition-opacity duration-500 pointer-events-none ${
                isHovered ? 'opacity-65' : ''
              } ${!isRead ? 'filter grayscale brightness-75' : ''}`}
            />
          )}

          {/* Paper Pages Texture Edge */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#dcd6c8] via-[#f7f3ea] to-[#dcd6c8] opacity-80" />
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/10 pointer-events-none" />

          {/* Receding Plane Tag */}
          <div className="absolute top-2 left-4 flex items-center gap-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/50">
              {book.seriesName ? `Vol #${book.order || book.seriesNumber}` : 'Archived Edition'}
            </span>
          </div>
        </div>

        {/* Forward-Facing Spine Slab (Tactile Book Spine) */}
        <div
          className={`relative z-10 w-full h-14 sm:h-16 rounded-b-2xl rounded-t-sm px-4 sm:px-6 flex items-center justify-between gap-4 border-t border-white/20 transition-all duration-300 ${
            isRead
              ? 'bg-gradient-to-r from-[#171922] via-[#202433] to-[#161823]'
              : 'bg-gradient-to-r from-[#14151c] via-[#1b1c24] to-[#12131a] opacity-85'
          }`}
        >
          {/* Spine Groove Shadow (Left Edge) */}
          <div className="absolute left-0 inset-y-0 w-2.5 bg-gradient-to-r from-black/80 to-transparent rounded-bl-2xl pointer-events-none" />

          {/* Spine Gold Embossed Volume + Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Volume Badge */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold border transition-colors flex-shrink-0 ${
                isRead
                  ? 'bg-[#0071e3]/20 border-[#0071e3]/40 text-[#0071e3]'
                  : isWantToRead
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/5 border-white/10 text-neutral-400'
              }`}
            >
              #{book.order === 0 ? 'P' : book.order || '•'}
            </div>

            {/* Book Title & Author */}
            <div className="min-w-0">
              <h4
                className={`font-editorial text-sm sm:text-base font-bold tracking-tight truncate leading-snug transition-colors ${
                  isRead
                    ? 'text-neutral-100 group-hover:text-[#0071e3]'
                    : isWantToRead
                    ? 'text-amber-200/90'
                    : 'text-neutral-400'
                }`}
              >
                {book.title}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                {book.author} {book.year ? `&bull; ${book.year}` : ''}
              </p>
            </div>
          </div>

          {/* Right Status Badges & Quick Action */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Tactile Obi Badge */}
            {isRead ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Read</span>
              </span>
            ) : isWantToRead ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full">
                <Bookmark className="w-3 h-3" />
                <span>Want to Read</span>
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3 text-neutral-500" />
                <span>Missing Volume</span>
              </span>
            )}

            {/* Rating Stars if read */}
            {book.rating > 0 && (
              <div className="hidden md:flex items-center gap-0.5 text-amber-400 text-xs font-semibold">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{book.rating}</span>
              </div>
            )}

            {/* Quick Toggle Read Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleRead();
              }}
              title={isRead ? 'Mark as Unread' : 'Mark as Read'}
              className={`p-2 rounded-xl transition-all border ${
                isRead
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/10'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${isRead ? 'stroke-[3]' : 'opacity-60'}`} />
            </button>
          </div>
        </div>

        {/* Ambient Contact Shadow beneath slab */}
        <div className="absolute -bottom-2 inset-x-4 h-3 bg-black/60 blur-md rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
