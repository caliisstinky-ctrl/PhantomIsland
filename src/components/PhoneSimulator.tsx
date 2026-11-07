import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  MessageSquare, 
  Music, 
  Phone, 
  Settings, 
  Camera, 
  Clock, 
  Compass, 
  Calendar,
  Layers,
  Sparkles,
  Maximize2,
  Power
} from 'lucide-react';
import { NotchConfig, ActiveModule, CustomNotification } from '../types/notch';
import { DynamicNotch } from './DynamicNotch';
import { EdgeLightingOverlay } from './EdgeLightingOverlay';

interface PhoneSimulatorProps {
  config: NotchConfig;
  activeModule: ActiveModule;
  customNotification?: CustomNotification | null;
  onModuleChange: (mod: ActiveModule) => void;
  onClearNotification: () => void;
  onSelectTab: (tab: string) => void;
  onTogglePower?: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  config,
  activeModule,
  customNotification,
  onModuleChange,
  onClearNotification,
  onSelectTab,
  onTogglePower,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [currentDate, setCurrentDate] = useState<string>('Tuesday, November 3');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isEdgeLightingActive = (() => {
    if (!config.edgeLighting || !config.edgeLighting.enabled) return false;
    switch (config.edgeLighting.trigger) {
      case 'music':
        return activeModule === 'music';
      case 'notification':
        return Boolean(customNotification);
      case 'charging':
        return activeModule === 'battery';
      case 'always':
      default:
        return true;
    }
  })();

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Smartphone Outer Chassis with metallic titanium rim */}
      <div className="relative w-[340px] sm:w-[390px] h-[720px] sm:h-[780px] bg-black rounded-[52px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),0_0_0_10px_#141416,0_0_0_11px_rgba(255,255,255,0.12)] border border-zinc-800 overflow-hidden">
        
        {/* Antenna band lines on side edges for physical realism */}
        <div className="absolute top-28 -left-[2px] w-[3px] h-3 bg-zinc-700/60 rounded-r" />
        <div className="absolute top-44 -left-[2px] w-[3px] h-3 bg-zinc-700/60 rounded-r" />
        <div className="absolute bottom-28 -right-[2px] w-[3px] h-3 bg-zinc-700/60 rounded-l" />

        {/* Screen Display Container */}
        <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#09090b] flex flex-col justify-between">
          
          {/* Wallpaper background with dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/monochrome_phone_wallpaper_1793716691212.jpg"
              alt="Monochrome Wallpaper"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-75 contrast-125"
            />
            {/* Subtle dark gradient scrim for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/20 to-black/90 pointer-events-none" />
          </div>

          {/* SCREEN PERIMETER EDGE LIGHTING OVERLAY */}
          {config.edgeLighting && (
            <EdgeLightingOverlay
              config={config.edgeLighting}
              isActive={isEdgeLightingActive}
            />
          )}



          {/* ABSOLUTE DYNAMIC NOTCH OVERLAY - Allows moving flush to camera cutout at top 0 */}
          <DynamicNotch
            config={config}
            activeModule={activeModule}
            customNotification={customNotification}
            onModuleChange={onModuleChange}
            onClearNotification={onClearNotification}
          />

          {/* TOP STATUS BAR (Clock left, Battery/Wifi right) */}
          <div className="relative z-20 pt-3 px-7 pointer-events-none">
            <div className="flex items-center justify-between text-[13px] font-semibold text-white tracking-tight h-7">
              <span className="font-mono-numbers pl-1">{currentTime}</span>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-[10px] font-mono tracking-tighter opacity-80">5G</span>
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-mono-numbers">88%</span>
                  <Battery className="w-4 h-4 fill-white/80" />
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATED PHONE CONTENT AREA */}
          <div className="relative z-10 px-5 flex-1 flex flex-col justify-between pt-16 pb-6">
            
            {/* Ambient Lock/Home Clock & Date */}
            <div className="text-center pt-1">
              <div className="text-5xl font-extralight tracking-tight text-white font-mono-numbers drop-shadow-md">
                {currentTime}
              </div>
              <div className="text-xs uppercase tracking-wider text-zinc-300 font-medium mt-1">
                {currentDate}
              </div>
            </div>

            {/* Middle Quick Widgets Card */}
            <div className="space-y-3">
              {/* Daily Habit / Standby Widget with Island On/Off status */}
              <div className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-md border border-zinc-800/80 text-zinc-200">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-400 pb-2 border-b border-zinc-800/60">
                  <span>PhantomIsland v6.6</span>
                  <button 
                    onClick={onTogglePower}
                    className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors pointer-events-auto hover:text-white"
                  >
                    <span className={`w-2 h-2 rounded-full ${config.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                    <span>{config.isEnabled ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
                <div className="pt-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Daily Obsidian Routine</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {config.expansionStyle === 'slide-down' ? 'TheNotch Slide Down' : 'iOS Stick-to-Camera'}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full border-2 border-zinc-800 flex items-center justify-center relative font-mono text-[11px] font-bold text-white">
                    84%
                  </div>
                </div>
              </div>

              {/* Quick Trigger App Grid */}
              <div className="grid grid-cols-4 gap-3 pt-2 text-center pointer-events-auto">
                <button
                  onClick={() => onModuleChange('music')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 group-hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center transition-all">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium">Music</span>
                </button>

                <button
                  onClick={() => onModuleChange('call')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 group-hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center transition-all">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium">Call</span>
                </button>

                <button
                  onClick={() => onModuleChange('timer')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 group-hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center transition-all">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium">Timer</span>
                </button>

                <button
                  onClick={() => onSelectTab('calibration')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 group-hover:bg-zinc-800 border border-zinc-700/50 flex items-center justify-center transition-all">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] text-zinc-300 font-medium">Position</span>
                </button>
              </div>
            </div>

            {/* Bottom Dock */}
            <div className="pt-4 pointer-events-auto">
              <div className="h-16 px-4 rounded-3xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 flex items-center justify-between">
                <button
                  onClick={() => onModuleChange('call')}
                  className="w-11 h-11 rounded-2xl bg-zinc-800/90 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onModuleChange('notification')}
                  className="w-11 h-11 rounded-2xl bg-zinc-800/90 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onModuleChange('music')}
                  className="w-11 h-11 rounded-2xl bg-zinc-800/90 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors"
                >
                  <Music className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onSelectTab('expansion')}
                  className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center font-bold text-xs hover:bg-zinc-200 transition-colors"
                  title="Expansion Options"
                >
                  ⚡
                </button>
              </div>
            </div>
          </div>

          {/* Home indicator bar at bottom */}
          <div className="relative z-30 pb-2 flex justify-center">
            <div className="w-32 h-1 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
