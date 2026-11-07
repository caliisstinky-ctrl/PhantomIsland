import React from 'react';
import { Smartphone, Package, Sparkles } from 'lucide-react';

interface AkitaBannerProps {
  onLaunchRealOverlay?: () => void;
  onOpenAPKModal?: () => void;
}

export const AkitaBanner: React.FC<AkitaBannerProps> = ({
  onLaunchRealOverlay,
  onOpenAPKModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-[#0b0b0e] to-zinc-950 border border-zinc-800/90 p-5 sm:p-6 mb-6 shadow-2xl group">
      {/* Dynamic ambient cyber glow accents */}
      <div 
        className="absolute -top-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" 
      />
      <div 
        className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all duration-700" 
      />

      {/* Cyber Grid background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          
          {/* ULTRA-COOL PHANTOM CYBER-AKITA BADGE */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Holographic glowing ring */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-white/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />

            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-black border border-zinc-700/80 p-2 flex items-center justify-center shadow-2xl overflow-hidden">
              {/* Radial gradient backing */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0,transparent_70%)]" />

              {/* Cyber Phantom Akita Vector Art */}
              <svg 
                viewBox="0 0 120 120" 
                className="w-full h-full text-white relative z-10 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                fill="none" 
              >
                <defs>
                  <linearGradient id="cyberAkitaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#22d3ee" />
                    <stop offset="80%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>

                  <linearGradient id="earFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.25)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.05)" />
                  </linearGradient>

                  <filter id="neonEyeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background Cybernetic Tech Rings */}
                <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 4" />
                <circle cx="60" cy="60" r="48" stroke="rgba(34,211,238,0.15)" strokeWidth="1" strokeDasharray="6 8" />

                {/* AKITA EARS (Faceted Samurai-armor / Cyber-Akita pricked triangular ears) */}
                {/* Left Ear Outer */}
                <path 
                  d="M 34 50 L 16 18 Q 24 14 44 26 L 40 40 Z" 
                  fill="url(#earFill)" 
                  stroke="url(#cyberAkitaGradient)" 
                  strokeWidth="2.2" 
                  strokeLinejoin="round" 
                />
                {/* Left Ear Cyber Core */}
                <path d="M 24 25 L 36 34" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="24" cy="25" r="1.5" fill="#22d3ee" />

                {/* Right Ear Outer */}
                <path 
                  d="M 86 50 L 104 18 Q 96 14 76 26 L 80 40 Z" 
                  fill="url(#earFill)" 
                  stroke="url(#cyberAkitaGradient)" 
                  strokeWidth="2.2" 
                  strokeLinejoin="round" 
                />
                {/* Right Ear Cyber Core */}
                <path d="M 96 25 L 84 34" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="96" cy="25" r="1.5" fill="#22d3ee" />

                {/* Head Forehead Armor & Crown */}
                <path 
                  d="M 44 26 L 60 21 L 76 26 L 68 37 L 60 35 L 52 37 Z" 
                  fill="rgba(255,255,255,0.06)" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  strokeLinejoin="round" 
                />
                {/* Forehead Cyber Diamond Crest */}
                <polygon points="60,26 64,31 60,36 56,31" fill="#22d3ee" filter="url(#neonEyeGlow)" />

                {/* Cheek Ruff Facets (Akita iconic thick, muscular cheek fur armor plates) */}
                {/* Left Cheek */}
                <path 
                  d="M 34 50 L 20 62 L 28 80 L 42 90 L 46 80 Z" 
                  fill="rgba(0,0,0,0.4)" 
                  stroke="url(#cyberAkitaGradient)" 
                  strokeWidth="2" 
                  strokeLinejoin="round" 
                />
                {/* Right Cheek */}
                <path 
                  d="M 86 50 L 100 62 L 92 80 L 78 90 L 74 80 Z" 
                  fill="rgba(0,0,0,0.4)" 
                  stroke="url(#cyberAkitaGradient)" 
                  strokeWidth="2" 
                  strokeLinejoin="round" 
                />

                {/* Muzzle & Jaw Armor */}
                <path 
                  d="M 46 80 L 42 90 L 52 98 L 60 100 L 68 98 L 78 90 L 74 80 L 60 84 Z" 
                  fill="rgba(15,15,20,0.85)" 
                  stroke="url(#cyberAkitaGradient)" 
                  strokeWidth="2.2" 
                  strokeLinejoin="round" 
                />

                {/* Cyber Philtrum & Akita Black Muzzle Tip */}
                <polygon points="60,78 52,72 68,72" fill="#ffffff" stroke="#22d3ee" strokeWidth="1" />
                <line x1="60" y1="78" x2="60" y2="86" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                <path d="M 52 85 Q 60 89 68 85" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />

                {/* GLOWING PHANTOM CYBER EYES (Almond Akita Eyes with Neon Glow) */}
                {/* Left Eye */}
                <path 
                  d="M 39 55 Q 46 50 53 56 Q 47 59 39 55 Z" 
                  fill="#00f0ff" 
                  filter="url(#neonEyeGlow)" 
                />
                <circle cx="47" cy="54.5" r="1.5" fill="#ffffff" />

                {/* Right Eye */}
                <path 
                  d="M 81 55 Q 74 50 67 56 Q 73 59 81 55 Z" 
                  fill="#00f0ff" 
                  filter="url(#neonEyeGlow)" 
                />
                <circle cx="73" cy="54.5" r="1.5" fill="#ffffff" />

                {/* Brow & Eye Ridge Lines */}
                <path d="M 37 49 Q 46 45 54 50" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 83 49 Q 74 45 66 50" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />

                {/* Cyber Accent Circuit Lines */}
                <path d="M 60 38 L 60 62" stroke="rgba(34,211,238,0.4)" strokeWidth="1.2" strokeDasharray="2 3" />
                <path d="M 28 80 L 36 78" stroke="rgba(168,85,247,0.7)" strokeWidth="1.5" />
                <path d="M 92 80 L 84 78" stroke="rgba(168,85,247,0.7)" strokeWidth="1.5" />
              </svg>

              {/* Shimmer sweep animation */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite]" 
              />
            </div>
          </div>

          {/* App Branding & Badges */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                PHANTOM ENGINE
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[10px] font-mono text-zinc-400">
                v6.6 Stealth
              </span>
              <span className="text-zinc-600">·</span>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>OLED Active</span>
              </div>
            </div>
            
            {/* The Actual App Name: PhantomIsland */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-2.5">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-zinc-300">
                PhantomIsland
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/80 text-[10px] font-mono text-zinc-300 font-medium">
                PRO
              </span>
            </h1>

            <p className="text-xs text-zinc-400 mt-1.5 max-w-lg leading-relaxed">
              Ultra-precision floating island and camera cutout morphing hub. Zero camera deadzone collision, OLED deep black architecture, and hardware overlay immunity.
            </p>
          </div>
        </div>

        {/* Quick Actions (Moved from the old top bar into the banner for clean ergonomics) */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center sm:justify-end">
          {onLaunchRealOverlay && (
            <button
              onClick={onLaunchRealOverlay}
              className="py-2 px-3.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-lg active:scale-95"
              title="Launch PhantomIsland directly on this phone screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Launch on Phone</span>
            </button>
          )}

          {onOpenAPKModal && (
            <button
              onClick={onOpenAPKModal}
              className="py-2 px-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5 active:scale-95 shadow-md"
              title="Export Standalone Android APK Source"
            >
              <Package className="w-3.5 h-3.5 text-zinc-400" />
              <span>Get APK</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
