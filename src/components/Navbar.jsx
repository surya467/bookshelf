import React, { useState } from 'react';
import { BookOpen, Upload, Library, RefreshCw, Edit2, Check } from 'lucide-react';
import SearchBar from './SearchBar';
import { soundFX } from '../services/soundFx';

/**
 * Navbar: Apple-level Refined Glassmorphic Navigation Bar.
 */
export default function Navbar({
  userName,
  onUpdateUserName,
  onOpenImport,
  onResetLibrary,
  onOpenOpenLibraryInfo,
  hasData,
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  onSelectBook,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  const handleSave = () => {
    soundFX.playClick();
    onUpdateUserName(tempName.trim());
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-[#08090e]/85 border-b border-white/[0.08] text-white shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Collection Title */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center shadow-inner">
            <BookOpen className="w-4 h-4 text-[#0071e3]" />
          </div>

          {hasData ? (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                    placeholder="Your Name"
                    className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg border border-[#0071e3] bg-white/10 text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 rounded-lg bg-[#0071e3] text-white hover:bg-[#0077ed]"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 group cursor-pointer"
                  onClick={() => {
                    soundFX.playClick();
                    setIsEditing(true);
                  }}
                >
                  <h1 className="font-editorial text-sm sm:text-base font-bold tracking-tight truncate max-w-[140px] sm:max-w-[220px] text-white">
                    {userName ? `${userName}'s Bookshelf` : 'Bookshelf Codex'}
                  </h1>
                  <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-neutral-400" />
                </div>
              )}
            </div>
          ) : (
            <h1 className="font-editorial text-sm sm:text-base font-bold tracking-tight text-white">
              TomeHunter
            </h1>
          )}
        </div>

        {/* Center: Search Bar */}
        {hasData && (
          <div className="flex-1 max-w-sm mx-1 sm:mx-4">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {hasData && (
            <button
              onClick={() => {
                soundFX.playClick();
                onResetLibrary();
              }}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
              title="Clear and upload a new CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px] font-mono">Change CSV</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFX.playClick();
              onOpenOpenLibraryInfo();
            }}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
            title="Book & Cover APIs"
          >
            <Library className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="hidden sm:inline font-mono text-[11px]">APIs</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onOpenImport();
            }}
            className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-full shadow-[0_2px_12px_rgba(0,113,227,0.4)] transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import CSV</span>
            <span className="sm:hidden">Import</span>
          </button>
        </div>
      </div>
    </header>
  );
}
