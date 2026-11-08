package com.phantomisland.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Build
import android.view.accessibility.AccessibilityEvent

class IslandAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Ensure floating overlay service is running when accessibility service starts
        val overlayIntent = Intent(this, IslandOverlayService::class.java).apply {
            action = IslandOverlayService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(overlayIntent)
        } else {
            startService(overlayIntent)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                // Monitor package switches (e.g. full screen games vs homescreen)
            }
            AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED -> {
                // Intercept notification banners for live dynamic notch morphing
            }
        }
    }

    override fun onInterrupt() {
        // Required callback for accessibility services
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
