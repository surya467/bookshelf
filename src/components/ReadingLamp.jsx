import React from 'react';
import { soundFX } from '../services/soundFx';

export default function ReadingLamp({ isOn, onToggle, isNight }) {
  const handleClick = (e) => {
    e.stopPropagation();
    soundFX.playLampClick();
    onToggle();
  };

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer select-none group flex flex-col items-center transition-all duration-500 z-30"
      title={`Reading Lamp (${isOn ? 'ON - Click to turn off' : 'OFF - Click to turn on'})`}
    >
      {/* 2700K Warm Incandescent Ambient Light Cone Spill */}
      {isOn && (
        <div
          className="absolute -top-10 -left-36 w-80 h-96 pointer-events-none transition-opacity duration-700"
          style={{
            background: 'radial-gradient(ellipse at 55% 20%, rgba(255, 205, 120, 0.45) 0%, rgba(255, 180, 80, 0.22) 35%, rgba(255, 150, 50, 0.08) 60%, transparent 75%)',
          }}
        />
      )}

      {/* Modern Nordic Designer Lamp Silhouette */}
      <div className="relative flex flex-col items-center">
        {/* Lamp Shade (Conical Fluted Shade) */}
        <div
          className={`relative w-14 h-11 transition-all duration-300 transform group-hover:scale-105 ${
            isOn
              ? 'filter drop-shadow-[0_0_20px_rgba(255,200,100,0.85)]'
              : ''
          }`}
        >
          {/* Porcelain / Matte White Shade Body */}
          <div
            className={`w-full h-full rounded-t-[12px] border transition-colors duration-500 ${
              isNight
                ? isOn
                  ? 'bg-gradient-to-b from-[#fff6e0] to-[#ffd799] border-amber-300/40 shadow-inner'
                  : 'bg-[#1e2029] border-white/10'
                : isOn
                ? 'bg-gradient-to-b from-[#fffaf0] to-[#ffe4b5] border-amber-200 shadow-sm'
                : 'bg-[#eae8e1] border-black/10'
            }`}
            style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            }}
          />

          {/* Glowing Warm Bulb Rim under shade */}
          <div
            className={`absolute -bottom-1.5 inset-x-2 h-3 rounded-full transition-all duration-300 ${
              isOn
                ? 'bg-gradient-to-b from-amber-100 to-amber-300 shadow-[0_4px_16px_rgba(255,190,70,1)]'
                : isNight
                ? 'bg-zinc-800'
                : 'bg-zinc-300'
            }`}
          />
        </div>

        {/* Brass Hardware Socket Accent */}
        <div className="w-2.5 h-1.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 rounded-sm shadow-sm -mt-0.5" />

        {/* Slender Arched Lamp Stem */}
        <div
          className={`w-1 h-36 transition-colors duration-500 ${
            isNight ? 'bg-zinc-700' : 'bg-zinc-400'
          }`}
        />

        {/* Weighted Cast-Metal Lamp Base */}
        <div
          className={`w-12 h-2.5 rounded-t-full transition-colors duration-500 shadow-md ${
            isNight ? 'bg-zinc-800 border-t border-white/15' : 'bg-[#dedbd2] border-t border-white/80'
          }`}
        />

        {/* Pull Chain Switch Indicator */}
        <div className="absolute top-10 right-2 flex flex-col items-center">
          <div
            className={`w-[1px] h-6 transition-colors ${
              isNight ? 'bg-amber-300/50' : 'bg-amber-600/50'
            }`}
          />
          <div
            className={`w-1.5 h-2 rounded-full transition-all group-hover:translate-y-0.5 ${
              isOn
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                : isNight
                ? 'bg-zinc-600'
                : 'bg-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* Tactile Status Badge */}
      <span
        className={`mt-2 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full transition-all ${
          isOn
            ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 font-semibold border border-amber-400/30'
            : isNight
            ? 'bg-white/5 text-white/40 border border-white/10'
            : 'bg-black/5 text-black/40 border border-black/5'
        }`}
      >
        Lamp {isOn ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
