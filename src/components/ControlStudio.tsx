import React, { useState } from 'react';
import { 
  Sliders, 
  Zap, 
  Palette, 
  SlidersHorizontal, 
  Check, 
  RotateCcw, 
  Send, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Eye, 
  Sparkles,
  Layers,
  Crosshair,
  ShieldAlert,
  Radio,
  Play,
  Power,
  Move,
  Maximize2,
  Minimize2,
  Workflow,
  Compass,
  ArrowDown,
  Sun,
  Flame,
  CircleDot,
  Activity,
  Plus,
  Trash2,
  PlayCircle,
  BatteryCharging,
  Shield,
  ShieldCheck,
  Terminal,
  Cpu,
  Copy,
  ExternalLink,
  Save
} from 'lucide-react';
import { 
  NotchConfig, 
  NotchShape, 
  NotchFinish, 
  ExpansionStyle, 
  ActiveModule, 
  CustomNotification,
  EdgeLightingConfig,
  IslandBorderConfig,
  EdgeLightingPattern,
  EdgeLightingTrigger,
  IslandBorderPattern,
  CameraBatteryRingConfig,
  BatteryChargingAnimation,
  SystemOverlayConfig
} from '../types/notch';
import { soundFx } from '../utils/audio';
import { requestSystemNotification, readRealClipboard, triggerHaptic, getRealDeviceBattery, RealBatteryState } from '../utils/system';

interface ControlStudioProps {
  config: NotchConfig;
  onUpdateConfig: (newConfig: NotchConfig) => void;
  activeModule: ActiveModule;
  onModuleChange: (mod: ActiveModule) => void;
  onTriggerNotification: (notif: CustomNotification) => void;
  selectedTab: string;
  onSelectTab: (tab: string) => void;
  displayMode: 'phone' | 'dock' | 'real-overlay';
  onDisplayModeChange: (mode: 'phone' | 'dock' | 'real-overlay') => void;
}

export const ControlStudio: React.FC<ControlStudioProps> = ({
  config,
  onUpdateConfig,
  activeModule,
  onModuleChange,
  onTriggerNotification,
  selectedTab,
  onSelectTab,
  displayMode,
  onDisplayModeChange,
}) => {
  const [notifSender, setNotifSender] = useState<string>('WhatsApp');
  const [notifTitle, setNotifTitle] = useState<string>('Elena Vance');
  const [notifMessage, setNotifMessage] = useState<string>('The updated monochrome blueprints look phenomenal.');
  const [sendRealOSNotif, setSendRealOSNotif] = useState<boolean>(true);
  const [simulatedCharging, setSimulatedCharging] = useState<boolean>(false);
  const [testBatteryLevel, setTestBatteryLevel] = useState<number>(84);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'island' | 'lighting'>(() => {
    return (selectedTab === 'edge-lighting' || selectedTab === 'island-border') ? 'lighting' : 'island';
  });
  const [hasSavedPreset, setHasSavedPreset] = useState<boolean>(false);

  const handleSaveConfig = () => {
    try {
      localStorage.setItem('phantomisland_saved_config', JSON.stringify(config));
      setHasSavedPreset(true);
      soundFx.playChime(config.soundEnabled);
      if (config.hapticsEnabled) triggerHaptic(30);
      setTimeout(() => setHasSavedPreset(false), 2500);
    } catch {
      // ignore
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
  };

  const update = (partial: Partial<NotchConfig>) => {
    onUpdateConfig({ ...config, ...partial });
  };

  const updateBatteryRing = (partial: Partial<CameraBatteryRingConfig>) => {
    update({
      batteryRing: {
        ...config.batteryRing,
        ...partial,
      },
    });
  };

  const updateSystemOverlay = (partial: Partial<SystemOverlayConfig>) => {
    update({
      systemOverlay: {
        ...config.systemOverlay,
        ...partial,
      },
    });
  };

  const handleApplyPreset = (
    shape: NotchShape, 
    w: number, 
    h: number, 
    r: number, 
    top: number, 
    offset: number,
    camSize: number = 11
  ) => {
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
    update({
      shape,
      width: w,
      height: h,
      cornerRadius: r,
      topMargin: top,
      horizontalOffset: offset,
      cameraHoleSize: camSize,
    });
  };

  const handleSendCustomNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;
    
    onTriggerNotification({
      id: Date.now().toString(),
      appName: notifSender,
      title: notifTitle,
      message: notifMessage,
      timeAgo: 'Just now',
      iconType: 'chat',
    });

    if (sendRealOSNotif) {
      await requestSystemNotification(`${notifSender}: ${notifTitle}`, notifMessage);
    }
  };

  const updateEdgeLighting = (partial: Partial<EdgeLightingConfig>) => {
    update({
      edgeLighting: {
        ...config.edgeLighting,
        ...partial,
      },
    });
  };

  const updateIslandBorder = (partial: Partial<IslandBorderConfig>) => {
    update({
      islandBorder: {
        ...config.islandBorder,
        ...partial,
      },
    });
  };

  const COLOR_PRESETS = [
    { id: 'monochrome-silver', name: 'Monochrome Silver', colors: ['#ffffff', '#a1a1aa', '#52525b', '#ffffff'] },
    { id: 'pure-white', name: 'Pure White Neon', colors: ['#ffffff', '#f4f4f5', '#e4e4e7', '#ffffff'] },
    { id: 'cyber-neon', name: 'Cyberpunk Neon', colors: ['#00f0ff', '#ff007f', '#7928ca', '#00f0ff'] },
    { id: 'aurora', name: 'Aurora Borealis', colors: ['#10b981', '#06b6d4', '#3b82f6', '#10b981'] },
    { id: 'solar-gold', name: 'Solar Amber', colors: ['#f59e0b', '#ef4444', '#fbbf24', '#f59e0b'] },
  ];

  return (
    <div className="w-full bg-[#0d0d0f] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between">
      <div>
        {/* Category Controls, Master Power & Save Button Bar */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-zinc-800/80 mb-4 gap-3">
          {/* Master PhantomIsland Power Switch */}
          <button
            onClick={() => {
              soundFx.playTap(config.soundEnabled);
              if (config.hapticsEnabled) triggerHaptic(25);
              update({ isEnabled: !config.isEnabled });
            }}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
              config.isEnabled 
                ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' 
                : 'bg-red-950/40 border-red-800/80 text-red-300'
            }`}
            title="Turn PhantomIsland On or Off"
          >
            <Power className={`w-3.5 h-3.5 ${config.isEnabled ? 'text-emerald-400' : 'text-red-400'}`} />
            <span>{config.isEnabled ? 'PhantomIsland ON' : 'PhantomIsland OFF'}</span>
          </button>

          {/* 3 Action Buttons: [Phone: Island Options] [Rainbow Double-Lines: Edge Light/Border] [Save Option] */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800 shrink-0">
            {/* Button 1: Mobile Phone (PhantomIsland Options) */}
            <button
              onClick={() => {
                soundFx.playTap(config.soundEnabled);
                setActiveCategory('island');
                if (selectedTab === 'edge-lighting' || selectedTab === 'island-border') {
                  onSelectTab('calibration');
                }
              }}
              title="PhantomIsland Customization Options"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCategory === 'island' 
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Island</span>
            </button>

            {/* Button 2: 2 Rainbow Lines (Edge Lighting & Border Options) */}
            <button
              onClick={() => {
                soundFx.playTap(config.soundEnabled);
                setActiveCategory('lighting');
                if (selectedTab !== 'edge-lighting' && selectedTab !== 'island-border') {
                  onSelectTab('edge-lighting');
                }
              }}
              title="Edge Lighting & Island Border Options"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeCategory === 'lighting' 
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {/* 2 Rainbow Neon Lines Graphic */}
              <div className="flex items-center gap-0.5 h-3.5 w-3.5 justify-center">
                <span className="w-1 h-3.5 rounded-full bg-gradient-to-b from-pink-500 via-amber-400 to-cyan-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                <span className="w-1 h-3.5 rounded-full bg-gradient-to-b from-cyan-400 via-emerald-400 to-purple-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              </div>
              <span className="hidden sm:inline">Lighting</span>
            </button>

            {/* Button 3: Save Option */}
            <button
              onClick={handleSaveConfig}
              title="Save Preset Configuration to Device"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                hasSavedPreset 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 shadow-sm' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {hasSavedPreset ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Save confirmation banner */}
        {hasSavedPreset && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>PhantomIsland configuration saved to device storage!</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">SAVED</span>
          </div>
        )}

        {/* REFINED TAB-WISE LAYOUT (NO HORIZONTAL SIDE-SCROLLING) */}
        <div className="mb-6">
          {activeCategory === 'island' ? (
            /* 6 Island Tabs in clean non-scrolling grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSelectTab('calibration')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'calibration'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Move className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                <span className="truncate">Position &amp; Size</span>
              </button>

              <button
                onClick={() => onSelectTab('expansion')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'expansion'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Workflow className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                <span className="truncate">Expansion &amp; Motion</span>
              </button>

              <button
                onClick={() => onSelectTab('battery-ring')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'battery-ring'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Battery Ring</span>
              </button>

              <button
                onClick={() => onSelectTab('triggers')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'triggers'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Trigger Lab</span>
              </button>

              <button
                onClick={() => onSelectTab('aesthetics')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'aesthetics'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Aesthetics</span>
              </button>

              <button
                onClick={() => onSelectTab('system-overlay')}
                className={`p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                  selectedTab === 'system-overlay'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">System &amp; Overlay</span>
              </button>
            </div>
          ) : (
            /* 2 Lighting Tabs in clean non-scrolling grid */
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectTab('edge-lighting')}
                className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                  selectedTab === 'edge-lighting'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Screen Edge Lighting</span>
              </button>

              <button
                onClick={() => onSelectTab('island-border')}
                className={`p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                  selectedTab === 'island-border'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <CircleDot className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>PhantomIsland Border FX</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: POSITION & SIZE (CALIBRATION SLIDERS) */}
        {selectedTab === 'calibration' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
                <span>Camera Cutout Alignment & Size Controls</span>
                <span className="text-xs font-mono text-zinc-400">Sub-pixel Tuning</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Fine-tune the exact coordinates, bezel margin, and idle/expanded dimensions to stick seamlessly to your device's physical camera notch.
              </p>
            </div>

            {/* Quick Device Presets */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2">
                Hardware Device Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleApplyPreset('pill', 124, 34, 20, 10, 0, 11)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.shape === 'pill'
                      ? 'bg-zinc-800 border-zinc-400 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">PhantomIsland Standard</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Y: 10px | W: 124px</div>
                </button>

                <button
                  onClick={() => handleApplyPreset('teardrop', 110, 36, 18, 0, 0, 12)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.shape === 'teardrop'
                      ? 'bg-zinc-800 border-zinc-400 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">Flush Top Bezel</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Y: 0px (Flush)</div>
                </button>

                <button
                  onClick={() => handleApplyPreset('left-punch', 38, 38, 19, 8, -120, 12)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.shape === 'left-punch'
                      ? 'bg-zinc-800 border-zinc-400 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">Left Punch Hole</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">X: -120px | Circle</div>
                </button>

                <button
                  onClick={() => handleApplyPreset('macbook', 180, 32, 10, 0, 0, 10)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.shape === 'macbook'
                      ? 'bg-zinc-800 border-zinc-400 text-white'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">MacBook Top Notch</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">180 × 32px | Top 0</div>
                </button>
              </div>
            </div>

            {/* Sliders Grid: Position & Idle Geometry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Top Margin Y Slider (Allows moving all the way up to camera / 0px) */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Top Position Y (Bezel Gap)</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.topMargin}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="65"
                  value={config.topMargin}
                  onChange={(e) => update({ topMargin: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>0px (Flush Bezel)</span>
                  <span>10px (Status Bar)</span>
                  <span>65px</span>
                </div>
              </div>

              {/* Horizontal Position X Offset Slider */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Horizontal Position X</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.horizontalOffset}px</span>
                </div>
                <input
                  type="range"
                  min="-160"
                  max="160"
                  value={config.horizontalOffset}
                  onChange={(e) => update({ horizontalOffset: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>-160px (Left Hole)</span>
                  <span>0 (Center)</span>
                  <span>+160px (Right)</span>
                </div>
              </div>

              {/* Idle Width */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Idle Width</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.width}px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="280"
                  value={config.width}
                  onChange={(e) => update({ width: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Idle Height */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Idle Height</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.height}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="56"
                  value={config.height}
                  onChange={(e) => update({ height: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Corner Radius */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Corner Curvature Radius</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.cornerRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="36"
                  value={config.cornerRadius}
                  onChange={(e) => update({ cornerRadius: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Camera Punch Hole Sizing & Red Calibration Circle */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Camera Cutout Diameter</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.cameraHoleSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="36"
                    value={config.cameraHoleSize}
                    onChange={(e) => update({ cameraHoleSize: Number(e.target.value) })}
                    className="flex-1 accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => update({ showCameraCalibrationRing: !config.showCameraCalibrationRing })}
                    className={`px-2.5 py-1 text-[11px] rounded font-mono font-semibold transition-colors flex items-center gap-1 ${
                      config.showCameraCalibrationRing 
                        ? 'bg-red-600 text-white shadow-lg' 
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title="Toggle red camera calibration circle"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>{config.showCameraCalibrationRing ? 'Red Ring ON' : 'Red Ring Guide'}</span>
                  </button>
                </div>
              </div>

              {/* Camera Cutout X Fine-Tuning */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Camera Cutout Offset X</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {config.cameraHoleOffsetX > 0 ? `+${config.cameraHoleOffsetX}` : config.cameraHoleOffsetX}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={config.cameraHoleOffsetX}
                  onChange={(e) => update({ cameraHoleOffsetX: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Camera Cutout Y Fine-Tuning */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Camera Cutout Offset Y</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {config.cameraHoleOffsetY > 0 ? `+${config.cameraHoleOffsetY}` : config.cameraHoleOffsetY}px
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={config.cameraHoleOffsetY}
                  onChange={(e) => update({ cameraHoleOffsetY: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Expanded Width */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Expanded Modal Width</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.expandedWidth}px</span>
                </div>
                <input
                  type="range"
                  min="280"
                  max="400"
                  value={config.expandedWidth}
                  onChange={(e) => update({ expandedWidth: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Expanded Height */}
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Expanded Min Height</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.expandedMinHeight}px</span>
                </div>
                <input
                  type="range"
                  min="140"
                  max="280"
                  value={config.expandedMinHeight}
                  onChange={(e) => update({ expandedMinHeight: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Calibration Crosshair Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Crosshair className="w-4 h-4 text-zinc-400" />
                <div>
                  <div className="text-xs font-medium text-white">Hardware Crosshair Alignment Overlay</div>
                  <div className="text-[11px] text-zinc-400">Renders optical coordinate crosshairs to align with physical lens</div>
                </div>
              </div>
              <button
                onClick={() => update({ showCrosshairs: !config.showCrosshairs })}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                  config.showCrosshairs ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    config.showCrosshairs ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXPANSION & MOTION (TheNotch vs iOS) */}
        {selectedTab === 'expansion' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
                <span>Expansion Mechanics &amp; Stick to Camera</span>
                <span className="text-xs font-mono text-zinc-400">TheNotch vs iOS</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Choose how notifications, media controls, and widgets expand relative to your device's physical camera hole.
              </p>
            </div>

            {/* Expansion Style Selector */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2">
                Expansion Motion Behavior
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    soundFx.playTap(config.soundEnabled);
                    update({ expansionStyle: 'stick-to-camera' });
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    config.expansionStyle === 'stick-to-camera'
                      ? 'bg-zinc-800 border-zinc-400 text-white shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Stick to Camera (iOS Native)</span>
                    <span className="text-xs font-mono">🍎</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Expands symmetrically outward around the camera cutout with fluid spring physics.
                  </div>
                </button>

                <button
                  onClick={() => {
                    soundFx.playTap(config.soundEnabled);
                    update({ expansionStyle: 'slide-down' });
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    config.expansionStyle === 'slide-down'
                      ? 'bg-zinc-800 border-zinc-400 text-white shadow-md'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Slide Down &amp; Expand (TheNotch Style)</span>
                    <span className="text-xs font-mono">⬇️</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Sits directly on the camera when idle, but drops down below the cutout before blooming open so the camera is never obstructed.
                  </div>
                </button>
              </div>
            </div>

            {/* Slide Down Distance (visible when slide-down is active) */}
            {config.expansionStyle === 'slide-down' && (
              <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white font-medium flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Slide Down Distance Below Camera</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">
                    {config.slideDownDistance}px
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="44"
                  value={config.slideDownDistance}
                  onChange={(e) => update({ slideDownDistance: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>8px (Close)</span>
                  <span>20px (Default)</span>
                  <span>44px (Deep Drop)</span>
                </div>
              </div>
            )}

            {/* Spring Physics Fine-Tuning */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Spring Stiffness</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.springStiffness}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="650"
                  value={config.springStiffness}
                  onChange={(e) => update({ springStiffness: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>200 (Soft)</span>
                  <span>440 (Balanced)</span>
                  <span>650 (Snappy)</span>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950/70 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-zinc-300 font-medium">Spring Damping</span>
                  <span className="text-xs font-mono font-bold text-white tabular-nums">{config.springDamping}</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={config.springDamping}
                  onChange={(e) => update({ springDamping: Number(e.target.value) })}
                  className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>16 (Bouncy)</span>
                  <span>34 (Fluid)</span>
                  <span>48 (Solid)</span>
                </div>
              </div>
            </div>

            {/* Auto-Expand Triggers */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2">
                Automatic Expansion Triggers
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div>
                    <div className="text-xs text-zinc-200 font-medium">Auto-Expand When New Music Plays</div>
                    <div className="text-[10px] text-zinc-400">Temporarily opens track title and player on song change</div>
                  </div>
                  <button
                    onClick={() => update({ autoExpandOnMusic: !config.autoExpandOnMusic })}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      config.autoExpandOnMusic ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        config.autoExpandOnMusic ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                  <div>
                    <div className="text-xs text-zinc-200 font-medium">Auto-Expand on Incoming Notifications</div>
                    <div className="text-[10px] text-zinc-400">Opens the full card rather than just a compact toast</div>
                  </div>
                  <button
                    onClick={() => update({ autoExpandOnNotification: !config.autoExpandOnNotification })}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      config.autoExpandOnNotification ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        config.autoExpandOnNotification ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CAMERA BATTERY RING */}
        {selectedTab === 'battery-ring' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
                <span>Camera Cutout Battery Ring (Energy Ring)</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Live Meter</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Customizable circular battery level ring hugging your physical camera hole, with 6 dynamic charging animations.
              </p>
            </div>

            {/* Master Switch */}
            <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Camera Battery Ring State</div>
                  <div className="text-[11px] text-zinc-400">
                    {config.batteryRing?.enabled ? 'Active around camera punch hole' : 'Turned off completely'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  if (config.hapticsEnabled) triggerHaptic(20);
                  updateBatteryRing({ enabled: !config.batteryRing?.enabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                  config.batteryRing?.enabled ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    config.batteryRing?.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Real-time Battery Simulator & Charging Test */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Interactive Battery &amp; Charging Test</div>
                  <div className="text-[10px] text-zinc-400">Simulate battery levels and preview charging animations live</div>
                </div>
                <button
                  onClick={() => {
                    soundFx.playChime(config.soundEnabled);
                    onModuleChange('battery');
                    setSimulatedCharging(prev => !prev);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeModule === 'battery' || simulatedCharging
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                      : 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${activeModule === 'battery' ? 'animate-bounce text-black' : 'text-amber-400'}`} />
                  <span>{activeModule === 'battery' ? 'Charging Active' : 'Test Charging Flow'}</span>
                </button>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Simulate Battery Level</span>
                  <span className="font-mono text-zinc-400 font-bold">{testBatteryLevel}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={testBatteryLevel}
                  onChange={(e) => setTestBatteryLevel(Number(e.target.value))}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span className="text-red-400">Critical (10%)</span>
                  <span className="text-amber-400">Warning (35%)</span>
                  <span className="text-emerald-400">Full (100%)</span>
                </div>
              </div>
            </div>

            {/* Selection of 6 Charging Animations */}
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-2">
                Charging Animation (While Plugged In)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'radar-sweep',
                    name: 'Radar Tracer',
                    desc: 'High-speed spinning tracer beam',
                    icon: CircleDot,
                  },
                  {
                    id: 'pulse-glow',
                    name: 'Pulse Glow',
                    desc: 'Radiant breathing bloom halo',
                    icon: Sun,
                  },
                  {
                    id: 'neon-comet',
                    name: 'Neon Comet',
                    desc: 'Dual racing comet heads',
                    icon: Flame,
                  },
                  {
                    id: 'dash-flash',
                    name: 'Dash Flash 67W',
                    desc: 'SuperVOOC rapid lightning strobe',
                    icon: Zap,
                  },
                  {
                    id: 'breathe',
                    name: 'Zen Breathe',
                    desc: 'Smooth organic breathing pulse',
                    icon: Activity,
                  },
                  {
                    id: 'liquid-bubble',
                    name: 'Liquid Fill',
                    desc: 'Fluid bubbling charge level',
                    icon: Sparkles,
                  },
                ].map((anim) => {
                  const Icon = anim.icon;
                  const isSelected = config.batteryRing?.chargingAnimation === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        if (config.hapticsEnabled) triggerHaptic(15);
                        updateBatteryRing({ chargingAnimation: anim.id as BatteryChargingAnimation });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border-emerald-400 text-white shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                        <span className="text-xs font-semibold">{anim.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">{anim.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ring Geometry & Sliders */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-4">
              <div className="text-xs font-semibold text-white">Ring Geometry &amp; Snug Camera Hug</div>

              {/* Ring Thickness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Ring Stroke Thickness</span>
                  <span className="font-mono text-zinc-400">{config.batteryRing?.thickness || 2.5}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={config.batteryRing?.thickness || 2.5}
                  onChange={(e) => updateBatteryRing({ thickness: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Ring Gap from Camera Hole */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Distance / Ring Gap from Hole</span>
                  <span className="font-mono text-zinc-400">{config.batteryRing?.ringGap || 2}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="1"
                  value={config.batteryRing?.ringGap || 2}
                  onChange={(e) => updateBatteryRing({ ringGap: Number(e.target.value) })}
                  className="w-full accent-white"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
                  <span>0px (Tight Rim)</span>
                  <span>4px (Spaced Ring)</span>
                  <span>14px (Outer Orbit)</span>
                </div>
              </div>

              {/* Start Angle */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Ring Arc Start Angle</span>
                  <span className="font-mono text-zinc-400">
                    {config.batteryRing?.startAngle === 0 
                      ? '0° (Top 12 o\'clock)' 
                      : config.batteryRing?.startAngle === 90 
                        ? '90° (Right 3 o\'clock)' 
                        : config.batteryRing?.startAngle === 180 
                          ? '180° (Bottom 6 o\'clock)' 
                          : `${config.batteryRing?.startAngle}°`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={config.batteryRing?.startAngle || 0}
                  onChange={(e) => updateBatteryRing({ startAngle: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Animation Speed */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Charging Animation Speed</span>
                  <span className="font-mono text-zinc-400">{(config.batteryRing?.chargingSpeed || 1.4).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.1"
                  value={config.batteryRing?.chargingSpeed || 1.4}
                  onChange={(e) => updateBatteryRing({ chargingSpeed: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Direction & Percentage Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-xs text-white font-medium">Clockwise Fill</div>
                    <div className="text-[10px] text-zinc-400">Ring fills clockwise from start</div>
                  </div>
                  <button
                    onClick={() => updateBatteryRing({ clockwise: !config.batteryRing?.clockwise })}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      config.batteryRing?.clockwise ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        config.batteryRing?.clockwise ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-xs text-white font-medium">Battery % Text</div>
                    <div className="text-[10px] text-zinc-400">Show tiny % tag below ring</div>
                  </div>
                  <button
                    onClick={() => updateBatteryRing({ showPercentageText: !config.batteryRing?.showPercentageText })}
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 relative ${
                      config.batteryRing?.showPercentageText ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        config.batteryRing?.showPercentageText ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Color Mode Selection */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
              <div className="text-xs font-semibold text-white">Color Themes &amp; Status Shift</div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'status-threshold', name: 'Status Shift', desc: 'Green > Amber > Red' },
                  { id: 'monochrome', name: 'Monochrome', desc: 'OLED Silver / White' },
                  { id: 'custom', name: 'Custom Hue', desc: 'User Chosen Color' },
                ].map((mode) => {
                  const isSelected = config.batteryRing?.colorMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => updateBatteryRing({ colorMode: mode.id as any })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-white text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{mode.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Color Pickers */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Charging Accent Color:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.batteryRing?.chargingColor || '#38bdf8'}
                    onChange={(e) => updateBatteryRing({ chargingColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Change charging accent color"
                  />
                  <span className="font-mono text-xs text-white uppercase">
                    {config.batteryRing?.chargingColor || '#38bdf8'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: EDGE LIGHTING */}
        {selectedTab === 'edge-lighting' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Perimeter Edge Lighting Engine
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Display perimeter aura with animated conic sweeps, pulsing glow, and customizable multi-color moving fades.
              </p>
            </div>

            {/* Master Switch */}
            <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  <Sun className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Edge Lighting Master State</div>
                  <div className="text-[11px] text-zinc-400">
                    {config.edgeLighting?.enabled ? 'Active on screen perimeter' : 'Turned off completely'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  if (config.hapticsEnabled) triggerHaptic(20);
                  updateEdgeLighting({ enabled: !config.edgeLighting?.enabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                  config.edgeLighting?.enabled ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    config.edgeLighting?.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Movement Pattern Selection */}
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-2">
                Movement Pattern &amp; Behavior
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'orbit-chase',
                    name: 'Orbit Chase',
                    desc: '360° rotating conic beam',
                    icon: CircleDot,
                  },
                  {
                    id: 'sweep-comet',
                    name: 'Comet Sweep',
                    desc: 'High-speed trailing laser',
                    icon: Flame,
                  },
                  {
                    id: 'liquid-fade',
                    name: 'Liquid Multi-Fade',
                    desc: 'Flowing color wave morph',
                    icon: Sparkles,
                  },
                  {
                    id: 'pulse-breathe',
                    name: 'Breathing Pulse',
                    desc: 'Soft rhythmic aura fade',
                    icon: Activity,
                  },
                  {
                    id: 'snake-runner',
                    name: 'Snake Runner',
                    desc: 'Dual racing perimeter beams',
                    icon: Workflow,
                  },
                ].map((pat) => {
                  const Icon = pat.icon;
                  const isSelected = config.edgeLighting?.pattern === pat.id;
                  return (
                    <button
                      key={pat.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        if (config.hapticsEnabled) triggerHaptic(15);
                        updateEdgeLighting({ pattern: pat.id as EdgeLightingPattern });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border-white text-white shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="text-xs font-semibold">{pat.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">{pat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette & Custom Multi-Color Stops */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Color Palette &amp; Multi-Color Stops</div>
                  <div className="text-[10px] text-zinc-400">Choose sleek monochrome presets or configure custom hues</div>
                </div>
                {config.edgeLighting?.colorPreset !== 'custom' && (
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Preset: {config.edgeLighting?.colorPreset}
                  </span>
                )}
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = config.edgeLighting?.colorPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        updateEdgeLighting({
                          colorPreset: preset.id,
                          colors: preset.colors,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-white text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center -space-x-1">
                        {preset.colors.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Live Gradient Preview Bar */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-zinc-400 flex justify-between">
                  <span>Gradient Color Flow Preview</span>
                  <span>{config.edgeLighting?.colors.length || 0} stops</span>
                </div>
                <div
                  className="w-full h-4 rounded-full border border-zinc-700 shadow-inner"
                  style={{
                    background: `linear-gradient(90deg, ${(config.edgeLighting?.colors || ['#ffffff', '#71717a']).join(', ')})`,
                  }}
                />
              </div>

              {/* Custom Stop Pickers */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <span>Configure Color Stops:</span>
                  {(config.edgeLighting?.colors.length || 0) < 4 && (
                    <button
                      onClick={() => {
                        const current = config.edgeLighting?.colors || ['#ffffff', '#71717a'];
                        updateEdgeLighting({
                          colorPreset: 'custom',
                          colors: [...current, '#38bdf8'],
                        });
                      }}
                      className="text-[10px] text-white hover:underline flex items-center gap-1 font-mono"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Stop</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(config.edgeLighting?.colors || []).map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...(config.edgeLighting?.colors || [])];
                            newColors[index] = e.target.value;
                            updateEdgeLighting({
                              colorPreset: 'custom',
                              colors: newColors,
                            });
                          }}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                          title="Click to change color"
                        />
                        <span className="font-mono text-[11px] text-zinc-300 uppercase">
                          {color}
                        </span>
                      </div>
                      {(config.edgeLighting?.colors.length || 0) > 2 && (
                        <button
                          onClick={() => {
                            const newColors = (config.edgeLighting?.colors || []).filter((_, i) => i !== index);
                            updateEdgeLighting({
                              colorPreset: 'custom',
                              colors: newColors,
                            });
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Precision Geometry Sliders */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-4">
              <div className="text-xs font-semibold text-white">Size, Inset &amp; Motion Calibration</div>

              {/* Thickness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Border Thickness</span>
                  <span className="font-mono text-zinc-400">{config.edgeLighting?.thickness || 3}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={config.edgeLighting?.thickness || 3}
                  onChange={(e) => updateEdgeLighting({ thickness: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Inset */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Screen Inset Offset</span>
                  <span className="font-mono text-zinc-400">{config.edgeLighting?.inset || 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="18"
                  step="1"
                  value={config.edgeLighting?.inset || 0}
                  onChange={(e) => updateEdgeLighting({ inset: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Corner Radius */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Corner Radius Curvature</span>
                  <span className="font-mono text-zinc-400">{config.edgeLighting?.cornerRadius || 42}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="52"
                  step="2"
                  value={config.edgeLighting?.cornerRadius || 42}
                  onChange={(e) => updateEdgeLighting({ cornerRadius: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Cycle Duration (Speed)</span>
                  <span className="font-mono text-zinc-400">{(config.edgeLighting?.speed || 2.4).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={config.edgeLighting?.speed || 2.4}
                  onChange={(e) => updateEdgeLighting({ speed: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Glow Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Luminous Glow &amp; Bloom Blur</span>
                  <span className="font-mono text-zinc-400">{config.edgeLighting?.glowBlur || 10}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="28"
                  step="1"
                  value={config.edgeLighting?.glowBlur || 10}
                  onChange={(e) => updateEdgeLighting({ glowBlur: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
            </div>

            {/* Trigger Activation Mode */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-3">
              <div>
                <div className="text-xs font-semibold text-white">Trigger Activation Mode</div>
                <div className="text-[10px] text-zinc-400">Specify when the edge lighting turns on</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'always', label: 'Always On', desc: 'Permanent ambient' },
                  { id: 'music', label: 'Music Playing', desc: 'Active with audio' },
                  { id: 'notification', label: 'Notifications', desc: 'Flashes on alert' },
                  { id: 'charging', label: 'Charging Only', desc: 'Fires when plugged' },
                ].map((trig) => {
                  const isSelected = config.edgeLighting?.trigger === trig.id;
                  return (
                    <button
                      key={trig.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        updateEdgeLighting({ trigger: trig.id as EdgeLightingTrigger });
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-white text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{trig.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{trig.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Flash Test Action */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Test trigger reaction:</span>
                <button
                  onClick={() => {
                    onTriggerNotification({
                      id: Date.now().toString(),
                      appName: 'Edge Light Test',
                      title: 'Edge Lighting Trigger Active',
                      message: 'Illuminating perimeter corners in real-time.',
                      timeAgo: 'Just now',
                      iconType: 'zap',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Alert Flash</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ISLAND BORDER */}
        {selectedTab === 'island-border' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                PhantomIsland Border &amp; Ring FX
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Architectural perimeter outlines and audio-reactive rings wrapping directly around the camera notch pill.
              </p>
            </div>

            {/* Master Switch */}
            <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                  <CircleDot className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Island Border Master State</div>
                  <div className="text-[11px] text-zinc-400">
                    {config.islandBorder?.enabled ? 'Active around notch contour' : 'Turned off completely'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  if (config.hapticsEnabled) triggerHaptic(20);
                  updateIslandBorder({ enabled: !config.islandBorder?.enabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                  config.islandBorder?.enabled ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    config.islandBorder?.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Island Border Pattern Selection */}
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-2">
                Island Border Pattern &amp; Movement
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'orbit-chase',
                    name: 'Rotating Conic Chase',
                    desc: 'Spins around the pill curve',
                    icon: CircleDot,
                  },
                  {
                    id: 'sound-reactive',
                    name: 'Sound-Reactive Beat',
                    desc: 'Pulses with Web Audio beats',
                    icon: Activity,
                  },
                  {
                    id: 'liquid-fade',
                    name: 'Liquid Gradient Fade',
                    desc: 'Fluid shifting multi-color morph',
                    icon: Sparkles,
                  },
                  {
                    id: 'laser-runner',
                    name: 'Laser Runner',
                    desc: 'Fast focused streak tracing edge',
                    icon: Flame,
                  },
                  {
                    id: 'pulse-breathe',
                    name: 'Breathing Aura',
                    desc: 'Organic breathing pulsation',
                    icon: Sun,
                  },
                  {
                    id: 'solid',
                    name: 'Solid Hairline',
                    desc: 'Precision architectural rim',
                    icon: Workflow,
                  },
                ].map((pat) => {
                  const Icon = pat.icon;
                  const isSelected = config.islandBorder?.pattern === pat.id;
                  return (
                    <button
                      key={pat.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        if (config.hapticsEnabled) triggerHaptic(15);
                        updateIslandBorder({ pattern: pat.id as IslandBorderPattern });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-zinc-800/90 border-white text-white shadow-md'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="text-xs font-semibold">{pat.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-tight">{pat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette & Custom Multi-Color Stops */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Island Border Palette &amp; Colors</div>
                  <div className="text-[10px] text-zinc-400">Match phone bezel or choose high-contrast neon accents</div>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = config.islandBorder?.colorPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        updateIslandBorder({
                          colorPreset: preset.id,
                          colors: preset.colors,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-zinc-800 border-white text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center -space-x-1">
                        {preset.colors.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-black/40"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Live Gradient Preview Bar */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-mono text-zinc-400 flex justify-between">
                  <span>Border Outline Gradient Preview</span>
                  <span>{config.islandBorder?.colors.length || 0} stops</span>
                </div>
                <div
                  className="w-full h-3 rounded-full border border-zinc-700 shadow-inner"
                  style={{
                    background: `linear-gradient(90deg, ${(config.islandBorder?.colors || ['#ffffff', '#71717a']).join(', ')})`,
                  }}
                />
              </div>

              {/* Color Stops Pickers */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <span>Custom Color Stops:</span>
                  {(config.islandBorder?.colors.length || 0) < 4 && (
                    <button
                      onClick={() => {
                        const current = config.islandBorder?.colors || ['#ffffff', '#71717a'];
                        updateIslandBorder({
                          colorPreset: 'custom',
                          colors: [...current, '#a855f7'],
                        });
                      }}
                      className="text-[10px] text-white hover:underline flex items-center gap-1 font-mono"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Stop</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(config.islandBorder?.colors || []).map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...(config.islandBorder?.colors || [])];
                            newColors[index] = e.target.value;
                            updateIslandBorder({
                              colorPreset: 'custom',
                              colors: newColors,
                            });
                          }}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                          title="Click to change color"
                        />
                        <span className="font-mono text-[11px] text-zinc-300 uppercase">
                          {color}
                        </span>
                      </div>
                      {(config.islandBorder?.colors.length || 0) > 2 && (
                        <button
                          onClick={() => {
                            const newColors = (config.islandBorder?.colors || []).filter((_, i) => i !== index);
                            updateIslandBorder({
                              colorPreset: 'custom',
                              colors: newColors,
                            });
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Precision Geometry Sliders */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 space-y-4">
              <div className="text-xs font-semibold text-white">Border Rim Thickness, Glow &amp; Speed</div>

              {/* Thickness */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Border Rim Thickness</span>
                  <span className="font-mono text-zinc-400">{config.islandBorder?.thickness || 2}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={config.islandBorder?.thickness || 2}
                  onChange={(e) => updateIslandBorder({ thickness: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Glow Blur */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Glow Bloom / Halo</span>
                  <span className="font-mono text-zinc-400">{config.islandBorder?.glowBlur || 8}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={config.islandBorder?.glowBlur || 8}
                  onChange={(e) => updateIslandBorder({ glowBlur: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>

              {/* Speed */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">Rotation / Flow Speed</span>
                  <span className="font-mono text-zinc-400">{(config.islandBorder?.speed || 2.0).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="5.0"
                  step="0.1"
                  value={config.islandBorder?.speed || 2.0}
                  onChange={(e) => updateIslandBorder({ speed: Number(e.target.value) })}
                  className="w-full accent-white"
                />
              </div>
            </div>

            {/* Sound-Reactive Beat Preview / Info */}
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real Web Audio Frequency Reactor</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  When &quot;Sound-Reactive Beat&quot; is active, the border modulates live with the audio visualizer.
                </div>
              </div>
              <button
                onClick={() => {
                  onModuleChange('music');
                  soundFx.startMusic(0, 70);
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
              >
                <PlayCircle className="w-3.5 h-3.5 text-white" />
                <span>Play Track Beat</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TRIGGER LAB */}
        {selectedTab === 'triggers' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Live Activity &amp; Event Trigger Lab
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Simulate events in real-time. Click any trigger to see the notch animate with fluid spring physics.
              </p>
            </div>

            {/* Event Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('music');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'music'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Now Playing</span>
                  <span className="text-[10px] font-mono opacity-60">🎵</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Spektrum - Resonance</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('call');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'call'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>VoIP Call</span>
                  <span className="text-[10px] font-mono opacity-60">📞</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Elena Vance</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('battery');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'battery'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Dash 67W Charger</span>
                  <span className="text-[10px] font-mono opacity-60">⚡</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">82% Fast Charging</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('timer');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'timer'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Pomodoro Timer</span>
                  <span className="text-[10px] font-mono opacity-60">⏱️</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">24:40 Remaining</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('delivery');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'delivery'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Courier Delivery</span>
                  <span className="text-[10px] font-mono opacity-60">🛵</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Obsidian Roasters 3m</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playTap(config.soundEnabled);
                  onModuleChange('sports');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activeModule === 'sports'
                    ? 'bg-zinc-800 border-zinc-400 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Live Score</span>
                  <span className="text-[10px] font-mono opacity-60">⚽</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">RMA 2 - 1 MCI 84'</div>
              </button>
            </div>

            {/* Custom Notification Generator Form */}
            <div className="p-4 bg-zinc-950/70 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <span className="text-xs font-semibold text-white">Send Custom Notification Toast</span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Interactive</span>
              </div>
              <form onSubmit={handleSendCustomNotif} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                      App Name
                    </label>
                    <input
                      type="text"
                      value={notifSender}
                      onChange={(e) => setNotifSender(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                      Sender / Title
                    </label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">
                    Message Body
                  </label>
                  <input
                    type="text"
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={sendRealOSNotif}
                      onChange={(e) => setSendRealOSNotif(e.target.checked)}
                      className="accent-white rounded"
                    />
                    <span>Also send real system notification to device</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const text = await readRealClipboard();
                      if (text) {
                        onTriggerNotification({
                          id: Date.now().toString(),
                          appName: 'Clipboard',
                          title: 'Copied Text Detected',
                          message: text,
                          timeAgo: 'Just now',
                          iconType: 'chat',
                        });
                      } else {
                        onTriggerNotification({
                          id: Date.now().toString(),
                          appName: 'Clipboard',
                          title: 'Clipboard',
                          message: 'No text copied or permission needed',
                          timeAgo: 'Just now',
                          iconType: 'chat',
                        });
                      }
                    }}
                    className="text-[11px] text-zinc-400 hover:text-white transition-colors underline"
                  >
                    Test Clipboard
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-white text-black font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Fire Notification to Island</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: AESTHETICS (SLEEK DARK MONOCHROME) */}
        {selectedTab === 'aesthetics' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Dark Monochrome Aesthetic &amp; OLED Finishes
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Curated dark monochrome palettes with high optical density, obsidian textures, and silver rim lighting.
              </p>
            </div>

            {/* Finish Selection */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2">
                Surface Material
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'obsidian', label: 'Obsidian Deep', desc: 'Deep zinc-950 with 80% opacity' },
                  { id: 'matte-carbon', label: 'Matte Carbon', desc: 'Low-specular #111114 matte' },
                  { id: 'frosted-smoke', label: 'Frosted Smoke', desc: 'Translucent acrylic glass blur' },
                  { id: 'pure-black', label: 'Pure OLED Black', desc: 'Zero luminance #000000 true black' },
                  { id: 'titanium-dark', label: 'Dark Titanium', desc: 'Brushed metal metallic finish' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => update({ finish: f.id as NotchFinish })}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      config.finish === f.id
                        ? 'bg-zinc-800 border-zinc-400 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{f.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Edge Glow & Rim Lighting */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 block mb-2">
                Edge Highlight / Rim Lighting
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'silver', label: 'Silver Rim' },
                  { id: 'white-neon', label: 'White Neon' },
                  { id: 'subtle', label: 'Subtle' },
                  { id: 'none', label: 'Stealth' },
                ].map((eg) => (
                  <button
                    key={eg.id}
                    onClick={() => update({ edgeGlow: eg.id as 'subtle' | 'silver' | 'white-neon' | 'none' })}
                    className={`py-2 px-3 rounded-xl border text-center text-xs transition-colors ${
                      config.edgeGlow === eg.id
                        ? 'bg-zinc-800 border-zinc-400 text-white font-medium'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {eg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Reactive Underglow Toggle */}
            <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-zinc-300" />
                <div>
                  <div className="text-xs font-medium text-white">Reactive Ambient Underglow</div>
                  <div className="text-[11px] text-zinc-400">Emits a soft monochrome aura beneath active music and charging</div>
                </div>
              </div>
              <button
                onClick={() => update({ ambientGlow: !config.ambientGlow })}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                  config.ambientGlow ? 'bg-white' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-black transition-transform ${
                    config.ambientGlow ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Tactile Audio & Haptics Feedback */}
            <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {config.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-white" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-500" />
                )}
                <div>
                  <div className="text-xs font-medium text-white">Synthesized Tactile Audio &amp; Haptics</div>
                  <div className="text-[11px] text-zinc-400">Low-latency clicks, vibration pulses, and chimes</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => soundFx.playChime(true)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium"
                >
                  Test
                </button>
                <button
                  onClick={() => update({ soundEnabled: !config.soundEnabled, hapticsEnabled: !config.hapticsEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                    config.soundEnabled ? 'bg-white' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black transition-transform ${
                      config.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: SYSTEM & OVERLAY (DISPLAY OVER APPS, ROOT & NON-ROOT KEEP-ALIVE) */}
        {selectedTab === 'system-overlay' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Real Hardware Overlay Banner */}
            <div className="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl border border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Real Device Overlay Engine
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mt-1">
                  Run Live on Your Physical Phone Screen
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                  Anchor the dynamic island directly onto your actual smartphone camera cutout with immersive fullscreen and hardware wake-lock.
                </p>
              </div>

              <button
                onClick={() => onDisplayModeChange('real-overlay')}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shrink-0 flex items-center justify-center gap-2 shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Launch on My Phone</span>
              </button>
            </div>

            {/* Section 1: Display Over Other Apps & Orientation */}
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
                <span>Display Over Other Apps &amp; Screen Behavior</span>
                <span className="text-xs font-mono text-zinc-400">SYSTEM_ALERT_WINDOW</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Control how the floating island renders on top of the home launcher, third-party apps, games, and lock screen.
              </p>

              <div className="mt-4 space-y-3">
                {/* Display Over Apps Master */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-medium text-white">Display Over Other Apps</div>
                      <div className="text-[11px] text-zinc-400">Draws floating window over all apps and homescreen</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ displayOverApps: !config.systemOverlay.displayOverApps })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.displayOverApps ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.displayOverApps ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show in Fullscreen Games & Media */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Maximize2 className="w-4 h-4 text-zinc-300" />
                    <div>
                      <div className="text-xs font-medium text-white">Show in Fullscreen Games &amp; Media</div>
                      <div className="text-[11px] text-zinc-400">Stay visible when immersive mode is active</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ showInFullScreenGames: !config.systemOverlay.showInFullScreenGames })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.showInFullScreenGames ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.showInFullScreenGames ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Hide on Lock Screen */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-zinc-300" />
                    <div>
                      <div className="text-xs font-medium text-white">Hide on Lock Screen &amp; AOD</div>
                      <div className="text-[11px] text-zinc-400">Automatically collapse when phone is locked</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ hideOnLockScreen: !config.systemOverlay.hideOnLockScreen })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.hideOnLockScreen ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.hideOnLockScreen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Landscape Orientation Behavior */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                  <div className="text-xs font-medium text-white mb-1">Landscape Screen Behavior</div>
                  <div className="text-[11px] text-zinc-400 mb-2.5">
                    Choose how the island behaves when rotating device horizontally:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => updateSystemOverlay({ landscapeBehavior: 'stay-over-camera' })}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                        config.systemOverlay.landscapeBehavior === 'stay-over-camera'
                          ? 'bg-zinc-800 border-white text-white font-semibold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-medium text-white">Stay Over Camera</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Locks with physical camera sensor</div>
                    </button>

                    <button
                      onClick={() => updateSystemOverlay({ landscapeBehavior: 'rotate-to-top' })}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                        config.systemOverlay.landscapeBehavior === 'rotate-to-top'
                          ? 'bg-zinc-800 border-white text-white font-semibold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-medium text-white">Rotate to Top</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Moves to current top bezel</div>
                    </button>

                    <button
                      onClick={() => updateSystemOverlay({ landscapeBehavior: 'hide-in-landscape' })}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                        config.systemOverlay.landscapeBehavior === 'hide-in-landscape'
                          ? 'bg-zinc-800 border-white text-white font-semibold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="font-medium text-white">Hide in Landscape</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Auto-collapses for games &amp; video</div>
                    </button>
                  </div>
                </div>

                {/* Auto-Collapse Timeout */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white">Auto-Collapse / Idle Timer</span>
                    <span className="text-xs font-mono text-zinc-400">
                      {config.systemOverlay.autoHideSeconds === 0 ? 'Never (Persistent)' : `${config.systemOverlay.autoHideSeconds} seconds`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 3, 5, 8, 15].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => updateSystemOverlay({ autoHideSeconds: sec })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          config.systemOverlay.autoHideSeconds === sec
                            ? 'bg-white text-black font-semibold'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {sec === 0 ? 'Never' : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Keep-Alive Suite for Non-Root Users */}
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Non-Root Keep-Alive Suite</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Prevent Android OEM memory managers (Samsung OneUI, Xiaomi MIUI, ColorOS) from killing the overlay.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 rounded">
                  SAFE FOR ALL DEVICES
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {/* Ignore Battery Optimization */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Ignore Battery Optimization (Doze Whitelist)</div>
                    <div className="text-[11px] text-zinc-400">Exempts app from aggressive standby &amp; sleep throttling</div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ ignoreBatteryOptimization: !config.systemOverlay.ignoreBatteryOptimization })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.ignoreBatteryOptimization ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.ignoreBatteryOptimization ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Unrestricted Background Data */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Allow Unrestricted Background Data</div>
                    <div className="text-[11px] text-zinc-400">Permits album art &amp; real-time notifications when data saver is on</div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ unrestrictedData: !config.systemOverlay.unrestrictedData })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.unrestrictedData ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.unrestrictedData ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Foreground Sticky Notification Service */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Foreground Sticky Service</div>
                    <div className="text-[11px] text-zinc-400">Maintains foreground process priority in Android OS</div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ foregroundService: !config.systemOverlay.foregroundService })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.foregroundService ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.foregroundService ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Accessibility Service Protection */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <span>Accessibility Service Keep-Alive</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded">
                        oom_score_adj ≤ 0
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Binds to Android system event bus; OS will never kill this process</div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ accessibilityService: !config.systemOverlay.accessibilityService })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.accessibilityService ? 'bg-white' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.accessibilityService ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* ADB One-Click Copy Box for Non-Root */}
                <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-medium text-white">ADB Instant Permission Grant</span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `adb shell pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW\nadb shell dumpsys deviceidle whitelist +com.phantomisland.app\nadb shell cmd appops set com.phantomisland.app RUN_IN_BACKGROUND allow`,
                          'adb-commands'
                        )
                      }
                      className="text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                    >
                      {copiedKey === 'adb-commands' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-400" />
                          <span>Copy Commands</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Execute via USB debugging on any PC or wireless debugging via Shizuku / LADB:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-black text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed border border-zinc-900">
                    adb shell pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW{'\n'}
                    adb shell dumpsys deviceidle whitelist +com.phantomisland.app{'\n'}
                    adb shell cmd appops set com.phantomisland.app RUN_IN_BACKGROUND allow
                  </pre>
                </div>
              </div>
            </div>

            {/* Section 3: Root User Engine (Low-Level System Privileges) */}
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>Root User Engine &amp; System Priv-App</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    For Magisk, KernelSU, and APatch rooted Android smartphones.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-950/50 text-purple-300 border border-purple-800/60 rounded">
                  ROOT / MAGISK
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {/* Root Engine Master Toggle */}
                <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white">Enable Root Engine Privileges</div>
                    <div className="text-[11px] text-zinc-400">Allows direct /proc memory priority and init watchdog execution</div>
                  </div>
                  <button
                    onClick={() => updateSystemOverlay({ rootModeEnabled: !config.systemOverlay.rootModeEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                      config.systemOverlay.rootModeEnabled ? 'bg-purple-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        config.systemOverlay.rootModeEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {config.systemOverlay.rootModeEnabled && (
                  <>
                    {/* System Priv-App Toggle */}
                    <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-white">Run as /system/priv-app/PhantomIsland</div>
                        <div className="text-[11px] text-zinc-400">Grants privileged system-app tier; immune to OEM task kill</div>
                      </div>
                      <button
                        onClick={() => updateSystemOverlay({ systemPrivApp: !config.systemOverlay.systemPrivApp })}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                          config.systemOverlay.systemPrivApp ? 'bg-white' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-black transition-transform ${
                            config.systemOverlay.systemPrivApp ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Magisk Module Integration */}
                    <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-white">Magisk / KernelSU Systemless Module Mode</div>
                        <div className="text-[11px] text-zinc-400">Mounts overlay directly at boot without modifying /system partition</div>
                      </div>
                      <button
                        onClick={() => updateSystemOverlay({ magiskModuleSupport: !config.systemOverlay.magiskModuleSupport })}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                          config.systemOverlay.magiskModuleSupport ? 'bg-white' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-black transition-transform ${
                            config.systemOverlay.magiskModuleSupport ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Auto-Restart Watchdog Daemon */}
                    <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-white">Root Watchdog Auto-Restart Daemon</div>
                        <div className="text-[11px] text-zinc-400">Spawns init watchdog daemon that revives overlay in &lt;200ms if killed</div>
                      </div>
                      <button
                        onClick={() => updateSystemOverlay({ restartOnOOMKill: !config.systemOverlay.restartOnOOMKill })}
                        className={`w-11 h-6 rounded-full transition-colors p-0.5 relative ${
                          config.systemOverlay.restartOnOOMKill ? 'bg-white' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-black transition-transform ${
                            config.systemOverlay.restartOnOOMKill ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Root Shell One-Click Copy */}
                    <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs font-medium text-white">Root Shell Privilege Elevators</span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `su -c pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW\nsu -c echo -1000 > /proc/$(pidof com.phantomisland.app)/oom_score_adj`,
                              'root-commands'
                            )
                          }
                          className="text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
                        >
                          {copiedKey === 'root-commands' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Copy su Commands</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-black text-[11px] font-mono text-purple-300/90 overflow-x-auto leading-relaxed border border-zinc-900">
                        su -c pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW{'\n'}
                        su -c echo -1000 &gt; /proc/$(pidof com.phantomisland.app)/oom_score_adj
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Reset & Status */}
      <div className="pt-6 border-t border-zinc-800/80 mt-6 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="font-mono text-[11px] text-zinc-300">
            {config.isEnabled ? 'Engine v6.6 Active' : 'Engine Idle / Disabled'}
          </span>
        </div>
        <button
          onClick={() => {
            soundFx.playTap(config.soundEnabled);
            update({
              isEnabled: true,
              shape: 'pill',
              width: 124,
              height: 34,
              topMargin: 10,
              horizontalOffset: 0,
              cornerRadius: 20,
              cameraHoleSize: 12,
              cameraHoleOffsetX: 0,
              cameraHoleOffsetY: 0,
              showCameraCalibrationRing: false,
              showCrosshairs: false,
              batteryRing: {
                enabled: false,
                thickness: 2.5,
                ringGap: 2,
                startAngle: 0,
                clockwise: true,
                showPercentageText: false,
                chargingAnimation: 'radar-sweep',
                chargingSpeed: 1.4,
                colorMode: 'status-threshold',
                highColor: '#10b981',
                midColor: '#f59e0b',
                lowColor: '#ef4444',
                chargingColor: '#38bdf8',
                customColor: '#ffffff',
              },
              expansionStyle: 'stick-to-camera',
              slideDownDistance: 20,
              springStiffness: 440,
              springDamping: 34,
              expandedWidth: 372,
              expandedMinHeight: 176,
              autoExpandOnMusic: true,
              autoExpandOnNotification: true,
              autoExpandOnCharger: true,
              finish: 'pure-black',
              edgeGlow: 'none',
              blurStrength: 'none',
              ambientGlow: false,
              soundEnabled: true,
              hapticsEnabled: true,
              autoCollapseSeconds: 5,
              showMiniWaveform: false,
              showMiniTimer: false,
              showMiniBattery: false,
              edgeLighting: {
                enabled: false,
                pattern: 'orbit-chase',
                thickness: 3,
                inset: 0,
                cornerRadius: 42,
                speed: 2.4,
                glowBlur: 10,
                colors: ['#ffffff', '#a1a1aa', '#3f3f46', '#ffffff'],
                colorPreset: 'monochrome-silver',
                trigger: 'always',
              },
              islandBorder: {
                enabled: false,
                pattern: 'orbit-chase',
                thickness: 2,
                glowBlur: 8,
                speed: 2.0,
                colors: ['#ffffff', '#a1a1aa', '#52525b', '#ffffff'],
                colorPreset: 'monochrome-silver',
              },
              systemOverlay: {
                displayOverApps: true,
                showInFullScreenGames: true,
                hideOnLockScreen: false,
                landscapeBehavior: 'stay-over-camera',
                autoHideSeconds: 0,
                ignoreBatteryOptimization: true,
                unrestrictedData: true,
                foregroundService: true,
                accessibilityService: true,
                rootModeEnabled: false,
                systemPrivApp: false,
                magiskModuleSupport: false,
                restartOnOOMKill: true,
              },
            });
            onModuleChange('idle');
          }}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
