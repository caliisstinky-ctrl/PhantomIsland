/**
 * Real device hardware integrations for Android and modern web browsers.
 * Handles Battery Status API, Web Notifications, Clipboard, and Vibration Haptics.
 */

export interface RealBatteryState {
  level: number;       // 0 to 100
  charging: boolean;
  chargingTime: number;
  isSupported: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  addEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export async function getRealDeviceBattery(): Promise<RealBatteryState> {
  if (typeof window === 'undefined') {
    return { level: 82, charging: true, chargingTime: 18, isSupported: false };
  }

  const nav = navigator as NavigatorWithBattery;
  if (typeof nav.getBattery === 'function') {
    try {
      const b = await nav.getBattery();
      return {
        level: Math.round(b.level * 100),
        charging: b.charging,
        chargingTime: b.chargingTime === Infinity ? 0 : Math.round(b.chargingTime / 60),
        isSupported: true,
      };
    } catch {
      // Fallback
    }
  }

  return { level: 82, charging: true, chargingTime: 18, isSupported: false };
}

export function subscribeToBattery(callback: (state: RealBatteryState) => void): () => void {
  const nav = navigator as NavigatorWithBattery;
  let active = true;

  if (typeof nav.getBattery === 'function') {
    nav.getBattery().then((battery) => {
      if (!active) return;
      const update = () => {
        callback({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          chargingTime: battery.chargingTime === Infinity ? 0 : Math.round(battery.chargingTime / 60),
          isSupported: true,
        });
      };
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
      update();
    }).catch(() => {});
  }

  return () => {
    active = false;
  };
}

export function triggerHaptic(pattern: number | number[] = 25) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }
}

export async function requestSystemNotification(title: string, body: string, iconUrl?: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    if (perm === 'granted') {
      new Notification(title, {
        body,
        icon: iconUrl || '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
      return true;
    }
  } catch {
    // Permission denied or unhandled
  }
  return false;
}

export async function readRealClipboard(): Promise<string | null> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
    try {
      const text = await navigator.clipboard.readText();
      return text && text.trim().length > 0 ? text.trim() : null;
    } catch {
      return null;
    }
  }
  return null;
}
