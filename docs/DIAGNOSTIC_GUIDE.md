# ChatBot Diagnostic Guide

## Quick Start

When you experience the error **"Network unreachable or CORS blocked"** on mobile:

1. Open the chatbot in the app
2. Type: `/diag` 
3. Hit Send

The diagnostic test will run and show you detailed connection information.

## What the Diagnostic Test Does

The `/diag` command tests connectivity to the weather API server by checking:

1. **Device Information**
   - User Agent (browser/app info)
   - Language settings
   - Online status

2. **Connectivity to Each Endpoint**
   - Tests: `http://152.42.220.20:82/api/weather-chat`
   - Tests: `http://152.42.220.20:82` (base URL)
   - Tests: `https://152.42.220.20:82` (HTTPS)
   - For each endpoint, it tries both HEAD and GET requests
   - Shows response status code or specific error

3. **Weather Chat API POST Test**
   - Sends actual POST request to the API
   - Shows if the API is responding
   - Displays response preview

## Reading the Results

### ✅ All Green (All Tests Pass)
```
✅ HEAD request: 200 OK
✅ GET request: 200 OK
✅ POST successful: 200
```
→ **Your device can reach the server!** If chat still doesn't work, the issue is with response parsing.

### ❌ Some Red (Tests Fail)
```
❌ HEAD request: Failed to fetch
❌ GET request: Network error
❌ POST failed: Failed to fetch
```
→ **Your device cannot reach the server.** Follow troubleshooting steps below.

## Troubleshooting Steps

### If all tests show ❌:

1. **Check Internet Connection**
   - Verify device has WiFi or mobile data enabled
   - Try accessing any website in mobile browser
   - Check if other apps can access the internet

2. **Try Different Networks**
   - Switch from WiFi to mobile data (or vice versa)
   - Try a different WiFi network if available
   - This helps identify if specific network is blocking the connection

3. **Verify Server is Running**
   - Ask server admin to check if `152.42.220.20:82` is online
   - Check if server crashed or is under maintenance
   - Verify server firewall allows incoming connections on port 82

4. **Check Device Network Settings**
   - Try pinging `152.42.220.20` from device
   - Check if device can access the server IP directly
   - Look for corporate proxies that might block the connection

5. **Test Direct URL in Browser**
   - Open browser on mobile device
   - Try: `http://152.42.220.20:82`
   - See if you can reach any server response

### If tests show ✅ but chat still fails:

The API server is reachable, but there might be response format issues:

1. **Check Response Format**
   - Look in browser console for the actual API response
   - Verify it matches expected format: `{reply: {response: "..."}}` 

2. **Share Response Format**
   - Copy the console output showing the actual response
   - Report to developer for parsing fixes

## Console Logs for Advanced Debugging

When testing on mobile, open Developer Tools (F12) and check Console tab:

### Looking for during message send:
```
📡 Trying endpoint 1/2: http://152.42.220.20:82/api/weather-chat
📤 Sending message (URL attempt 1, retry 1/3)...
✅ Response status: 200 OK
✅ API Response received: {...}
✅ Final bot response: [Your response here]
```

### If you see errors:
```
❌ Attempt 1/3 failed: Failed to fetch
🔄 Retrying in 1 second...
❌ Attempt 2/3 failed: Network error
❌ Attempt 3/3 failed: Failed to fetch
📡 Trying endpoint 2/2: https://152.42.220.20:82/api/weather-chat
...
❌ Chat error: All API endpoints failed.
```

## Common Issues & Solutions

### Issue: "Network unreachable"
**Cause:** Device cannot reach server IP  
**Solution:** Verify server is running and device has internet

### Issue: "Request timeout"
**Cause:** Server taking too long to respond  
**Solution:** Server might be overloaded, wait and try again

### Issue: "Request was aborted"
**Cause:** Connection interrupted (slow/unstable network)  
**Solution:** Try on better connection or try again

### Issue: "HTTP 500"
**Cause:** Server-side error  
**Solution:** Contact server admin to check logs

## Network Architecture

```
Mobile Device
    ↓ (WiFi/Mobile Data)
Device Network Interface
    ↓ (Routes to)
Server Network
    ↓
Server at 152.42.220.20:82
    ↓ 
Weather Chat API
```

If any step fails, you'll see "Network unreachable" error.

## Getting Help

When reporting an issue, include:

1. Run `/diag` in the chat
2. Copy all diagnostic output
3. Check browser console for any errors
4. Note which network you're on (WiFi SSID or mobile carrier)
5. Share this information with development team

## For Developers

The diagnostic function tests:
- `HEAD` requests (lightweight connectivity check)
- `GET` requests (full connectivity check)
- `POST` requests (actual API call)
- Multiple endpoints (HTTP + HTTPS)
- 5-8 second timeouts per request

Results are logged to:
- Browser console (F12 → Console)
- Chat window (for user reference)

All diagnostic data is collected locally on the device, nothing is sent to server.
