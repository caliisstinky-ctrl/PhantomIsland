import JSZip from 'jszip';

export async function generateAndroidStudioProjectZip(appUrl: string): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'settings.gradle',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "DynamicNotch"
include ':app'
`
  );

  zip.file(
    'build.gradle',
    `plugins {
    id 'com.android.application' version '8.3.0' apply false
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
`
  );

  zip.file(
    'README.md',
    `# Dynamic Notch v6.6 Native Android Project

This is a complete, native Android project configured for **Dynamic Notch Studio**.
It includes:
- Hardware Display Cutout support (\`LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES\`)
- \`SYSTEM_ALERT_WINDOW\` for floating island overlay capability
- Full-screen immersive edge-to-edge rendering
- WebApp / PWA container with hardware acceleration

## How to Build the APK:

### Method 1: Command Line (Fastest)
\`\`\`bash
# Linux / macOS
chmod +x gradlew
./gradlew assembleDebug

# Windows
gradlew.bat assembleDebug
\`\`\`
Your APK will be ready at: \`app/build/outputs/apk/debug/app-debug.apk\`

### Method 2: Android Studio
1. Open Android Studio -> "Open Existing Project" -> Select this folder.
2. Wait for Gradle sync to complete.
3. Click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
4. Click "locate" when notification appears to get your \`app-debug.apk\`!
`
  );

  // App module
  const app = zip.folder('app');
  if (app) {
    app.file(
      'build.gradle',
      `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.dynamicnotch.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.dynamicnotch.app"
        minSdk 24
        targetSdk 34
        versionCode 660
        versionName "6.6.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'androidx.core:core-ktx:1.12.0'
}
`
    );

    // AndroidManifest.xml
    const srcMain = app.folder('src/main');
    if (srcMain) {
      srcMain.file(
        'AndroidManifest.xml',
        `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Essential Android Permissions for Dynamic Notch & Floating Overlay -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.SET_WALLPAPER" />
    <uses-permission android:name="android.permission.EXPAND_STATUS_BAR" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Dynamic Notch"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DynamicNotch"
        android:hardwareAccelerated="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:clearTaskOnLaunch="true"
            android:stateNotNeeded="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.DynamicNotch.Fullscreen">
            <!-- Native Android Home Launcher Intent Filter -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.HOME" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
      );

      // Kotlin & Java code
      const kotlinFolder = srcMain.folder('java/com/dynamicnotch/app');
      if (kotlinFolder) {
        kotlinFolder.file(
          'MainActivity.kt',
          `package com.dynamicnotch.app

import android.annotation.SuppressLint
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Hardware Camera Notch & Cutout Integration (Android P+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }

        // Immersive Edge-to-Edge display
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )

        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
            allowContentAccess = true
        }

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // Load Dynamic Notch Applet
        webView.loadUrl("${appUrl}")
    }

    override fun onBackPressed() {
        if (this::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
`
        );
        kotlinFolder.file(
          'MainActivity.java',
          `package com.dynamicnotch.app;

import android.annotation.SuppressLint;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hardware Camera Cutout Integration
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        // Immersive Edge-to-Edge display
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        );

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // Load Dynamic Notch Applet
        webView.loadUrl("${appUrl}");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
`
        );
      }

      // Styles
      const resValues = srcMain.folder('res/values');
      if (resValues) {
        resValues.file(
          'styles.xml',
          `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.DynamicNotch" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="android:statusBarColor">#09090B</item>
        <item name="android:navigationBarColor">#070708</item>
    </style>
    <style name="Theme.DynamicNotch.Fullscreen" parent="Theme.DynamicNotch">
        <item name="android:windowFullscreen">false</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
    </style>
</resources>
`
        );
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}
