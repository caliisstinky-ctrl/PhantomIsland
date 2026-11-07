import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onSelectTab: (tab: string) => void;
  activeTab: string;
  displayMode: 'phone' | 'dock' | 'real-overlay';
  onToggleDisplayMode: () => void;
  onLaunchRealOverlay: () => void;
  onOpenAPKModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  activeTab,
  displayMode,
  onToggleDisplayMode,
  onLaunchRealOverlay,
  onOpenAPKModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4 border-b border-zinc-800 bg-[#09090b]">
      {/* Zone 1: Single text element wordmark in display face */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('calibration');
        }}
        className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-zinc-200 transition-colors"
      >
        Dynamic Notch Studio
      </a>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-zinc-400">
        <button
          onClick={() => onSelectTab('calibration')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'calibration' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Position &amp; Size
        </button>
        <button
          onClick={() => onSelectTab('expansion')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'expansion' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Expansion &amp; Motion
        </button>
        <button
          onClick={() => onSelectTab('battery-ring')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'battery-ring' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Battery Ring
        </button>
        <button
          onClick={() => onSelectTab('system-overlay')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'system-overlay' ? 'text-white underline underline-offset-4 font-semibold text-emerald-400' : ''
          }`}
        >
          System &amp; Overlay
        </button>
        <button
          onClick={() => onSelectTab('edge-lighting')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'edge-lighting' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Edge Light
        </button>
        <button
          onClick={() => onSelectTab('island-border')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'island-border' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Island Border
        </button>
        <button
          onClick={() => onSelectTab('triggers')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'triggers' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Trigger Lab
        </button>
        <button
          onClick={() => onSelectTab('aesthetics')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'aesthetics' ? 'text-white underline underline-offset-4' : ''
          }`}
        >
          Aesthetics
        </button>
      </nav>

      {/* Zone 3: Actions (Launch on Real Phone + Dock + APK) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onLaunchRealOverlay}
          className="px-3 py-1.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          title="Launch fullscreen dynamic island directly on this phone screen"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Launch on Real Phone</span>
        </button>

        <button
          onClick={onToggleDisplayMode}
          className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 hidden sm:flex"
        >
          {displayMode === 'dock' ? (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Studio View</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Dock to Top</span>
            </>
          )}
        </button>

        <PWAInstallButton onOpenAPKModal={onOpenAPKModal} variant="header" />
      </div>
    </header>
  );
};
