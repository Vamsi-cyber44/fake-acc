# Step 1 Frontend OTP - Quick Integration Reference

## What's Done ✅

AuthModal.tsx now has complete email & phone OTP verification integrated into the signup flow.

## Component Structure

```
AuthModal.tsx
├── State: otpData (NEW)
│   ├── emailOtp: string
│   ├── phoneOtp: string
│   ├── emailOtpSent: boolean
│   ├── phoneOtpSent: boolean
│   ├── emailOtpError: string
│   ├── phoneOtpError: string
│   ├── emailResendCountdown: number
│   └── phoneResendCountdown: number
│
├── Handlers (NEW):
│   ├── sendEmailOTP()
│   ├── verifyEmailOTP()
│   ├── resendEmailOTP()
│   ├── sendPhoneOTP()
│   ├── verifyPhoneOTP()
│   ├── resendPhoneOTP()
│   ├── autoLogin()
│   ├── startEmailResendCountdown()
│   └── startPhoneResendCountdown()
│
└── Views (NEW):
    ├── 'email-verification'
    └── 'phone-verification'
```

## Signup Flow (7 Steps)

```
signup-basic 
  ↓ (form valid + strong password)
signup-social 
  ↓ (platform selected)
signup-biometric 
  ↓ (scan complete)
provisioning 
  ↓ (permissions granted)
email-verification (NEW)
  ↓ (email OTP verified)
phone-verification (NEW)
  ↓ (phone OTP verified)
Dashboard (auto-login)
```

## API Flow

```
1. User submits provisioning form
   ↓
2. POST /api/auth/register 
   (with email, username, password, phoneNumber)
   ↓
3. Move to: email-verification view
   ↓
4. POST /api/auth/send-otp {email}
   ↓
5. User enters 6-digit code
   ↓
6. POST /api/auth/verify-otp {email, otp}
   ↓
7. If phone exists: Move to phone-verification
   If no phone: Auto-login
   ↓
8. POST /api/auth/send-sms-otp {phoneNumber, email}
   ↓
9. User enters 6-digit code
   ↓
10. POST /api/auth/verify-sms-otp {phoneNumber, otp}
    ↓
11. POST /api/auth/login {email, password}
    ↓
12. Dashboard opens (onLoginSuccess)
```

## Testing the Flow

### Quick Test

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npm run dev
```

Visit `http://localhost:5173` → Click "Request Security Clearance" → Follow flow

### What to Expect

1. **Email OTP Sent:** Backend console shows OTP code (demo mode)
2. **Verify Email:** Enter code from console, click verify
3. **Phone OTP Sent:** Backend console shows SMS OTP
4. **Verify Phone:** Enter code from console, click verify
5. **Auto-Login:** User logs in automatically
6. **Dashboard:** App opens, user authenticated

## Code Locations

| Feature | File | Line(s) |
|---------|------|---------|
| OTP State | AuthModal.tsx | 35-56 |
| Email Handler | AuthModal.tsx | ~180-220 |
| Phone Handler | AuthModal.tsx | ~230-270 |
| Email View | AuthModal.tsx | 724-795 |
| Phone View | AuthModal.tsx | 796-867 |
| Register Param | authService.ts | 83-91 |

## Key Functions Reference

### Send Email OTP
```typescript
const sendEmailOTP = async () => {
  // Calls: POST /api/auth/send-otp
  // Sets: emailOtpSent = true
  // Starts: emailResendCountdown (60s)
}
```

### Verify Email OTP
```typescript
const verifyEmailOTP = async () => {
  // Validates: 6-digit input
  // Calls: POST /api/auth/verify-otp
  // On Success: Move to phone-verification OR auto-login
  // On Error: Show emailOtpError message
}
```

### Similar for Phone OTP
```typescript
const sendPhoneOTP = async () { }
const verifyPhoneOTP = async () { }
const resendPhoneOTP = async () { }
```

## Error Scenarios

| Error | Message Shown | What to Do |
|-------|---------------|-----------|
| Wrong OTP | "Invalid OTP" | Try again |
| 5 Failed Attempts | Backend returns max attempts error | Wait & resend |
| Network Error | "Verification failed. Please try again." | Retry or resend |
| Empty Input | "Please enter a valid 6-digit code" | Enter code |

## Resend Logic

- First OTP Send: Immediate
- Resend Button: Disabled for 60 seconds
- After 60s: Button enabled, user can resend
- Shows: "Resend in Xs" during countdown

## Import Notes

Added to imports:
```typescript
import { ..., MessageSquare } from 'lucide-react';
```

## Type Safety

```typescript
type ModalView = 
  | 'login'
  | 'signup-basic'
  | 'signup-social'
  | 'signup-biometric'
  | 'provisioning'
  | 'email-verification'      // NEW
  | 'phone-verification'      // NEW
```

## UI Components Used

- **Email Verification View:**
  - Mail icon (lucide-react)
  - Text input for 6-digit code
  - Send, Verify, Resend buttons
  - Error message display

- **Phone Verification View:**
  - MessageSquare icon (lucide-react)
  - Text input for 6-digit code
  - Send, Verify, Resend buttons
  - Error message display

## State Updates Pattern

```typescript
// Always use this pattern for OTP state:
setOtpData(prev => ({ 
  ...prev, 
  fieldName: value 
}));

// Example:
setOtpData(prev => ({ ...prev, emailOtp: '123456' }));
setOtpData(prev => ({ ...prev, emailOtpError: 'Invalid code' }));
```

## Loading States

- "Connect Terminal" button: Shows spinner during registration
- "Send Verification Code": Shows spinner while calling backend
- "Verify Code": Shows spinner while verifying OTP
- "Resend Code": Disabled with countdown during cooldown

## Success Indicators

✅ Email OTP Sent: Button changes, countdown starts
✅ Email OTP Verified: Auto-moves to phone-verification
✅ Phone OTP Verified: Auto-logs in
✅ Auto-Login Successful: Dashboard opens

## Backend Dependency

All OTP handlers depend on backend endpoints:
- `POST /api/auth/register` - Register with phone
- `POST /api/auth/send-otp` - Send email OTP
- `POST /api/auth/verify-otp` - Verify email code
- `POST /api/auth/resend-otp` - Resend email OTP
- `POST /api/auth/send-sms-otp` - Send SMS OTP
- `POST /api/auth/verify-sms-otp` - Verify SMS code
- `POST /api/auth/resend-sms-otp` - Resend SMS OTP
- `POST /api/auth/login` - Auto-login after verification

**All endpoints implemented and tested in previous steps ✅**

## Next Steps

After testing this step:
1. Create EmailVerification component (separate, reusable)
2. Create PhoneVerification component (separate, reusable)
3. Update login flow with verification checks
4. Add password reset with OTP
5. Add MFA with Google Authenticator
6. Add rate limiting

## Summary

| Item | Status |
|------|--------|
| Implementation | ✅ Complete |
| Testing | ⏳ Pending |
| Errors | 0 |
| Dependencies | 0 new |
| Browser Support | All modern browsers |
| Mobile Ready | Yes |
| Accessibility | Basic |

---

**Ready to test the complete flow!** 🚀
