import React, { useState } from 'react';
import { ArrowRight, Edit2, Check, RefreshCw } from 'lucide-react';

export default function StatsHeader({
  stats,
  userName,
  onUpdateUserName,
  onSwitchToMarket,
  onResetLibrary,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

  const { totalRead, totalMissing, totalSeries, completedSeries, completionRate, totalMissingCost } = stats;

  const handleSaveName = () => {
    onUpdateUserName(nameInput.trim());
    setIsEditingName(false);
  };

  const displayName = userName
    ? `${userName}'s Library`
    : 'Your Library';

  return (
    <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
              Series Completionist
            </span>
            <button
              onClick={onResetLibrary}
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1 transition-colors ml-2"
              title="Import a different CSV"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Change CSV</span>
            </button>
          </div>

          {/* Dynamic / Editable Title */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  placeholder="Your Name"
                  autoFocus
                  className="text-2xl sm:text-4xl font-semibold text-[#1d1d1f] bg-[#f5f5f7] rounded-xl px-3 py-1 border border-[#0071e3] focus:outline-none"
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 group">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1d1d1f]">
                  {displayName}
                </h1>
                <button
                  onClick={() => {
                    setNameInput(userName || '');
                    setIsEditingName(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition-all"
                  title="Rename Library"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-sm sm:text-base text-[#86868b] mt-2 max-w-xl leading-relaxed">
            Books you have read appear in full vibrant color. Missing companion volumes in your series appear in minimal grey with instant purchase options.
          </p>
        </div>

        {/* Global Minimal Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.02]">
            <div className="text-[11px] font-medium text-[#86868b]">Read</div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] mt-0.5">{totalRead}</div>
            <div className="text-[11px] text-[#0071e3] font-medium mt-0.5">In Color</div>
          </div>

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.02]">
            <div className="text-[11px] font-medium text-[#86868b]">Missing</div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#86868b] mt-0.5">{totalMissing}</div>
            <div className="text-[11px] text-[#86868b] font-medium mt-0.5">Greyed Out</div>
          </div>

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.02]">
            <div className="text-[11px] font-medium text-[#86868b]">Series</div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] mt-0.5">{totalSeries}</div>
            <div className="text-[11px] text-[#86868b] font-medium mt-0.5">{completedSeries} Complete</div>
          </div>

          <div className="bg-[#f5f5f7] p-4 rounded-2xl border border-black/[0.02]">
            <div className="text-[11px] font-medium text-[#86868b]">Completion</div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f] mt-0.5">{completionRate}%</div>
            <div className="text-[11px] text-[#34c759] font-medium mt-0.5">Across Shelf</div>
          </div>
        </div>
      </div>

      {totalMissing > 0 && (
        <div className="mt-8 pt-6 border-t border-black/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-[#86868b]">
            Estimated cost to complete all series: <strong className="text-[#1d1d1f] font-semibold">${totalMissingCost.toFixed(2)}</strong>
          </div>
          <button
            onClick={onSwitchToMarket}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors"
          >
            <span>View all {totalMissing} missing books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
