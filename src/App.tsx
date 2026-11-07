/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NotchConfig, ActiveModule, CustomNotification } from './types/notch';
import { Header } from './components/Header';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ControlStudio } from './components/ControlStudio';
import { DynamicNotch } from './components/DynamicNotch';
import { EdgeLightingOverlay } from './components/EdgeLightingOverlay';
import { APKExportModal } from './components/APKExportModal';
import { 
  Sliders, 
  Zap, 
  Palette, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Volume2, 
  X,
  Package,
  Download
} from 'lucide-react';
import { soundFx } from './utils/audio';

const DEFAULT_CONFIG: NotchConfig = {
  isEnabled: true,
  shape: 'pill',
  width: 124,
  height: 34,
  topMargin: 10,
  horizontalOffset: 0,
  cornerRadius: 20,
  expandedWidth: 372,
  expandedMinHeight: 176,
  cameraHoleSize: 12,
  cameraHoleOffsetX: 0,
  cameraHoleOffsetY: 0,
  showCameraCalibrationRing: false,
  showCrosshairs: false,
  batteryRing: {
    enabled: true,
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
  autoExpandOnMusic: true,
  autoExpandOnNotification: true,
  autoExpandOnCharger: true,
  finish: 'obsidian',
  edgeGlow: 'silver',
  blurStrength: 'subtle',
  ambientGlow: true,
  soundEnabled: true,
  hapticsEnabled: true,
  autoCollapseSeconds: 5,
  showMiniWaveform: true,
  showMiniTimer: true,
  showMiniBattery: true,
  edgeLighting: {
    enabled: true,
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
    enabled: true,
    pattern: 'orbit-chase',
    thickness: 2,
    glowBlur: 8,
    speed: 2.0,
    colors: ['#ffffff', '#a1a1aa', '#52525b', '#ffffff'],
    colorPreset: 'monochrome-silver',
  },
};

export default function App() {
  const [config, setConfig] = useState<NotchConfig>(DEFAULT_CONFIG);
  const [activeModule, setActiveModule] = useState<ActiveModule>('music');
  const [customNotification, setCustomNotification] = useState<CustomNotification | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('calibration');
  const [displayMode, setDisplayMode] = useState<'phone' | 'dock' | 'laptop'>('phone');
  const [isAPKModalOpen, setIsAPKModalOpen] = useState<boolean>(false);

  const handleTriggerNotification = (notif: CustomNotification) => {
    setCustomNotification(notif);
    soundFx.playChime(config.soundEnabled);
  };

  const handleClearNotification = () => {
    setCustomNotification(null);
  };

  const toggleDisplayMode = () => {
    soundFx.playTap(config.soundEnabled);
    setDisplayMode(prev => (prev === 'dock' ? 'phone' : 'dock'));
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

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col font-sans selection:bg-zinc-700 selection:text-white">
      {/* FULL VIEWPORT EDGE LIGHTING WHEN IN DOCKED DESKTOP MODE */}
      {displayMode === 'dock' && config.edgeLighting?.enabled && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <EdgeLightingOverlay
            config={config.edgeLighting}
            isActive={isEdgeLightingActive}
            isDockMode={true}
          />
        </div>
      )}

      {/* PERSISTENT TOP DOCKED NOTCH (when displayMode === 'dock') */}
      {displayMode === 'dock' && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center">
          <div className="pointer-events-auto">
            <DynamicNotch
              config={config}
              activeModule={activeModule}
              customNotification={customNotification}
              onModuleChange={setActiveModule}
              onClearNotification={handleClearNotification}
              isDockedMode={true}
            />
          </div>
          {/* Subtle dock indicator banner */}
          <div className="mt-14 pointer-events-auto bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono text-zinc-400 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md">
            <span>Docked to top browser edge</span>
            <button
              onClick={() => setDisplayMode('phone')}
              className="text-white hover:underline flex items-center gap-1 font-sans text-xs ml-1"
            >
              Return to Phone Simulator
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR CONTRACT COMPONENT */}
      <Header
        activeTab={selectedTab}
        onSelectTab={setSelectedTab}
        displayMode={displayMode}
        onToggleDisplayMode={toggleDisplayMode}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
      />

      {/* MAIN STUDIO WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Editorial Sub-kicker & Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
              <span>Dynamic Island Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Release v6.6 Core</span>
              <span aria-hidden="true">·</span>
              <span>Monochrome Obsidian Edition</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              Interactive Dynamic Notch & Camera Cutout Studio
            </h1>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Morphs around physical camera punch holes and notches into a live multitasking center. Test music playback, VoIP calls, dash charging, countdowns, and real-time activities.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setIsAPKModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white text-xs font-semibold flex items-center gap-2 transition-all hover:bg-zinc-800 shadow-lg"
            >
              <Package className="w-4 h-4 text-zinc-200" />
              <span>Android APK &amp; WebAPK</span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN STUDIO LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SIMULATOR VIEW (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 mb-2 px-1 border-b border-zinc-800/80">
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Live Simulator Device
              </span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>OLED 120Hz Preview</span>
              </div>
            </div>

            <PhoneSimulator
              config={config}
              activeModule={activeModule}
              customNotification={customNotification}
              onModuleChange={setActiveModule}
              onClearNotification={handleClearNotification}
              onSelectTab={setSelectedTab}
              onTogglePower={() => setConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
            />

            <p className="text-[11px] text-zinc-400 text-center mt-3 max-w-xs">
              Click or tap the notch to expand into interactive controls. Swipe or click close to collapse.
            </p>
          </div>

          {/* RIGHT COLUMN: CONTROL & CALIBRATION STUDIO (7 cols) */}
          <div className="lg:col-span-7">
            <div className="w-full flex items-center justify-between pb-3 mb-2 px-1 border-b border-zinc-800/80">
              <span className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                Configuration & Modules
              </span>
              <span className="text-xs text-zinc-400">
                Active Module: <strong className="text-white capitalize">{activeModule}</strong>
              </span>
            </div>

            <ControlStudio
              config={config}
              onUpdateConfig={setConfig}
              activeModule={activeModule}
              onModuleChange={setActiveModule}
              onTriggerNotification={handleTriggerNotification}
              selectedTab={selectedTab}
              onSelectTab={setSelectedTab}
              displayMode={displayMode}
              onDisplayModeChange={setDisplayMode}
            />
          </div>
        </div>

        {/* FEATURE CAPABILITY GRID (Editorial Proof & Architecture) */}
        <section className="mt-16 pt-12 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2">
            <span>Hardware & Interaction Engine</span>
            <span aria-hidden="true">·</span>
            <span>Specification v6.6</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-6">
            Engineered for Pixel-Perfect Cutout Integration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-3">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Dynamic Cutout Morphing</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Seamlessly adapts to center pills, teardrop notches, side punch holes, or top bezel cutouts with sub-pixel alignment and customizable corner radii.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Live Activities & Telemetry</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Displays live background tasks including media audio visualizers, call timers, Dash/SuperVOOC battery charging percentages, and delivery milestones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white mb-3">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Sleek Obsidian Monochrome</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Zero glare, true deep black and obsidian surfaces with subtle hairline titanium borders, designed specifically for dark mode and OLED screens.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-zinc-800 bg-[#070708] py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Dynamic Notch Studio</span>
            <span aria-hidden="true">·</span>
            <span>v6.6 Architecture</span>
          </div>
          <div className="text-zinc-400">
            Engineered with Motion Spring Physics &amp; Sleek Monochrome Aesthetics
          </div>
        </div>
      </footer>

      {/* ANDROID APK & STANDALONE INSTALLATION MODAL */}
      <APKExportModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />
    </div>
  );
}
