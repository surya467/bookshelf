import React from 'react';

/**
 * ComicVerseFooter: Ripped Paper Edge & Massive Condensed Headline.
 * Directly inspired by Reference Image 3 (Comic Verse bottom section).
 */
export default function ComicVerseFooter({ stats, userName }) {
  return (
    <footer className="w-full relative mt-20 select-none">
      {/* Torn Paper Jagged Edge Separator (from Image 3) */}
      <div className="torn-paper-edge" />

      {/* Deep Black Footer Base */}
      <div className="w-full bg-[#050608] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-8">
          {/* Top Info Strip */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-meta text-xs text-neutral-400 border-b border-white/10 pb-6">
            <span>{userName ? `${userName}'S COLLECTION` : 'SERIES ARCHIVE'} &bull; {stats.totalRead} VOLUMES READ</span>
            <span>GOODREADS CSV ENGINE &bull; OPEN LIBRARY SYNC</span>
            <span>STATUS: ACTIVE CODEX</span>
          </div>

          {/* Giant Distressed Headline (exact match to Image 3 COMIC VERSE) */}
          <div className="w-full text-center py-4 overflow-hidden">
            <h2 className="font-display text-8xl sm:text-[14rem] tracking-tight leading-none text-neutral-200/90 uppercase opacity-95 hover:text-[#ff2d55] transition-colors duration-500">
              TOME VERSE
            </h2>
          </div>

          {/* Bottom Copyright & Colophon */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 font-mono-meta text-[11px] text-neutral-500">
            <span>&copy; {new Date().getFullYear()} TOMEHUNTER ARCHIVE &bull; ALL RIGHTS RESERVED</span>
            <span>PRESS 1: CATALOG &bull; 2: 3D ARENA &bull; 3: STAGGERED PANELS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
