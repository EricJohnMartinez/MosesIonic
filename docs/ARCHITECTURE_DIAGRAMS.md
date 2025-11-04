# Offline Support Architecture Diagrams

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE DEVICE                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MosesIonic Weather App                       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │           Vue Components (UI Layer)              │    │   │
│  │  │  ┌──────────────────┐  ┌──────────────────┐    │    │   │
│  │  │  │  SummaryPage.vue │  │  HomePage.vue    │    │    │   │
│  │  │  └──────────────────┘  └──────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                      ↓                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │        Offline Services Layer                    │    │   │
│  │  │  ┌──────────────────┐  ┌──────────────────┐    │    │   │
│  │  │  │ offlineStorage   │  │ offlineDetection │    │    │   │
│  │  │  │ - saveToCache    │  │ - getStatus()    │    │    │   │
│  │  │  │ - loadFromCache  │  │ - addListener    │    │    │   │
│  │  │  │ - isCacheValid   │  │ - sync callbacks │    │    │   │
│  │  │  └──────────────────┘  └──────────────────┘    │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                      ↓                                  │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │          Local Storage Layer                     │    │   │
│  │  │                                                  │    │   │
│  │  │  ┌──────────────────────────────────────────┐   │    │   │
│  │  │  │       Browser localStorage               │   │    │   │
│  │  │  │                                          │   │    │   │
│  │  │  │  summaryData_station1: {...}            │   │    │   │
│  │  │  │  latestStationData: {...}               │   │    │   │
│  │  │  │  __storageMetadata__: {...}             │   │    │   │
│  │  │  └──────────────────────────────────────────┘   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Network State Monitoring                       │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ • navigator.onLine                              │   │   │
│  │  │ • online/offline events                         │   │   │
│  │  │ • Connection quality API                        │   │   │
│  │  │ • Periodic connectivity checks                 │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         ↕ Network Connection Available ↕
         ↓ (Online)               (Offline) ↑
         
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUD SERVICES                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Firebase Realtime Database                    │   │
│  │  • Weather station data                                 │   │
│  │  • Real-time updates                                   │   │
│  │  • 7-day historical data                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Offline-to-Online Transition

```
OFFLINE MODE
┌─────────────────────────┐
│   User Opens App        │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Load from localStorage  │
│ (Via offlineStorage)    │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│ Check if cache valid    │
│ (Expiry check)          │
└────────────┬────────────┘
             ↓
        ┌────┴────┐
        ↓         ↓
    VALID      EXPIRED
      │           │
      ↓           ↓
   Display    Try Firebase
   Cached     (fails offline)
   Data        │
      │        ↓
      │      Use Fallback
      │      or Show Error
      │
      └────┬────────────┘
           ↓
      Display to User
           ↓
    ┌──────────────────────┐
    │ Monitor Connection   │
    │ (offlineDetection)   │
    └──────────┬───────────┘
               ↓
        CONNECTION RESTORED
        (onlineCallback triggered)
               ↓
    ┌──────────────────────┐
    │ Auto-Sync Triggered  │
    │ (fetchData(true))    │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Fetch Fresh Data     │
    │ from Firebase        │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Update Cache         │
    │ (saveToCache)        │
    └──────────┬───────────┘
               ↓
    ┌──────────────────────┐
    │ Update UI with       │
    │ Fresh Data           │
    └──────────────────────┘
```

## Cache Entry Lifecycle

```
CREATE                    VALIDATE                  EXPIRE
┌─────┐              ┌──────────┐              ┌─────────┐
│Save │ ────────────→│Check Age │ ────────────→│ Discard │
│Data │ timestamp=T0 │age < ttl?│ age ≥ ttl   │ Cache   │
│     │ ttl = 1h    │ YES: OK  │              │& Fetch  │
└─────┘              │ NO: DEL │              │ Fresh   │
  ↑                  └──────────┘              └─────────┘
  │                       ↓ (Valid)                 ↑
  │                  ┌──────────┐                   │
  │                  │Return    │ ─ ─ ─ ─ ─ ─ ─ ──┘
  │                  │Cached    │ (On error,
  │                  │Data      │  retry save)
  │                  └──────────┘
  │
  └──────────────────────────────────
     (Update on fresh data received)


Cache Entry Structure:
{
  data: T,                    // Actual weather data
  timestamp: 1634728000000,  // When cached (ms)
  expiryMs: 3600000          // TTL 1 hour (ms)
}

Validation Logic:
age = now - timestamp
if (age > expiryMs) {
  // Cache expired - discard
  localStorage.removeItem(key)
  return null
} else {
  // Cache valid
  return data
}
```

## Component Integration Pattern

```
SUMMARY PAGE EXAMPLE:

┌──────────────────────────────────────┐
│ SummaryPage.vue Component            │
└───────────────────┬──────────────────┘
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
    ┌────────────┐      ┌───────────────┐
    │ onMounted  │      │ watch station │
    └──────┬─────┘      └───────┬───────┘
           │                    │
           ├────────────────────┤
           ↓                    ↓
     ┌─────────────┐    ┌────────────────┐
     │Setup Offline│    │fetchSummaryData│
     │Detection    │    │(forceRefresh?) │
     │Service      │    └────────┬────────┘
     └──────┬──────┘             │
            │                    ↓
            │              ┌────────────────┐
            │              │Try cache first │
            │              │(loadFromCache) │
            │              └────────┬───────┘
            │                       ↓
            │                ┌─────────────┐
            │                │If no cache: │
            │                │fetch fresh  │
            │                │from Firebase│
            │                └────────┬────┘
            │                         ↓
            │                  ┌────────────┐
            │                  │On error:   │
            │                  │use cache   │
            │                  │fallback    │
            │                  └────┬───────┘
            │                        ↓
            │                   ┌─────────────┐
            │                   │Save to cache│
            │                   │(saveToCache)│
            │                   └──────┬──────┘
            │                          ↓
            │                   ┌──────────────┐
            │                   │Display Data  │
            │                   └──────────────┘
            │
            └──→ onlineCallback
                 triggered
                 ├─────────────┐
                 ↓             ↓
            ┌──────────┐  ┌───────────────┐
            │Console   │  │Auto-Refresh   │
            │Log       │  │Data           │
            │"Online"  │  │(force sync)   │
            └──────────┘  └───────────────┘
```

## Storage State Machine

```
                    ┌─────────────────────┐
                    │  Initial State      │
                    │  (No Data)          │
                    └──────────┬──────────┘
                               │
                    (Fetch Data Online)
                               │
                    ┌──────────▼──────────┐
                    │  Cached & Valid     │
                    │  (1-2h remaining)   │◄─── Online Mode
                    └──────────┬──────────┘     Normal
                               │                Updates
                    (Time Passes)
                               │
                    ┌──────────▼──────────┐
                    │  Cached & Expired   │
                    │  (0h remaining)     │
                    └──────────┬──────────┘
                               │
                    (Offline or Error)
                               │
                    ┌──────────▼──────────┐
                    │  Offline Mode       │◄─── Online Failed
                    │  (Use Expired)      │     Use Stale Data
                    └──────────┬──────────┘
                               │
                    (Connection Restored)
                               │
                    ┌──────────▼──────────┐
                    │  Syncing...         │
                    │  (Fetch Fresh)      │
                    └──────────┬──────────┘
                               │
                    (Fetch Succeeds)
                               │
                    ┌──────────▼──────────┐
                    │  Cached & Valid     │
                    │  (Fresh Data)       │
                    └─────────────────────┘
```

## Performance Characteristics

```
OPERATION TIMING:

┌────────────────────────────────────────┐
│ Operation         │ Time    │ Blocking │
├────────────────────────────────────────┤
│ loadFromCache     │ < 1ms   │ Yes      │
│ saveToCache       │ < 10ms  │ Yes      │
│ isCacheValid      │ < 1ms   │ Yes      │
│ getCacheSize      │ 5-20ms  │ Yes      │
│                   │         │          │
│ Online event      │ 0ms     │ No       │
│ Offline event     │ 0ms     │ No       │
│ Periodic check    │ 20-50ms │ No       │
│ (5s interval)     │         │          │
│                   │         │          │
│ Firebase fetch    │ 500ms-5s│ No       │
│ Data merge        │ 20-100ms│ Yes      │
│ UI update         │ 50-200ms│ No       │
└────────────────────────────────────────┘

MEMORY IMPACT:

Cache Entry Size: ~1-5 KB (typical weather data)
Sample Cache:
  • summaryData_station1: 45 KB
  • summaryData_station2: 45 KB
  • latestStationData: 120 KB
  • metadata: 1 KB
  ───────────────────────────
  Total: ~215 KB (typical)
  Max recommended: ~5 MB
  Device quota: 5-10 MB
```

## Connectivity State Transitions

```
                  ┌───────────────────┐
                  │  ONLINE           │
                  │ (navigator.onLine)│
                  └─────────┬─────────┘
                            │
                 (Network disconnected)
                            │
                  ┌─────────▼─────────┐
                  │  Offline Event    │
                  │  (1st Priority)   │◄─── Event-Based
                  └─────────┬─────────┘     Detection
                            │
                  (Network reconnected)
                            │
                  ┌─────────▼─────────┐
                  │  Online Event     │
                  │  (1st Priority)   │
                  └─────────┬─────────┘
                            │
                  (Callback: onlineCallback)
                            │
                  ┌─────────▼─────────┐
                  │  Auto-Sync Start  │
                  │  (fetchData(true))│
                  └─────────┬─────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ↓                                     ↓
    ┌────────────┐                  ┌──────────────┐
    │ Success    │                  │ Error        │
    │(1-2s)      │                  │(Retry in 5s) │
    └────────────┘                  └──────────────┘
         │                               │
    ┌────▼────────────────────────────────┴────┐
    │        Update Cache & UI                 │
    │      (syncStatus: synced)                │
    └──────────────────────────────────────────┘

PERIODIC CHECK (Fallback, every 5s):
    ┌─────────────────────────────┐
    │ Fetch favicon (small req)    │
    ├─────────────────────────────┤
    │ Success → Online            │
    │ Failure → Offline           │
    └─────────────────────────────┘
    
    (Triggers state transitions if no events)
```

## Error Handling & Fallback

```
FETCH DATA FLOW:

┌──────────────────────┐
│  fetchSummaryData()  │
└──────────┬───────────┘
           │
           ↓
    ┌─────────────────┐
    │ Load from Cache │
    └────────┬────────┘
             │
        ┌────┴────┐
        ↓         ↓
    Valid     Invalid
      │           │
      │           ├──→ Try Firebase
      │           │       │
      │           │   ┌───┴────┐
      │           │   ↓        ↓
      │           │ Success  Error
      │           │   │        │
      │           │   ↓        ↓
      │           │  Show   (Show Error
      │           │  Fresh   Message)
      │           │  Data    │
      │           │   │      ├──→ Check if
      │           │   │      │    Cache
      │           │   │      │    Exists
      │           │   │      │    │
      │           │   │      │┌───┴────┐
      │           │   │      │↓        ↓
      │           │   │      │Yes      No
      │           │   │      ││        │
      │           │   │      │↓        ↓
      │           │   │      │Use   Show
      │           │   │      │Cache Error
      │           │   │      ││        │
      │           │   │      │├────────┤
      │           │   │      │↓        ↓
      │           │   │      │Update UI
      └───────────┴───┴──────┴────────┘
                    │
                    ↓
              DISPLAY DATA
              
Key Points:
✓ Always tries cache first (fast)
✓ Falls back to stale cache on error
✓ Never shows blank state if data exists
✓ Only errors if no cache available
✓ Auto-refreshes when online returns
```

## Listener Pattern Flow

```
SERVICE INITIALIZATION:

getOfflineDetectionService()
    │
    ├─→ Create singleton instance (if not exists)
    │
    ├─→ Setup event listeners:
    │   • window.addEventListener('online', ...)
    │   • window.addEventListener('offline', ...)
    │
    ├─→ Start periodic check timer (5s)
    │
    └─→ Return instance

ADDING LISTENERS:

offlineService.addListener(callback)
    │
    ├─→ Add callback to Set<listeners>
    │
    └─→ Return unsubscribe function
        │
        └─→ When called: Remove from Set


CALLING LISTENERS:

notifyListeners(isOnline: boolean)
    │
    ├─→ Iterate all listeners
    │
    ├─→ Call each: listener(isOnline)
    │
    └─→ Handle errors gracefully


MULTIPLE COMPONENTS:

Component 1: addListener → Callback1
Component 2: addListener → Callback2
Component 3: addListener → Callback3
                │
                └─→ All called when status changes
                    (No duplicate events!)
```

---

These diagrams illustrate:
1. ✅ Complete system architecture
2. ✅ Data flow patterns
3. ✅ Component integration
4. ✅ Performance characteristics
5. ✅ Error handling strategies
6. ✅ Connection monitoring
7. ✅ Listener pattern usage

For detailed implementation, see the service files.
