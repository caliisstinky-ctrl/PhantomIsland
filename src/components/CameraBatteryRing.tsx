import React from 'react';
import { CameraBatteryRingConfig } from '../types/notch';
import { RealBatteryState } from '../utils/system';

interface CameraBatteryRingProps {
  config: CameraBatteryRingConfig;
  cameraDiameter: number;
  batteryState: RealBatteryState;
  showCalibrationCircle: boolean;
  className?: string;
}

export const CameraBatteryRing: React.FC<CameraBatteryRingProps> = ({
  config,
  cameraDiameter,
  batteryState,
  showCalibrationCircle,
  className = '',
}) => {
  const {
    enabled,
    thickness,
    ringGap,
    startAngle,
    clockwise,
    showPercentageText,
    chargingAnimation,
    chargingSpeed,
    colorMode,
    highColor,
    midColor,
    lowColor,
    chargingColor,
    customColor,
  } = config;

  const isCharging = batteryState.charging;
  const batteryLevel = Math.max(1, Math.min(100, batteryState.level));

  // Geometry calculations
  const radius = cameraDiameter / 2 + ringGap + thickness / 2;
  const circumference = 2 * Math.PI * radius;
  const size = Math.ceil((radius + thickness + 4) * 2);
  const center = size / 2;

  // Arc length
  const progressDash = (batteryLevel / 100) * circumference;
  const dashOffset = clockwise ? circumference - progressDash : -(circumference - progressDash);

  // Active color based on state
  const getRingColor = () => {
    if (isCharging) {
      return chargingColor || '#38bdf8';
    }
    switch (colorMode) {
      case 'monochrome':
        return '#ffffff';
      case 'custom':
        return customColor || '#ffffff';
      case 'status-threshold':
      default:
        if (batteryLevel > 50) return highColor || '#10b981';
        if (batteryLevel > 20) return midColor || '#f59e0b';
        return lowColor || '#ef4444';
    }
  };

  const activeColor = getRingColor();

  // Rotation offset: SVG 0 is 3 o'clock (90deg offset for 12 o'clock top)
  const rotationDegrees = startAngle - 90;

  return (
    <div
      className={`relative pointer-events-none select-none flex items-center justify-center ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* 1. RED CALIBRATION CIRCLE (To align perfectly over your real phone camera punch hole) */}
      {showCalibrationCircle && (
        <div
          className="absolute z-30 rounded-full border-2 border-red-500 bg-red-500/15 flex items-center justify-center pointer-events-none animate-pulse"
          style={{
            width: `${cameraDiameter}px`,
            height: `${cameraDiameter}px`,
          }}
        >
          {/* Subtle crosshair lines within the red calibration circle */}
          <div className="w-[1px] h-full bg-red-400/80 absolute" />
          <div className="h-[1px] w-full bg-red-400/80 absolute" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute" />
          
          {/* Real-time size badge */}
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-red-400 bg-black/95 px-1 py-0.2 rounded border border-red-500/40 whitespace-nowrap shadow-lg">
            Ø {cameraDiameter}px
          </span>
        </div>
      )}

      {/* 2. CUSTOMIZABLE CAMERA BATTERY RING */}
      {enabled && (
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            {/* Glow bloom filter */}
            <filter id="battery-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={isCharging ? 3 : 1.5} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sweep gradient for radar tracer animation */}
            <linearGradient id="tracer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={chargingColor || '#38bdf8'} stopOpacity="0" />
              <stop offset="70%" stopColor={chargingColor || '#38bdf8'} stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Background Ring Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={Math.max(1, thickness - 0.5)}
          />

          {/* Glow Halo Layer for Charging or High-Alert */}
          {(isCharging || batteryLevel < 20) && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={thickness + 2}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={0.45}
              filter="url(#battery-glow)"
              style={{
                transformOrigin: `${center}px ${center}px`,
                transform: `rotate(${rotationDegrees}deg) ${clockwise ? '' : 'scaleX(-1)'}`,
              }}
            />
          )}

          {/* Main Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            filter="url(#battery-glow)"
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `rotate(${rotationDegrees}deg) ${clockwise ? '' : 'scaleX(-1)'}`,
              transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease',
            }}
          />

          {/* CHARGING ANIMATIONS */}
          {isCharging && chargingAnimation === 'radar-sweep' && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="url(#tracer-gradient)"
              strokeWidth={thickness + 1}
              strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
              strokeLinecap="round"
              className="animate-spin-conic"
              style={{
                transformOrigin: `${center}px ${center}px`,
                animationDuration: `${chargingSpeed}s`,
              }}
            />
          )}

          {isCharging && chargingAnimation === 'neon-comet' && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#ffffff"
              strokeWidth={thickness + 1.5}
              strokeDasharray={`${circumference * 0.15} ${circumference * 0.35}`}
              strokeLinecap="round"
              className="animate-spin-conic"
              style={{
                transformOrigin: `${center}px ${center}px`,
                animationDuration: `${chargingSpeed * 0.8}s`,
              }}
            />
          )}

          {isCharging && chargingAnimation === 'pulse-glow' && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={chargingColor || '#38bdf8'}
              strokeWidth={thickness + 2}
              className="animate-breathe"
              style={{
                animationDuration: `${chargingSpeed}s`,
              }}
            />
          )}

          {isCharging && chargingAnimation === 'dash-flash' && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#ffffff"
              strokeWidth={thickness + 2.5}
              strokeDasharray={`${circumference * 0.25} ${circumference * 0.25}`}
              className="animate-spin-conic"
              style={{
                transformOrigin: `${center}px ${center}px`,
                animationDuration: `${chargingSpeed * 0.5}s`,
              }}
            />
          )}

          {isCharging && chargingAnimation === 'breathe' && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={thickness + 1}
              className="animate-breathe"
              style={{
                animationDuration: `${chargingSpeed * 1.5}s`,
              }}
            />
          )}
        </svg>
      )}

      {/* Optional Tiny Battery % Badge */}
      {enabled && showPercentageText && (
        <div
          className="absolute font-mono-numbers text-[8px] font-bold text-white bg-black/85 px-1 py-0.2 rounded-full border border-zinc-700 pointer-events-none shadow"
          style={{
            top: `${size + 1}px`,
          }}
        >
          {batteryLevel}%
        </div>
      )}
    </div>
  );
};
