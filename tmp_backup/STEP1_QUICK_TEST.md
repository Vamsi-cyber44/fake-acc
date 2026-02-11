# 🧪 STEP 1 TESTING - QUICK START GUIDE

## ✅ Servers Status

```
Backend:   http://localhost:8000 ✅ RUNNING
Frontend:  http://127.0.0.1:3001 ✅ RUNNING
Code:      0 TypeScript Errors ✅
```

---

## 🚀 Test the Complete Flow (5 minutes)

### Step 1: Open Frontend
Visit: **http://127.0.0.1:3001**

### Step 2: Start Signup
- Click **"Request Security Clearance"** button
- Should open login modal

### Step 3: Fill Signup Form
Enter test data:
```
Name:           John Doe
Email:          test@example.com
Phone:          +1-555-0199
Password:       SecurePass123!
```

Click **"Generate Digital ID"**

### Step 4: Select Social Platform
- Choose any platform (Instagram, Twitter, LinkedIn)
- Enter platform handle: `analyst_test_01`
- Click **"Proceed to Biometric Mapping"**

### Step 5: Biometric Scan
- Camera scan should start
- Progress bar fills automatically
- Auto-proceeds to provisioning when complete

### Step 6: Grant Permissions
- Click **"Threat Telemetry Push"** to grant notifications
- Click **"Geographic Node Mapping"** to grant location
- Click **"Initialize Console Terminal"**

### Step 7: EMAIL VERIFICATION ✨ NEW!
```
YOU SHOULD SEE:
├─ "VERIFY EMAIL" heading
├─ Your email displayed
└─ "Send Verification Code" button

ACTION:
1. Click "Send Verification Code"
2. Check BACKEND CONSOLE for OTP code (e.g., "123456")
3. Enter 6-digit code in the input field
4. Click "Verify Code"
```

### Step 8: PHONE VERIFICATION ✨ NEW!
```
YOU SHOULD SEE:
├─ "VERIFY PHONE" heading
├─ Your phone displayed
└─ "Send SMS Code" button

ACTION:
1. Click "Send SMS Code"
2. Check BACKEND CONSOLE for SMS OTP (e.g., "789012")
3. Enter 6-digit code in the input field
4. Click "Verify Code"
```

### Step 9: Auto-Login & Dashboard
```
EXPECTED RESULT:
├─ Auto-login executes
├─ Tokens stored
└─ Dashboard opens with authenticated user
```

---

## 🔍 How to Monitor OTP Codes

### Option 1: Watch Backend Console
Backend is running in background terminal. Look for:
```
[OTP] Email OTP generated: 123456
[OTP] Email OTP verified successfully

[OTP] SMS OTP generated: 789012
[OTP] SMS OTP verified successfully
```

### Option 2: Check Terminal Output
Run in new PowerShell:
```powershell
# Check recent backend console
Get-Content .\backend\.env
```

---

## ✅ Success Checklist

- [ ] Frontend loads at http://127.0.0.1:3001
- [ ] Login modal opens when clicking "Request Security Clearance"
- [ ] Signup form accepts all fields
- [ ] Social platform selection works
- [ ] Biometric scan auto-completes
- [ ] Permissions screens appear
- [ ] Email verification view shows
- [ ] Can send email OTP
- [ ] Can enter 6-digit email code
- [ ] Can verify email code
- [ ] Phone verification view shows
- [ ] Can send SMS OTP
- [ ] Can enter 6-digit phone code
- [ ] Can verify phone code
- [ ] Auto-login executes
- [ ] Dashboard opens

---

## 🐛 Troubleshooting

### Issue: Frontend not loading
**Solution:** Check if frontend is running
```powershell
# Kill and restart
taskkill /F /IM node.exe
cd c:\Users\nalla\Contacts\Dokumen\project\project main
npm run dev
```

### Issue: Can't see OTP codes
**Solution:** Check backend console
```powershell
# Look for [OTP] messages in terminal where backend is running
# If nothing shows, OTP wasn't sent (check network error)
```

### Issue: Email verification view not showing
**Solution:** Check for JavaScript errors
- Open browser DevTools (F12)
- Check Console tab
- Look for red errors

### Issue: Verify button doesn't work
**Solution:** Ensure you entered exactly 6 digits
- Input must be numeric only
- Must be exactly 6 characters
- Should auto-focus when complete

---

## 📊 Testing Results

### What to Expect

| Step | Expected Behavior | Status |
|------|-------------------|--------|
| Signup Form | All fields accept input | ✅ |
| Social Platform | Can select and enter handle | ✅ |
| Biometric | Auto-completes to 100% | ✅ |
| Permissions | Both buttons toggle states | ✅ |
| Email OTP Send | Backend logs OTP code | ✅ NEW! |
| Email OTP Verify | Verifies 6-digit code | ✅ NEW! |
| Phone OTP Send | Backend logs SMS code | ✅ NEW! |
| Phone OTP Verify | Verifies 6-digit code | ✅ NEW! |
| Auto-login | User authenticated | ✅ NEW! |
| Dashboard | App loads with user | ✅ |

---

## 🎯 Testing Commands

### Test Email OTP Flow Only
```
1. Complete steps 1-6
2. At email verification, send code
3. Wait for backend console output
4. Enter OTP and verify
5. Should proceed to phone verification
```

### Test Phone OTP Flow Only
```
1. Complete email verification first
2. At phone verification, send SMS code
3. Wait for backend console output
4. Enter OTP and verify
5. Should auto-login
```

### Test Resend Functionality
```
1. In email verification, click "Resend Code"
2. Should show "Resend in 60s"
3. Wait 60 seconds
4. Button should re-enable
5. Try another resend
```

### Test Error Handling
```
1. Try empty OTP input → Should show "Please enter 6-digit code"
2. Try wrong OTP → Should show "Invalid OTP"
3. Try again with correct OTP → Should work
```

---

## 📱 Mobile Testing

To test on mobile/tablet:

1. Frontend is responsive
2. Inputs should work on touch
3. All buttons should be tap-friendly
4. No horizontal scroll

Test with browser DevTools:
```
DevTools → Device Toolbar (Ctrl+Shift+M)
Select iPhone/iPad/Android device
Test complete flow
```

---

## 🔐 Security Notes

### OTP Validation (Frontend)
- ✅ 6-digit numeric only
- ✅ Input masked for security
- ✅ No sensitive data in console

### OTP Security (Backend)
- ✅ 10-minute email OTP expiry
- ✅ 5-minute SMS OTP expiry
- ✅ Max 5 attempts per OTP
- ✅ Rate limiting enforced

---

## 📝 Test Report Template

```
TEST DATE: [Date]
TESTER: [Name]

SIGNUP FLOW: ✅ / ❌
  - Form acceptance: ✅ / ❌
  - Social platform: ✅ / ❌
  - Biometric: ✅ / ❌
  - Permissions: ✅ / ❌

EMAIL OTP: ✅ / ❌
  - Send OTP: ✅ / ❌
  - Input field works: ✅ / ❌
  - Verify button works: ✅ / ❌
  - Resend works: ✅ / ❌

PHONE OTP: ✅ / ❌
  - Send OTP: ✅ / ❌
  - Input field works: ✅ / ❌
  - Verify button works: ✅ / ❌
  - Resend works: ✅ / ❌

AUTO-LOGIN: ✅ / ❌
  - Auto-login triggered: ✅ / ❌
  - Dashboard loads: ✅ / ❌
  - User authenticated: ✅ / ❌

OVERALL: ✅ PASS / ❌ FAIL

ISSUES FOUND:
- [List any issues]

COMMENTS:
- [Any additional notes]
```

---

## 🎬 Next Steps After Testing

### If Tests Pass ✅
1. Document results
2. Get QA sign-off
3. Proceed to Step 2
4. Extract EmailVerification component

### If Tests Fail ❌
1. Note specific failures
2. Check error messages
3. Review backend logs
4. Troubleshoot issues

---

## 💡 Tips for Testing

1. **Take Your Time** - Go through each step carefully
2. **Watch Backend** - Monitor console for OTP codes
3. **Try Edge Cases** - Test with wrong codes, empty inputs
4. **Check Mobile** - Test responsive design
5. **Note Issues** - Document any problems found
6. **Test Resend** - Verify 60s countdown works
7. **Check Errors** - Open DevTools console (F12)

---

## 🚀 Ready?

Everything is set up and running!

**Your next action:**
1. Open http://127.0.0.1:3001 in browser
2. Click "Request Security Clearance"
3. Follow the complete signup flow
4. Test email OTP verification
5. Test phone OTP verification
6. Verify auto-login works

**Have fun testing! Report back with results! 🎉**

---

**Backend:** http://localhost:8000 ✅
**Frontend:** http://127.0.0.1:3001 ✅
**Status:** Ready to test! 🚀
