import React, { useState } from 'react';
import { BookOpen, Volume2, VolumeX, Upload, Library, RefreshCw, Edit2, Check } from 'lucide-react';

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
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  const handleSave = () => {
    onUpdateUserName(tempName.trim());
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#dfdeda]/75 backdrop-blur-xl border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Collection Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/80 shadow-sm border border-black/[0.06] flex items-center justify-center text-[#1d1d1f]">
            <BookOpen className="w-4 h-4 text-[#1d1d1f]" />
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
                    className="bg-white/90 text-sm font-semibold text-[#1d1d1f] px-2.5 py-1 rounded-lg border border-[#0071e3] focus:outline-none"
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
                  <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#1d1d1f]">
                    {userName ? `${userName}'s Bookshelf` : 'Your Bookshelf'}
                  </h1>
                  <Edit2 className="w-3 h-3 text-[#86868b] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          ) : (
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-[#1d1d1f]">
              Bookshelf
            </h1>
          )}
        </div>

        {/* Center: Quick Stats Pill (Only if data loaded) */}
        {hasData && (
          <div className="hidden md:flex items-center gap-4 bg-white/70 px-4 py-1.5 rounded-full border border-black/[0.04] text-xs shadow-sm">
            <span className="text-[#1d1d1f] font-medium">
              <strong>{stats.totalRead}</strong> Read
            </span>
            <span className="text-[#86868b]">&bull;</span>
            <span className="text-[#86868b]">
              <strong>{stats.totalMissing}</strong> Missing
            </span>
            <span className="text-[#86868b]">&bull;</span>
            <span className="text-[#0071e3] font-semibold">
              {stats.completionRate}% Shelf Complete
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasData && (
            <button
              onClick={onResetLibrary}
              className="flex items-center gap-1.5 text-xs text-[#86868b] hover:text-[#1d1d1f] px-3 py-1.5 rounded-full hover:bg-white/60 transition-all"
              title="Clear and upload a new CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change CSV</span>
            </button>
          )}

          <button
            onClick={onOpenOpenLibraryInfo}
            className="flex items-center gap-1.5 text-xs text-[#1d1d1f] bg-white/70 hover:bg-white px-3 py-1.5 rounded-full border border-black/[0.05] transition-all shadow-sm"
            title="Book & Cover APIs: Open Library, Google Books, Hardcover"
          >
            <Library className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="hidden sm:inline font-medium text-[11px]">Book APIs</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-white/60 transition-all"
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
    </header>
  );
}
