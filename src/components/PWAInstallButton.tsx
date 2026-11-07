import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onOpenAPKModal?: () => void;
  variant?: 'header' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  onOpenAPKModal,
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running as standalone, offer the APK / Package manager
  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <button
        onClick={onOpenAPKModal}
        className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>APK Center</span>
      </button>
    );
  }

  // Chromium / Android WebAPK direct prompt flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install APK / App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100">
              <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button in Safari's bottom toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. The Dynamic Notch app will install as a standalone mobile application.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-zinc-800 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback when browser hasn't fired beforeinstallprompt or desktop:
  // Opens the APK & WebAPK modal with full instructions
  return (
    <button
      onClick={onOpenAPKModal}
      className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
      title="Get APK / Install on Android"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Get APK</span>
    </button>
  );
};
