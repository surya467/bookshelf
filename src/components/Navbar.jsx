import React, { useState } from 'react';
import { BookOpen, Volume2, VolumeX, Upload, Library, RefreshCw, Edit2, Check, LayoutGrid, Sliders } from 'lucide-react';

export default function Navbar({
  userName,
  onUpdateUserName,
  stats,
  soundEnabled,
  onToggleSound,
  onOpenImport,
  onResetLibrary,
  onOpenOpenLibraryInfo,
  hasData,
  bookSize = 'default',
  onChangeBookSize,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  const handleSave = () => {
    onUpdateUserName(tempName.trim());
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080c]/85 backdrop-blur-xl border-b border-white/10 transition-all text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Collection Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-sm">
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
                    className="bg-white/10 text-sm font-semibold text-white px-2.5 py-1 rounded-lg border border-[#0071e3] focus:outline-none"
                  />
                  <button
                    onClick={handleSave}
                    className="p-1 rounded-lg bg-[#0071e3] text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditing(true)}>
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white/95">
                    {userName ? `${userName}'s Bookshelf` : 'Your Bookshelf'}
                  </h1>
                  <Edit2 className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white/95">
              Bookshelf
            </h1>
          )}
        </div>

        {/* Center: Quick Stats Pill (Only if data loaded) */}
        {hasData && (
          <div className="hidden lg:flex items-center gap-3.5 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 text-xs shadow-inner">
            <span className="text-white font-medium">
              <strong className="text-white font-semibold">{stats.totalRead}</strong> Read
            </span>
            <span className="text-white/20">&bull;</span>
            <span className="text-white/70">
              <strong className="text-white/90">{stats.totalMissing}</strong> Missing
            </span>
            {stats.totalWantToRead > 0 && (
              <>
                <span className="text-white/20">&bull;</span>
                <span className="text-[#0071e3] font-medium">
                  {stats.totalWantToRead} Want to Read
                </span>
              </>
            )}
            <span className="text-white/20">&bull;</span>
            <span className="text-emerald-400 font-semibold">
              {stats.completionRate}% Complete
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Density Sizing Switcher */}
          {hasData && onChangeBookSize && (
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full p-0.5 text-[11px]">
              <button
                onClick={() => onChangeBookSize('compact')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  bookSize === 'compact'
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Ultra Compact: Fit maximum books per shelf"
              >
                Compact
              </button>
              <button
                onClick={() => onChangeBookSize('default')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  bookSize === 'default'
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Balanced: Standard realistic proportions"
              >
                Balanced
              </button>
            </div>
          )}

          {hasData && (
            <button
              onClick={onResetLibrary}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all"
              title="Clear and upload a new CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Change CSV</span>
            </button>
          )}

          <button
            onClick={onOpenOpenLibraryInfo}
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all"
            title="Book & Cover APIs: Open Library, Google Books, Hardcover"
          >
            <Library className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="hidden sm:inline font-medium text-[11px]">Book APIs</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-full shadow-[0_2px_12px_rgba(0,113,227,0.35)] transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
}
