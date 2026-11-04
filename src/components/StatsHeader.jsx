import React, { useState } from 'react';
import { Edit2, Check, Sparkles } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * StatsHeader: Luxury Dark Editorial Library Codex.
 * Features customizable collector name, animated completion metrics,
 * and collapsible luxury glassmorphism.
 */
export default function StatsHeader({
  stats,
  userName,
  onUpdateUserName,
  onResetLibrary,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName || '');

  const { totalRead, totalMissing, totalSeries, completedSeries, completionRate, totalMissingCost } = stats;

  const handleSaveName = () => {
    soundFX.playClick();
    onUpdateUserName(nameInput.trim());
    setIsEditingName(false);
  };

  const displayName = userName
    ? `${userName}'s Bibliotheca`
    : 'Your Library Codex';

  return (
    <div className="w-full max-w-[1260px] mx-auto px-3 sm:px-6 mb-6">
      <div className="relative rounded-[28px] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent border border-white/10 p-5 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden">
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-[#0071e3]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            {/* Header Badge */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#0071e3] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#0071e3]" />
                <span>Bibliotheca &bull; Series Completionist Codex</span>
              </span>
            </div>

            {/* Editable Collector Name */}
            <div className="flex items-center gap-3 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    placeholder="Your Name"
                    autoFocus
                    className="font-editorial text-2xl sm:text-3xl font-bold text-white bg-white/10 rounded-xl px-3 py-1 border border-[#0071e3] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 rounded-xl bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => {
                  soundFX.playClick();
                  setNameInput(userName || '');
                  setIsEditingName(true);
                }}>
                  <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white group-hover:text-[#0071e3] transition-colors">
                    {displayName}
                  </h2>
                  <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity" />
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl leading-relaxed">
              Volumes read are displayed in full vibrant color. Missing companions in your active series appear as tactile grey editions ready for discovery.
            </p>
          </div>

          {/* Minimalist Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-shrink-0">
            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Read</div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white mt-0.5">{totalRead}</div>
              <div className="text-[10px] text-[#0071e3] font-mono mt-0.5">In Color</div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Missing</div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-neutral-400 mt-0.5">{totalMissing}</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">To Collect</div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Series</div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-white mt-0.5">{totalSeries}</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{completedSeries} Done</div>
            </div>

            <div className="bg-white/[0.03] p-3.5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Rate</div>
              <div className="text-xl sm:text-2xl font-bold font-editorial text-emerald-300 mt-0.5">{completionRate}%</div>
              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Archived</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
