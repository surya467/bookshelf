import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function StatsHeader({ stats, onSwitchToMarket }) {
  const { totalRead, totalMissing, totalSeries, completedSeries, completionRate, totalMissingCost } = stats;

  return (
    <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
            Series Completionist
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#1d1d1f] mt-1.5">
            Your Library
          </h1>
          <p className="text-sm sm:text-base text-[#86868b] mt-2 max-w-xl leading-relaxed">
            Books you have read appear in full vibrant color. Missing companion books in your series are greyed out with direct links to complete your collection.
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
