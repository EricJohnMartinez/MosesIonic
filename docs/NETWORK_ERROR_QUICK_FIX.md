# Mobile Network Error - Quick Fix Guide

## The Error You're Seeing
```
⚠️ Network unreachable or CORS blocked
• Check your internet connection
• Ensure the server is online
• Try again in a moment
```

## What It Means
Your mobile device **cannot reach** the server at `152.42.220.20:82`

## Quick Fixes (Try in Order)

### 1️⃣ Test Connection
```
In chat, type: /diag
Then hit Send
```
This will show you exactly where the connection is failing.

### 2️⃣ Check Internet
- [ ] WiFi is connected and working
- [ ] Or mobile data is enabled
- [ ] Other apps can access the internet

### 3️⃣ Try Different Network
- [ ] Switch WiFi to mobile data
- [ ] Switch mobile data to WiFi
- [ ] Try a different WiFi network

### 4️⃣ Verify Server
- [ ] Ask: Is the server at `152.42.220.20:82` running?
- [ ] Is it online and not in maintenance?

### 5️⃣ Test in Browser
- [ ] Open mobile device browser
- [ ] Go to: `http://152.42.220.20:82`
- [ ] Does it respond?

## Diagnostic Test Details

The `/diag` command checks:

| Test | What | If ✅ | If ❌ |
|------|------|-------|-------|
| Device Info | Your network status | Good baseline | Check device |
| HTTP HEAD | Server responds | Server online | Server down? |
| HTTP GET | Server reachable | Connection works | Network blocked |
| HTTPS GET | Secure connection | HTTPS works | SSL/TLS issue |
| POST API | Chat API works | Ready to use | API unreachable |

## What to Report

If `/diag` shows all ❌, tell your developer:

1. **Your network**: Home WiFi / Work WiFi / Mobile Data
2. **Device type**: Android / iOS
3. **Diagnostic output**: Copy everything from the test
4. **Status of**: `152.42.220.20:82` (online/offline)

## Technical Details

**Server Address:** `152.42.220.20:82`  
**API Endpoint:** `/api/weather-chat`  
**Protocol:** HTTP (or HTTPS)  
**Request Timeout:** 10 seconds per attempt  
**Retry Attempts:** 3 for HTTP, 2 for HTTPS  

## Why This Happens

❌ **Common Causes:**
- Device not connected to internet
- Server is offline or crashed
- Network firewall blocks port 82
- DNS cannot resolve IP
- Wrong IP address configured
- Corporate network restrictions

✅ **How We Fixed It:**
- Added automatic retry logic (tries 3 times)
- Added HTTPS fallback if HTTP fails
- Added detailed error messages
- Added diagnostic tool to identify exact issue
- Go straight to POST (skip CORS preflight)

## Still Not Working?

1. Run `/diag` and screenshot results
2. Note your network type (WiFi/Mobile)
3. Check if other APIs/websites work from device
4. Verify `152.42.220.20:82` is accessible from browser
5. Share all info with development team

## For IT/Network Teams

**Port:** 82  
**Protocol:** HTTP & HTTPS  
**Service:** Weather Chat API  
**Block List Review:** Needed if port 82 is blocked  
**CORS:** Not needed - Direct HTTP/HTTPS connection  
**Firewall Rule:** Allow outbound to 152.42.220.20:82  

---

**Last Updated:** November 5, 2025  
**For Support:** Contact development team with `/diag` output
