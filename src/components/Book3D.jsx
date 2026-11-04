import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { soundFX } from '../services/soundFx';

/**
 * Book3D: Ultra-tactile physical book standing on an architectural shelf.
 * Features realistic spine creasing, paper deckle edge, Japanese Obi belly band,
 * and Framer Motion spring lift on hover.
 */
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
      ? 'w-[88px] sm:w-[102px] md:w-[114px]'
      : 'w-[68px] sm:w-[78px] md:w-[86px]';

  const handleMouseEnter = () => {
    soundFX.playSwoosh();
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
      className="group relative cursor-pointer select-none flex-shrink-0 z-10 hover:z-40"
    >
      {/* 3D Physical Book Structure */}
      <motion.div
        animate={
          isHovered
            ? { y: -14, scale: 1.05, rotateZ: -1 }
            : { y: 0, scale: 1, rotateZ: 0 }
        }
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className={`relative ${sizeClasses} aspect-[1/1.53] rounded-r-[4px] rounded-l-[2px] ${
          isHovered ? 'book-3d-dark-hover' : 'book-3d-dark'
        }`}
      >
        {/* Book Body: Cover Image or Fallback Jacket */}
        <div className="relative w-full h-full overflow-hidden rounded-r-[4px] rounded-l-[2px] bg-[#151720]">
          {hasCover ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 pointer-events-none ${
                !isRead ? 'filter grayscale-[0.8] contrast-105 brightness-90 opacity-80' : 'brightness-100'
              }`}
              loading="lazy"
            />
          ) : (
            <div
              className={`w-full h-full p-2.5 flex flex-col justify-between text-white pointer-events-none ${
                isRead
                  ? 'bg-gradient-to-br from-[#1b1f2e] via-[#242b3e] to-[#11131a]'
                  : 'bg-gradient-to-br from-[#1e2029] via-[#252834] to-[#15161e] opacity-80'
              }`}
            >
              <span className="text-[7.5px] uppercase tracking-wider text-white/50 font-mono truncate">
                {book.seriesName || 'Volume'}
              </span>
              <div className="my-auto">
                <h4 className="font-editorial font-bold text-[9.5px] leading-tight line-clamp-3 text-white/95">
                  {book.title}
                </h4>
                <p className="text-[7.5px] text-white/60 mt-0.5 line-clamp-1">{book.author}</p>
              </div>
              <span className="text-[7.5px] text-white/40 font-mono">{book.year || 'Tome'}</span>
            </div>
          )}

          {/* Left Book Spine Crease & Shadow */}
          <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/60 via-white/10 to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 left-1 w-[1px] bg-black/40 pointer-events-none z-20" />

          {/* Top Paper Page Deckle Trim */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-[#f5f0e6]/90 pointer-events-none z-20" />

          {/* Subtle Right Edge Bevel */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-white/20 pointer-events-none z-20" />

          {/* Diagonal Cover Sheen / Light Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.08] to-transparent pointer-events-none z-10" />

          {/* TACTILE JAPANESE OBI PAPER BELLY BAND for Want-To-Read */}
          {isWantToRead && !isRead && (
            <div className="absolute inset-x-0 bottom-3.5 z-25 pointer-events-none select-none">
              <div className="relative py-1 px-1 bg-[#1c1e26]/95 backdrop-blur-sm border-y border-amber-500/40 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center">
                <span className="text-[7.5px] font-mono tracking-widest uppercase font-bold text-amber-300 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-400 inline-block shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
                  WANT TO READ
                </span>
              </div>
            </div>
          )}

          {/* Minimalist Missing Tome Paper Band */}
          {!isRead && !isWantToRead && (
            <div className="absolute inset-x-0 bottom-3.5 z-25 pointer-events-none select-none">
              <div className="relative py-1 px-1 bg-black/75 backdrop-blur-sm border-y border-white/20 flex items-center justify-center">
                <span className="text-[7.5px] font-mono tracking-widest uppercase font-medium text-white/80">
                  MISSING
                </span>
              </div>
            </div>
          )}

          {/* Volume Order Badge on Shelf */}
          {book.order !== undefined && book.order !== null && (
            <div className="absolute top-1.5 right-1.5 z-20 pointer-events-none">
              <span className="bg-black/75 backdrop-blur-md text-white text-[8px] font-mono px-1 py-0.2 rounded shadow-sm border border-white/15">
                #{book.order === 0 ? 'P' : book.order}
              </span>
            </div>
          )}
        </div>

        {/* Realistic Book Contact Shadow onto Shelf */}
        <div className="absolute -bottom-2 inset-x-1 h-3 bg-black/75 blur-[3px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
