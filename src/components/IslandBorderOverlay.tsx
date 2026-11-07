import React from 'react';
import { IslandBorderConfig } from '../types/notch';

interface IslandBorderOverlayProps {
  config: IslandBorderConfig;
  borderRadius: string;
  isExpanded: boolean;
  audioEnergy?: number; // 0 to 1 for sound-reactive mode
}

export const IslandBorderOverlay: React.FC<IslandBorderOverlayProps> = ({
  config,
  borderRadius,
  isExpanded,
  audioEnergy = 0.5,
}) => {
  if (!config.enabled) return null;

  const { pattern, thickness, glowBlur, speed, colors } = config;
  const safeColors = colors.length >= 2 ? colors : ['#ffffff', '#71717a'];

  const getConicGradient = () => {
    if (pattern === 'laser-runner') {
      const primary = safeColors[0];
      const secondary = safeColors[1] || safeColors[0];
      return `conic-gradient(from 0deg, transparent 0%, transparent 75%, ${secondary} 90%, ${primary} 98%, transparent 100%)`;
    }
    const step = 360 / safeColors.length;
    const stops = safeColors.map((col, idx) => `${col} ${Math.round(idx * step)}deg`).join(', ');
    return `conic-gradient(from 0deg, ${stops}, ${safeColors[0]} 360deg)`;
  };

  const getLinearGradient = () => {
    return `linear-gradient(135deg, ${safeColors.join(', ')})`;
  };

  const isConic = pattern === 'orbit-chase' || pattern === 'laser-runner';
  const isLiquid = pattern === 'liquid-fade';
  const isBreathe = pattern === 'pulse-breathe';
  const isSound = pattern === 'sound-reactive';
  const isSolid = pattern === 'solid';

  // Sound reactive scale factor
  const soundMultiplier = isSound ? Math.max(0.3, Math.min(1.4, audioEnergy * 1.5)) : 1;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 transition-all duration-150 overflow-hidden"
      style={{
        borderRadius,
        padding: `${thickness}px`,
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
      }}
      aria-hidden="true"
    >
      {/* GLOW LAYER */}
      {glowBlur > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius,
            filter: `blur(${glowBlur}px)`,
            opacity: isSound ? soundMultiplier : 0.75,
            padding: `${thickness}px`,
          }}
        >
          {isConic ? (
            <div
              className="absolute -inset-[200%] animate-spin-conic"
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
          ) : isSound ? (
            <div
              className="absolute inset-0 transition-opacity duration-75"
              style={{
                background: getLinearGradient(),
                opacity: soundMultiplier,
              }}
            />
          ) : (
            <div
              className={`absolute inset-0 ${isBreathe ? 'animate-breathe' : ''}`}
              style={{
                background: isSolid ? safeColors[0] : getLinearGradient(),
                animationDuration: `${speed}s`,
              }}
            />
          )}
        </div>
      )}

      {/* CRISP STROKE LAYER */}
      {isConic ? (
        <div
          className="absolute -inset-[200%] animate-spin-conic"
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
      ) : isSound ? (
        <div
          className="absolute inset-0 transition-opacity duration-75"
          style={{
            background: getLinearGradient(),
            opacity: Math.max(0.4, soundMultiplier),
          }}
        />
      ) : (
        <div
          className={`absolute inset-0 ${isBreathe ? 'animate-breathe' : ''}`}
          style={{
            background: isSolid ? safeColors[0] : getLinearGradient(),
            animationDuration: `${speed}s`,
          }}
        />
      )}
    </div>
  );
};
