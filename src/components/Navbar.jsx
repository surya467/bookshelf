import React from 'react';
import { BookOpen, Upload, Library, RefreshCw, Zap } from 'lucide-react';
import SearchBar from './SearchBar';
import { soundFX } from '../services/soundFx';

/**
 * Navbar: High-Contrast Comic Verse Header Bar.
 */
export default function Navbar({
  userName,
  onOpenImport,
  onResetLibrary,
  onOpenOpenLibraryInfo,
  hasData,
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  onSelectBook,
}) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#08090d]/90 border-b border-white/[0.08] text-white shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Mark */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-sm bg-[#ff2d55] flex items-center justify-center shadow-[0_0_12px_rgba(255,45,85,0.6)]">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <h1 className="font-display text-2xl tracking-wide uppercase text-white">
              TOME VERSE
            </h1>
            <span className="font-mono-meta text-[10px] text-[#ff2d55] font-bold">
              EDITION 2.0
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        {hasData && (
          <div className="flex-1 max-w-md mx-2 sm:mx-6 hidden md:block">
            <SearchBar
              seriesList={seriesList}
              standaloneBooks={standaloneBooks}
              wantToReadStandalone={wantToReadStandalone}
              onSelectBook={onSelectBook}
              isNight={true}
            />
          </div>
        )}

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {hasData && (
            <button
              onClick={() => {
                soundFX.playClick();
                onResetLibrary();
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm text-neutral-400 hover:text-white hover:bg-white/10 font-mono-meta transition-all"
              title="Clear and upload a new CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">CHANGE CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFX.playClick();
              onOpenOpenLibraryInfo();
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 font-mono-meta transition-all"
            title="Book & Cover APIs"
          >
            <Library className="w-3.5 h-3.5 text-[#ff2d55]" />
            <span className="hidden sm:inline">APIS</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onOpenImport();
            }}
            className="flex items-center gap-1.5 bg-[#ff2d55] hover:bg-[#e02649] text-white text-xs font-impact tracking-wider uppercase px-4 py-2 rounded-sm shadow-[0_0_15px_rgba(255,45,85,0.4)] transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>IMPORT CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
