import React from 'react';
import { motion } from 'framer-motion';
import { Columns3, Layers, Sparkles, Volume2, VolumeX, ArrowUp } from 'lucide-react';
import { soundFX } from '../services/soundFx';

/**
 * InteractiveDock: Apple-style Floating Glassmorphic View Dock.
 * Controls bookshelf view mode, display density, and tactile ambient feedback.
 */
export default function InteractiveDock({
  viewMode = 'shelves',
  onChangeViewMode,
  bookSize = 'default',
  onChangeBookSize,
}) {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.muted = next;
    if (!next) soundFX.playClick();
  };

  const scrollToTop = () => {
    soundFX.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const modes = [
    { id: 'shelves', label: 'Wall Shelves', icon: Columns3 },
    { id: 'stack', label: '3D Stack', icon: Layers },
    { id: 'rail', label: 'Jewel Rail', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex items-center justify-center pointer-events-none px-4">
      <div className="glass-dock rounded-full p-1.5 flex items-center gap-1.5 sm:gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] pointer-events-auto">
        {/* View Modes Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-full p-1 border border-white/5">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = viewMode === m.id;

            return (
              <button
                key={m.id}
                onClick={() => {
                  soundFX.playClick();
                  onChangeViewMode(m.id);
                }}
                className={`relative px-3 sm:px-4 py-2 rounded-full text-xs font-semibold tracking-tight transition-colors flex items-center gap-2 select-none ${
                  isActive ? 'text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dock-pill"
                    className="absolute inset-0 rounded-full bg-[#0071e3] shadow-[0_2px_12px_rgba(0,113,227,0.5)] z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5" />

        {/* Book Density Toggle */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-full p-1 border border-white/5">
          <button
            onClick={() => {
              soundFX.playClick();
              onChangeBookSize('compact');
            }}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              bookSize === 'compact'
                ? 'bg-white/20 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Compact Layout"
          >
            Compact
          </button>
          <button
            onClick={() => {
              soundFX.playClick();
              onChangeBookSize('default');
            }}
            className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              bookSize === 'default'
                ? 'bg-white/20 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Balanced Layout"
          >
            Balanced
          </button>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10 mx-0.5 hidden xs:block" />

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 text-neutral-300 hover:text-white transition-all"
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Back to Top */}
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/5 text-neutral-300 hover:text-white transition-all"
          title="Scroll to Top"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
