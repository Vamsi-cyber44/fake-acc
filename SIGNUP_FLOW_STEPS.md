# ✅ COMPLETE SIGNUP FLOW TO OTP VERIFICATION

## 🎯 The Issue
The signup form goes through **4 stages** before calling the registration API. If you skip any stage, you won't reach the OTP screen.

## 📋 COMPLETE FLOW - STEP BY STEP

### **STAGE 1: SIGNUP-BASIC (Fill Identity Form)**
```
┌─────────────────────────────────┐
│   Identity Registry             │
├─────────────────────────────────┤
│ Full Identity Name:             │
│ [John Sterling]                 │
│                                 │
│ Registry Email:  Contact Phone: │
│ [john@test.com]  [+1-555-0199] │
│                                 │
│ Master Security Cipher:         │
│ [Test123!@ABC]  ← Must be SECURE
│ ✓ 12+ Characters                │
│ ✓ Uppercase                     │
│ ✓ Numeric                       │
│ ✓ Special Symbol                │
│                                 │
│ [Generate Digital ID →]         │
│ (button is GRAY until password) │
│ (is SECURE_ENTROPY)             │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. Fill: Name = "John Sterling"
2. Fill: Email = "john@test.com"
3. Fill: Phone = "+1-555-0199"
4. Fill: Password = "Test123!@ABC" (or similar secure password)
5. Wait for password strength bar to show 4/4 items ✓
6. Button changes to BLUE with "Generate Digital ID →"
7. CLICK THE BUTTON
```

### **STAGE 2: SIGNUP-SOCIAL (Link Social Account)**
```
┌─────────────────────────────────┐
│   Neural Node Linkage           │
├─────────────────────────────────┤
│ Select Platform:                │
│ [Instagram] Twitter LinkedIn    │
│                                 │
│ Platform Handle:                │
│ [analyst_handle_01]             │
│                                 │
│ [Proceed to Biometric Mapping →]│
│ [Back to Registry]              │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. Instagram is selected by default (has cyan glow)
2. Enter social handle = "analyst_handle_01"
3. CLICK "Proceed to Biometric Mapping →"
```

### **STAGE 3: SIGNUP-BIOMETRIC (Camera Scan)**
```
┌─────────────────────────────────┐
│   Biometric Handshake           │
├─────────────────────────────────┤
│ [Camera Feed Box]               │
│ ╔═══════════════════════════╗   │
│ ║                           ║   │
│ ║   CAMERA PREVIEW          ║   │
│ ║   (scanning animation)    ║   │
│ ║                           ║   │
│ ╚═══════════════════════════╝   │
│ FACIAL_RECOGNITION_LINK: 45%    │
│ [████░░░░░░░░░░░░░░░░░░░░░░░]  │
│                                 │
│ [Re-establish Handshake] ♻      │
│ (if camera fails)               │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. Browser will ask for CAMERA permission
   → Click "Allow" to grant permission
2. Camera preview will appear
3. Scan progress bar will fill automatically (0% → 100%)
4. After 100% completes, screen auto-advances to Stage 4
```

### **STAGE 4: PROVISIONING (Permissions)**
```
┌─────────────────────────────────┐
│   Interface Ready               │
├─────────────────────────────────┤
│ ⚡ Interface Ready              │
│ Provisioning secure access...  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔔 Threat Telemetry Push    │ │
│ │ Real-time botnet alerts  → │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📍 Geographic Node Mapping   │ │
│ │ Verified origin scanning  → │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Initialize Console Terminal →] │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. Browser will ask for NOTIFICATION permission
   → Click "Allow"
2. Browser will ask for LOCATION permission
   → Click "Allow"
3. Both buttons will show ✓ checkmark when granted
4. CLICK "Initialize Console Terminal →"
   → THIS CALLS THE REGISTRATION API
   → THIS REDIRECTS TO EMAIL OTP SCREEN
```

### **STAGE 5: EMAIL VERIFICATION (OTP)**
```
┌─────────────────────────────────┐
│   📧 Verify Email               │
├─────────────────────────────────┤
│ Enter the 6-digit code sent to  │
│ john@test.com                   │
│                                 │
│ [Send Verification Code →]      │
│ (click to get the OTP)          │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ VERIFICATION CODE:              │
│ [000000]                        │
│ (6-digit input field)           │
│                                 │
│ [Verify Code ✓]                 │
│ (enabled when 6 digits entered) │
│                                 │
│ Resend Code  or  Resend in 60s  │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. CLICK "Send Verification Code →"
2. Check your email or check backend console for OTP code
3. Enter 6-digit code in input field
4. CLICK "Verify Code ✓"
5. Screen auto-advances to Phone Verification
```

### **STAGE 6: PHONE VERIFICATION (SMS OTP)**
```
┌─────────────────────────────────┐
│   💬 Verify Phone               │
├─────────────────────────────────┤
│ Enter the 6-digit code sent to  │
│ +1-555-0199                     │
│                                 │
│ [Send SMS Code →]               │
│ (click to get the OTP)          │
│                                 │
│ ─────────────────────────────── │
│                                 │
│ VERIFICATION CODE:              │
│ [000000]                        │
│ (6-digit input field)           │
│                                 │
│ [Verify Code ✓]                 │
│ (enabled when 6 digits entered) │
│                                 │
│ Resend Code  or  Resend in 60s  │
└─────────────────────────────────┘

✅ WHAT TO DO:
1. CLICK "Send SMS Code →"
2. Check backend console for SMS OTP code
3. Enter 6-digit code in input field
4. CLICK "Verify Code ✓"
5. Auto-login happens
6. Dashboard loads
```

---

## 🔍 HOW TO GET OTP CODES

### **For Email OTP:**
- Check the email address (john@test.com) you provided
- OR check the **backend console** for output like:
  ```
  📧 EMAIL OTP: 123456
  ```

### **For Phone OTP (SMS):**
- Check the **backend console** for output like:
  ```
  📱 SMS OTP: 654321
  ```

### **To See Console Messages:**
1. Open browser DevTools: `F12`
2. Click "Console" tab
3. You'll see messages like:
   - `📝 Registering user with: {...}`
   - `✅ Registration response: {...}`
   - `📧 Sending email OTP to: john@test.com`
   - `🔐 Verifying email OTP: 123456`

---

## ⚠️ COMMON MISTAKES

| Mistake | Problem | Solution |
|---------|---------|----------|
| Click "Generate Digital ID" before password is SECURE | Button stays gray | Password must have all 4 checkmarks |
| Skip biometric stage | Don't reach provisioning | Allow camera access when browser asks |
| Don't grant permissions | Missing button click | Allow notifications & location |
| Skip provisioning stage | Don't call registration | MUST click "Initialize Console Terminal" |
| Wrong email format | Registration fails | Use proper email: name@domain.com |
| Phone without country code | Registration fails | Use format: +1-555-0199 |
| OTP takes too long | Timeout error | Check backend console for code within 10 min |

---

## ✅ SUCCESS CHECKLIST

After **Phone OTP verification**, you should see:

- [ ] Dashboard loads successfully
- [ ] User is logged in (authenticated)
- [ ] No 400/500 errors in console
- [ ] No "Invalid OTP" errors
- [ ] Can access app features
- [ ] Page title shows authenticated state

---

## 🚀 QUICK TEST DATA

**Copy-paste this to avoid typos:**

| Field | Value |
|-------|-------|
| Full Name | `John Sterling` |
| Email | `john@test.com` |
| Phone | `+1-555-0199` |
| Password | `Test123!@ABC` |
| Social Handle | `analyst_handle_01` |
| Email OTP | *(check backend console)* |
| Phone OTP | *(check backend console)* |

---

## 📞 IF SOMETHING GOES WRONG

**Step 1:** Open DevTools (`F12`) and check Console for errors

**Step 2:** Look for messages starting with:
- ❌ Registration error
- ❌ Send OTP error
- ❌ Verify OTP error

**Step 3:** Take a screenshot of the error and report what you see

**Step 4:** Check backend console (where npm start runs) for:
- `Error:` messages
- `OTP sent to:` messages
- API request/response logs

---

## 🎯 TL;DR - THE FOUR CLICKS

1. **Click 1:** "Generate Digital ID" (after filling form)
2. **Click 2:** "Proceed to Biometric Mapping" (after entering social handle)
3. **Click 3:** "Initialize Console Terminal" (after permissions granted)
4. **Click 4:** "Send Verification Code" (on email OTP screen)

Then enter the OTP codes from backend console and verify.
