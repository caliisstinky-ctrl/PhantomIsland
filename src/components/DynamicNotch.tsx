import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  BatteryCharging, 
  Clock, 
  RotateCcw, 
  Plus, 
  Navigation, 
  Check, 
  X, 
  Radio, 
  Headphones, 
  Footprints, 
  Trophy,
  ChevronUp,
  Clipboard,
  Zap,
  Sparkles,
  ExternalLink,
  Power
} from 'lucide-react';
import { NotchConfig, ActiveModule, CustomNotification } from '../types/notch';
import { IslandBorderOverlay } from './IslandBorderOverlay';
import { CameraBatteryRing } from './CameraBatteryRing';
import { soundFx } from '../utils/audio';
import { getRealDeviceBattery, subscribeToBattery, triggerHaptic, readRealClipboard, RealBatteryState } from '../utils/system';

interface DynamicNotchProps {
  config: NotchConfig;
  activeModule: ActiveModule;
  customNotification?: CustomNotification | null;
  onModuleChange: (mod: ActiveModule) => void;
  onClearNotification?: () => void;
  isDockedMode?: boolean;
}

interface Track {
  title: string;
  artist: string;
  duration: number;
}

const PLAYLIST: Track[] = [
  { title: 'Resonance in Minor', artist: 'Spektrum // Nocturnal', duration: 225 },
  { title: 'Monochrome Horizon', artist: 'Kaelen Ambient', duration: 184 },
  { title: 'Obsidian Pulse', artist: 'Aethel Neo-Noir', duration: 242 },
];

export const DynamicNotch: React.FC<DynamicNotchProps> = ({
  config,
  activeModule,
  customNotification,
  onModuleChange,
  onClearNotification,
  isDockedMode = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [trackProgress, setTrackProgress] = useState<number>(42);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [callSeconds, setCallSeconds] = useState<number>(142);
  const [callActive, setCallActive] = useState<boolean>(true);
  const [timerSeconds, setTimerSeconds] = useState<number>(1480);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [audioRoute, setAudioRoute] = useState<'studio-buds' | 'internal' | 'dac'>('studio-buds');
  const [clipboardText, setClipboardText] = useState<string | null>(null);

  // Real Hardware Battery state
  const [batteryState, setBatteryState] = useState<RealBatteryState>({
    level: 84,
    charging: true,
    chargingTime: 18,
    isSupported: false,
  });

  // Real-time audio frequency bars from Web Audio AnalyserNode
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>([12, 18, 24, 16, 20]);
  const animationFrameRef = useRef<number | null>(null);

  const autoCollapseRef = useRef<NodeJS.Timeout | null>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  // Subscribe to real battery status
  useEffect(() => {
    getRealDeviceBattery().then(setBatteryState);
    const unsubscribe = subscribeToBattery(setBatteryState);
    return () => unsubscribe();
  }, []);

  // Real Web Audio frequency spectrum loop
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerHeights([4, 6, 8, 5, 7]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateBars = () => {
      const data = soundFx.getFrequencyData();
      if (data && data.length >= 5) {
        const b1 = Math.max(4, Math.round((data[1] / 255) * 24));
        const b2 = Math.max(5, Math.round((data[3] / 255) * 26));
        const b3 = Math.max(6, Math.round((data[6] / 255) * 28));
        const b4 = Math.max(4, Math.round((data[9] / 255) * 22));
        const b5 = Math.max(5, Math.round((data[12] / 255) * 24));
        setVisualizerHeights([b1, b2, b3, b4, b5]);
      }
      animationFrameRef.current = requestAnimationFrame(updateBars);
    };

    animationFrameRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Track timer increment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTrackProgress(prev => (prev >= currentTrack.duration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callActive && (activeModule === 'call' || isExpanded)) {
      interval = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callActive, activeModule, isExpanded]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            soundFx.playChime(config.soundEnabled);
            if (config.hapticsEnabled) triggerHaptic([50, 100, 50, 100]);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, config.soundEnabled, config.hapticsEnabled]);

  // Auto-collapse handler
  useEffect(() => {
    if (isExpanded && config.autoCollapseSeconds > 0 && activeModule === 'idle') {
      if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
      autoCollapseRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, config.autoCollapseSeconds * 1000);
    }
    return () => {
      if (autoCollapseRef.current) clearTimeout(autoCollapseRef.current);
    };
  }, [isExpanded, config.autoCollapseSeconds, activeModule]);

  // Expand when notification arrives (if enabled)
  useEffect(() => {
    if (customNotification) {
      soundFx.playChime(config.soundEnabled);
      if (config.hapticsEnabled) triggerHaptic(40);
      if (config.autoExpandOnNotification) {
        setIsExpanded(true);
      }
    }
  }, [customNotification, config.soundEnabled, config.hapticsEnabled, config.autoExpandOnNotification]);

  // Master Island Disabled check
  if (!config.isEnabled) {
    return (
      <div 
        className={`relative z-50 flex flex-col items-center pointer-events-auto select-none ${
          isDockedMode ? 'fixed top-2 left-0 right-0' : ''
        }`}
        style={{
          transform: `translateX(${config.horizontalOffset}px)`,
          top: isDockedMode ? '8px' : `${config.topMargin}px`,
        }}
      >
        {/* Render Battery Ring or Red Calibration Circle around camera cutout even if Island is Off */}
        {(config.showCameraCalibrationRing || config.batteryRing?.enabled) && (
          <div className="pointer-events-none mb-1">
            <CameraBatteryRing
              config={config.batteryRing}
              cameraDiameter={config.cameraHoleSize}
              batteryState={batteryState}
              showCalibrationCircle={config.showCameraCalibrationRing}
            />
          </div>
        )}
        <div className="text-[10px] font-mono text-zinc-600 bg-black/60 px-2 py-0.5 rounded-full border border-zinc-900 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <Power className="w-2.5 h-2.5 text-zinc-500" />
          <span>Island Disabled</span>
        </div>
      </div>
    );
  }

  const toggleExpand = () => {
    soundFx.playMorph(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(20);
    setIsExpanded(prev => !prev);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
    if (isPlaying) {
      soundFx.stopMusic();
      setIsPlaying(false);
    } else {
      soundFx.startMusic(currentTrackIndex, isMuted ? 0 : volume);
      setIsPlaying(true);
      if (config.autoExpandOnMusic && !isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIdx);
    setTrackProgress(0);
    if (isPlaying) {
      soundFx.startMusic(nextIdx, isMuted ? 0 : volume);
    }
  };

  const handlePrevTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playTap(config.soundEnabled);
    if (config.hapticsEnabled) triggerHaptic(15);
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIdx);
    setTrackProgress(0);
    if (isPlaying) {
      soundFx.startMusic(prevIdx, isMuted ? 0 : volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(false);
    soundFx.setVolume(newVol);
  };

  const handleCheckClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = await readRealClipboard();
    if (text) {
      setClipboardText(text);
      soundFx.playMorph(config.soundEnabled);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sleek surface finishes
  const getFinishClasses = () => {
    switch (config.finish) {
      case 'obsidian':
        return 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.85)]';
      case 'matte-carbon':
        return 'bg-[#111114] border-zinc-800 text-zinc-100 shadow-[0_12px_36px_rgba(0,0,0,0.9)]';
      case 'frosted-smoke':
        return 'bg-zinc-900/85 border-zinc-700/60 backdrop-blur-2xl text-zinc-100 shadow-2xl';
      case 'titanium-dark':
        return 'bg-[#18181b] border-zinc-600/50 text-zinc-100 shadow-2xl';
      case 'pure-black':
      default:
        return 'bg-black border-zinc-900 text-white shadow-2xl shadow-black';
    }
  };

  const getEdgeGlowClasses = () => {
    switch (config.edgeGlow) {
      case 'silver':
        return 'ring-1 ring-zinc-500/40';
      case 'white-neon':
        return 'ring-1 ring-white/30 shadow-[0_0_12px_rgba(255,255,255,0.15)]';
      case 'subtle':
        return 'ring-1 ring-white/10';
      case 'none':
      default:
        return '';
    }
  };

  // Idle width / height dynamically adapting
  let idleWidth = config.width;
  let idleHeight = config.height;
  let idleRadius = config.cornerRadius;

  if (activeModule === 'music' && !isExpanded) {
    idleWidth = Math.max(config.width + 78, 204);
  } else if (activeModule === 'call' && !isExpanded) {
    idleWidth = Math.max(config.width + 80, 212);
  } else if (activeModule === 'timer' && !isExpanded) {
    idleWidth = Math.max(config.width + 68, 192);
  } else if (activeModule === 'battery' && !isExpanded) {
    idleWidth = Math.max(config.width + 84, 210);
  } else if (customNotification && !isExpanded) {
    idleWidth = Math.max(config.width + 160, 328);
    idleHeight = Math.max(config.height + 10, 44);
  }

  const expandedWidth = config.expandedWidth || 372;
  const expandedMinHeight = config.expandedMinHeight || 176;

  // TheNotch slide-down mechanics vs iOS stick-to-camera
  const slideDownY = isExpanded && config.expansionStyle === 'slide-down'
    ? config.slideDownDistance
    : 0;

  // Camera Cutout Deadzone Calculation: ensures left & right wings never overlap physical lens
  const ringGap = config.batteryRing?.enabled ? (config.batteryRing.ringGap || 2) + (config.batteryRing.thickness || 2.5) : 0;
  const deadzoneWidth = Math.max(config.cameraHoleSize + ringGap * 2 + 14, 28);

  const getPillPadding = (): React.CSSProperties => {
    if (config.shape === 'left-punch') {
      return { paddingLeft: `${deadzoneWidth + 8}px`, paddingRight: '12px' };
    }
    if (config.shape === 'right-punch') {
      return { paddingLeft: '12px', paddingRight: `${deadzoneWidth + 8}px` };
    }
    return { paddingLeft: '12px', paddingRight: '12px' };
  };

  const renderCameraDeadzone = () => {
    if (config.shape === 'left-punch' || config.shape === 'right-punch') {
      return null;
    }
    return (
      <div 
        className="shrink-0 pointer-events-none"
        style={{ 
          width: `${deadzoneWidth}px`, 
          height: `${config.cameraHoleSize}px`,
          marginLeft: `${config.cameraHoleOffsetX}px`
        }} 
        aria-hidden="true"
      />
    );
  };

  return (
    <div 
      className={`relative z-50 flex justify-center pointer-events-auto select-none transition-transform duration-150 ${
        isDockedMode ? 'fixed top-0 left-0 right-0' : 'absolute inset-x-0'
      }`}
      style={{
        transform: `translateX(${config.horizontalOffset}px)`,
        top: `${config.topMargin}px`,
      }}
    >
      {/* Alignment Crosshairs Guide */}
      {config.showCrosshairs && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -top-6">
          <div className="w-[1px] h-28 bg-red-500/70" />
          <div className="h-[1px] w-52 bg-red-500/70 absolute" />
          <span className="absolute -top-6 text-[10px] font-mono text-red-400 bg-black/95 px-2 py-0.5 rounded border border-red-500/30 shadow-lg">
            {idleWidth}×{idleHeight}px | Y:{config.topMargin}px | X:{config.horizontalOffset}px | Cutout: {config.cameraHoleSize}px
          </span>
        </div>
      )}

      {/* Reactive Ambient Underglow */}
      {config.ambientGlow && (
        <div 
          className="absolute -inset-1 rounded-full blur-xl opacity-30 pointer-events-none transition-all duration-500"
          style={{
            background: isPlaying ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
            transform: `translateY(${slideDownY}px) scale(${isExpanded ? 1.05 : 0.95})`,
          }}
        />
      )}

      {/* Main Dynamic Notch Element */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: config.springStiffness || 440,
          damping: config.springDamping || 34,
          mass: 0.8,
        }}
        onClick={toggleExpand}
        className={`group relative flex items-center overflow-hidden border transition-all cursor-pointer ${getFinishClasses()} ${getEdgeGlowClasses()}`}
        style={{
          width: isExpanded ? `${expandedWidth}px` : `${idleWidth}px`,
          minHeight: isExpanded ? `${expandedMinHeight}px` : `${idleHeight}px`,
          borderRadius: isExpanded ? '30px' : `${idleRadius}px`,
          borderTopLeftRadius: config.shape === 'macbook' && !isExpanded ? 0 : undefined,
          borderTopRightRadius: config.shape === 'macbook' && !isExpanded ? 0 : undefined,
          transform: `translateY(${slideDownY}px)`,
        }}
      >
        {/* Dynamic Island Border Effect */}
        {config.islandBorder?.enabled && (
          <IslandBorderOverlay
            config={config.islandBorder}
            borderRadius={isExpanded ? '30px' : `${idleRadius}px`}
            isExpanded={isExpanded}
            audioEnergy={(visualizerHeights[0] + visualizerHeights[1] + visualizerHeights[2]) / 72}
          />
        )}

        {/* Camera Cutout: Red Sizing Calibration Circle & Battery Level Ring (No fake camera graphics) */}
        {(config.showCameraCalibrationRing || config.batteryRing?.enabled) && (
          <div 
            className="absolute pointer-events-none z-30"
            style={{
              left: config.shape === 'left-punch' 
                ? `${12 + config.cameraHoleOffsetX}px` 
                : config.shape === 'right-punch' 
                  ? 'auto' 
                  : `calc(50% + ${config.cameraHoleOffsetX}px)`,
              right: config.shape === 'right-punch' 
                ? `${12 - config.cameraHoleOffsetX}px` 
                : 'auto',
              top: `calc(50% + ${config.cameraHoleOffsetY}px)`,
              transform: config.shape === 'left-punch' || config.shape === 'right-punch' 
                ? 'translateY(-50%)' 
                : 'translate(-50%, -50%)',
            }}
          >
            <CameraBatteryRing
              config={config.batteryRing}
              cameraDiameter={config.cameraHoleSize}
              batteryState={batteryState}
              showCalibrationCircle={config.showCameraCalibrationRing}
            />
          </div>
        )}

        {/* 1. COMPACT / IDLE STATE VIEW (Acknowledges camera position/size with zero overlap) */}
        {!isExpanded && (
          <div 
            className="w-full h-full flex items-center justify-between text-xs font-medium tracking-tight overflow-hidden"
            style={getPillPadding()}
          >
            {customNotification ? (
              /* Custom Notification Compact Toast with Camera Deadzone */
              <div className="w-full flex items-center justify-between gap-1 overflow-hidden">
                <div className="flex-1 flex items-center gap-2 overflow-hidden pr-1">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-white shrink-0">
                    <Radio className="w-3 h-3 text-white" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-white mr-1.5">{customNotification.title}:</span>
                    <span className="text-zinc-400">{customNotification.message}</span>
                  </div>
                </div>

                {/* Deadzone Spacer keeping text/icons away from camera */}
                {renderCameraDeadzone()}

                <div className="shrink-0 flex items-center justify-end pl-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClearNotification) onClearNotification();
                    }}
                    className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : activeModule === 'music' ? (
              /* Real Live Music Visualizer & Track */
              <div className="w-full flex items-center justify-between overflow-hidden">
                {/* Left Wing: Track Info */}
                <div className="flex-1 flex items-center gap-2 overflow-hidden pr-1">
                  <img
                    src="/src/assets/images/monochrome_album_art_1793716690539.jpg"
                    alt="Album Art"
                    referrerPolicy="no-referrer"
                    className="w-4.5 h-4.5 rounded-full object-cover border border-zinc-700/80 shrink-0"
                    style={{
                      transform: isPlaying ? 'rotate(360deg)' : 'none',
                      transition: isPlaying ? 'transform 12s linear infinite' : 'none',
                    }}
                  />
                  <span className="text-[11px] font-semibold text-zinc-200 truncate">
                    {currentTrack.title}
                  </span>
                </div>

                {/* Deadzone Clearance Spacer */}
                {renderCameraDeadzone()}

                {/* Right Wing: Frequency Visualizer Spectrum */}
                <div className="shrink-0 flex items-center justify-end pl-1">
                  {config.showMiniWaveform ? (
                    <div className="flex items-end gap-[2px] h-3.5 pr-0.5">
                      {visualizerHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-[2.5px] rounded-full bg-zinc-100 transition-all duration-75"
                          style={{ height: `${Math.max(3, h * 0.6)}px` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              </div>
            ) : activeModule === 'call' ? (
              /* VoIP Call */
              <div className="w-full flex items-center justify-between overflow-hidden">
                {/* Left Wing: Call Contact */}
                <div className="flex-1 flex items-center gap-1.5 text-zinc-200 overflow-hidden pr-1">
                  <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <Phone className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300 truncate">Elena</span>
                </div>

                {/* Deadzone Clearance Spacer */}
                {renderCameraDeadzone()}

                {/* Right Wing: Call Timer */}
                <div className="shrink-0 flex items-center gap-1 font-mono-numbers text-[11px] text-zinc-400 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{formatTime(callSeconds)}</span>
                </div>
              </div>
            ) : activeModule === 'timer' ? (
              /* Live Pomodoro Countdown */
              <div className="w-full flex items-center justify-between overflow-hidden">
                <div className="flex-1 flex items-center gap-1.5 text-zinc-200 pr-1">
                  <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                  <span className="text-[11px] font-medium text-zinc-300 truncate">Focus</span>
                </div>

                {/* Deadzone Clearance Spacer */}
                {renderCameraDeadzone()}

                <div className="shrink-0 font-mono-numbers text-[11px] font-semibold text-white pl-1">
                  {formatTime(timerSeconds)}
                </div>
              </div>
            ) : activeModule === 'battery' ? (
              /* Battery Charging Status */
              <div className="w-full flex items-center justify-between overflow-hidden">
                <div className="flex-1 flex items-center gap-1.5 pr-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                  <span className="text-[11px] font-medium text-zinc-300 truncate">
                    {batteryState.charging ? 'Dash 67W' : 'Battery'}
                  </span>
                </div>

                {/* Deadzone Clearance Spacer */}
                {renderCameraDeadzone()}

                <div className="shrink-0 font-mono-numbers text-[11px] font-bold text-white pl-1">
                  {batteryState.level}%
                </div>
              </div>
            ) : (
              /* Idle State: 100% PURE BLACK PILL - Clean, silent, zero text or dots under camera */
              <div className="w-full h-full" />
            )}
          </div>
        )}

        {/* 2. EXPANDED INTERACTIVE STATE */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="w-full p-4 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Island Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400">
                    PhantomIsland
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-xs font-semibold text-zinc-200 capitalize">
                    {activeModule === 'idle' ? 'Now Playing' : activeModule}
                  </span>
                </div>
                <button
                  onClick={toggleExpand}
                  className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                  aria-label="Collapse island"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              {/* MODULE VIEW: MUSIC (REAL SOUND SYNTHESIS) */}
              {(activeModule === 'music' || activeModule === 'idle') && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <img
                      src="/src/assets/images/monochrome_album_art_1793716690539.jpg"
                      alt="Album Cover"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shadow-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate tracking-tight">
                        {currentTrack.title}
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">
                        {currentTrack.artist}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 font-mono-numbers">
                        <Headphones className="w-3 h-3 text-zinc-400" />
                        <span className="text-zinc-300">Studio Buds (Hi-Res Audio)</span>
                      </div>
                    </div>

                    {/* Real Spectrum Equalizer */}
                    <div className="flex items-end gap-[3px] h-7 px-1">
                      {visualizerHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-white transition-all duration-75"
                          style={{ height: `${Math.max(4, h)}px` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Scrubber seekbar */}
                  <div>
                    <div 
                      className="relative w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = clickX / rect.width;
                        setTrackProgress(Math.round(pct * currentTrack.duration));
                      }}
                    >
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-150"
                        style={{ width: `${(trackProgress / currentTrack.duration) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono-numbers text-zinc-400 mt-1">
                      <span>{formatTime(trackProgress)}</span>
                      <span>-{formatTime(currentTrack.duration - trackProgress)}</span>
                    </div>
                  </div>

                  {/* Real Playback Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setAudioRoute(audioRoute === 'studio-buds' ? 'internal' : 'studio-buds')}
                      className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span className="text-[11px] uppercase tracking-wide">Route</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePrevTrack}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
                        aria-label="Previous track"
                      >
                        <SkipBack className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="p-3 bg-white hover:bg-zinc-200 text-black rounded-full shadow-lg transition-transform active:scale-95"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        title="Click to play real audio synthesizer"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={handleNextTrack}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors"
                        aria-label="Next track"
                      >
                        <SkipForward className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const nextMute = !isMuted;
                          setIsMuted(nextMute);
                          soundFx.setVolume(nextMute ? 0 : volume);
                        }}
                        className="p-1 text-zinc-400 hover:text-white transition-colors"
                        aria-label="Mute toggle"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-16 accent-white h-1 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE VIEW: CALL */}
              {activeModule === 'call' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-white text-lg">
                        EV
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Elena Vance</div>
                        <div className="text-xs text-zinc-400">Chief System Architect</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono-numbers text-white font-medium">
                        {formatTime(callSeconds)}
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wide">VoIP HD</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        setIsCallMuted(!isCallMuted);
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                        isCallMuted ? 'bg-white text-black' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isCallMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isCallMuted ? 'Muted' : 'Mute'}</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        setIsSpeakerOn(!isSpeakerOn);
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                        isSpeakerOn ? 'bg-zinc-800 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Speaker</span>
                    </button>
                    <button
                      onClick={handleCheckClipboard}
                      className="h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors"
                      title="Paste clipboard snippet"
                    >
                      <Clipboard className="w-4 h-4" />
                      <span>Clip</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        if (config.hapticsEnabled) triggerHaptic(50);
                        setCallActive(false);
                        setIsExpanded(false);
                        onModuleChange('idle');
                      }}
                      className="h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>End</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODULE VIEW: POMODORO TIMER */}
              {activeModule === 'timer' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-mono text-zinc-400">Pomodoro Focus</div>
                      <div className="text-3xl font-mono-numbers font-bold text-white tracking-tight mt-1">
                        {formatTime(timerSeconds)}
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-full border-2 border-zinc-800 flex items-center justify-center relative">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="3" className="text-zinc-800" fill="transparent" />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-white transition-all duration-500"
                          fill="transparent"
                          strokeDasharray={150}
                          strokeDashoffset={150 - (150 * timerSeconds) / 1500}
                        />
                      </svg>
                      <Clock className="w-5 h-5 text-white absolute" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        setTimerSeconds(prev => prev + 60);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono-numbers text-zinc-300 transition-colors"
                    >
                      +1:00
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        setTimerSeconds(prev => prev + 300);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono-numbers text-zinc-300 transition-colors"
                    >
                      +5:00
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        setTimerSeconds(1500);
                      }}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playTap(config.soundEnabled);
                        if (config.hapticsEnabled) triggerHaptic(20);
                        setIsTimerRunning(!isTimerRunning);
                      }}
                      className="flex-1 py-2 rounded-lg bg-white text-black font-semibold text-xs transition-colors hover:bg-zinc-200"
                    >
                      {isTimerRunning ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </div>
              )}

              {/* MODULE VIEW: BATTERY & HARDWARE TELEMETRY */}
              {activeModule === 'battery' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase font-mono tracking-wider text-zinc-400">
                        {batteryState.isSupported ? 'Real Hardware Battery' : 'Dash Fast Charge'}
                      </div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {batteryState.level}% · {batteryState.charging ? 'Charging (67W)' : 'On Battery'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono-numbers text-zinc-300">
                        {batteryState.charging ? 'Fast SuperVOOC' : 'Discharging'}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {batteryState.isSupported ? 'Hardware Synced' : 'Dual-Cell'}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500" 
                      style={{ width: `${batteryState.level}%` }}
                    />
                  </div>

                  <div className="pt-2 border-t border-zinc-800 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] uppercase font-mono text-zinc-400">Left Pod</div>
                      <div className="text-xs font-mono-numbers font-bold text-white mt-0.5">94%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] uppercase font-mono text-zinc-400">Right Pod</div>
                      <div className="text-xs font-mono-numbers font-bold text-white mt-0.5">88%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[10px] uppercase font-mono text-zinc-400">Smart Case</div>
                      <div className="text-xs font-mono-numbers font-bold text-white mt-0.5">100%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE VIEW: DELIVERY */}
              {activeModule === 'delivery' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">Obsidian Roasters</div>
                      <div className="text-xs text-zinc-400">Chemex Roast & Cold Brew #842</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-mono-numbers">0.4 km</div>
                      <div className="text-[10px] text-zinc-400">Arriving in ~3 mins</div>
                    </div>
                  </div>

                  <div className="relative pt-2 pb-1">
                    <div className="h-1 bg-zinc-800 rounded-full w-full" />
                    <div className="h-1 bg-white rounded-full absolute top-2 left-0 w-[85%]" />
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400 mt-2">
                      <span className="text-white font-medium">Order Placed</span>
                      <span className="text-white font-medium">On the Way</span>
                      <span className="text-zinc-500">Delivered</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE VIEW: SPORTS */}
              {activeModule === 'sports' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>UEFA Champions League</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      84' 2nd Half
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div className="text-center w-28">
                      <div className="text-sm font-bold text-white">Real Madrid</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Home</div>
                    </div>
                    <div className="text-2xl font-mono-numbers font-bold text-white">
                      2 - 1
                    </div>
                    <div className="text-center w-28">
                      <div className="text-sm font-bold text-white">Man City</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">Away</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 text-center font-mono">
                    81' V. Junior Goal (Assisted by Bellingham)
                  </div>
                </div>
              )}

              {/* Clipboard Peek if text is available */}
              {clipboardText && (
                <div className="mt-3 p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-700/80 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-1">
                    <span>CLIPBOARD DETECTED</span>
                    <button onClick={() => setClipboardText(null)} className="text-zinc-400 hover:text-white">✕</button>
                  </div>
                  <div className="text-white truncate font-mono text-[11px]">{clipboardText}</div>
                </div>
              )}

              {/* Module Switcher Bar */}
              <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                <button
                  onClick={() => onModuleChange('music')}
                  className={`hover:text-white transition-colors ${activeModule === 'music' ? 'text-white font-medium' : ''}`}
                >
                  Music
                </button>
                <span>·</span>
                <button
                  onClick={() => onModuleChange('call')}
                  className={`hover:text-white transition-colors ${activeModule === 'call' ? 'text-white font-medium' : ''}`}
                >
                  Call
                </button>
                <span>·</span>
                <button
                  onClick={() => onModuleChange('timer')}
                  className={`hover:text-white transition-colors ${activeModule === 'timer' ? 'text-white font-medium' : ''}`}
                >
                  Timer
                </button>
                <span>·</span>
                <button
                  onClick={() => onModuleChange('battery')}
                  className={`hover:text-white transition-colors ${activeModule === 'battery' ? 'text-white font-medium' : ''}`}
                >
                  Power
                </button>
                <span>·</span>
                <button
                  onClick={() => onModuleChange('delivery')}
                  className={`hover:text-white transition-colors ${activeModule === 'delivery' ? 'text-white font-medium' : ''}`}
                >
                  Tracker
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
