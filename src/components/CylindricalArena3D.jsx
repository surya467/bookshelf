import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, Bookmark, Sparkles, Star } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * CylindricalArena3D: 3D Curved Arena Carousel.
 * Directly inspired by Reference Image 2 (Oli Studio 3D Curved Carousel & Gather Here radial ring).
 * Books curve inward toward the camera in a 3D cylindrical arena with drag inertia
 * and dynamic ambient lighting.
 */
export default function CylindricalArena3D({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  activeFilter = 'all',
  onInspectBook,
  onToggleRead,
}) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, startAngle: 0 });

  // Gather flattened books according to active filter
  const books = useMemo(() => {
    const list = [];
    seriesList.forEach((s) => {
      s.books.forEach((b) => {
        list.push({ ...b, seriesName: s.name });
      });
    });
    standaloneBooks.forEach((b) => list.push({ ...b, seriesName: 'Standalone' }));
    wantToReadStandalone.forEach((b) => list.push({ ...b, seriesName: 'Wishlist' }));

    // Filter
    return list.filter((b) => {
      if (activeFilter === 'read') return b.isRead;
      if (activeFilter === 'tbr') return !b.isRead && b.isWantToRead;
      if (activeFilter === 'missing') return !b.isRead && !b.isWantToRead;
      return true;
    });
  }, [seriesList, standaloneBooks, wantToReadStandalone, activeFilter]);

  const count = books.length;
  const radius = Math.max(500, Math.min(1200, count * 55));
  const anglePerItem = count > 0 ? 360 / Math.max(count, 8) : 45;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      startAngle: rotationAngle,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    setRotationAngle(dragStartRef.current.startAngle + dx * 0.28);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        startAngle: rotationAngle,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    setRotationAngle(dragStartRef.current.startAngle + dx * 0.28);
  };

  const rotate = (dir) => {
    soundFX.playClick();
    const step = anglePerItem;
    setRotationAngle((prev) => prev + (dir === 'left' ? step : -step));
  };

  // Determine currently centered book index
  const normalizedAngle = ((-rotationAngle % 360) + 360) % 360;
  const activeIndex = count > 0 ? Math.round(normalizedAngle / anglePerItem) % count : 0;
  const activeBook = books[activeIndex] || books[0];

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div>
          <span className="font-mono-meta text-xs text-[#ff2d55] uppercase tracking-widest block mb-1">
            CYLINDRICAL 3D ARENA
          </span>
          <h3 className="font-display text-2xl sm:text-4xl text-white uppercase tracking-wider">
            Curved Perspective Stage
          </h3>
        </div>

        {/* Rotation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => rotate('left')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
            title="Rotate Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => rotate('right')}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition-all active:scale-95 shadow-md"
            title="Rotate Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Cylindrical Arena Viewport */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative w-full h-[460px] sm:h-[540px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing perspective-1400"
      >
        {/* The 3D Rotating Ring */}
        <div
          className="relative w-48 h-72 preserve-3d transition-transform duration-100 ease-out"
          style={{
            transform: `translateZ(-${radius}px) rotateY(${rotationAngle}deg)`,
          }}
        >
          {books.map((book, idx) => {
            const itemAngle = idx * anglePerItem;
            const isRead = !!book.isRead;
            const isWant = !!book.isWantToRead;

            return (
              <div
                key={book.id || `arena-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onInspectBook(book);
                }}
                className="absolute inset-0 preserve-3d cursor-pointer group"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                }}
              >
                {/* Book Card in Cylindrical Arc */}
                <div
                  className={`relative w-44 sm:w-52 aspect-[1/1.52] rounded-xl overflow-hidden bg-[#151722] border border-white/20 mylar-sleeve shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105 ${
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
                    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1c1d29] to-[#0d0e15] text-white">
                      <span className="font-mono-meta text-[9px] text-[#ff2d55]">{book.seriesName}</span>
                      <h4 className="font-impact text-sm uppercase leading-tight line-clamp-3">{book.title}</h4>
                      <span className="font-mono-meta text-[9px] text-neutral-400">{book.author}</span>
                    </div>
                  )}

                  {/* Volume Badge */}
                  {book.order !== undefined && book.order !== null && (
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-black/85 text-white font-impact text-xs px-2 py-0.5 rounded border border-white/20">
                        #{book.order}
                      </span>
                    </div>
                  )}

                  {/* Status Tag */}
                  <div className="absolute bottom-2 right-2 z-20">
                    {isRead ? (
                      <span className="bg-[#34c759] text-black font-impact text-[10px] px-2 py-0.5 rounded shadow">
                        READ
                      </span>
                    ) : isWant ? (
                      <span className="bg-[#ff9500] text-black font-impact text-[10px] px-2 py-0.5 rounded shadow">
                        WANT
                      </span>
                    ) : (
                      <span className="bg-black/80 text-white font-mono-meta text-[10px] px-2 py-0.5 rounded">
                        MISSING
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arena Floor Glow Ring */}
        <div className="absolute bottom-4 w-96 h-24 rounded-full border border-white/10 bg-gradient-to-t from-[#ff2d55]/15 to-transparent blur-md pointer-events-none" />
      </div>

      {/* Active Centered Book Dossier Spotlight */}
      {activeBook && (
        <div className="mt-4 p-5 sm:p-6 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="font-mono-meta text-[10px] text-[#ff2d55] uppercase tracking-widest">
              FOCUSED ISSUE &bull; #{activeBook.order || '1'}
            </span>
            <h4 className="font-impact text-xl sm:text-2xl text-white uppercase tracking-wide mt-0.5">
              {activeBook.title}
            </h4>
            <p className="font-mono-meta text-xs text-neutral-400 mt-1">
              By {activeBook.author} {activeBook.year ? `(${activeBook.year})` : ''} &bull; {activeBook.seriesName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onInspectBook(activeBook)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-impact text-xs uppercase tracking-wider rounded-lg transition-colors shadow"
            >
              INSPECT DOSSIER
            </button>
            <button
              onClick={() => onToggleRead(activeBook)}
              className={`px-5 py-2.5 font-impact text-xs uppercase tracking-wider rounded-lg transition-colors shadow ${
                activeBook.isRead
                  ? 'bg-[#34c759] text-black'
                  : 'bg-[#ff2d55] text-white hover:bg-[#e02649]'
              }`}
            >
              {activeBook.isRead ? 'MARKED READ ✓' : 'MARK AS READ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
