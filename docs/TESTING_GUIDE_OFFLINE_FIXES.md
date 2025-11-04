# Testing Guide: Offline Crash Fix

## Quick Test Steps

### Test 1: Offline with Cached Data ✅
**Setup:**
1. Open app while connected
2. Go to SummaryPage
3. Wait for data to load (shows 7-day summary)

**Test:**
1. Turn on Airplane Mode (Settings → Airplane Mode → ON)
2. Force close app (swipe up completely)
3. Reopen app
4. Navigate to SummaryPage

**Expected Result:**
- ✅ Data displays immediately
- ✅ No loading spinner
- ✅ No blank page
- ✅ No crash

**Console Output:**
```
🔍 fetchSummaryData called - offline: true
💾 Cache status: { hasCachedData: true, cacheLength: 7 }
📱 SummaryPage: Cache available: 7 records
📱 SummaryPage: Displaying cached data immediately (offline)
🏁 Finally block: setting loading to false
```

---

### Test 2: Offline without Cached Data ❌→✅
**Setup:**
1. Clear app data (Settings → Apps → MosesIonic → Storage → Clear)
2. OR: Force restart device

**Test:**
1. Turn on Airplane Mode BEFORE opening app
2. Open app
3. Navigate to SummaryPage

**Expected Result:**
- ✅ Shows "No Data Available" message
- ✅ Shows "You are offline. No cached data available."
- ✅ Has "Try Again Later" button
- ✅ No crash
- ✅ No blank page
- ✅ No infinite loading

**Console Output:**
```
🔍 fetchSummaryData called - offline: true
💾 Cache status: { hasCachedData: false, cacheLength: 0 }
📱 SummaryPage: No valid cache found
📵 SummaryPage: Offline detected, skipping Firebase fetch
ℹ️ Finally block: setting loading to false
```

---

### Test 3: Goes Offline During Fetch 🔄
**Setup:**
1. Device connected to internet
2. SummaryPage loading data

**Test:**
1. Immediately turn on Airplane Mode while data is loading
2. Wait 15 seconds
3. Observe what happens

**Expected Result:**
- ✅ Page doesn't hang indefinitely
- ✅ After ~10 seconds, one of these appears:
  - Error message if no cache
  - Cached data if cache exists
- ✅ No crash
- ✅ No infinite loading spinner

**Console Output:**
```
🔍 SummaryPage: Fetching TEM...
⚠️ SummaryPage: Device went offline during TEM fetch
❌ SummaryPage: No cache and fetch failed
Error message: "Device went offline during data fetch"
🏁 Finally block: setting loading to false
```

---

### Test 4: Timeout Protection Working ⏱️
**Setup:**
1. Device offline

**Test:**
1. Go to SummaryPage (no cache)
2. Wait 20 seconds without doing anything
3. Observe if page responds

**Expected Result:**
- ✅ Page responds before 15 seconds
- ✅ Firebase timeout triggers at 10 seconds
- ✅ Shows "No Data Available" message
- ✅ Button says "Try Again Later"
- ✅ Not frozen/stuck

**Console Output:**
```
Firebase query timeout for TEM
Firebase query timeout for HUM
Firebase query timeout for RR
Firebase query timeout for WSP
Firebase query timeout for WD
[After each timeout]
Error fetching TEM: Error: Firebase query timeout...
```

---

### Test 5: Back Online Auto-Sync 🔄
**Setup:**
1. Device offline with cached data displayed
2. Cache shows old data (e.g., from yesterday)

**Test:**
1. Turn off Airplane Mode (go online)
2. Pull to refresh on SummaryPage
3. Observe if new data loads

**Expected Result:**
- ✅ New data starts loading (loading spinner)
- ✅ After successful fetch, data updates
- ✅ No crash during reconnection
- ✅ Shows new 7-day summary

**Console Output:**
```
🟢 Device is ONLINE - syncing data...
🔄 Device reconnected - auto-syncing summary data
🔍 SummaryPage: Fetching fresh data...
✅ SummaryPage: Found TEM data
✅ SummaryPage: Found HUM data
[...rest of sensors...]
✅ SummaryPage: Final processed data: [...]
💾 SummaryPage: Data cached for station
```

---

### Test 6: Station Switch When Offline 🏠
**Setup:**
1. Device offline
2. Station 1 has cached data
3. Station 2 has NO cached data

**Test:**
1. On SummaryPage with Station 1 data showing
2. Tap station selector button (📍)
3. Tap on "San Andres Station" (Station 2)
4. Wait for page to load

**Expected Result:**
- ✅ Page updates to Station 2
- ✅ Shows "No Data Available" for Station 2
- ✅ Message shows "You are offline. No cached data."
- ✅ Can tap back to Station 1 and see original data
- ✅ No crash

**Console Output:**
```
🔍 fetchSummaryData called - station: station2, offline: true
💾 Cache status: { hasCachedData: false }
📱 SummaryPage: No valid cache found
📵 SummaryPage: Offline detected, skipping Firebase fetch
```

---

### Test 7: Rapid Refresh While Offline ⚡
**Setup:**
1. Device offline with no cached data

**Test:**
1. Go to SummaryPage
2. Immediately tap "Refresh Data" button 5 times rapidly
3. Wait and observe

**Expected Result:**
- ✅ Multiple requests don't crash app
- ✅ All timeouts work independently
- ✅ App remains responsive
- ✅ Shows appropriate message

**Console Output:**
```
Multiple concurrent console logs showing each refresh attempt
No crashes from overlapping requests
```

---

### Test 8: Error Message Display 📢
**Setup:**
1. Device offline
2. SummaryPage loaded

**Test:**
1. Check if error is displayed in red box (if no cache)
2. Verify text is readable
3. Verify button is clickable
4. Tap "Try Again Later" button

**Expected Result:**
- ✅ Error clearly visible (red background)
- ✅ Text readable and clear
- ✅ Button responds to tap
- ✅ Refresh works when tapped

---

## Advanced Testing: Console Monitoring

### How to Check Console on Android Device

**Option 1: Chrome DevTools (Emulator)**
```
1. Open Chrome on PC
2. Go to: chrome://inspect
3. Select your emulator
4. Click "Inspect"
5. Go to Console tab
6. Look for logs with emoji: 📱 🔍 📵 ❌ ✅
```

**Option 2: Android Studio Logcat**
```
1. Open Android Studio
2. Run app in emulator
3. View → Tool Windows → Logcat
4. Filter by: MosesIonic or your app tag
```

**Option 3: Real Device (USB Debugging)**
```
1. Connect device via USB
2. Enable USB Debugging in Developer Options
3. Run: adb logcat
4. Look for app logs
```

---

## What to Look For in Logs

### ✅ Good Logs (Successful Offline)
```
🔍 fetchSummaryData called - offline: true
💾 Cache status: { hasCachedData: true, cacheLength: 7 }
📱 SummaryPage: Cache available: 7 records
📱 SummaryPage: Displaying cached data immediately
🏁 Finally block: setting loading to false
```

### ⚠️ Warning Logs (Expected when offline)
```
📵 SummaryPage: Offline detected, skipping Firebase fetch
⚠️ SummaryPage: Device went offline during fetch
⚠️ Firebase query timeout for TEM
Firebase query timeout for HUM
```

### ❌ ERROR Logs (Should have error handling)
```
❌ SummaryPage: No cache and fetch failed
Error: Device went offline during data fetch
[Should be caught and handled, not crash]
```

### 🚨 BAD Logs (App will crash)
```
Uncaught TypeError: Cannot read properties of undefined
Unhandled promise rejection
Cannot convert undefined to number
[These would indicate a crash]
```

---

## Post-Test Verification

After running all tests, verify:

- [ ] No crashes in any offline scenario
- [ ] No infinite loading states
- [ ] Cached data displays immediately
- [ ] Error messages are clear and helpful
- [ ] Buttons are responsive
- [ ] Station switching works offline
- [ ] Auto-sync works when reconnecting
- [ ] Rapid refresh doesn't crash app
- [ ] Console shows expected logs
- [ ] No uncaught errors in logs

---

## Report Issues

If you find any crashes, please include:

1. **Console Output** - Copy all logs (click export in DevTools)
2. **Steps to Reproduce** - Exactly what you did
3. **Expected vs Actual** - What should happen vs what did
4. **Device Info** - Phone model, Android version, app version
5. **Network Status** - Airplane mode on/off, WiFi/Mobile

Example issue report:
```
Title: App crashes when going offline mid-fetch

Steps:
1. Device connected to WiFi
2. Open SummaryPage
3. Immediately toggle Airplane Mode on while loading
4. Wait 15 seconds

Expected: Shows error message or cached data
Actual: App closes/crashes

Console Log:
[Paste full console output]

Device: Samsung Galaxy A12, Android 11
```

---

## Success Criteria

✅ All 8 tests pass  
✅ No uncaught errors in console  
✅ No app crashes  
✅ Clear user messaging  
✅ Responsive UI  
✅ Proper offline/online detection  

**Ready to deploy!** 🚀
