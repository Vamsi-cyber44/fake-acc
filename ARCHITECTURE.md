# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER (Port 3000)                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend Application                    │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌──────────┐  ┌──────────────┐              │   │
│  │  │   Landing   │  │ Dashboard│  │ Auth Modal   │              │   │
│  │  │   Page      │  │ (Protected)│  │ (Register/  │              │   │
│  │  │             │  │           │  │  Login)     │              │   │
│  │  └─────────────┘  └──────────┘  └──────────────┘              │   │
│  │                                                                  │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │  authService.ts (API Integration Layer)               │    │   │
│  │  │  - Handles all HTTP requests to backend              │    │   │
│  │  │  - Manages JWT tokens automatically                  │    │   │
│  │  │  - Refreshes expired tokens                          │    │   │
│  │  │  - Stores tokens in localStorage                     │    │   │
│  │  │  - Provides utility functions (isAuthenticated, etc)│    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  │                              ↓                                   │   │
│  │  ┌────────────────────────────────────────────────────────┐    │   │
│  │  │  LocalStorage (Client-side persistence)              │    │   │
│  │  │  - accessToken                                        │    │   │
│  │  │  - refreshToken                                       │    │   │
│  │  │  - user (profile data)                               │    │   │
│  │  │  - settings (preferences)                            │    │   │
│  │  └────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS Requests
                          │ (axios interceptors)
                          │ Bearer Token in Header
                          ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        Node.js Server (Port 8000)                        │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Express Server (server.ts)                         │   │
│  │  - CORS Middleware (allows localhost:3000)                    │   │
│  │  - Helmet (security headers)                                 │   │
│  │  - Rate Limiting (100 req/15min)                            │   │
│  │  - Body Parser (JSON)                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Route Handlers                              │   │
│  │                                                                 │   │
│  │  ┌──────────────────────┐    ┌──────────────────────────────┐ │   │
│  │  │ /api/auth routes     │    │ /api/users routes            │ │   │
│  │  │ (auth.routes.ts)     │    │ (user.routes.ts)             │ │   │
│  │  │                      │    │                              │ │   │
│  │  │ - register           │    │ - getProfile                 │ │   │
│  │  │ - login              │    │ - updateProfile              │ │   │
│  │  │ - verify-email       │    │ - changePassword             │ │   │
│  │  │ - forgot-password    │    │ - getPreferences             │ │   │
│  │  │ - reset-password     │    │ - updatePreferences          │ │   │
│  │  │ - refresh-token      │    │ - getScanHistory             │ │   │
│  │  │ - mfa/setup          │    │ - addScanRecord              │ │   │
│  │  │ - mfa/verify         │    │ - [admin] getAllUsers        │ │   │
│  │  │ - logout             │    │ - [admin] deleteUser         │ │   │
│  │  └──────────────────────┘    └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │               Controllers (Business Logic)                       │   │
│  │                                                                 │   │
│  │  ┌──────────────────────┐    ┌──────────────────────────────┐ │   │
│  │  │ auth.controller.ts   │    │ user.controller.ts           │ │   │
│  │  │ - register()         │    │ - getProfile()               │ │   │
│  │  │ - login()            │    │ - updateProfile()            │ │   │
│  │  │ - verifyEmail()      │    │ - changePassword()           │ │   │
│  │  │ - forgotPassword()   │    │ - getScanHistory()           │ │   │
│  │  │ - resetPassword()    │    │ - addScanRecord()            │ │   │
│  │  │ - refreshToken()     │    │ - [admin] getAllUsers()      │ │   │
│  │  │ - setupMFA()         │    │ - [admin] deleteUser()       │ │   │
│  │  │ - verifyMFA()        │    └──────────────────────────────┘ │   │
│  │  │ - logout()           │                                      │ │   │
│  │  └──────────────────────┘                                      │ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │              Middleware (Security & Validation)                  │   │
│  │                                                                 │   │
│  │  ┌──────────────────────┐    ┌──────────────────────────────┐ │   │
│  │  │ auth.ts              │    │ errorHandler.ts              │ │   │
│  │  │ - authenticate()     │    │ - errorHandler()             │ │   │
│  │  │ - authorize()        │    │ - Global error handling      │ │   │
│  │  │ (verify JWT token)   │    │ - Error formatting           │ │   │
│  │  │ (check user roles)   │    │ - Logging                    │ │   │
│  │  └──────────────────────┘    └──────────────────────────────┘ │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │ validation.ts                                            │ │   │
│  │  │ - registerSchema     - loginSchema     - mfaSetupSchema │ │   │
│  │  │ - passwordResetSchema - updateProfileSchema            │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Data Layer (Models & DB)                      │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  User.ts (MongoDB Schema)                               │ │   │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │   │
│  │  │  │ Fields:                                            │ │ │   │
│  │  │  │ - email (unique)                                   │ │ │   │
│  │  │  │ - username (unique)                                │ │ │   │
│  │  │  │ - password (hashed with bcryptjs)                 │ │ │   │
│  │  │  │ - profile (firstName, lastName, avatar)           │ │ │   │
│  │  │  │ - isEmailVerified, emailVerificationToken         │ │ │   │
│  │  │  │ - isMFAEnabled, mfaMethod, mfaSecret              │ │ │   │
│  │  │  │ - roles (user/analyst/admin)                      │ │ │   │
│  │  │  │ - scanHistory (array of scan records)             │ │ │   │
│  │  │  │ - preferences (theme, notifications, digest)      │ │ │   │
│  │  │  │ - timestamps (createdAt, updatedAt)               │ │ │   │
│  │  │  │                                                    │ │ │   │
│  │  │  │ Methods:                                           │ │ │   │
│  │  │  │ - comparePassword()                                │ │ │   │
│  │  │  │ - generateVerificationToken()                      │ │ │   │
│  │  │  │ - generatePasswordResetToken()                     │ │ │   │
│  │  │  │ - generateMFABackupCodes()                         │ │ │   │
│  │  │  └────────────────────────────────────────────────────┘ │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                          ↓                                                │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   Utility Services                               │   │
│  │                                                                 │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                  │   │
│  │  │ jwt.ts           │  │ emailService.ts  │                  │   │
│  │  │ - generateToken()│  │ - sendEmail()    │                  │   │
│  │  │ - verifyToken() │  │ - sendVerifEmail()                  │   │
│  │  │ - refreshToken()│  │ - sendResetEmail()                  │   │
│  │  │ - tokenPair()  │  │ - sendMFAEmail()                    │   │
│  │  └──────────────────┘  └──────────────────┘                  │   │
│  │                                                                 │   │
│  │  ┌──────────────────┐  ┌──────────────────┐                  │   │
│  │  │ logger.ts        │  │ validation.ts    │                  │   │
│  │  │ - info()         │  │ - Joi schemas    │                  │   │
│  │  │ - error()        │  │ - Input validation                  │   │
│  │  │ - warn()         │  │                  │                  │   │
│  │  │ - debug()        │  │                  │                  │   │
│  │  └──────────────────┘  └──────────────────┘                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬──────────────────────────────────────────────┘
                          │
                          │ Mongoose ODM
                          │ (Connection pooling)
                          ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                                   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  fake-account-detector (Database)                              │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  users (Collection)                                      │ │   │
│  │  │                                                          │ │   │
│  │  │  Documents:                                            │ │   │
│  │  │  {                                                     │ │   │
│  │  │    _id: ObjectId,                                      │ │   │
│  │  │    email: "user@example.com",                          │ │   │
│  │  │    username: "username",                               │ │   │
│  │  │    password: "$2a$10$...", (hashed)                   │ │   │
│  │  │    isEmailVerified: true,                              │ │   │
│  │  │    isMFAEnabled: false,                                │ │   │
│  │  │    roles: ["user"],                                    │ │   │
│  │  │    scanHistory: [{...}, {...}],                        │ │   │
│  │  │    preferences: {...},                                 │ │   │
│  │  │    createdAt: "2024-01-15T...",                        │ │   │
│  │  │    updatedAt: "2024-01-15T..."                         │ │   │
│  │  │  }                                                     │ │   │
│  │  │                                                          │ │   │
│  │  │  Indexes:                                              │ │   │
│  │  │  - email (unique)                                      │ │   │
│  │  │  - username (unique)                                   │ │   │
│  │  │  - createdAt (for sorting)                             │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Authentication Flow

```
User Registration:
1. User enters email, username, password in frontend
2. authService.register() calls POST /api/auth/register
3. Server validates input with Joi schema
4. Controller creates User document in MongoDB
5. Server generates verification token
6. Server sends email with verification link
7. Frontend shows "Check your email" message
8. User clicks link in email → token in URL
9. authService.verifyEmail() calls POST /api/auth/verify-email
10. Server validates token against database
11. Server sets isEmailVerified = true
12. User can now login

User Login:
1. User enters email, password in AuthModal
2. authService.login() calls POST /api/auth/login
3. Server finds user by email
4. Server compares password with bcrypt
5. Server checks isEmailVerified === true
6. Server generates JWT tokens (access + refresh)
7. Server sends tokens to frontend
8. authService stores tokens in localStorage
9. axios interceptor adds token to future requests
10. Frontend redirects to /dashboard
11. Dashboard loads user profile using tokens
```

### Token Refresh Flow

```
When Access Token Expires:
1. Frontend makes API request with expired token
2. Backend returns 401 Unauthorized
3. axios interceptor catches 401 error
4. Interceptor sends refreshToken to /api/auth/refresh-token
5. Backend validates refreshToken (7 day expiry)
6. Backend generates new accessToken (15 min expiry)
7. Interceptor saves new tokens to localStorage
8. Interceptor retries original request with new token
9. Original request succeeds
10. User doesn't need to re-login
```

### User Profile Update Flow

```
User Updates Profile:
1. User changes name in Dashboard Settings
2. SettingsView calls authService.updateProfile(data)
3. axios interceptor adds Bearer token to header
4. Server receives request at PUT /api/users/profile
5. authenticate middleware verifies JWT token
6. Controller validates input with Joi schema
7. Controller updates MongoDB User document
8. Controller returns updated user data
9. Frontend shows "Profile updated" notification
10. Frontend updates local user state
```

## Security Layers

```
Layer 1: Network Security
├─ CORS (only localhost:3000 allowed)
├─ HTTPS (in production)
└─ Helmet security headers

Layer 2: Rate Limiting
├─ 100 requests per 15 minutes per IP
└─ Prevents brute force attacks

Layer 3: Input Validation
├─ Joi schemas on every endpoint
├─ Email validation
├─ Password strength validation (8+ chars)
└─ Username validation (alphanumeric, 3-30 chars)

Layer 4: Authentication
├─ JWT token-based authentication
├─ 15-minute access token expiry
├─ 7-day refresh token expiry
└─ Token stored in localStorage (frontend)

Layer 5: Authorization
├─ Role-based access control
├─ User, Analyst, Admin roles
└─ Admin routes require admin role

Layer 6: Password Security
├─ bcryptjs hashing (10 salt rounds)
├─ Never stored in plain text
└─ Pre-save middleware handles hashing

Layer 7: Session Management
├─ Account lockout after 5 failed attempts
├─ Login attempt tracking
└─ Last login timestamp

Layer 8: Data Protection
├─ Email verification required
├─ Password reset tokens (1 hour expiry)
├─ Email verification tokens (24 hour expiry)
└─ Token hashing before database storage
```

## Component Interaction

```
App.tsx (Root)
├─ Checks authService.isAuthenticated()
├─ Shows Gateway (login/register) if not authenticated
└─ Shows Dashboard if authenticated

Gateway.tsx (Public)
├─ AuthModal
│  ├─ Login tab → authService.login() → JWT tokens
│  ├─ Register tab → authService.register() → email verify
│  └─ Forgot password → authService.forgotPassword() → reset email

Dashboard.tsx (Protected)
├─ SettingsView
│  ├─ Profile section → authService.updateProfile()
│  ├─ Password section → authService.changePassword()
│  ├─ Preferences section → authService.updatePreferences()
│  └─ Other settings sections
├─ HistoryView
│  ├─ Gets scan history → authService.getScanHistory()
│  └─ Displays user's scan records
├─ ScanView
│  ├─ Performs new scan
│  └─ Records scan → authService.addScanRecord()
└─ Header
   └─ Logout button → authService.logout() → clears tokens
```

## Development Stack Summary

### Frontend (Port 3000)
- **Framework**: React 19.2.1
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.4.1
- **HTTP Client**: Axios (in authService)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage API

### Backend (Port 8000)
- **Framework**: Express 4.18.2
- **Language**: TypeScript 5.3.3
- **Database**: MongoDB + Mongoose 8.0.3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **MFA**: Speakeasy + QRCode
- **Server**: Node.js 16+

---

This architecture provides:
✅ Type-safe frontend & backend
✅ Secure JWT authentication
✅ Automatic token refresh
✅ MFA support
✅ Email verification
✅ Role-based access control
✅ Comprehensive error handling
✅ Production-ready security
