import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Terminal, 
  ExternalLink, 
  Check, 
  Copy, 
  X, 
  QrCode, 
  Share2, 
  Layers, 
  ShieldCheck,
  Package,
  FileCode,
  FolderArchive,
  ArrowRight,
  Home,
  Zap,
  Shield
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { generateAndroidStudioProjectZip } from '../utils/androidProjectExport';

interface APKExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKExportModal: React.FC<APKExportModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'launcher' | 'project' | 'webapk' | 'pwabuilder' | 'cli'>('launcher');
  const [isExportingZip, setIsExportingZip] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-qcagel6kuzh4ybrnn7kbka-512111811776.us-west2.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleDownloadProjectZip = async () => {
    try {
      setIsExportingZip(true);
      const zipBlob = await generateAndroidStudioProjectZip(appUrl);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DynamicNotch-v6.6-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Android project zip', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const bubblewrapCode = `# 1. Install Google's official Android TWA CLI
npm install -g @bubblewrap/cli

# 2. Initialize project from live manifest
bubblewrap init --manifest=${appUrl}/manifest.webmanifest

# 3. Build signed Android APK
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0c0c0e] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-zinc-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-white shadow-inner">
              <Package className="w-5 h-5 text-zinc-100" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Android APK &amp; Native Studio Exporter</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                  v6.6 Production
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Package PhantomIsland into an installable Android APK or open in Android Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 pt-4 pb-2 border-b border-zinc-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'launcher'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hardcoded Launcher Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('project')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'project'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Download Android Project (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('webapk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'webapk'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Direct WebAPK (Phone)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pwabuilder'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click PWABuilder .APK</span>
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cli'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>CLI (Bubblewrap)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4 overflow-y-auto space-y-4 flex-1 pr-1">
          {/* TAB: HARDCODED ANDROID LAUNCHER MODE */}
          {activeTab === 'launcher' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>Hardcoded Android Home Launcher Integration</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                        Persistent 24/7
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Third-party overlay apps (like Ring Launcher, Energy Ring, dynamicSpot) get killed constantly by Android aggressive battery managers (MIUI, OneUI, ColorOS). By compiling as a <strong>Native Android Home Launcher</strong>, your phone keeps PhantomIsland &amp; the Camera Battery Ring alive 24/7 with zero battery throttling!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">OS Level Priority</div>
                    <div className="text-xs font-semibold text-white">Never Killed by Android</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Default Home Launchers are immune to background memory killers.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Autostart On Boot</div>
                    <div className="text-xs font-semibold text-white">Instant Boot Launch</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Automatically launches the island and battery ring when phone powers on.</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1">Display Cutout</div>
                    <div className="text-xs font-semibold text-white">Pixel-Perfect Cutout</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Hardcoded to wrap your camera punch hole with sub-pixel precision.</div>
                  </div>
                </div>

                {/* How to activate as Home App in Android */}
                <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>How to Set as Default Android Launcher:</span>
                  </div>
                  <ol className="text-xs text-zinc-300 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Download and install the APK on your Android device.</li>
                    <li>Open phone <strong>Settings &gt; Apps &gt; Default Apps &gt; Home app</strong>.</li>
                    <li>Select <strong>PhantomIsland</strong> as your default Home Launcher.</li>
                    <li>Your camera punch hole battery ring and morphing island will now stay permanently active!</li>
                  </ol>
                </div>

                {/* Download Project Zip Button */}
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDownloadProjectZip}
                    disabled={isExportingZip}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{isExportingZip ? 'Packaging Android Studio Project...' : 'Download Android Launcher Project (.zip)'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pwabuilder')}
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Or Build Direct .APK</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Download Complete Android Project (.zip) */}
          {activeTab === 'project' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Complete Native Android Studio Project
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Generates a full ready-to-compile Android project configured with <strong>display cutout rendering</strong>, <strong>IslandOverlayService.kt</strong> (`SYSTEM_ALERT_WINDOW` floating overlay), <strong>IslandAccessibilityService.kt</strong> (zero-kill process immunity), <strong>BootReceiver.kt</strong> (autostart on reboot), and native Android edge-to-edge windowing.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs font-mono text-zinc-300 pt-1">
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] uppercase">Cutout Mode</span>
                    <span className="text-white font-medium">SHORT_EDGES</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] uppercase">Overlay Type</span>
                    <span className="text-white font-medium text-[11px]">APPLICATION_OVERLAY</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span className="text-zinc-400 block text-[10px] uppercase">Target SDK</span>
                    <span className="text-white font-medium">Android 14 (API 34)</span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadProjectZip}
                  disabled={isExportingZip}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExportingZip ? 'Generating Project Archive...' : 'Download Android Studio Project (.zip)'}
                  </span>
                </button>

                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                  <div className="font-semibold text-zinc-300">How to produce the final .apk file:</div>
                  <div>1. Unzip the downloaded file on your computer.</div>
                  <div>2. Run <code className="text-white font-mono bg-black px-1 py-0.5 rounded">./gradlew assembleDebug</code> in the unzipped folder (or open in Android Studio and hit "Build APK").</div>
                  <div>3. Your compiled <code className="text-white font-mono bg-black px-1 py-0.5 rounded">app-debug.apk</code> will be ready in <code className="text-zinc-300">app/build/outputs/apk/debug/</code> to install on any Android phone!</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Direct WebAPK */}
          {activeTab === 'webapk' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-semibold text-white">Direct Native WebAPK on Your Phone</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  On Android, modern browsers (Chrome, Edge, Samsung Internet) compile and sign a native <strong>WebAPK package</strong> directly on the device. It installs in your app drawer with system notification and notch access.
                </p>

                {isInstalled ? (
                  <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-center">
                    <span className="text-xs text-white font-medium flex items-center justify-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      App is currently running in Standalone Android mode!
                    </span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={install}
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install Native WebAPK on this Device</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-zinc-300">
                      Steps to install on your Android phone right now:
                    </div>
                    <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal pl-4">
                      <li>Open this URL in <strong>Chrome</strong> or <strong>Edge</strong> on your Android phone.</li>
                      <li>Tap the <strong>three dots menu (⋮)</strong> in the browser toolbar.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Android will automatically create and install the native WebAPK package.</li>
                    </ol>
                  </div>
                )}

                {/* Direct App Link */}
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                  <div className="truncate mr-3">
                    <div className="text-[10px] font-mono uppercase text-zinc-400">Live App URL</div>
                    <div className="text-xs text-zinc-200 font-mono truncate">{appUrl}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(appUrl, 'url')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {copiedStep === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1-Click PWABuilder */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <h3 className="text-sm font-semibold text-white">Generate Standalone .APK via PWABuilder</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  PWABuilder is Microsoft's free service that wraps the live PWA into an Android package, compiles signed <strong>.apk</strong> files for sideloading and <strong>.aab</strong> files for Google Play.
                </p>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                  <div className="font-semibold text-white">Instructions:</div>
                  <div>1. Click the button below to launch PWABuilder with your manifest loaded.</div>
                  <div>2. Select <strong>"Package for Stores"</strong> &rarr; <strong>"Android"</strong>.</div>
                  <div>3. Click <strong>"Download Package (.apk / .aab)"</strong> to get the APK file.</div>
                </div>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open 1-Click APK Generator on PWABuilder</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: CLI Bubblewrap */}
          {activeTab === 'cli' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Build .APK with Google Bubblewrap CLI</h3>
                  <button
                    onClick={() => copyToClipboard(bubblewrapCode, 'cli')}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    {copiedStep === 'cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStep === 'cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Google's official CLI packages progressive apps into native Android TWA APKs:
                </p>

                <pre className="p-3 rounded-xl bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre">
                  {bubblewrapCode}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-300" />
            <span>PWA &amp; Android Cutout Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
