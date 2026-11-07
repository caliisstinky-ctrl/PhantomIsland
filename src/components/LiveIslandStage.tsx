import React from 'react';
import { 
  NotchConfig, 
  ActiveModule, 
  CustomNotification 
} from '../types/notch';
import { DynamicNotch } from './DynamicNotch';
import { 
  Power, 
  Sparkles, 
  Music, 
  PhoneCall, 
  Clock, 
  BatteryCharging, 
  Bell, 
  CheckCircle2, 
  Maximize2,
  Sliders,
  Eye,
  Radio
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/system';

interface LiveIslandStageProps {
  config: NotchConfig;
  activeModule: ActiveModule;
  customNotification?: CustomNotification | null;
  onModuleChange: (mod: ActiveModule) => void;
  onClearNotification: () => void;
  onSelectTab: (tab: string) => void;
  onTogglePower: () => void;
  onLaunchRealOverlay: () => void;
}

export const LiveIslandStage: React.FC<LiveIslandStageProps> = ({
  config,
  activeModule,
  customNotification,
  onModuleChange,
  onClearNotification,
  onSelectTab,
  onTogglePower,
  onLaunchRealOverlay,
}) => {
  const isMasterOn = config.isEnabled;

  const handleQuickTrigger = (mod: ActiveModule) => {
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
    onClearNotification();
    onModuleChange(mod);
  };

  return (
    <div className="w-full space-y-4">
      {/* 
        WHEN MASTER SWITCH IS OFF:
        Keep this small sleek demo on screen while they scroll!
        Using sticky top-6 z-30 with a compact, ultra-sleek OLED black stage.
      */}
      {!isMasterOn ? (
        <div className="sticky top-6 z-30 space-y-3 transition-all duration-300">
          {/* Minimalist Stage Card */}
          <div className="relative rounded-3xl bg-[#09090b] border border-zinc-800 p-5 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Header with Switch Status */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-semibold text-white tracking-wide">
                  Demo Preview Stage
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  Sticky on Scroll
                </span>
              </div>

              {/* PhantomIsland Power Switch */}
              <button
                onClick={onTogglePower}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                title="Turn Real PhantomIsland On"
              >
                <Power className="w-3.5 h-3.5 text-zinc-400" />
                <span>Turn PhantomIsland ON</span>
              </button>
            </div>

            {/* Pristine OLED Stage: Island Only Display */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-black border border-zinc-900/90 flex flex-col items-center justify-start overflow-hidden pt-3 shadow-inner">
              {/* Subtle camera punch hole marker guide */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-zinc-800/40 to-transparent pointer-events-none" 
              />

              {/* The PhantomIsland Demo */}
              <DynamicNotch
                config={{ ...config, isEnabled: true }} // Forced preview in demo
                activeModule={activeModule}
                customNotification={customNotification}
                onModuleChange={onModuleChange}
                onClearNotification={onClearNotification}
                isDockedMode={false}
              />
            </div>

            {/* Stage Quick Controls */}
            <div className="mt-3.5 pt-3 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                <span>{config.width}×{config.height}px</span>
                <span>·</span>
                <span className="capitalize">{activeModule}</span>
              </div>

              {/* Quick Module Changers */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => handleQuickTrigger('idle')}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    activeModule === 'idle'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Pure Black Idle State"
                >
                  Idle
                </button>
                <button
                  onClick={() => handleQuickTrigger('music')}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    activeModule === 'music'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Music Playing"
                >
                  Music
                </button>
                <button
                  onClick={() => handleQuickTrigger('call')}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    activeModule === 'call'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="VoIP Call"
                >
                  Call
                </button>
                <button
                  onClick={() => handleQuickTrigger('battery')}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                    activeModule === 'battery'
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Dash Charging"
                >
                  Charge
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 text-center px-2">
            Switch is OFF: This floating demo stays pinned as you adjust sliders below.
          </p>
        </div>
      ) : (
        /* 
          WHEN MASTER SWITCH IS ON:
          Only update the real PhantomIsland itself!
          Display a sleek indicator confirming the live real PhantomIsland at the top of the screen is active and receiving live updates.
        */
        <div className="sticky top-6 z-20 space-y-3">
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a0a0c] to-[#0e0e12] border border-zinc-800 p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  PhantomIsland Active
                </span>
              </div>

              {/* Turn Off Button */}
              <button
                onClick={onTogglePower}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Power className="w-3.5 h-3.5 text-red-400" />
                <span>Turn PhantomIsland OFF</span>
              </button>
            </div>

            {/* Informative Live Telemetry Box */}
            <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800/90 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Live System PhantomIsland Running at Screen Top
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Master switch is <strong>ON</strong>. PhantomIsland at the top of the screen is live and directly reflecting all slider adjustments, physical cutout coordinates, animations, and sound effects.
                  </p>
                </div>
              </div>

              {/* Status chips */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1 text-zinc-300">
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] uppercase">Active Target</span>
                  <span className="text-white font-medium">Top Viewport Edge</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[9px] uppercase">Module State</span>
                  <span className="text-emerald-400 font-medium capitalize">{activeModule}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={onLaunchRealOverlay}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fullscreen on Phone</span>
              </button>

              <button
                onClick={() => onSelectTab('calibration')}
                className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 text-center px-2">
            Look at the top of your screen &mdash; any changes you make in the tabs immediately update the real island!
          </p>
        </div>
      )}
    </div>
  );
};
