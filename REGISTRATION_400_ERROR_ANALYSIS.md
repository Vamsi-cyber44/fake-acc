# Registration API 400 Error - Root Cause Analysis

**Date**: February 2, 2026  
**Status**: CRITICAL - Registration flow broken due to validation mismatch

---

## Executive Summary

The registration API is returning **400 Bad Request** errors due to a **validation schema mismatch** between what the frontend sends and what the backend validates. The issue stems from a **username validation rule that's too strict** when combined with how the frontend uses user data.

---

## Root Causes Identified

### 1. **CRITICAL: Username Validation - Alphanumeric Only** ⚠️
**Location**: [backend/src/utils/validation.ts](backend/src/utils/validation.ts#L16)

```typescript
// LINE 16
username: joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username must contain only letters and numbers',
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username must not exceed 30 characters',
    'any.required': 'Username is required'
})
```

**THE PROBLEM:**
- The validation requires `.alphanum()` (letters and numbers only)
- The frontend sends `formData.name` as the username ([components/AuthModal.tsx](components/AuthModal.tsx#L257))
- User names often contain **spaces**, **hyphens**, **apostrophes**, or **special characters**
- Example: "John O'Brien" or "Jane Doe" will **fail validation** with message: *"Username must contain only letters and numbers"*

**Impact**: ANY registration with a name containing non-alphanumeric characters fails with 400 error.

---

### 2. **Frontend Sending Wrong Field Name**
**Location**: [services/authService.ts](services/authService.ts#L86-L98)

```typescript
async register(email: string, username: string, password: string, confirmPassword: string, phoneNumber?: string) {
    const payload: any = {
      email,
      username,           // ✅ Correct field name
      password,
      confirmPassword,    // ✅ Correct field name
      phoneNumber         // ✅ Correct field name (optional)
    };
```

**This is CORRECT**, but there's a semantic issue in how it's called.

---

### 3. **Frontend Using Name as Username** 
**Location**: [components/AuthModal.tsx](components/AuthModal.tsx#L234-L267)

```typescript
// LINE 257-258
const response = await authService.register(
  formData.email,
  formData.name,        // ❌ PROBLEM: Using name field as username!
  formData.password,
  formData.password,    // confirmPassword = password
  formData.phone
);
```

**THE ISSUE:**
- Frontend collects `formData.name` (full user name like "John Smith")
- Passes it as `username` parameter
- Backend validation expects username to be **alphanumeric only**
- This creates a mismatch: names ≠ usernames

**Example Failure Scenario:**
```
Frontend sends: { username: "John Smith", email: "john@example.com", ... }
Backend validation rejects: "Username must contain only letters and numbers" (because of space)
API returns: 400 Bad Request
```

---

### 4. **Validation Schema Missing phoneNumber Field**
**Location**: [backend/src/utils/validation.ts](backend/src/utils/validation.ts#L3-L22)

```typescript
export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required(),
  username: joi.string().alphanum().min(3).max(30).required()
  // ❌ MISSING: phoneNumber field is not defined in schema
});
```

**THE ISSUE:**
- Frontend tries to send `phoneNumber` in registration payload
- Validation schema doesn't explicitly define `phoneNumber`
- Joi middleware might reject unknown fields (depends on `stripUnknown` setting)
- Line 9 in [backend/src/routes/auth.routes.ts](backend/src/routes/auth.routes.ts#L9) uses `{ stripUnknown: true }`, so extra fields ARE stripped
- **But this means phoneNumber is being silently dropped** instead of properly validated

---

### 5. **Missing Validation in Schema** 
**Location**: [backend/src/utils/validation.ts](backend/src/utils/validation.ts#L3-L22)

The registration schema is missing optional field definitions:

**Current Schema:**
```typescript
export const registerSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required(),
  username: joi.string().alphanum().min(3).max(30).required()
  // Missing phoneNumber, firstName, lastName definitions
});
```

**What Frontend Actually Sends:**
```typescript
// From components/AuthModal.tsx line 257-263
authService.register(
  formData.email,
  formData.name,      // Used as username
  formData.password,
  formData.password,  // confirmPassword
  formData.phone      // phoneNumber - NOT VALIDATED!
)
```

---

### 6. **Backend Controller Redundant Validation**
**Location**: [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts#L24-L35)

```typescript
export const register = async (req: AuthRequest, res: Response) => {
  try {
    console.log('📝 Register request received:', req.body);
    const { email, username, password, confirmPassword, phoneNumber, firstName, lastName } = req.body;
    
    if (!email || !username || !password || !confirmPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required'
      });
    }
```

**ISSUE**: This validation is AFTER the Joi validation should have caught it, so this is redundant BUT it might be triggered if validation middleware fails silently.

---

## Field Requirements Analysis

### **What Backend Validates (registerSchema):**
| Field | Required | Type | Rules | Status |
|-------|----------|------|-------|--------|
| `email` | ✅ Yes | string | Valid email format | ✅ Correct |
| `username` | ✅ Yes | string | Alphanumeric only, 3-30 chars | ❌ **TOO STRICT** |
| `password` | ✅ Yes | string | Min 8 characters | ✅ Correct |
| `confirmPassword` | ✅ Yes | string | Must match password | ✅ Correct |
| `phoneNumber` | ❌ Not defined | - | - | ❌ **Missing** |
| `firstName` | ❌ Not defined | - | - | ❌ **Missing** |
| `lastName` | ❌ Not defined | - | - | ❌ **Missing** |

### **What Frontend Sends (AuthModal.tsx line 257-263):**
| Field | Value | Issue |
|-------|-------|-------|
| `email` | User input | ✅ Valid |
| `username` | `formData.name` (full name) | ❌ Contains spaces/special chars |
| `password` | User input (8+ chars) | ✅ Valid |
| `confirmPassword` | Same as password | ✅ Valid |
| `phoneNumber` | User input (optional) | ⚠️ Sent but stripped by validation |

---

## Firebase Integration Check

**Findings**: ✅ No active Firebase integration detected
- No Firebase Admin SDK imports found in backend
- No Firebase authentication methods in auth.controller.ts
- Using MongoDB with bcrypt for password hashing (Lines 195-202 in User.ts)
- Mock data fallback system in place (Lines 24-25 in auth.controller.ts)
- **Conclusion**: Firebase was likely removed when switching to mock/real DB system

---

## Mock Data System Status

**Location**: [backend/src/controllers/auth.controller.ts](backend/src/controllers/auth.controller.ts#L24-25)

```typescript
// In-memory mock store for when MongoDB is not available
let mockUsers: any[] = [];
let mockTokens: Map<string, any> = new Map();
```

**Status**: ✅ Working but bypassed by validation errors

The mock system works IF validation passes, but validation fails BEFORE reaching the mock logic.

---

## Database Connection Status

**Location**: [backend/src/config/database.ts](backend/src/config/database.ts)

- Database connection uses timeout of **10 seconds**
- Falls back to mock data gracefully if MongoDB unavailable
- Connection status is checked in register function (Line 48)
- **Current Status**: Likely failing silently, using mock data (which works but loses persistence)

---

## 400 Error Flow Diagram

```
Frontend Registration Request
         ↓
[AuthModal.tsx - finalizeClearance]
         ↓
register() with:
  email: "john@example.com"
  username: "John Smith"  ← Contains space!
  password: "SecurePass123"
  confirmPassword: "SecurePass123"
  phoneNumber: "+1234567890"
         ↓
[auth.routes.ts - validate middleware]
         ↓
[Joi registerSchema validation]
         ↓
  username.alphanum() check
         ↓
❌ FAILS: "Username must contain only letters and numbers"
         ↓
HTTP 400 Bad Request Response:
{
  success: false,
  message: "Username must contain only letters and numbers"
}
         ↓
Frontend Error Handler [AuthModal.tsx]
         ↓
Display error: "Username must contain only letters and numbers"
```

---

## Summary of All Issues

| # | Component | File | Line | Issue | Severity | Type |
|---|-----------|------|------|-------|----------|------|
| 1 | Backend Validation | validation.ts | 16 | Username `.alphanum()` too strict for names | 🔴 CRITICAL | Logic Error |
| 2 | Frontend Registration | AuthModal.tsx | 257 | Using name as username | 🔴 CRITICAL | Logic Error |
| 3 | Validation Schema | validation.ts | 3-22 | Missing phoneNumber field definition | 🟠 HIGH | Missing Validation |
| 4 | Validation Middleware | auth.routes.ts | 9 | Uses `stripUnknown: true`, drops extra fields | 🟠 HIGH | Configuration |
| 5 | Redundant Validation | auth.controller.ts | 28-35 | Duplicate validation after schema check | 🟡 LOW | Code Quality |
| 6 | Firebase Cleanup | - | - | No Firebase integration (OK, removed cleanly) | ✅ RESOLVED | N/A |

---

## Why Previous Firebase Implementation Worked

With Firebase:
- Authentication was handled externally (Firebase Auth service)
- Field validation was likely more lenient
- Username could accept display names with spaces
- Phone verification was optional

Current Implementation:
- Local authentication with Joi schema validation
- **Strict alphanumeric username requirement**
- Mismatch between frontend name field and backend username field

---

## Next Steps (Recommended Fixes)

**Priority 1 - CRITICAL (Fix immediately):**
1. Update Joi schema to allow spaces in username
2. OR create separate "displayName" field for full names
3. Validate phoneNumber in schema (make optional)

**Priority 2 - HIGH:**
1. Update validation middleware error messages
2. Add phoneNumber support to schema
3. Update User model to handle firstName/lastName

**Priority 3 - MEDIUM:**
1. Consolidate validation logic (remove redundant checks)
2. Improve error messages to be more specific
3. Add input sanitization

---

**Analysis Complete** ✅
