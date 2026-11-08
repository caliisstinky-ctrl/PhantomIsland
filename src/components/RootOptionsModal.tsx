import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Play, 
  Maximize2, 
  FileCode, 
  ExternalLink,
  Flame,
  Smartphone,
  FolderArchive,
  RefreshCw
} from 'lucide-react';
import { NotchConfig } from '../types/notch';
import { exportAndroidProjectZip } from '../utils/androidProjectExport';
import { triggerHaptic } from '../utils/system';
import { soundFx } from '../utils/audio';

interface RootOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotchConfig;
  onUpdateConfig: (newConfig: NotchConfig) => void;
  onLaunchRealOverlay?: () => void;
}

export const RootOptionsModal: React.FC<RootOptionsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onLaunchRealOverlay,
}) => {
  const [activeTab, setActiveTab] = useState<'root' | 'shizuku' | 'overlay' | 'stores'>('root');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [rootCheckResult, setRootCheckResult] = useState<'checking' | 'detected' | 'not-detected' | 'web-environment'>('checking');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Check if running inside real native Android container with root
    const win = window as any;
    if (win.Android && typeof win.Android.checkRoot === 'function') {
      try {
        const isRoot = win.Android.checkRoot();
        setRootCheckResult(isRoot ? 'detected' : 'not-detected');
      } catch {
        setRootCheckResult('not-detected');
      }
    } else {
      setRootCheckResult('web-environment');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
  };

  const handleDownloadProjectZip = async () => {
    setIsExportingZip(true);
    soundFx.playChime(config.soundEnabled);
    try {
      await exportAndroidProjectZip(config);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleExecuteRootCmd = (cmd: string) => {
    soundFx.playTap(config.soundEnabled);
    const win = window as any;
    if (win.Android && typeof win.Android.runRootCommand === 'function') {
      try {
        const res = win.Android.runRootCommand(cmd);
        setCommandOutput(`Root Execution Result: ${res}`);
      } catch (err: any) {
        setCommandOutput(`Error: ${err.message}`);
      }
    } else {
      setCommandOutput(`[Simulated Root Execution]: su -c ${cmd}\nCommand staged. On a rooted Android phone running the APK, this executes instantly with root privileges.`);
    }
  };

  const updateSystemOverlay = (partial: Partial<NotchConfig['systemOverlay']>) => {
    onUpdateConfig({
      ...config,
      systemOverlay: {
        ...config.systemOverlay,
        ...partial,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-3xl rounded-3xl bg-[#09090c] border border-purple-500/40 p-5 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.18)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-zinc-900 p-2 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Root User Options &amp; Privileged Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-700/80 text-purple-300 font-semibold">
                  MAGISK · KSU · APATCH
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Low-level system overlay permissions, kernel memory priority &amp; store packaging
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Root Detection Status Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${rootCheckResult === 'detected' ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}`} />
            <div>
              <span className="font-semibold text-white">Privileged Environment: </span>
              <span className="text-zinc-300">
                {rootCheckResult === 'detected' && 'Root (su) Shell Active & Granted'}
                {rootCheckResult === 'not-detected' && 'Native Android Container Active (SU not granted)'}
                {rootCheckResult === 'web-environment' && 'Ready for Root APK / Magisk Module / ADB Shell'}
                {rootCheckResult === 'checking' && 'Inspecting system privilege daemon...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-1 rounded-lg">
            <span>PKG:</span>
            <strong className="text-purple-300">com.phantomisland.app</strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 pt-4 pb-2 border-b border-zinc-800/80 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('root')}
            className={`px-3 py-1.5 font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'root'
                ? 'bg-purple-950/80 text-white border border-purple-600/80 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Root (su) &amp; Magisk</span>
          </button>

          <button
            onClick={() => setActiveTab('shizuku')}
            className={`px-3 py-1.5 font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shizuku'
                ? 'bg-purple-950/80 text-white border border-purple-600/80 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Shizuku &amp; Wireless ADB</span>
          </button>

          <button
            onClick={() => setActiveTab('overlay')}
            className={`px-3 py-1.5 font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overlay'
                ? 'bg-purple-950/80 text-white border border-purple-600/80 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Actual Overlay Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`px-3 py-1.5 font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'stores'
                ? 'bg-purple-950/80 text-white border border-purple-600/80 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>Play Store &amp; F-Droid</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
          
          {/* TAB 1: ROOT (SU), MAGISK, KERNELSU, SYSTEM PRIV-APP */}
          {activeTab === 'root' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      <span>Root System Engine Configuration</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Direct kernel access to bypass background memory kills, OEM throttling, and lockscreen limits.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {/* Option 1: Root Engine Enabled */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Root Mode Permissions</div>
                      <div className="text-[11px] text-zinc-400">Allows running su background helpers</div>
                    </div>
                    <button
                      onClick={() => updateSystemOverlay({ rootModeEnabled: !config.systemOverlay.rootModeEnabled })}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative ${
                        config.systemOverlay.rootModeEnabled ? 'bg-purple-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${config.systemOverlay.rootModeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Option 2: System Priv-App */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">/system/priv-app Status</div>
                      <div className="text-[11px] text-zinc-400">System tier; immune to memory cleanup</div>
                    </div>
                    <button
                      onClick={() => updateSystemOverlay({ systemPrivApp: !config.systemOverlay.systemPrivApp })}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative ${
                        config.systemOverlay.systemPrivApp ? 'bg-purple-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${config.systemOverlay.systemPrivApp ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Option 3: Magisk Module Mode */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Magisk / KernelSU Module</div>
                      <div className="text-[11px] text-zinc-400">Systemless overlay mount on boot</div>
                    </div>
                    <button
                      onClick={() => updateSystemOverlay({ magiskModuleSupport: !config.systemOverlay.magiskModuleSupport })}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative ${
                        config.systemOverlay.magiskModuleSupport ? 'bg-purple-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${config.systemOverlay.magiskModuleSupport ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Option 4: OOM Auto-Restart Daemon */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">OOM Watchdog Respawn</div>
                      <div className="text-[11px] text-zinc-400">Auto-revive overlay in &lt;100ms</div>
                    </div>
                    <button
                      onClick={() => updateSystemOverlay({ restartOnOOMKill: !config.systemOverlay.restartOnOOMKill })}
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 relative ${
                        config.systemOverlay.restartOnOOMKill ? 'bg-purple-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black transition-transform ${config.systemOverlay.restartOnOOMKill ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 1-Click Root Commands */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-white">Instant Root (su) Script Execution</span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `su -c "pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW && echo -1000 > /proc/$(pidof com.phantomisland.app)/oom_score_adj && cmd appops set com.phantomisland.app SYSTEM_ALERT_WINDOW allow"`,
                        'su-full'
                      )
                    }
                    className="text-[11px] font-medium text-zinc-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                  >
                    {copiedKey === 'su-full' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-black text-[11px] font-mono text-purple-300/95 overflow-x-auto border border-zinc-900 leading-relaxed">
                  # 1. Grant overlay permissions without user prompt{'\n'}
                  su -c pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW{'\n\n'}
                  # 2. Lock process memory priority to system level (never killed by Android OS){'\n'}
                  su -c "echo -1000 &gt; /proc/$(pidof com.phantomisland.app)/oom_score_adj"{'\n\n'}
                  # 3. Whitelist in power and doze engine{'\n'}
                  su -c dumpsys deviceidle whitelist +com.phantomisland.app
                </pre>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExecuteRootCmd('pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW && echo -1000 > /proc/$(pidof com.phantomisland.app)/oom_score_adj')}
                    className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Execute on Device (su)</span>
                  </button>
                </div>

                {commandOutput && (
                  <div className="p-3 rounded-xl bg-zinc-900/90 border border-purple-500/30 text-[11px] font-mono text-zinc-200 whitespace-pre-wrap">
                    {commandOutput}
                  </div>
                )}
              </div>

              {/* Magisk Module Installation Guide */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span>How to Install as Magisk / KernelSU Systemless Module:</span>
                </span>
                <ol className="text-zinc-300 space-y-1.5 list-decimal list-inside leading-relaxed text-xs">
                  <li>Download the native Android project archive using the button below.</li>
                  <li>Build or extract the APK file (`app-debug.apk`).</li>
                  <li>Move the APK to `/system/priv-app/PhantomIsland/PhantomIsland.apk` using Magisk App or MT Manager.</li>
                  <li>Set file permissions to <code className="bg-zinc-900 px-1 py-0.5 rounded text-purple-300">0644 (rw-r--r--)</code>.</li>
                  <li>Reboot phone. PhantomIsland will start automatically as an untouchable system-tier service!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: SHIZUKU & WIRELESS ADB */}
          {activeTab === 'shizuku' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Non-Root ADB &amp; Shizuku Wireless Permissions</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    For users without root who want seamless background immunity and overlay permissions via Shizuku or PC.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">ADB Commands for USB / Wireless Debugging:</span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `adb shell pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW\nadb shell dumpsys deviceidle whitelist +com.phantomisland.app\nadb shell cmd appops set com.phantomisland.app RUN_IN_BACKGROUND allow\nadb shell cmd appops set com.phantomisland.app SYSTEM_ALERT_WINDOW allow`,
                          'adb-all'
                        )
                      }
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      {copiedKey === 'adb-all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'adb-all' ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-black text-[11px] font-mono text-cyan-300/90 overflow-x-auto border border-zinc-900 leading-relaxed">
                    adb shell pm grant com.phantomisland.app android.permission.SYSTEM_ALERT_WINDOW{'\n'}
                    adb shell dumpsys deviceidle whitelist +com.phantomisland.app{'\n'}
                    adb shell cmd appops set com.phantomisland.app RUN_IN_BACKGROUND allow{'\n'}
                    adb shell cmd appops set com.phantomisland.app SYSTEM_ALERT_WINDOW allow
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="font-medium text-white">Shizuku 1-Click Instructions:</span>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    1. Open Shizuku on your Android phone and start the wireless service.<br />
                    2. Install LADB or a Shizuku terminal on your device.<br />
                    3. Paste the commands above to unlock persistent overlay status without a PC.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTUAL OVERLAY ENGINE */}
          {activeTab === 'overlay' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Real Phone Floating Window &amp; Cutout Overlay</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    How PhantomIsland renders directly over all running applications on Android.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Window Manager</div>
                    <div className="text-xs font-semibold text-white">TYPE_APPLICATION_OVERLAY</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Direct OS surface floating on top of all activities.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Display Cutout</div>
                    <div className="text-xs font-semibold text-white">LAYOUT_IN_DISPLAY_CUTOUT</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Wraps physical camera notch with sub-pixel zero collision.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Touch Passthrough</div>
                    <div className="text-xs font-semibold text-white">FLAG_NOT_FOCUSABLE</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Allows touching apps beneath while tapping the island pill.</div>
                  </div>
                </div>

                {/* Direct Test Floating Overlay Button */}
                {onLaunchRealOverlay && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onLaunchRealOverlay();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Test Real Fullscreen Overlay on This Device Screen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PLAY STORE, F-DROID & GITHUB ACTIONS APK */}
          {activeTab === 'stores' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Google Play Store &amp; F-Droid Readiness</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configured with 100% compliant manifests, accessibility disclosures, and reproducible build workflows.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {/* F-Droid Status */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>F-Droid Compliant Architecture</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Zero proprietary telemetry, 100% open-source Apache 2.0 license, reproducible gradle recipe in <code className="text-amber-300">metadata/com.phantomisland.app.yml</code>.
                      </div>
                    </div>
                  </div>

                  {/* Play Store Status */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Google Play Android 14 (API 34) Ready</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Includes declared <code className="text-amber-300">foregroundServiceType="specialUse"</code> and required Accessibility in-app privacy disclosures.
                      </div>
                    </div>
                  </div>

                  {/* GitHub Actions Automated Build */}
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GitHub Actions Automated APK CI/CD</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Workflow located at <code className="text-amber-300">.github/workflows/build-apk.yml</code>. Compiles <code className="text-amber-300">app-debug.apk</code> automatically on git push!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Project Zip Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDownloadProjectZip}
                    disabled={isExportingZip}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <FolderArchive className="w-4 h-4 text-purple-400" />
                    <span>{isExportingZip ? 'Packaging Android Studio Project...' : 'Download Complete Native Android Project (.zip)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-300">PhantomIsland Engine v6.6</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
