import React from 'react';
import { BookOpen, Layers, Volume2, VolumeX, Upload, Library, ShoppingBag } from 'lucide-react';

export default function Navbar({
  viewMode,
  setViewMode,
  stats,
  soundEnabled,
  onToggleSound,
  onOpenImport,
  onOpenOpenLibraryInfo,
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] flex items-center justify-center text-[#1d1d1f]">
            <BookOpen className="w-4 h-4 text-[#1d1d1f]" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#1d1d1f]">
              Bookshelf
            </h1>
          </div>
        </div>

        {/* Center: Apple Segmented Control */}
        <div className="hidden md:flex items-center bg-[#f5f5f7] p-1 rounded-full border border-black/[0.04] text-xs">
          <button
            onClick={() => setViewMode('series')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              viewMode === 'series'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Series
          </button>
          <button
            onClick={() => setViewMode('shelf')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              viewMode === 'shelf'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            All Cards
          </button>
          <button
            onClick={() => setViewMode('market')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              viewMode === 'market'
                ? 'bg-white text-[#1d1d1f] shadow-sm'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Missing ({stats.totalMissing})
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenOpenLibraryInfo}
            className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
            title="Open Library API Architecture"
          >
            <Library className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#86868b]" />}
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium px-4 py-2 rounded-full shadow-sm transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="flex md:hidden border-t border-black/[0.04] px-4 py-2 justify-around bg-white/95 text-xs">
        <button
          onClick={() => setViewMode('series')}
          className={`py-1 px-3 rounded-full font-medium ${
            viewMode === 'series' ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b]'
          }`}
        >
          Series
        </button>
        <button
          onClick={() => setViewMode('shelf')}
          className={`py-1 px-3 rounded-full font-medium ${
            viewMode === 'shelf' ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b]'
          }`}
        >
          All Cards
        </button>
        <button
          onClick={() => setViewMode('market')}
          className={`py-1 px-3 rounded-full font-medium ${
            viewMode === 'market' ? 'bg-[#1d1d1f] text-white' : 'text-[#86868b]'
          }`}
        >
          Missing ({stats.totalMissing})
        </button>
      </div>
    </header>
  );
}
