# 🔍 DEBUGGING GUIDE - Page Reload Issue

## Problem
Website reloads when entering login/registration details instead of communicating with backend.

## Solution: Check Browser Console for Errors

### Step 1: Open Browser Console
1. Press **F12** on your keyboard
2. Click the **"Console"** tab
3. Look for RED ERROR messages

### Step 2: Check Network Requests
1. Click **"Network"** tab (next to Console)
2. Try to login/register again
3. Look for API requests to `http://localhost:8000/api/auth/login`
4. Check the response status:
   - ✅ 200/201 = Success
   - ❌ 0 = Backend not responding (CORS error)
   - ❌ 500 = Backend error

### Step 3: Common Issues

**Issue 1: CORS Error**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/auth/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Make sure backend is running
- Check backend .env has correct CORS_ORIGIN
- Restart backend

**Issue 2: Connection Refused**
```
XMLHttpRequest cannot load http://localhost:8000/api/auth/login. 
Network error.
```

**Solution:**
- Backend might have crashed
- Run: `cd backend && npm run dev`
- Check if port 8000 is available

**Issue 3: Empty Response**
```
Response shows: null or empty data
```

**Solution:**
- Backend might not be sending correct response
- Check backend logs for errors
- Check if request is reaching backend

---

## Check Backend Status

### Open Backend Terminal
Look at the backend output. You should see:

**Good (Working):**
```
🚀 Server running on http://localhost:8000
Environment: development
[INFO] POST /api/auth/login - 200
```

**Bad (Not Working):**
```
Cannot find module 'axios'
Error: connection refused
Error on line X
```

If backend has errors:
```bash
cd backend
npm run dev  # Restart it
```

---

## Verify API Connection

### Test 1: Direct Backend Test
Open new terminal:
```bash
# Test if backend is responding
curl http://localhost:8000/health

# You should see: OK or similar response
```

### Test 2: Check Axios Configuration
The frontend uses this API URL:
```
http://localhost:8000/api
```

To verify it's correct, open browser console and paste:
```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.log('Error:', e))
```

If you see response with `success: false` or `success: true`, backend is working!

---

## Step-by-Step Fix

### Step 1: Verify Servers
```bash
# Terminal 1: Check Backend
curl http://localhost:8000

# Terminal 2: Check Frontend  
# Should see "VITE v6.4.1 ready"
```

### Step 2: Clear Browser Cache
1. Press **F12**
2. Right-click refresh icon
3. Select "Empty cache and hard refresh"

### Step 3: Test Login
1. Open http://localhost:3000
2. Open Console (F12)
3. Try to login
4. Check Console for errors

### Step 4: Check Network Tab
1. Network tab (F12)
2. Try to login again
3. Look for request to `localhost:8000/api/auth/login`
4. Click it to see details

---

## Expected Flow

### Good Flow (No Reload):
```
1. User enters email/password
2. Click "Connect Terminal"
3. Loading spinner shows
4. API call to backend (Network tab shows 200)
5. Response received with tokens
6. Page redirects to dashboard (no reload!)
```

### Bad Flow (Page Reloads):
```
1. User enters email/password
2. Click "Connect Terminal"
3. Page immediately reloads
4. Network tab shows no API calls (or error)
5. Console shows CORS error or 0 status
```

---

## Test Commands

Run these in browser console (F12 → Console):

### Test 1: Check if Backend is Reachable
```javascript
fetch('http://localhost:8000')
  .then(() => console.log('✅ Backend is reachable'))
  .catch(() => console.log('❌ Backend is NOT reachable'))
```

### Test 2: Test API Response
```javascript
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@example.com', 
    password: 'test123' 
  })
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.log('Error:', e.message))
```

Expected response (even if wrong credentials):
```javascript
{
  success: false,
  message: "Invalid credentials"
}
```

---

## Report Back With

When you investigate, check these and report:

- [ ] Browser Console errors (screenshot or copy-paste)
- [ ] Network tab shows API call? Yes/No
- [ ] Backend terminal shows error? Yes/No
- [ ] What's the API response status? (200, 500, 0?)
- [ ] Does page reload or does it hang/load?

Then I can help fix the exact issue!

---

## Quick Fixes

**If Backend Not Running:**
```bash
cd backend
npm run dev
```

**If Ports Conflict:**
```bash
# Kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000 | grep LISTEN
kill -9 <PID>
```

**If Dependencies Missing:**
```bash
cd backend
npm install
npm run dev
```

---

**Open F12 (Developer Tools) and tell me what you see in the Console tab!**
