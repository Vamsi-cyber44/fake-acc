# 🧪 Test Commands Reference

## Quick Test Suite for Email & SMS OTP

Copy-paste these commands to test your OTP system immediately.

---

## 📧 EMAIL OTP TESTS

### Test 1: Send Email OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "email": "test@example.com",
  "expiresIn": "10 minutes"
}
```

**Check Backend Logs for OTP**: `✅ OTP created for test@example.com: 630580`

---

### Test 2: Verify Email OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"630580"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Test 3: Invalid Email OTP (Test Error Handling)
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"000000"}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "attemptsRemaining": 4
}
```

**Check Backend Logs**: `⚠️ Invalid OTP for test@example.com (attempt 1/5)`

---

### Test 4: Resend Email OTP
```bash
curl -X POST http://localhost:8000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "OTP resent to your email",
  "email": "test@example.com",
  "expiresIn": "10 minutes"
}
```

**Check Backend Logs for new OTP**: `✅ OTP created for test@example.com: 256880`

---

## 📱 SMS OTP TESTS

### Test 5: Send SMS OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","email":"test@example.com"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "SMS OTP sent to your phone",
  "phoneNumber": "9876543210",
  "expiresIn": "5 minutes"
}
```

**Check Backend Logs for OTP**: `✅ SMS OTP created for 9876543210: 845720 (expires in 5 min)`

---

### Test 6: Verify SMS OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","otp":"845720"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

**Check Backend Logs**: `✅ SMS OTP verified successfully for 9876543210`

---

### Test 7: Invalid SMS OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","otp":"111111"}'
```

**Expected Response** (Status: 400):
```json
{
  "success": false,
  "message": "Invalid or expired SMS OTP",
  "attemptsRemaining": 4
}
```

**Check Backend Logs**: `⚠️ Invalid SMS OTP for 9876543210 (attempt 1/5)`

---

### Test 8: Resend SMS OTP
```bash
curl -X POST http://localhost:8000/api/auth/resend-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","email":"test@example.com"}'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "SMS OTP resent to your phone",
  "phoneNumber": "9876543210",
  "expiresIn": "5 minutes"
}
```

**Check Backend Logs for new OTP**: `✅ SMS OTP created for 9876543210: 212082`

---

## 👤 USER REGISTRATION TESTS

### Test 9: Register with Phone Number
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "username":"newuser123",
    "password":"Password@123",
    "confirmPassword":"Password@123",
    "phoneNumber":"9988776655",
    "firstName":"John",
    "lastName":"Doe"
  }'
```

**Expected Response** (Status: 201):
```json
{
  "success": true,
  "message": "Registration successful. Check your email to verify your account.",
  "userId": "69809af7bd104994cfc5596f"
}
```

---

### Test 10: Register without Phone (Email Only)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"emailonly@example.com",
    "username":"emailuser123",
    "password":"Password@123",
    "confirmPassword":"Password@123"
  }'
```

**Expected Response** (Status: 201):
```json
{
  "success": true,
  "message": "Registration successful. Check your email to verify your account.",
  "userId": "..."
}
```

---

## 🔑 LOGIN TESTS

### Test 11: Login in Development Mode (Auto-Verified)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"Password@123"
  }'
```

**Expected Response** (Status: 200):
```json
{
  "success": true,
  "message": "Login successful",
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "user": {
    "id": "69809af7bd104994cfc5596f",
    "email": "newuser@example.com",
    "username": "newuser123",
    "roles": ["user"],
    "isMFAEnabled": false
  }
}
```

---

### Test 12: Login Before Email Verification (Production Only)
```bash
# Set NODE_ENV=production first
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"unverified@example.com",
    "password":"Password@123"
  }'
```

**Expected Response** (Status: 403):
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

---

### Test 13: Login Before Phone Verification (Production Only)
```bash
# User with phone but phone not verified
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"phonepending@example.com",
    "password":"Password@123"
  }'
```

**Expected Response** (Status: 403):
```json
{
  "success": false,
  "message": "Please verify your phone number before logging in"
}
```

---

## 🔄 COMPLETE FLOW TEST

Run these commands in sequence to test the complete workflow:

```bash
# Step 1: Register user
echo "=== STEP 1: Register ==="
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"flowtest@example.com",
    "username":"flowtester",
    "password":"Test@1234",
    "confirmPassword":"Test@1234",
    "phoneNumber":"9876543210"
  }'

# Step 2: Send email OTP
echo "=== STEP 2: Send Email OTP ==="
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"flowtest@example.com"}'
# Check logs for OTP code (e.g., 630580)

# Step 3: Verify email OTP (use OTP from logs)
echo "=== STEP 3: Verify Email OTP ==="
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"flowtest@example.com","otp":"630580"}'

# Step 4: Send SMS OTP
echo "=== STEP 4: Send SMS OTP ==="
curl -X POST http://localhost:8000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","email":"flowtest@example.com"}'
# Check logs for OTP code (e.g., 845720)

# Step 5: Verify SMS OTP (use OTP from logs)
echo "=== STEP 5: Verify SMS OTP ==="
curl -X POST http://localhost:8000/api/auth/verify-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","otp":"845720"}'

# Step 6: Login (will succeed - all verified)
echo "=== STEP 6: Login ==="
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"flowtest@example.com","password":"Test@1234"}'
```

---

## 🔧 PowerShell Test Script

```powershell
# For Windows PowerShell users

Write-Host "Testing Email OTP System..." -ForegroundColor Green

# Test Send OTP
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/send-otp" `
  -Method POST `
  -Body '{"email":"test@test.com"}' `
  -ContentType "application/json"

Write-Host "Status: $($response.StatusCode)"
$json = ConvertFrom-Json $response.Content
Write-Host "Message: $($json.message)"
Write-Host ""

Write-Host "Testing SMS OTP System..." -ForegroundColor Green

# Test Send SMS OTP
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/send-sms-otp" `
  -Method POST `
  -Body '{"phoneNumber":"9876543210"}' `
  -ContentType "application/json"

Write-Host "Status: $($response.StatusCode)"
$json = ConvertFrom-Json $response.Content
Write-Host "Message: $($json.message)"
```

---

## 📊 Test Checklist

```
Email OTP Tests:
☐ Send OTP (Status 200)
☐ Verify OTP (Status 200)
☐ Invalid OTP (Status 400, attempts shown)
☐ Resend OTP (Status 200, new OTP)

SMS OTP Tests:
☐ Send SMS OTP (Status 200)
☐ Verify SMS OTP (Status 200)
☐ Invalid SMS OTP (Status 400, attempts shown)
☐ Resend SMS OTP (Status 200, new OTP)

User Tests:
☐ Register with phone (Status 201)
☐ Register without phone (Status 201)
☐ Login after verify (Status 200)
☐ Login before verify (Status 403 in production)

Integration:
☐ Complete email→verify→login flow
☐ Complete SMS→verify→login flow
☐ Both email and SMS verification
```

---

## 🎯 Common Testing Scenarios

### Scenario 1: User Forgets OTP
```bash
# Send OTP
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Try wrong OTP 3 times
# ...3 failed attempts...

# Resend new OTP
curl -X POST http://localhost:8000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Use new OTP to verify
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"NEWOTP"}'
```

### Scenario 2: User Provides Wrong Phone Format
```bash
# Will be validated and normalized
curl -X POST http://localhost:8000/api/auth/send-sms-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+91 9876543210"}'
# Automatically converts to: 9876543210
```

### Scenario 3: User Max Attempts Exceeded
```bash
# Send OTP
curl http://localhost:8000/api/auth/send-sms-otp ...

# Try 5 wrong OTPs
curl http://localhost:8000/api/auth/verify-sms-otp ... (1/5)
curl http://localhost:8000/api/auth/verify-sms-otp ... (2/5)
curl http://localhost:8000/api/auth/verify-sms-otp ... (3/5)
curl http://localhost:8000/api/auth/verify-sms-otp ... (4/5)
curl http://localhost:8000/api/auth/verify-sms-otp ... (5/5)

# OTP now deleted, must resend
curl http://localhost:8000/api/auth/resend-sms-otp ...
```

---

## 📝 Notes

- OTPs are logged in backend console (check for "✅ OTP created")
- All tests use mock email/SMS in development (no real delivery)
- For real SMS, get Fast2SMS API key and update .env
- Development mode auto-verifies users (perfect for testing)
- Set `NODE_ENV=production` to enforce verification

---

**Last Updated**: February 2, 2026
**Version**: 1.0.0
