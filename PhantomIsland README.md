<div align="center">

```text
██████╗ ██╗  ██╗ █████╗ ███╗   ██╗████████╗██████╗  ██╗███████╗██╗      █████╗ ███╗   ██╗██████╗ 
██╔══██╗██║  ██║██╔══██╗████╗  ██║╚══██╔══╝██╔══██╗███║██╔════╝██║     ██╔══██╗████╗  ██║██╔══██╗
██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║  ██║╚██║███████╗██║     ███████║██╔██╗ ██║██║  ██║
██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║   ██║   ██║  ██║ ██║╚════██║██║     ██╔══██║██║╚██╗██║██║  ██║
██║     ██║  ██║██║  ██║██║ ╚████║   ██║   ██████╔╝ ██║███████║███████╗██║  ██║██║ ╚████║██████╔╝
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚═════╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ 
```

### ⚡ <span style="color:#00E5FF;">THE NEXT-GEN DYNAMIC CUTOUT INTERFACE</span> ⚡

[![Build Status](https://img.shields.io/badge/BUILD-STABLE-00E5FF?style=for-the-badge&logo=github&logoColor=black)](https://github.com/phantom-island/PhantomIsland)
[![License](https://img.shields.io/badge/LICENSE-WTFPL-FF0055?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![Theme](https://img.shields.io/badge/THEME-TRUE_OLED_BLACK-000000?style=for-the-badge&logo=letsencrypt&logoColor=00E5FF)]()
[![Platform](https://img.shields.io/badge/ANDROID-14%2F15%2F16-76FF03?style=for-the-badge&logo=android&logoColor=black)]()

</div>

---

## 🖤 <span style="color:#76FF03;">Overview</span>

**PhantomIsland** replaces static camera punch-holes with a fluid, high-velocity dynamic notification HUD. Engineered exclusively for **True Black OLED (`#000000`)** panels with razor-sharp **Pure White (`#FFFFFF`)** typography and neon telemetry accents.

*   🔋 **Zero Battery Drain:** Absolute black pixels shut off completely on OLED displays.
*   ⚡ **Spring-Physics Engine:** GPU-backed mathematical damping for seamless morphing animations.
*   🛡️ **Privacy Telltales:** Instantaneous hardware-level indicators for camera and microphone hooks.

---

## 🚀 <span style="color:#00E5FF;">Quick Build & Install</span>

### 1. Clone & Setup
```bash
git clone https://github.com/phantom-island/PhantomIsland.git
cd PhantomIsland
```

### 2. Configure SDK
Create a `local.properties` file in the root directory:
```properties
sdk.dir=/path/to/your/android/sdk
```

### 3. Compile & Deploy
```bash
# Build release bundle
./gradlew clean assembleRelease

# Install APK & grant overlay permission
adb install -r app/build/outputs/apk/release/PhantomIsland-release.apk
adb shell pm grant com.phantom.island android.permission.SYSTEM_ALERT_WINDOW
```

---

## 🔌 <span style="color:#FF0055;">Terminal Automation API</span>

Push live cards directly to the island via local terminal scripts (Termux / Shizuku):

```bash
am broadcast -a com.phantom.island.ACTION_PUSH_CARD \
   --es "title" "SYSTEM OVERRIDE" \
   --es "subtitle" "Governor: Performance // Temp: 37°C" \
   --ei "timeout_ms" 4000
```

---

## 📜 <span style="color:#00E5FF;">License</span>

Distributed under the **WTFPL License**. Fork it, break it, rebuild it.