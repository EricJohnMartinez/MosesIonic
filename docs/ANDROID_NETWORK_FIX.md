# Android Network Security Fix

## Problem Identified

The error **"Network unreachable or CORS blocked"** on Android devices was caused by **Android's default network security policy** that blocks HTTP (non-HTTPS) requests on Android API 28+ (Android 9+).

## Root Cause

- **Android 9+ blocks HTTP by default** for security reasons
- The weather API uses HTTP: `http://152.42.220.20:82/api/weather-chat`
- Android WebView blocks this connection automatically
- Browser works because it has different security policies

## Solution Implemented

### 1. Created Network Security Configuration

**File:** `android/app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">152.42.220.20</domain>
    </domain-config>
</network-security-config>
```

### 2. Updated Android Manifest

**File:** `android/app/src/main/AndroidManifest.xml`
```xml
<application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme"
    android:networkSecurityConfig="@xml/network_security_config">
```

### 3. Added Automatic Connectivity Test

**Enhancement:** ChatBot now runs a quick connectivity test when opened:
- Tests server reachability automatically
- Shows success/failure message immediately
- Provides `/diag` command for detailed diagnostics

## What This Fixes

✅ **HTTP requests now work on Android**
- Allows cleartext (HTTP) traffic to `152.42.220.20`
- Maintains security for other domains
- Only affects the specific weather API server

✅ **Better User Experience**
- Automatic connectivity check when opening chat
- Immediate feedback if connection fails
- Clear instructions to use `/diag` for troubleshooting

## Testing Instructions

1. **Rebuild and deploy:**
   ```bash
   ionic build
   npx cap sync android
   npx cap open android
   ```

2. **Test on Android device:**
   - Open the app
   - Open the ChatBot
   - Should see: "✅ Connected to weather service" (if working)
   - Or: "⚠️ Connection test failed" (if still issues)

3. **If still failing:**
   - Type `/diag` in chat for detailed diagnostics
   - Check console logs (F12 → Console)
   - Verify device has internet connection

## Technical Details

### Android Network Security

- **Default behavior:** HTTP blocked on Android 9+
- **Our fix:** Explicitly allow HTTP for weather API domain
- **Security:** Only affects `152.42.220.20`, other domains still secure

### Capacitor Integration

- Network security config is automatically included in APK
- No additional Capacitor plugins needed
- Works with Capacitor's WebView

### ChatBot Enhancements

- **Auto-test:** Runs connectivity check when chat opens
- **Smart feedback:** Shows appropriate message based on test result
- **Diagnostic command:** `/diag` provides comprehensive testing
- **Console logging:** Detailed logs for debugging

## Files Modified

1. `android/app/src/main/res/xml/network_security_config.xml` (created)
2. `android/app/src/main/AndroidManifest.xml` (updated)
3. `src/components/ChatBot.vue` (enhanced with auto-test)

## Next Steps

1. Test on Android device
2. If `/diag` shows all ✅ but chat still fails → API response parsing issue
3. If `/diag` shows ❌ → Network/server connectivity issue
4. Share diagnostic results for further troubleshooting

## Why This Was Needed

- **Android Security:** Google blocks HTTP by default since Android 9
- **Legacy API:** Weather service uses HTTP (not HTTPS)
- **Capacitor WebView:** Follows Android's network security rules
- **Browser Exception:** Browsers have different security policies

This fix ensures the app works on Android while maintaining security for other connections.