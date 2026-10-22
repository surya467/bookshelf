import React, { useState } from 'react';
import { BookOpen, Volume2, VolumeX, Upload, Library, RefreshCw, Edit2, Check, Sun, Moon, Sunset, Sunrise, Lightbulb } from 'lucide-react';
import SearchBar from './SearchBar';

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
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  onSelectBook,
  timeOfDay = 'afternoon',
  onChangeTimeOfDay,
  lampOn = false,
  onToggleLamp,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName || '');

  const handleSave = () => {
    onUpdateUserName(tempName.trim());
    setIsEditing(false);
  };

  const isNight = timeOfDay === 'night';

  const timeOptions = [
    { id: 'morning', label: 'Dawn', icon: Sunrise },
    { id: 'afternoon', label: 'Day', icon: Sun },
    { id: 'sunset', label: 'Dusk', icon: Sunset },
    { id: 'night', label: 'Night', icon: Moon },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-all duration-500 ${
      isNight
        ? 'bg-[#0d0f15]/85 border-white/10 text-white'
        : 'bg-[#f7f5ef]/85 border-black/[0.08] text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand & Collection Title */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm transition-colors ${
            isNight ? 'bg-white/10 border-white/15 text-white' : 'bg-white border-black/10 text-neutral-800'
          }`}>
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
                    className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg border border-[#0071e3] focus:outline-none ${
                      isNight ? 'bg-white/10 text-white' : 'bg-white text-neutral-900'
                    }`}
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
                  <h1 className={`text-xs sm:text-base font-semibold tracking-tight truncate max-w-[120px] sm:max-w-[200px] ${
                    isNight ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {userName ? `${userName}'s Bookshelf` : 'Your Bookshelf'}
                  </h1>
                  <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-neutral-400" />
                </div>
              )}
            </div>
          ) : (
            <h1 className={`text-sm sm:text-base font-semibold tracking-tight ${
              isNight ? 'text-white' : 'text-neutral-900'
            }`}>
              Bookshelf
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
              isNight={isNight}
            />
          </div>
        )}

        {/* Right Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Time of Day Sun Dial Selector */}
          <div className={`flex items-center rounded-full p-0.5 border text-xs ${
            isNight ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
          }`}>
            {timeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = timeOfDay === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeTimeOfDay(opt.id)}
                  title={`Switch lighting to ${opt.label}`}
                  className={`p-1.5 rounded-full transition-all ${
                    isActive
                      ? isNight
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-white text-neutral-900 shadow-sm'
                      : isNight
                      ? 'text-white/40 hover:text-white'
                      : 'text-neutral-400 hover:text-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>

          {/* Lamp Toggle Switch Button */}
          <button
            onClick={onToggleLamp}
            title={lampOn ? 'Reading Lamp: ON' : 'Reading Lamp: OFF'}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border transition-all flex items-center gap-1.5 text-xs ${
              lampOn
                ? 'bg-amber-400/20 text-amber-500 border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : isNight
                ? 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                : 'bg-black/5 text-neutral-400 border-black/10 hover:text-neutral-800'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-mono">{lampOn ? 'Lamp ON' : 'Lamp'}</span>
          </button>

          {/* Density Sizing Switcher */}
          {hasData && onChangeBookSize && (
            <div className={`hidden md:flex items-center rounded-full p-0.5 border text-[11px] ${
              isNight ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
            }`}>
              <button
                onClick={() => onChangeBookSize('compact')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  bookSize === 'compact'
                    ? isNight ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm'
                    : isNight ? 'text-white/40 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'
                }`}
                title="Ultra Compact: Fit maximum books per shelf"
              >
                Compact
              </button>
              <button
                onClick={() => onChangeBookSize('default')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  bookSize === 'default'
                    ? isNight ? 'bg-white/20 text-white shadow-sm' : 'bg-white text-neutral-900 shadow-sm'
                    : isNight ? 'text-white/40 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'
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
              className={`flex items-center gap-1 text-xs px-2 sm:px-2.5 py-1.5 rounded-full transition-all ${
                isNight ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'
              }`}
              title="Clear and upload a new CSV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Change CSV</span>
            </button>
          )}

          <button
            onClick={onOpenOpenLibraryInfo}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-all ${
              isNight
                ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10'
                : 'bg-white border-black/10 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm'
            }`}
            title="Book & Cover APIs"
          >
            <Library className="w-3.5 h-3.5 text-[#0071e3]" />
            <span className="hidden sm:inline font-medium text-[11px]">APIs</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-full transition-all ${
              isNight ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
            }`}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-3 sm:px-4 py-2 rounded-full shadow-sm transition-all active:scale-95"
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
