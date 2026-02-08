# End-to-End Integration Testing - Phase 4

## Overview
Complete testing of the system covering all user and admin workflows.

---

## Manual Testing Checklist

### 1️⃣ User Registration & Login Flow

#### Test Case 1.1: Register New User
```
Steps:
1. Navigate to registration page
2. Enter email: test-user@example.com
3. Enter password: SecurePass123!
4. Enter confirm password: SecurePass123!
5. Click "Register"

Expected Result:
- User created successfully
- Redirected to login page
- Success message displayed
```

#### Test Case 1.2: Login with Valid Credentials
```
Steps:
1. Navigate to login page
2. Enter email: test-user@example.com
3. Enter password: SecurePass123!
4. Click "Login"

Expected Result:
- Login successful
- JWT token stored in localStorage
- Redirected to dashboard
- User name displayed in header
```

#### Test Case 1.3: Login with Invalid Credentials
```
Steps:
1. Enter wrong password
2. Click "Login"

Expected Result:
- Error message: "Invalid credentials"
- User remains on login page
- No token in localStorage
```

---

### 2️⃣ Scan Submission Flow

#### Test Case 2.1: Submit Valid Scan
```
Steps:
1. Navigate to ScanView
2. Enter username: test_account
3. Select platform: Instagram
4. Click "Submit Scan"

Expected Result:
- Loading state shows spinner
- Results display after 2-5 seconds
- Risk score shown (0-100)
- Verdict badge displayed
- Confidence percentage shown
```

#### Test Case 2.2: Submit with Optional Fields
```
Steps:
1. Click "Advanced Options" toggle
2. Enter followers: 1000
3. Enter posts: 50
4. Check "Verified" checkbox
5. Submit scan

Expected Result:
- All fields validated
- Scan submitted successfully
- Results include all metrics
```

#### Test Case 2.3: Validation Errors
```
Steps:
1. Leave username empty
2. Click submit

Expected Result:
- Error: "Username is required"
- Red border on field
- Submit button disabled
```

#### Test Case 2.4: Username Length Validation
```
Steps:
1. Enter username: "a" (1 character)
2. Click submit

Expected Result:
- Error: "Username must be 2-100 characters"
```

---

### 3️⃣ Scan Results Display

#### Test Case 3.1: Results Display
```
Expected Result:
- Risk score gauge with color:
  ✓ 0-25: Green
  ✓ 26-60: Yellow
  ✓ 61-85: Orange
  ✓ 86-100: Red
- Verdict badge:
  ✓ REAL: Green background
  ✓ FAKE: Red background
  ✓ SUSPICIOUS: Yellow background
  ✓ BOTNET: Orange background
- Analysis explanation displayed
- Red flags list shown
```

#### Test Case 3.2: Metrics Breakdown
```
Expected Result:
- Each detection module shown:
  ✓ Username module score
  ✓ Metadata module score
  ✓ Behavior module score
  ✓ Image module score
  ✓ Content module score
  ✓ Network module score
- Progress bar for each module
- Module details/description
```

---

### 4️⃣ Report Download

#### Test Case 4.1: Download Report
```
Steps:
1. View scan results
2. Click "Download Report" button

Expected Result:
- PDF downloaded with filename: scan_report_SCANID.pdf
- PDF contains:
  ✓ Scan summary
  ✓ Risk score
  ✓ Verdict
  ✓ Analysis breakdown
  ✓ Timestamp
```

#### Test Case 4.2: Report Format
```
Expected Result PDF contains:
- Header with app name
- Account details (username, platform)
- Risk score visualization
- Verdict (REAL/FAKE/SUSPICIOUS/BOTNET)
- Analysis explanation
- Module breakdown table
- Red flags list
- Footer with timestamp
```

---

### 5️⃣ Scan History

#### Test Case 5.1: View Scan History
```
Steps:
1. Navigate to History tab
2. View scan list

Expected Result:
- Table displays all user scans
- Columns: Username, Platform, Verdict, Risk Score, Date, Actions
- Newest scans appear first
- Each row clickable or has action buttons
```

#### Test Case 5.2: Pagination
```
Steps:
1. View scan history
2. If >10 scans, pagination shows
3. Click "Next" button

Expected Result:
- Next 10 scans displayed
- Page counter updated
- "Previous" button enabled
```

#### Test Case 5.3: Filter by Platform
```
Steps:
1. Select platform filter: "Instagram"
2. View results

Expected Result:
- Only Instagram scans shown
- Count updated
- Other platforms hidden
```

#### Test Case 5.4: Filter by Verdict
```
Steps:
1. Select verdict filter: "FAKE"
2. View results

Expected Result:
- Only FAKE scans shown
- Other verdicts hidden
```

---

### 6️⃣ Admin Scan Management

#### Test Case 6.1: View All Scans (Admin)
```
Steps:
1. Login as admin
2. Navigate to "Manage Scans"

Expected Result:
- All system scans displayed
- Table shows: User, Username, Platform, Verdict, Risk Score, Status, Actions
- Total scan count displayed
```

#### Test Case 6.2: Review Scan (Admin)
```
Steps:
1. Select a scan from list
2. Detail panel appears on right
3. Enter review notes
4. Click "Confirm"

Expected Result:
- Review notes saved
- Status changed from "Pending" to "Reviewed"
- Timestamp updated
```

#### Test Case 6.3: Override Verdict (Admin)
```
Steps:
1. Select a scan
2. Enter review notes
3. Click "Override as Fake"

Expected Result:
- Verdict changed to FAKE
- Previous verdict in audit log
- Admin name recorded
- Timestamp updated
```

#### Test Case 6.4: Delete Scan (Admin)
```
Steps:
1. Select a scan
2. Click delete/trash icon
3. Confirm deletion dialog
4. Click "Delete"

Expected Result:
- Scan removed from list
- Audit log entry created
- Success message shown
- Page refreshes
```

---

### 7️⃣ Performance Testing

#### Test Case 7.1: API Response Time
```
Expected Results:
- Login API: < 500ms
- Submit scan API: < 2000ms
- Get history API: < 500ms
- Get admin scans API: < 500ms
- Download report: < 1000ms
```

#### Test Case 7.2: Page Load Time
```
Expected Results:
- Initial page load: < 2s
- Dashboard load: < 1s
- History view load: < 1s
- Admin view load: < 1s
```

#### Test Case 7.3: Concurrent Scans
```
Steps:
1. Submit multiple scans rapidly
2. Monitor for errors

Expected Result:
- All scans process correctly
- No race conditions
- Results display accurately
```

---

### 8️⃣ Security Testing

#### Test Case 8.1: JWT Token Validation
```
Steps:
1. Login to get token
2. Try to access protected route with expired token

Expected Result:
- Redirected to login
- Error message: "Session expired"
- New login required
```

#### Test Case 8.2: Admin Route Protection
```
Steps:
1. Login as regular user
2. Try to access /admin route

Expected Result:
- Access denied
- Redirected to dashboard
- Error message displayed
```

#### Test Case 8.3: CSRF Protection
```
Steps:
1. Try to submit form from different origin

Expected Result:
- Request blocked
- CORS error in console
- Form submission fails
```

---

### 9️⃣ Error Handling

#### Test Case 9.1: Network Error
```
Steps:
1. Disconnect internet
2. Try to submit scan

Expected Result:
- Error message: "Network error"
- Offline indicator shown
- Retry button available
```

#### Test Case 9.2: Server Error (500)
```
Steps:
1. Submit invalid data that causes server error
2. Observe response

Expected Result:
- Friendly error message
- Not showing technical details
- Retry option available
```

#### Test Case 9.3: Validation Error
```
Steps:
1. Submit form with invalid data

Expected Result:
- Clear error messages
- Field highlighting
- Specific validation hints
```

---

### 🔟 Dark Mode

#### Test Case 10.1: Dark Mode Toggle
```
Steps:
1. Click dark mode toggle
2. Observe UI

Expected Result:
- All components change to dark colors
- Text remains readable
- No layout shifts
- Persists on page reload
```

---

## Automated Testing with Playwright

Create `tests/e2e/auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.fill('input[placeholder*="Confirm"]', 'TestPass123!');
    
    await page.click('button:has-text("Register")');
    
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Registration successful')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    
    await page.click('button:has-text("Login")');
    
    await expect(page).toHaveURL(/dashboard/);
    
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeTruthy();
  });

  test('should fail with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

Create `tests/e2e/scan.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Scan Submission', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button:has-text("Login")');
    await page.waitForURL(/dashboard/);
  });

  test('should submit valid scan', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    await page.fill('input[placeholder*="username"]', 'test_account');
    await page.selectOption('select', 'instagram');
    
    await page.click('button:has-text("Submit Scan")');
    
    // Wait for results
    await expect(page.locator('text=Risk Score')).toBeVisible({ timeout: 5000 });
    
    // Verify verdict badge
    const verdict = page.locator('[class*="badge"]');
    await expect(verdict).toContainText(/REAL|FAKE|SUSPICIOUS|BOTNET/);
  });

  test('should validate username', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    await page.fill('input[placeholder*="username"]', '');
    await page.click('button:has-text("Submit Scan")');
    
    await expect(page.locator('text=Username is required')).toBeVisible();
  });

  test('should download report', async ({ page, context }) => {
    // Submit scan first
    await page.goto('http://localhost:5173/dashboard');
    await page.fill('input[placeholder*="username"]', 'test_account');
    await page.selectOption('select', 'instagram');
    await page.click('button:has-text("Submit Scan")');
    
    // Wait for results
    await expect(page.locator('text=Risk Score')).toBeVisible({ timeout: 5000 });
    
    // Download report
    const downloadPromise = context.waitForEvent('download');
    await page.click('button:has-text("Download Report")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/scan_report_.*\.pdf/);
  });
});
```

Run tests:
```bash
npx playwright test

# Run specific file
npx playwright test tests/e2e/auth.spec.ts

# Run with UI
npx playwright test --ui

# Run headed (show browser)
npx playwright test --headed
```

---

## API Testing with Postman/Thunder Client

### Login Endpoint

```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

Expected Response (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "123",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

### Submit Scan Endpoint

```http
POST /api/scan/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "targetUsername": "test_account",
  "platform": "instagram",
  "followers": 1000,
  "following": 500,
  "postsCount": 50,
  "isVerified": false,
  "isPrivate": false,
  "bio": "Test bio",
  "fullName": "Test Account"
}
```

Expected Response (200):
```json
{
  "scanId": "scan_123",
  "targetUsername": "test_account",
  "platform": "instagram",
  "riskScore": 35,
  "verdict": "REAL",
  "confidence": 92,
  "explanation": "Account appears genuine...",
  "flags": ["recent_activity"],
  "breakdown": {
    "username": { "score": 20, "details": "...", "flags": [] },
    // ... other modules
  }
}
```

---

## Load Testing with k6

Create `tests/load/scan-load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Ramp-up to 10 users
    { duration: '30s', target: 50 },   // Ramp-up to 50 users
    { duration: '20s', target: 100 },  // Ramp-up to 100 users
    { duration: '10s', target: 0 },    // Ramp-down to 0 users
  ],
};

export default function () {
  // Login
  const loginResponse = http.post('http://localhost:5000/auth/login', {
    email: 'test@example.com',
    password: 'TestPass123!',
  });

  const token = loginResponse.json('data.token');

  // Submit scan
  const scanResponse = http.post(
    'http://localhost:5000/api/scan/profile',
    {
      targetUsername: `test_${__VU}_${__ITER}`,
      platform: 'instagram',
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  check(scanResponse, {
    'scan status is 200': (r) => r.status === 200,
    'scan has verdict': (r) => r.json('verdict') !== null,
  });

  sleep(1);
}
```

Run load test:
```bash
k6 run tests/load/scan-load-test.js
```

---

## Test Reporting

### Checklist Template

```markdown
## Test Execution Report

**Date**: February 8, 2024
**Tester**: QA Team
**Build Version**: 1.0.0

### Summary
- Total Tests: 50
- Passed: 48
- Failed: 2
- Pass Rate: 96%

### Failed Tests
1. Test: Admin report download
   Error: PDF generation timeout
   Status: Blocker
   Resolution: Increase timeout

2. Test: Concurrent scan handling
   Error: Race condition
   Status: Major
   Resolution: Add mutex lock

### Performance Results
| Endpoint | Avg Response | P95 | P99 |
|----------|-------------|-----|-----|
| Login | 45ms | 120ms | 200ms |
| Submit Scan | 1200ms | 2000ms | 2500ms |
| Get History | 120ms | 300ms | 500ms |

### Recommendations
1. Optimize scan processing
2. Add response caching
3. Implement query indexing
```

---

## Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] JWT token stored correctly
- [ ] Protected routes require auth
- [ ] Scan submission works
- [ ] Results display correctly
- [ ] Verdicts color-coded properly
- [ ] Report downloads successfully
- [ ] Scan history displays
- [ ] Pagination works
- [ ] Filters work (platform, verdict)
- [ ] Admin can view all scans
- [ ] Admin can review scans
- [ ] Admin can override verdicts
- [ ] Admin can delete scans
- [ ] Dark mode works
- [ ] Responsive design works
- [ ] Error messages display
- [ ] API response times acceptable
- [ ] No console errors
- [ ] No memory leaks
- [ ] All validation works
- [ ] Security checks pass

---

**Status**: ✅ E2E testing framework ready
**Next**: Security Hardening & Production Checks
