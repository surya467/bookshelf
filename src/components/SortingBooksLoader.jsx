import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Library } from 'lucide-react';

export default function SortingBooksLoader({ totalBooks = 0 }) {
  const [stage, setStage] = useState(0);

  const stages = [
    'Parsing Goodreads library records...',
    'Grouping volumes into series universes...',
    'Calculating shelf layouts & compact spacing...',
    'Mounting 3D tomes on floating ledges...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 450);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeIn relative z-20">
      <div className="relative p-8 sm:p-10 rounded-[32px] bg-[#0d0e14]/90 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] max-w-md w-full">
        {/* Animated 3D Book Sorting Graphic */}
        <div className="relative h-28 w-56 mx-auto flex items-end justify-center gap-2 pb-4">
          {/* Animated Books */}
          {[
            { color: 'from-amber-600 to-amber-900', delay: '0s', h: 'h-18', rotate: '-rotate-6' },
            { color: 'from-blue-600 to-indigo-900', delay: '0.15s', h: 'h-22', rotate: 'rotate-0' },
            { color: 'from-emerald-600 to-teal-900', delay: '0.3s', h: 'h-20', rotate: 'rotate-3' },
            { color: 'from-rose-600 to-purple-950', delay: '0.45s', h: 'h-24', rotate: '-rotate-3' },
            { color: 'from-slate-600 to-zinc-900', delay: '0.6s', h: 'h-16', rotate: 'rotate-6' },
          ].map((b, i) => (
            <div
              key={i}
              style={{ animationDelay: b.delay }}
              className={`w-7 ${b.h} rounded-t-[3px] rounded-b-[1px] bg-gradient-to-t ${b.color} border-t border-r border-white/30 shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform transition-transform animate-bounce`}
            >
              {/* Spine Gilded Lines */}
              <div className="w-full h-1 bg-white/30 mt-2" />
              <div className="w-full h-0.5 bg-white/20 mt-1" />
            </div>
          ))}

          {/* Shelf Rail Underneath Animating Books */}
          <div className="absolute bottom-1 inset-x-0 h-2 bg-gradient-to-b from-[#2b2e3a] to-[#121319] border-t border-white/25 rounded-sm shadow-md" />
        </div>

        {/* Progress & Text */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 text-[#0071e3] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Assembling Bookshelf</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mt-1.5 transition-all">
            {stages[stage]}
          </h3>
          <p className="text-xs text-white/50 mt-1">
            {totalBooks > 0 ? `Processing ${totalBooks} books` : 'Optimizing continuous shelves'}
          </p>

          {/* Minimal Animated Track Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mt-5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#0071e3] via-indigo-500 to-emerald-400 rounded-full animate-pulse w-3/4 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
