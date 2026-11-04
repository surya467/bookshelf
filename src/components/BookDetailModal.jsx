import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Lock, ExternalLink, Star, RotateCw, Play, Pause, Bookmark, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPurchaseLinks } from '../services/openLibrary';
import { soundFX } from '../services/soundFx';

/**
 * BookDetailModal: Persona & Comic Verse Inspired Collectible Dossier.
 * Features 360-degree interactive turntable, glossy Mylar reflection,
 * tactile corner tape, and high-energy HUD dossier.
 */
export default function BookDetailModal({ book, onClose, onToggleRead }) {
  if (!book) return null;

  const [imgError, setImgError] = useState(false);
  const [isReadState, setIsReadState] = useState(!!book.isRead);
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startRotY: 0, startRotX: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    setIsReadState(!!book.isRead);
  }, [book.isRead, book.id]);

  useEffect(() => {
    if (!isAutoSpinning) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastT = performance.now();
    const spinLoop = (time) => {
      const dt = (time - lastT) / 1000;
      lastT = time;
      setRotY((prev) => (prev + dt * 28) % 360);
      animFrameRef.current = requestAnimationFrame(spinLoop);
    };

    animFrameRef.current = requestAnimationFrame(spinLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoSpinning]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotY: rotY,
      startRotX: rotX,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setRotY(dragStartRef.current.startRotY + dx * 0.7);
    setRotX(Math.max(-25, Math.min(25, dragStartRef.current.startRotX - dy * 0.4)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsAutoSpinning(false);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        startRotY: rotY,
        startRotX: rotX,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setRotY(dragStartRef.current.startRotY + dx * 0.7);
    setRotX(Math.max(-25, Math.min(25, dragStartRef.current.startRotX - dy * 0.4)));
  };

  const isWantToRead = !!book.isWantToRead;
  const purchaseLinks = book.purchaseLinks || getPurchaseLinks(book.title, book.author, book.isbn13 || book.isbn);

  const handleToggle = () => {
    const next = !isReadState;
    setIsReadState(next);
    if (next) {
      soundFX.playUnlock();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff2d55', '#34c759', '#ffffff'],
      });
    } else {
      soundFX.playClick();
    }
    onToggleRead({ ...book, isRead: isReadState });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-[#0d0e14] border-2 border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-sm bg-white/10 hover:bg-[#ff2d55] text-white flex items-center justify-center transition-colors shadow-md"
          title="Close Modal (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Turntable Inspection Stage */}
        <div className="p-6 md:w-1/2 bg-gradient-to-b from-[#151722] via-[#0d0e15] to-[#07080c] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden select-none">
          {/* Ambient Radiant Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-[#ff2d55]/20 blur-[80px]" />
          </div>

          {/* Turntable Control Top Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <span className="font-mono-meta text-[10px] tracking-widest uppercase text-[#ff2d55] flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 fill-[#ff2d55]" />
              <span>360° TURNTABLE INSPECTOR</span>
            </span>

            <button
              onClick={() => {
                soundFX.playClick();
                setIsAutoSpinning(!isAutoSpinning);
              }}
              className="px-3 py-1 rounded-sm bg-white/10 hover:bg-white/20 border border-white/10 font-impact text-xs uppercase tracking-wider text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              {isAutoSpinning ? (
                <>
                  <Pause className="w-3 h-3 text-[#ff9500]" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#ff2d55]" />
                  <span>AUTO-SPIN</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive 3D Turntable Scene */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full h-72 sm:h-80 flex items-center justify-center cursor-grab active:cursor-grabbing perspective-1000 z-10"
          >
            {/* The 3D Book Object */}
            <div
              className="relative w-44 sm:w-48 aspect-[1/1.55] preserve-3d transition-transform duration-75"
              style={{
                transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
              }}
            >
              {/* Front Cover */}
              <div
                className="absolute inset-0 rounded-r-md rounded-l-sm overflow-hidden backface-hidden shadow-[0_15px_40px_rgba(0,0,0,0.85)] border-r border-white/20 bg-[#161822] mylar-sleeve"
                style={{ transform: 'translateZ(14px)' }}
              >
                <div className="tape-corner" />
                {book.coverUrl && !imgError ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover pointer-events-none ${
                      !isReadState ? 'filter grayscale-[0.8] brightness-80' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#1c2030] to-[#10121a] text-white">
                    <span className="font-mono-meta text-[9px] uppercase text-[#ff2d55]">{book.seriesName || 'TOME'}</span>
                    <h4 className="font-impact text-base uppercase leading-tight">{book.title}</h4>
                    <span className="font-mono-meta text-[9px] text-neutral-400">{book.author}</span>
                  </div>
                )}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
              </div>

              {/* Spine (Left Surface in 3D) */}
              <div
                className="absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-[#141620] via-[#212432] to-[#161822] border-y border-white/10 flex flex-col items-center justify-between py-4 text-center shadow-inner"
                style={{
                  transform: 'rotateY(-90deg) translateZ(14px)',
                  transformOrigin: 'left center',
                }}
              >
                <span className="font-mono-meta text-[8px] text-white/60 uppercase">
                  #{book.order || '•'}
                </span>
                <span
                  className="font-impact text-[10px] text-white tracking-widest truncate max-w-[130px] -rotate-90 select-none uppercase"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {book.title}
                </span>
                <span className="font-mono-meta text-[8px] text-white/40">{book.year || 'ED'}</span>
              </div>

              {/* Deckled Pages (Right Surface in 3D) */}
              <div
                className="absolute inset-y-0 right-0 w-7 bg-[#ded6bf] border-y border-stone-400/30 flex items-center justify-center shadow-inner"
                style={{
                  transform: 'rotateY(90deg) translateZ(14px)',
                  transformOrigin: 'right center',
                }}
              >
                <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(0deg,#000_0px,#000_1px,transparent_1px,transparent_3px)]" />
              </div>

              {/* Back Cover in 3D */}
              <div
                className="absolute inset-0 rounded-l-md rounded-r-sm overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-br from-[#12131b] to-[#1a1d29] border border-white/10 text-white shadow-xl"
                style={{
                  transform: 'rotateY(180deg) translateZ(14px)',
                }}
              >
                <div>
                  <span className="font-mono-meta text-[9px] uppercase tracking-widest text-[#ff2d55] block mb-1 font-bold">
                    TOME VERSE ARCHIVE
                  </span>
                  <h4 className="font-impact text-sm uppercase leading-tight text-neutral-200">
                    {book.title}
                  </h4>
                  <p className="font-mono-meta text-[10px] text-neutral-400 mt-2 line-clamp-4 leading-relaxed">
                    A celebrated volume in the collection. Explores deep themes of narrative, craft, and literary universe continuity.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono-meta text-[9px] text-neutral-400">
                  <span>{book.isbn13 || book.isbn || 'ISBN 978-0-XXXX'}</span>
                  <span>{book.pages ? `${book.pages} PP.` : 'ARCHIVAL'}</span>
                </div>
              </div>
            </div>

            {/* Pedestal Ring */}
            <div className="absolute bottom-2 w-48 h-12 rounded-full border border-white/10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none blur-[1px]" />
          </div>

          <p className="font-mono-meta text-[10px] text-neutral-500 text-center z-10 mt-1">
            DRAG HORIZONTALLY TO ROTATE &bull; INSPECT ARCHIVAL BINDING
          </p>

          {/* Primary Action Button */}
          <button
            onClick={handleToggle}
            className={`mt-4 w-full py-3 px-5 rounded-sm font-impact text-sm uppercase tracking-wider transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 z-10 ${
              isReadState
                ? 'bg-[#34c759] text-black shadow-[#34c759]/30'
                : 'bg-[#ff2d55] hover:bg-[#e02649] text-white shadow-[#ff2d55]/30'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isReadState ? 'ARCHIVED & READ ✓ (CLICK TO UNMARK)' : 'MARK VOLUME AS READ'}</span>
          </button>
        </div>

        {/* Right Side: Comic Verse HUD Dossier */}
        <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Series Label & Status */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono-meta text-xs tracking-wider text-[#ff2d55] uppercase font-bold">
                {book.seriesName ? `${book.seriesName} &bull; ISSUE #${book.order || '1'}` : 'STANDALONE ISSUE'}
              </span>

              {isReadState ? (
                <span className="bg-[#34c759] text-black font-impact text-xs px-2.5 py-0.5 rounded-sm flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>READ</span>
                </span>
              ) : isWantToRead ? (
                <span className="bg-[#ff9500] text-black font-impact text-xs px-2.5 py-0.5 rounded-sm flex items-center gap-1">
                  <Bookmark className="w-3 h-3 stroke-[3]" />
                  <span>WISHLIST</span>
                </span>
              ) : (
                <span className="bg-white/10 text-white font-mono-meta text-xs px-2.5 py-0.5 rounded-sm flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>MISSING</span>
                </span>
              )}
            </div>

            {/* Book Title & Author */}
            <h3 className="font-impact text-2xl sm:text-4xl uppercase tracking-wide text-white leading-tight">
              {book.title}
            </h3>
            <p className="font-mono-meta text-sm text-neutral-400 mt-1 uppercase">
              AUTHOR: <span className="text-white font-bold">{book.author}</span>
            </p>

            {/* HUD Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              <div className="p-3 bg-white/[0.04] rounded-sm border border-white/10">
                <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">YEAR</span>
                <span className="font-impact text-sm sm:text-base text-white mt-0.5 block">{book.year || 'UNKNOWN'}</span>
              </div>

              <div className="p-3 bg-white/[0.04] rounded-sm border border-white/10">
                <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">PAGES</span>
                <span className="font-impact text-sm sm:text-base text-white mt-0.5 block">{book.pages ? `${book.pages}P` : '—'}</span>
              </div>

              <div className="p-3 bg-white/[0.04] rounded-sm border border-white/10">
                <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">RATING</span>
                <span className="font-impact text-sm sm:text-base text-[#ff9500] mt-0.5 flex items-center gap-1">
                  {book.rating ? (
                    <>
                      <Star className="w-3.5 h-3.5 fill-[#ff9500]" />
                      <span>{book.rating}/5</span>
                    </>
                  ) : (
                    <span className="text-neutral-500 font-normal">UNRATED</span>
                  )}
                </span>
              </div>

              <div className="p-3 bg-white/[0.04] rounded-sm border border-white/10">
                <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">STATUS</span>
                <span className="font-impact text-sm sm:text-base text-neutral-300 mt-0.5 truncate block">
                  {isReadState ? 'OWNED' : 'WANTED'}
                </span>
              </div>
            </div>
          </div>

          {/* Purchase & Loan Links */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-impact text-xs uppercase tracking-wider text-neutral-400">
                ACQUIRE / LOAN PHYSICAL COPY
              </h4>
              <span className="font-mono-meta text-[10px] text-neutral-500">VERIFIED VENDORS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {purchaseLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-sm bg-white/[0.04] hover:bg-[#ff2d55] border border-white/10 flex items-center justify-between text-xs text-white transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-impact uppercase tracking-wider text-xs truncate">
                      {link.name}
                    </span>
                    {link.badge && (
                      <span className="font-mono-meta text-[9px] text-neutral-400 group-hover:text-white/80">
                        &bull; {link.badge}
                      </span>
                    )}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
