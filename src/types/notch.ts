export type NotchShape = 'pill' | 'teardrop' | 'left-punch' | 'right-punch' | 'macbook';

export type NotchFinish = 'obsidian' | 'matte-carbon' | 'frosted-smoke' | 'pure-black' | 'titanium-dark';

export type ExpansionStyle = 'stick-to-camera' | 'slide-down' | 'split-bubble' | 'top-curtain';

export type ActiveModule = 
  | 'idle' 
  | 'music' 
  | 'call' 
  | 'battery' 
  | 'bluetooth' 
  | 'timer' 
  | 'delivery' 
  | 'sports' 
  | 'notification'
  | 'controls';

export type EdgeLightingPattern = 'orbit-chase' | 'pulse-breathe' | 'sweep-comet' | 'snake-runner' | 'liquid-fade';

export type EdgeLightingTrigger = 'always' | 'music' | 'notification' | 'charging';

export type IslandBorderPattern = 'orbit-chase' | 'pulse-breathe' | 'sound-reactive' | 'liquid-fade' | 'laser-runner' | 'solid';

export interface EdgeLightingConfig {
  enabled: boolean;
  pattern: EdgeLightingPattern;
  thickness: number;       // px (1 to 10)
  inset: number;           // px (0 to 18)
  cornerRadius: number;    // px (0 to 52)
  speed: number;           // seconds (0.5 to 6.0)
  glowBlur: number;        // px (0 to 28)
  colors: string[];        // 2 to 4 custom hex strings
  colorPreset: string;     // 'monochrome-silver' | 'pure-white' | 'cyber-neon' | 'aurora' | 'solar-gold' | 'custom'
  trigger: EdgeLightingTrigger;
}

export interface IslandBorderConfig {
  enabled: boolean;
  pattern: IslandBorderPattern;
  thickness: number;       // px (1 to 6)
  glowBlur: number;        // px (0 to 24)
  speed: number;           // seconds (0.4 to 5.0)
  colors: string[];        // 2 to 4 custom hex strings
  colorPreset: string;     // 'monochrome-silver' | 'pure-white' | 'cyber-neon' | 'aurora' | 'custom'
}

export type BatteryChargingAnimation = 
  | 'radar-sweep' 
  | 'pulse-glow' 
  | 'liquid-bubble' 
  | 'neon-comet' 
  | 'dash-flash' 
  | 'breathe';

export interface CameraBatteryRingConfig {
  enabled: boolean;
  thickness: number;          // px (1 to 8)
  ringGap: number;            // px gap from camera circle (0 to 14)
  startAngle: number;         // degrees (0 = top, 90 = right, 180 = bottom, 270 = left)
  clockwise: boolean;
  showPercentageText: boolean;
  chargingAnimation: BatteryChargingAnimation;
  chargingSpeed: number;      // seconds (0.4 to 3.0)
  colorMode: 'status-threshold' | 'gradient' | 'monochrome' | 'custom';
  highColor: string;          // e.g. '#10b981'
  midColor: string;           // e.g. '#f59e0b'
  lowColor: string;           // e.g. '#ef4444'
  chargingColor: string;      // e.g. '#38bdf8'
  customColor: string;        // e.g. '#ffffff'
}

export interface NotchConfig {
  // Master State
  isEnabled: boolean;                   // Island On/Off toggle

  // Position & Geometry
  shape: NotchShape;
  width: number;                        // Idle width in px (e.g. 124)
  height: number;                       // Idle height in px (e.g. 34)
  topMargin: number;                    // px from top (supports 0 to 60px, flush to bezel)
  horizontalOffset: number;             // px offset from center (for hole-punch)
  cornerRadius: number;                 // px (0 to 36px)
  expandedWidth: number;                // px (280 to 420px)
  expandedMinHeight: number;            // px (140 to 320px)

  // Physical Camera Cutout & Red Sizing Guide (No fake camera pictures)
  cameraHoleSize: number;               // physical camera diameter in px (8 to 36px)
  cameraHoleOffsetX: number;            // px fine-tune lens X (-60 to +60px)
  cameraHoleOffsetY: number;            // px fine-tune lens Y (-30 to +30px)
  showCameraCalibrationRing: boolean;   // Sizing red circle to align over phone camera punch hole
  showCrosshairs: boolean;

  // Camera Cutout Battery Ring (Energy Ring)
  batteryRing: CameraBatteryRingConfig;

  // Expansion & Motion Mechanics (TheNotch vs iOS)
  expansionStyle: ExpansionStyle;       // 'stick-to-camera' (iOS) vs 'slide-down' (TheNotch)
  slideDownDistance: number;            // px to drop below camera before expanding (e.g. 20px)
  springStiffness: number;              // physics stiffness (200 to 700)
  springDamping: number;                // physics damping (15 to 50)
  autoExpandOnMusic: boolean;
  autoExpandOnNotification: boolean;
  autoExpandOnCharger: boolean;
  autoCollapseSeconds: number;          // 0 for off, or 3, 5, 8

  // Visuals & OLED Monochrome Aesthetics
  finish: NotchFinish;
  edgeGlow: 'subtle' | 'silver' | 'white-neon' | 'none';
  blurStrength: 'none' | 'subtle' | 'heavy';
  ambientGlow: boolean;                 // subtle reactive under-glow

  // Edge Lighting & Dynamic Notch Border
  edgeLighting: EdgeLightingConfig;
  islandBorder: IslandBorderConfig;

  // Feedback & Mini-Indicators
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showMiniWaveform: boolean;
  showMiniTimer: boolean;
  showMiniBattery: boolean;

  // Real System & OS Overlay Settings (Non-Root Keep-Alive, Root, Display Over Apps, Landscape)
  systemOverlay: SystemOverlayConfig;
}

export interface SystemOverlayConfig {
  // Display Over Other Apps & Orientation
  displayOverApps: boolean;
  showInFullScreenGames: boolean;
  hideOnLockScreen: boolean;
  landscapeBehavior: 'stay-over-camera' | 'rotate-to-top' | 'hide-in-landscape';
  autoHideSeconds: number;       // 0 for never, or 3, 5, 8, 15

  // Non-Root Keep-Alive
  ignoreBatteryOptimization: boolean;
  unrestrictedData: boolean;
  foregroundService: boolean;
  accessibilityService: boolean;

  // Root & Power User Options
  rootModeEnabled: boolean;
  systemPrivApp: boolean;
  magiskModuleSupport: boolean;
  restartOnOOMKill: boolean;
}

export interface CustomNotification {
  id: string;
  appName: string;
  title: string;
  message: string;
  timeAgo: string;
  iconType: 'chat' | 'mail' | 'shield' | 'calendar' | 'zap';
}
