import React, { useState } from 'react';
import { Edit2, Check, Sparkles, Search, X } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * ComicVerseHeroHeader: Giant Bold Headline & Filter System.
 * Directly inspired by Reference Image 3 (Comic Verse Catalog Header).
 */
export default function ComicVerseHeroHeader({
  stats,
  userName,
  onUpdateUserName,
  activeFilter = 'all',
  onChangeFilter,
  searchQuery = '',
  onSearchChange,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

  const { totalRead, totalWantToRead, totalMissing, totalSeries, completedSeries, completionRate } = stats;

  const handleSaveName = () => {
    soundFX.playClick();
    onUpdateUserName(nameInput.trim());
    setIsEditingName(false);
  };

  const filterOptions = [
    { id: 'all', label: 'ALL ITEMS' },
    { id: 'read', label: `READ (${totalRead})` },
    { id: 'tbr', label: `WANT TO READ (${totalWantToRead})` },
    { id: 'completed', label: `COMPLETED SERIES (${completedSeries})` },
    { id: 'missing', label: `MISSING TOMES (${totalMissing})` },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 select-none">
      {/* Top Giant Bold Title Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-meta text-xs uppercase tracking-widest text-[#ff2d55]">
              // ARCHIVE CODEX &bull; VOL. 2026
            </span>
          </div>

          {/* Giant Condensed Headline: CATALOG */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="font-display text-7xl sm:text-9xl tracking-tight text-[#ff2d55] uppercase leading-none">
              CATALOG
            </h1>

            {/* Editable Collector Identity */}
            <div className="flex items-center gap-2 pb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-lg border border-[#ff2d55]">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    placeholder="Collector Name"
                    autoFocus
                    className="font-impact text-lg text-white bg-transparent px-2 py-0.5 focus:outline-none"
                  />
                  <button onClick={handleSaveName} className="p-1.5 bg-[#ff2d55] text-white rounded">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    soundFX.playClick();
                    setNameInput(userName || '');
                    setIsEditingName(true);
                  }}
                  className="group flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  <span className="font-impact text-sm sm:text-base text-neutral-200 tracking-wider uppercase">
                    {userName ? `${userName}'S ARCHIVE` : 'MASTER ARCHIVE'}
                  </span>
                  <Edit2 className="w-3 h-3 text-neutral-400 group-hover:text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Editorial Statement & Stats HUD (Reference Image 3 Header Layout) */}
        <div className="lg:max-w-md flex flex-col justify-end space-y-4">
          <p className="text-xs sm:text-sm text-neutral-400 font-mono-meta leading-relaxed">
            Explore a vast collection of literary sagas, complete series, and rare editions.
            Real-time Goodreads sync, volume sequence tracking, and completion ratios.
          </p>

          {/* Quick HUD Counters */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
            <div>
              <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">Read</span>
              <span className="font-impact text-xl sm:text-2xl text-[#34c759]">{totalRead}</span>
            </div>
            <div>
              <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">Wishlist</span>
              <span className="font-impact text-xl sm:text-2xl text-[#ff9500]">{totalWantToRead}</span>
            </div>
            <div>
              <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">Missing</span>
              <span className="font-impact text-xl sm:text-2xl text-neutral-300">{totalMissing}</span>
            </div>
            <div>
              <span className="font-mono-meta text-[9px] text-neutral-500 uppercase block">Complete</span>
              <span className="font-impact text-xl sm:text-2xl text-[#0071e3]">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar (Image 3 exact filter row) */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  soundFX.playClick();
                  onChangeFilter(opt.id);
                }}
                className={`font-impact text-xs sm:text-sm uppercase tracking-wider px-4 py-1.5 rounded-sm transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-[#ff2d55] text-white shadow-[0_0_15px_rgba(255,45,85,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Clean Live Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="FILTER BY TITLE OR AUTHOR..."
            className="w-full bg-white/5 border border-white/10 rounded-sm pl-8 pr-8 py-1.5 text-xs font-mono-meta text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff2d55]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
