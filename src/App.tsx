/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NotchConfig, ActiveModule, CustomNotification } from './types/notch';
import { AkitaBanner } from './components/AkitaBanner';
import { LiveIslandStage } from './components/LiveIslandStage';
import { ControlStudio } from './components/ControlStudio';
import { DynamicNotch } from './components/DynamicNotch';
import { EdgeLightingOverlay } from './components/EdgeLightingOverlay';
import { RealPhoneOverlayMode } from './components/RealPhoneOverlayMode';
import { APKExportModal } from './components/APKExportModal';
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
};

export default function App() {
  const [config, setConfig] = useState<NotchConfig>(() => {
    try {
      const saved = localStorage.getItem('phantomisland_saved_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });
  const [activeModule, setActiveModule] = useState<ActiveModule>('idle');
  const [customNotification, setCustomNotification] = useState<CustomNotification | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('calibration');
  const [displayMode, setDisplayMode] = useState<'phone' | 'dock' | 'real-overlay'>('phone');
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

  if (displayMode === 'real-overlay') {
    return (
      <>
        <RealPhoneOverlayMode
          config={config}
          onUpdateConfig={setConfig}
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          customNotification={customNotification}
          onClearNotification={handleClearNotification}
          onTriggerNotification={handleTriggerNotification}
          onExit={() => setDisplayMode('phone')}
          onOpenAPKModal={() => setIsAPKModalOpen(true)}
        />
        <APKExportModal
          isOpen={isAPKModalOpen}
          onClose={() => setIsAPKModalOpen(false)}
        />
      </>
    );
  }

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

      {/* REAL LIVE PHANTOMISLAND (Active whenever config.isEnabled is ON) */}
      {config.isEnabled && (
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
        </div>
      )}

      {/* MAIN STUDIO WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        
        {/* ANIMATED PHANTOM AKITA BANNER WITH DIRECT LAUNCH & GET APK BUTTONS */}
        <AkitaBanner 
          onLaunchRealOverlay={() => setDisplayMode('real-overlay')}
          onOpenAPKModal={() => setIsAPKModalOpen(true)}
        />

        {/* 2-COLUMN STUDIO LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: SLEEK LIVE ISLAND ONLY DISPLAY (5 cols) */}
          <div className="lg:col-span-5">
            <LiveIslandStage
              config={config}
              activeModule={activeModule}
              customNotification={customNotification}
              onModuleChange={setActiveModule}
              onClearNotification={handleClearNotification}
              onSelectTab={setSelectedTab}
              onTogglePower={() => setConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
              onLaunchRealOverlay={() => setDisplayMode('real-overlay')}
            />
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

      </main>

      {/* FOOTER CREDITS */}
      <footer className="py-6 border-t border-zinc-900 bg-[#070708] text-center text-xs text-zinc-500 font-mono">
        Calis Ideas, Argon's Code. ©️ 2026
      </footer>

      {/* ANDROID APK & STANDALONE INSTALLATION MODAL */}
      <APKExportModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
      />
    </div>
  );
}
