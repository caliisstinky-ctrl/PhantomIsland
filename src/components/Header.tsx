import React from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onSelectTab: (tab: string) => void;
  activeTab: string;
  displayMode: 'phone' | 'dock' | 'laptop';
  onToggleDisplayMode: () => void;
  onOpenAPKModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  activeTab,
  displayMode,
  onToggleDisplayMode,
  onOpenAPKModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-zinc-800 bg-[#09090b]">
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

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-400">
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

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <PWAInstallButton onOpenAPKModal={onOpenAPKModal} variant="header" />
        <button
          onClick={onToggleDisplayMode}
          className="px-3.5 py-1.5 text-xs font-semibold text-black bg-white rounded-lg hover:bg-zinc-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          {displayMode === 'dock' ? (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone View</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Dock to Top</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
