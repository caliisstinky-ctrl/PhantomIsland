import React from 'react';
import { EdgeLightingConfig } from '../types/notch';

interface EdgeLightingOverlayProps {
  config: EdgeLightingConfig;
  isActive: boolean;
  isDockMode?: boolean;
}

export const EdgeLightingOverlay: React.FC<EdgeLightingOverlayProps> = ({
  config,
  isActive,
  isDockMode = false,
}) => {
  if (!config.enabled || !isActive) {
    return null;
  }

  const {
    pattern,
    thickness,
    inset,
    cornerRadius,
    speed,
    glowBlur,
    colors,
  } = config;

  // Ensure at least 2 colors exist
  const safeColors = colors.length >= 2 ? colors : ['#ffffff', '#71717a'];

  // Helper to construct conic gradient stops
  const getConicGradient = () => {
    if (pattern === 'sweep-comet') {
      const primary = safeColors[0];
      const secondary = safeColors[1] || safeColors[0];
      return `conic-gradient(from 0deg, transparent 0%, transparent 65%, ${secondary} 82%, ${primary} 98%, transparent 100%)`;
    }
    if (pattern === 'snake-runner') {
      const c1 = safeColors[0];
      const c2 = safeColors[1] || safeColors[0];
      return `conic-gradient(from 0deg, ${c1} 0deg 30deg, transparent 30deg 180deg, ${c2} 180deg 210deg, transparent 210deg 360deg)`;
    }
    // orbit-chase or default multi-color
    const step = 360 / safeColors.length;
    const stops = safeColors.map((col, idx) => `${col} ${Math.round(idx * step)}deg`).join(', ');
    return `conic-gradient(from 0deg, ${stops}, ${safeColors[0]} 360deg)`;
  };

  const getLinearGradient = () => {
    return `linear-gradient(135deg, ${safeColors.join(', ')})`;
  };

  const isConic = pattern === 'orbit-chase' || pattern === 'sweep-comet' || pattern === 'snake-runner';
  const isLiquid = pattern === 'liquid-fade';
  const isBreathe = pattern === 'pulse-breathe';

  return (
    <div
      className="absolute pointer-events-none z-30 transition-opacity duration-300 overflow-hidden"
      style={{
        top: `${inset}px`,
        bottom: `${inset}px`,
        left: `${inset}px`,
        right: `${inset}px`,
        borderRadius: `${isDockMode ? 0 : cornerRadius}px`,
      }}
      aria-hidden="true"
    >
      {/* 1. AMBIENT GLOW BACK-LAYER (for luminous bloom effect) */}
      {glowBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: `${isDockMode ? 0 : cornerRadius}px`,
            filter: `blur(${glowBlur}px)`,
            opacity: 0.65,
            padding: `${thickness}px`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }}
        >
          {isConic ? (
            <div
              className="absolute -inset-[150%] animate-spin-conic"
              style={{
                background: getConicGradient(),
                animationDuration: `${speed}s`,
              }}
            />
          ) : isLiquid ? (
            <div
              className="absolute inset-0 animate-liquid"
              style={{
                backgroundImage: getLinearGradient(),
                animationDuration: `${speed * 2}s`,
              }}
            />
          ) : (
            <div
              className={`absolute inset-0 ${isBreathe ? 'animate-breathe' : ''}`}
              style={{
                background: getLinearGradient(),
                animationDuration: `${speed}s`,
              }}
            />
          )}
        </div>
      )}

      {/* 2. CRISP SHARP PERIMETER BORDER */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: `${isDockMode ? 0 : cornerRadius}px`,
          padding: `${thickness}px`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      >
        {isConic ? (
          <div
            className="absolute -inset-[150%] animate-spin-conic"
            style={{
              background: getConicGradient(),
              animationDuration: `${speed}s`,
            }}
          />
        ) : isLiquid ? (
          <div
            className="absolute inset-0 animate-liquid"
            style={{
              backgroundImage: getLinearGradient(),
              animationDuration: `${speed * 2}s`,
            }}
          />
        ) : (
          <div
            className={`absolute inset-0 ${isBreathe ? 'animate-breathe' : ''}`}
            style={{
              background: getLinearGradient(),
              animationDuration: `${speed}s`,
            }}
          />
        )}
      </div>
    </div>
  );
};
