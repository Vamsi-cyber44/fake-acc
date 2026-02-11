# 🎯 CONNECTION TESTING INSTRUCTIONS

## Current Status

✅ **Backend:** Running on `http://localhost:8000`  
✅ **Frontend:** Running on `http://localhost:3000`  
✅ **Both servers started successfully**

---

## Test 1: Quick Browser Console Test

1. **Go to** `http://localhost:3000`
2. **Press F12** to open Developer Tools
3. **Go to Console tab**
4. **Copy and paste this entire script:**

```javascript
async function testBackendAPI() {
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    console.log('Test 1: Health Check');
    const healthRes = await fetch('http://localhost:8000/health');
    const healthData = await healthRes.json();
    console.log('✅ Health Status:', healthData);
  } catch (e) {
    console.error('❌ Health Check Failed:', e.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  try {
    console.log('Test 2: Login API (wrong credentials expected)');
    const loginRes = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    const loginData = await loginRes.json();
    console.log('✅ Status:', loginRes.status);
    console.log('✅ Response:', loginData);
  } catch (e) {
    console.error('❌ Login Failed:', e.message);
  }
}

testBackendAPI();
```

5. **Press Enter**
6. **Check the console output** - You should see test results

---

## Test 2: Try to Login in the App

Now that we know the backend is running, try the actual login flow:

1. **On the login screen**, enter:
   - Email: `test@example.com`
   - Password: `test123`
   
2. **Click "Connect Terminal"**

3. **Watch what happens:**
   - Does page reload? → Page is reloading (bad)
   - Do you see error message? → API is working (good!)
   - Do you see loading spinner? → Request is being sent (good!)

---

## Test 3: Network Tab Inspection

1. **Press F12 and go to Network tab**
2. **Leave it open**
3. **Try to login** with any email/password
4. **Look for requests** to `localhost:8000/api/auth/login`
5. **Click on it** and check:
   - **Status:** What number? (200=success, 400/401=error, 0=can't reach)
   - **Response:** What data is returned?
   - **Headers:** Is Authorization header sent?

---

## Test 4: Backend Logs

While you're testing the login, **check the backend terminal** for messages like:

```
[INFO] POST /api/auth/login - 400 Bad Request
[INFO] POST /api/auth/login - 200 OK
[INFO] POST /api/auth/login - 401 Unauthorized
```

These indicate the backend received the request!

---

## 📋 What To Report Back

After running these tests, tell me:

1. **Console test results** - Did both tests pass? Any errors?
2. **Network tab** - Does API request appear?
3. **Response status** - What number did you see? (200, 400, 401, 0, etc.)
4. **Page behavior** - Does page reload or show error?
5. **Backend terminal** - Do you see request logged?
6. **Error message** - What exactly does it say?

---

## 🚀 If All Tests Pass

If backend is responding and network requests appear, but page still reloads:

**This means:**
- API connection is working ✅
- Issue is in frontend form handling ⚠️

**Then check:**
1. Open DevTools Console (F12)
2. Look for RED error messages
3. Tell me what the error says

---

## ❌ If Any Test Fails

**If backend not responding:**
- Restart backend: `cd backend && npm run dev`
- Wait for "Server running on http://localhost:8000"

**If CORS error appears:**
- This means frontend can't reach backend
- Check backend .env has correct CORS settings
- Restart backend server

**If timeout error:**
- Backend crashed or not running
- Check backend terminal for errors
- Restart with: `npm run dev`

---

## Quick Commands Reference

```bash
# Start backend (run in backend folder)
npm run dev

# Start frontend (run in root folder)
npm run dev

# Test API directly in terminal
curl http://localhost:8000/health

# Kill process on port 8000 (if stuck)
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
```

---

## Expected Login Flow

### ✅ GOOD (This should happen):
```
1. Enter email/password
2. Click "Connect Terminal"
3. See loading spinner for 1-2 seconds
4. One of these happens:
   - Login successful → Dashboard appears
   - Wrong credentials → Red error "Invalid email or password"
   - Account locked → Red error "Account is locked"
```

### ❌ BAD (Page reloads):
```
1. Enter email/password
2. Click "Connect Terminal"
3. Page immediately reloads/refreshes completely
4. Back to login screen
```

If you're in the BAD flow:
- Backend is probably not responding
- Or there's a JavaScript error
- Or CORS is blocking the request

---

**Ready to test? Open your browser console (F12) and paste the test script above!**
