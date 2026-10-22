import React, { useEffect, useState } from 'react';
import { Sparkles, Receipt, RefreshCw, Volume2, VolumeX, ArrowUpDown, Flame, BookMarked } from 'lucide-react';
import { formatPrice } from '../services/priceDiscovery';

export default function TotalCounterHeader({
  totalValue,
  displayValue,
  loadedCount,
  totalCount,
  isLoading,
  currency,
  onReset,
  onOpenReceipt,
  priciestBook,
  avgPrice,
  totalPages,
  recentIncrement,
  soundEnabled,
  onToggleSound,
  speed,
  onChangeSpeed,
  activeFilter,
  onChangeFilter,
  sortBy,
  onChangeSort,
}) {
  const [pulse, setPulse] = useState(false);

  // Trigger pulse effect on price increase
  useEffect(() => {
    if (recentIncrement > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [recentIncrement, displayValue]);

  const percentComplete = totalCount > 0 ? Math.min(100, Math.round((loadedCount / totalCount) * 100)) : 0;
  const isFinished = !isLoading && loadedCount >= totalCount && totalCount > 0;

  return (
    <div className="sticky top-3 z-30 mb-8 w-full max-w-6xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-pink-100 shadow-[0_15px_35px_rgba(244,114,182,0.15)] p-5 sm:p-7 transition-all">
        {/* Cute ambient pastel background glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-pink-200/40 to-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-amber-200/40 to-rose-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Main Price Counter Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-pink-100 text-pink-700">
                <Sparkles className="w-3.5 h-3.5" />
                {isFinished ? 'Bookshelf Tally Complete!' : isLoading ? 'Calculating Shelf Worth...' : 'Your Bookshelf Worth'}
              </span>

              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                title={soundEnabled ? 'Mute cute sounds' : 'Enable cute sounds'}
                className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Giant Animated Price Odometer */}
            <div className="relative mt-2 flex items-baseline gap-2">
              <h2
                className={`text-4xl sm:text-6xl font-black tracking-tight text-slate-900 transition-transform duration-150 ${
                  pulse ? 'scale-105 text-pink-600' : ''
                }`}
              >
                {formatPrice(displayValue, currency)}
              </h2>

              {/* Floating increment bubble */}
              {recentIncrement > 0 && isLoading && (
                <span className="animate-pop-in inline-flex items-center text-sm sm:text-base font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm">
                  +{formatPrice(recentIncrement, currency)}
                </span>
              )}
            </div>

            {/* Subtitle / Commentary */}
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  Adding book #{loadedCount} of {totalCount} to your catalogue...
                </span>
              ) : isFinished ? (
                <span>
                  🎉 You own a personal library worth <strong className="text-slate-800">{formatPrice(totalValue, currency)}</strong>!
                </span>
              ) : (
                <span>Upload a CSV or paste a link to tally your collection.</span>
              )}
            </p>
          </div>

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full md:w-auto">
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-2.5 sm:p-3 text-center">
              <span className="text-[11px] font-semibold text-amber-800 flex items-center justify-center gap-1">
                <BookMarked className="w-3 h-3" /> Total Books
              </span>
              <p className="text-lg sm:text-xl font-bold text-amber-950 mt-0.5">
                {loadedCount} <span className="text-xs text-amber-700/80 font-normal">/ {totalCount}</span>
              </p>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/60 rounded-2xl p-2.5 sm:p-3 text-center">
              <span className="text-[11px] font-semibold text-rose-800 flex items-center justify-center gap-1">
                🏷️ Avg Book Cost
              </span>
              <p className="text-lg sm:text-xl font-bold text-rose-950 mt-0.5">
                {formatPrice(avgPrice, currency)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-purple-50/70 border border-purple-200/60 rounded-2xl p-2.5 sm:p-3 text-center">
              <span className="text-[11px] font-semibold text-purple-800 flex items-center justify-center gap-1">
                👑 Priciest
              </span>
              <p className="text-xs sm:text-sm font-bold text-purple-950 truncate mt-1" title={priciestBook?.title}>
                {priciestBook ? formatPrice(priciestBook.price, currency) : '—'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Reset & View Receipt */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-center">
            {isFinished && (
              <button
                onClick={onOpenReceipt}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Receipt className="w-4 h-4" />
                <span>Cute Receipt 🧾</span>
              </button>
            )}

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Shelf</span>
            </button>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="mt-5 pt-4 border-t border-pink-100/80">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-1.5">
              <span>Populating Catalogue ({percentComplete}%)</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px]">Speed:</span>
                <button
                  onClick={() => onChangeSpeed('normal')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${speed === 'normal' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Chill
                </button>
                <button
                  onClick={() => onChangeSpeed('fast')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${speed === 'fast' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Brisk
                </button>
                <button
                  onClick={() => onChangeSpeed('instant')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${speed === 'instant' ? 'bg-pink-500 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  Instant ⚡
                </button>
              </div>
            </div>

            <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 rounded-full transition-all duration-200"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        )}

        {/* Filter and Sort Toolbar (Shown when catalogue has items) */}
        {loadedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-pink-100/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Shelf Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Filter:</span>
              {['all', 'read', 'currently-reading', 'to-read'].map((shelf) => (
                <button
                  key={shelf}
                  onClick={() => onChangeFilter(shelf)}
                  className={`px-2.5 py-1 rounded-xl font-medium capitalize transition-all ${
                    activeFilter === shelf
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {shelf === 'to-read' ? 'Want to Read' : shelf === 'currently-reading' ? 'Reading' : shelf}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => onChangeSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="original">Order Added</option>
                <option value="price-desc">Price: Highest First 👑</option>
                <option value="price-asc">Price: Lowest First 🪙</option>
                <option value="rating-desc">Rating: Highest First ⭐</option>
                <option value="title-asc">Title: A to Z 📖</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
