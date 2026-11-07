import React, { useState, useEffect, useRef } from 'react';
import { 
  NotchConfig, 
  ActiveModule, 
  CustomNotification 
} from '../types/notch';
import { DynamicNotch } from './DynamicNotch';
import { EdgeLightingOverlay } from './EdgeLightingOverlay';
import { 
  Maximize, 
  Minimize, 
  X, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Power, 
  Sparkles, 
  Music, 
  Bell, 
  PhoneCall, 
  BatteryCharging, 
  Clock, 
  RotateCcw,
  CircleDot,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/system';

interface RealPhoneOverlayModeProps {
  config: NotchConfig;
  onUpdateConfig: (newConfig: NotchConfig) => void;
  activeModule: ActiveModule;
  onModuleChange: (mod: ActiveModule) => void;
  customNotification: CustomNotification | null;
  onClearNotification: () => void;
  onTriggerNotification: (notif: CustomNotification) => void;
  onExit: () => void;
  onOpenAPKModal: () => void;
}

export const RealPhoneOverlayMode: React.FC<RealPhoneOverlayModeProps> = ({
  config,
  onUpdateConfig,
  activeModule,
  onModuleChange,
  customNotification,
  onClearNotification,
  onTriggerNotification,
  onExit,
  onOpenAPKModal,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [showQuickHud, setShowQuickHud] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);

  // Monitor Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Request WakeLock to prevent phone screen from sleeping
  useEffect(() => {
    async function requestWake() {
      if ('wakeLock' in navigator) {
        try {
          wakeLockSentinel.current = await navigator.wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLockSentinel.current.addEventListener('release', () => {
            setWakeLockActive(false);
          });
        } catch {
          setWakeLockActive(false);
        }
      }
    }

    requestWake();

    return () => {
      if (wakeLockSentinel.current) {
        wakeLockSentinel.current.release().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = async () => {
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(20);

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
    }
  };

  const update = (partial: Partial<NotchConfig>) => {
    onUpdateConfig({ ...config, ...partial });
  };

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

  const handleTestTrigger = (module: ActiveModule) => {
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(20);
    onClearNotification();
    onModuleChange(module);
  };

  const handleSendTestNotification = () => {
    soundFx.playChime(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(30);
    onTriggerNotification({
      id: Date.now().toString(),
      appName: 'System Phone Alert',
      title: 'Real Device Overlay Active',
      message: 'Island is anchored right on your physical camera cutout.',
      timeAgo: 'Now',
      iconType: 'chat',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden select-none flex flex-col justify-between">
      {/* 1. FULLSCREEN PHYSICAL EDGE LIGHTING (Edge-to-Edge Bezel) */}
      {config.edgeLighting?.enabled && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <EdgeLightingOverlay
            config={config.edgeLighting}
            isActive={isEdgeLightingActive}
            isDockMode={true}
          />
        </div>
      )}

      {/* 2. REAL HARDWARE DYNAMIC ISLAND (Positioned at Physical Screen Bezel) */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center"
        style={{
          paddingTop: `${Math.max(0, config.topMargin)}px`,
        }}
      >
        <div className="pointer-events-auto">
          <DynamicNotch
            config={config}
            activeModule={activeModule}
            customNotification={customNotification}
            onModuleChange={onModuleChange}
            onClearNotification={onClearNotification}
            isDockedMode={true}
          />
        </div>
      </div>

      {/* 3. SUBTLE FULLSCREEN STATUS HINT (Auto fades or toggleable) */}
      <div className="pt-2 px-4 z-20 flex items-center justify-between pointer-events-none text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${config.isEnabled ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          <span>{config.isEnabled ? 'Hardware Overlay Live' : 'Island Off'}</span>
          {wakeLockActive && <span className="text-zinc-600">· WakeLock ON</span>}
        </div>
        <div>
          <span>Tap island to expand</span>
        </div>
      </div>

      {/* 4. REAL PHONE FLOATING CALIBRATION HUD & CONTROLS */}
      <div className="z-50 p-4 w-full max-w-lg mx-auto pointer-events-auto">
        {showQuickHud ? (
          <div className="bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
            {/* HUD Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">
                  PhantomIsland Phone Overlay
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {isFullscreen ? 'FULLSCREEN' : 'WINDOWED'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQuickHud(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Minimize HUD to test fullscreen"
                >
                  <Minimize className="w-4 h-4" />
                </button>
                <button
                  onClick={onExit}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  title="Exit Overlay Mode"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Calibration: Nudge Camera Position on Real Screen */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                <span>Hardware Cutout Calibration</span>
                <button
                  onClick={() => update({ showCameraCalibrationRing: !config.showCameraCalibrationRing })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    config.showCameraCalibrationRing
                      ? 'bg-red-950/60 border-red-700 text-red-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {config.showCameraCalibrationRing ? 'Hide Red Guide' : 'Show Red Guide'}
                </button>
              </div>

              {/* Nudge Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Nudge Up */}
                <button
                  onClick={() => update({ topMargin: Math.max(0, config.topMargin - 2) })}
                  className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1 text-zinc-200"
                  title="Nudge Notch Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Up</span>
                </button>

                {/* Nudge Down */}
                <button
                  onClick={() => update({ topMargin: config.topMargin + 2 })}
                  className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1 text-zinc-200"
                  title="Nudge Notch Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Down</span>
                </button>

                {/* Nudge Left */}
                <button
                  onClick={() => update({ horizontalOffset: config.horizontalOffset - 2 })}
                  className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1 text-zinc-200"
                  title="Nudge Left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Left</span>
                </button>

                {/* Nudge Right */}
                <button
                  onClick={() => update({ horizontalOffset: config.horizontalOffset + 2 })}
                  className="px-2 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-1 text-zinc-200"
                  title="Nudge Right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Right</span>
                </button>
              </div>

              {/* Cutout Diameter Controls */}
              <div className="mt-2 flex items-center justify-between bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-[11px] font-mono text-zinc-300">
                <span>Cutout: {config.cameraHoleSize}px | Top: {config.topMargin}px</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => update({ cameraHoleSize: Math.max(6, config.cameraHoleSize - 1) })}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    title="Decrease camera cutout clearance"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => update({ cameraHoleSize: config.cameraHoleSize + 1 })}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    title="Increase camera cutout clearance"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Triggers */}
            <div className="mb-3">
              <span className="text-[11px] text-zinc-400 block mb-1.5">Test Live Island Behaviors:</span>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => handleTestTrigger('music')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    activeModule === 'music'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Music</span>
                </button>

                <button
                  onClick={() => handleTestTrigger('call')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    activeModule === 'call'
                      ? 'bg-emerald-400 text-black border-emerald-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                <button
                  onClick={() => handleTestTrigger('battery')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    activeModule === 'battery'
                      ? 'bg-cyan-400 text-black border-cyan-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <BatteryCharging className="w-3.5 h-3.5" />
                  <span>Charge</span>
                </button>

                <button
                  onClick={() => handleTestTrigger('timer')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    activeModule === 'timer'
                      ? 'bg-amber-400 text-black border-amber-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timer</span>
                </button>

                <button
                  onClick={handleSendTestNotification}
                  className="p-2 rounded-lg border bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notif</span>
                </button>

                <button
                  onClick={() => handleTestTrigger('idle')}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    activeModule === 'idle'
                      ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span>Idle Black</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions: Fullscreen & Exit */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
              <button
                onClick={toggleFullscreen}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-md"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen'}</span>
              </button>

              <button
                onClick={onOpenAPKModal}
                className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-medium text-xs hover:bg-zinc-800 transition-colors"
                title="Download Standalone Android APK Source"
              >
                APK Export
              </button>

              <button
                onClick={onExit}
                className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors"
              >
                Studio
              </button>
            </div>
          </div>
        ) : (
          /* Minimized Floating Trigger Button */
          <div className="flex justify-center">
            <button
              onClick={() => setShowQuickHud(true)}
              className="px-4 py-2 rounded-full bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 hover:text-white shadow-xl backdrop-blur-md flex items-center gap-2 hover:bg-zinc-900 transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>Overlay Controls</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
