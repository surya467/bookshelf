import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Lock, ExternalLink, Star, RotateCw, Play, Pause, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPurchaseLinks } from '../services/openLibrary';
import { soundFX } from '../services/soundFx';

/**
 * BookDetailModal with Interactive 3D Turntable Inspection.
 * Directly inspired by Pinterest Reference (video1.mp4 Turntable / Pin 1).
 * Allows users to inspect books in 360-degree rotational physics with dynamic
 * ambient aura lighting, gold/silver foil typography, and paper page trim.
 */
export default function BookDetailModal({ book, onClose, onToggleRead }) {
  if (!book) return null;

  const [imgError, setImgError] = useState(false);
  const [isReadState, setIsReadState] = useState(!!book.isRead);
  const [rotY, setRotY] = useState(-18); // Default slight perspective angle
  const [rotX, setRotX] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startRotY: 0, startRotX: 0 });
  const animFrameRef = useRef(null);

  useEffect(() => {
    setIsReadState(!!book.isRead);
  }, [book.isRead, book.id]);

  // Auto-spin animation loop
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
        colors: ['#0071e3', '#34c759', '#ffd700'],
      });
    } else {
      soundFX.playClick();
    }
    onToggleRead({ ...book, isRead: isReadState });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-[#0f1118] border border-white/10 rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95"
          title="Close Modal (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: 3D Turntable Inspection Stage */}
        <div className="p-6 md:w-1/2 bg-gradient-to-b from-[#141622] via-[#0d0e15] to-[#08090d] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden select-none">
          {/* Ambient Radiant Glow derived from book presence */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full bg-[#0071e3]/20 blur-[80px]" />
          </div>

          {/* Turntable Control Top Bar */}
          <div className="w-full flex items-center justify-between z-10 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/50 flex items-center gap-1.5">
              <RotateCw className="w-3 h-3 text-[#0071e3]" />
              <span>360° Interactive Turntable</span>
            </span>

            <button
              onClick={() => {
                soundFX.playClick();
                setIsAutoSpinning(!isAutoSpinning);
              }}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              {isAutoSpinning ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-[#0071e3]" />
                  <span>Auto-Spin</span>
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
                className="absolute inset-0 rounded-r-xl rounded-l-sm overflow-hidden backface-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-r border-white/20 bg-[#161822]"
                style={{ transform: 'translateZ(14px)' }}
              >
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
                    <span className="text-[9px] font-mono uppercase text-white/50">{book.seriesName || 'Tome'}</span>
                    <h4 className="font-editorial text-sm font-bold leading-tight">{book.title}</h4>
                    <span className="text-[9px] text-white/50">{book.author}</span>
                  </div>
                )}
                {/* Spine Crease on Cover */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-[#f5f0e6] pointer-events-none" />
              </div>

              {/* Spine (Left Surface in 3D) */}
              <div
                className="absolute inset-y-0 left-0 w-7 bg-gradient-to-r from-[#141620] via-[#212432] to-[#161822] border-y border-white/10 flex flex-col items-center justify-between py-4 text-center shadow-inner"
                style={{
                  transform: 'rotateY(-90deg) translateZ(14px)',
                  transformOrigin: 'left center',
                }}
              >
                <span className="text-[7px] font-mono text-white/60 uppercase">
                  #{book.order || '•'}
                </span>
                <span
                  className="font-editorial text-[9px] font-bold text-neutral-200 tracking-wider truncate max-w-[130px] -rotate-90 select-none whitespace-nowrap"
                  style={{ writingMode: 'vertical-rl' }}
                >
                  {book.title}
                </span>
                <span className="text-[7px] font-mono text-white/40">{book.year || 'Ed'}</span>
              </div>

              {/* Deckled Pages (Right Surface in 3D) */}
              <div
                className="absolute inset-y-0 right-0 w-7 bg-gradient-to-b from-[#e5dec9] via-[#f7f2e4] to-[#ded6bf] border-y border-stone-400/30 flex items-center justify-center shadow-inner"
                style={{
                  transform: 'rotateY(90deg) translateZ(14px)',
                  transformOrigin: 'right center',
                }}
              >
                {/* Paper page horizontal striations */}
                <div className="w-full h-full opacity-35 bg-[repeating-linear-gradient(0deg,#000_0px,#000_1px,transparent_1px,transparent_3px)]" />
              </div>

              {/* Back Cover in 3D */}
              <div
                className="absolute inset-0 rounded-l-xl rounded-r-sm overflow-hidden p-5 flex flex-col justify-between bg-gradient-to-br from-[#12131b] to-[#1a1d29] border border-white/10 text-white shadow-xl"
                style={{
                  transform: 'rotateY(180deg) translateZ(14px)',
                }}
              >
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#0071e3] block mb-1">
                    Bibliotheca Edition
                  </span>
                  <h4 className="font-editorial text-xs font-bold leading-tight text-neutral-200">
                    {book.title}
                  </h4>
                  <p className="text-[9px] text-neutral-400 mt-1 line-clamp-4 leading-relaxed">
                    A celebrated volume in the collection. Explores deep themes of narrative, craft, and literary universe continuity.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[8px] font-mono text-neutral-400">
                  <span>{book.isbn13 || book.isbn || 'ISBN 978-0-XXXX'}</span>
                  <span>{book.pages ? `${book.pages} pp.` : 'Archival'}</span>
                </div>
              </div>
            </div>

            {/* Turntable Pedestal / Base Ring */}
            <div className="absolute bottom-2 w-48 h-12 rounded-full border border-white/10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none blur-[1px]" />
          </div>

          <p className="text-[10px] text-neutral-400 font-mono text-center z-10 mt-1">
            Drag horizontally to rotate &bull; Double-click to toggle view
          </p>

          {/* Primary Action Button */}
          <button
            onClick={handleToggle}
            className={`mt-4 w-full py-3 px-5 rounded-2xl font-semibold text-xs tracking-tight transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 z-10 ${
              isReadState
                ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[#0071e3]/30'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{isReadState ? 'Completed Tome ✓ (Click to Mark Unread)' : 'Mark Volume as Read'}</span>
          </button>
        </div>

        {/* Right Side: Details & Purchasing Codex */}
        <div className="p-6 sm:p-8 md:w-1/2 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Series Label & Status */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-mono tracking-wider text-[#0071e3] uppercase">
                {book.seriesName ? `${book.seriesName} &bull; Vol #${book.order || book.seriesNumber || '•'}` : 'Standalone Volume'}
              </span>

              {isReadState ? (
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Read</span>
                </span>
              ) : isWantToRead ? (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Bookmark className="w-3 h-3" />
                  <span>Want to Read</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-neutral-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Missing Tome</span>
                </span>
              )}
            </div>

            {/* Book Title & Author */}
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {book.title}
            </h3>
            <p className="text-sm text-neutral-300 mt-1 font-serif-display italic">
              By <span className="text-white font-medium not-italic">{book.author}</span>
            </p>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-neutral-400 block text-[9px] uppercase font-mono">Published</span>
                <span className="font-semibold text-white text-xs mt-0.5 block">{book.year || 'Unknown'}</span>
              </div>

              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-neutral-400 block text-[9px] uppercase font-mono">Length</span>
                <span className="font-semibold text-white text-xs mt-0.5 block">{book.pages ? `${book.pages} p.` : '—'}</span>
              </div>

              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-neutral-400 block text-[9px] uppercase font-mono">Rating</span>
                <span className="font-semibold text-amber-400 text-xs mt-0.5 flex items-center gap-1">
                  {book.rating ? (
                    <>
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{book.rating}/5</span>
                    </>
                  ) : (
                    <span className="text-neutral-400 font-normal">Unrated</span>
                  )}
                </span>
              </div>

              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                <span className="text-neutral-400 block text-[9px] uppercase font-mono">Finished</span>
                <span className="font-semibold text-neutral-300 text-xs mt-0.5 truncate block">
                  {book.dateRead || (isReadState ? 'Archived' : 'Unread')}
                </span>
              </div>
            </div>
          </div>

          {/* Purchase & Loan Links */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Acquire or Loan Online
              </h4>
              <span className="text-[10px] text-neutral-400 font-mono">Verified Booksellers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {purchaseLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 flex items-center justify-between text-xs text-white/90 transition-all group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium text-xs truncate group-hover:text-[#0071e3] transition-colors">
                      {link.name}
                    </span>
                    {link.badge && (
                      <span className="text-[9px] text-neutral-400 font-mono">
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
