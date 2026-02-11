# Frontend & Backend Integration Guide

This document explains how to connect your React frontend with the Node.js backend.

## Prerequisites

1. **Backend running**: `cd backend && npm run dev` (port 8000)
2. **Frontend running**: `npm run dev` (port 3000)
3. **MongoDB**: Local or Atlas connection configured in backend/.env

## Quick Start

### 1. Update Frontend API Service

The `services/authService.ts` has been created with full integration. It:
- Handles all API calls to the backend
- Manages JWT tokens automatically
- Refreshes expired tokens
- Stores user data in localStorage
- Provides utility functions for auth state

### 2. Update Your Environment (Optional)

If backend runs on a different URL, create `.env` in frontend:
```env
VITE_API_URL=http://localhost:8000/api
```

Then update authService.ts line 3:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';
```

### 3. Update App.tsx (Authentication Wrapper)

Replace the mock authentication with real backend calls:

```typescript
import { useEffect, useState } from 'react';
import authService from './services/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    setIsAuthenticated(authService.isAuthenticated());
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      {isAuthenticated ? <Dashboard /> : <Gateway />}
    </div>
  );
}
```

### 4. Update AuthModal.tsx (Login/Register)

Replace the mock auth with real backend:

```typescript
import { useState } from 'react';
import authService from '../services/authService';

export default function AuthModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        window.location.href = '/dashboard';
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 5. Update Dashboard.tsx (Protected Routes)

```typescript
import { useEffect, useState } from 'react';
import authService from '../services/authService';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      {/* Rest of dashboard */}
    </div>
  );
}
```

## API Endpoints

### Authentication

#### Register
```typescript
const response = await authService.register(
  'user@example.com',
  'username',
  'Password123',
  'Password123'
);
// Response: { success, message, userId }
```

#### Login
```typescript
const response = await authService.login('user@example.com', 'Password123');
// Response: { success, tokens: { accessToken, refreshToken }, user }
// Tokens are automatically saved to localStorage
```

#### Verify Email
```typescript
const response = await authService.verifyEmail('token_from_email');
// Response: { success, message }
```

#### Forgot Password
```typescript
const response = await authService.forgotPassword('user@example.com');
// Response: { success, message }
```

#### Reset Password
```typescript
const response = await authService.resetPassword(
  'token_from_email',
  'newPassword123',
  'newPassword123'
);
// Response: { success, message }
```

#### Logout
```typescript
await authService.logout();
// Clears localStorage and redirects to login
```

### User Profile

#### Get Profile
```typescript
const response = await authService.getProfile();
// Response: { success, user: UserProfile }
```

#### Update Profile
```typescript
const response = await authService.updateProfile({
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://...'
});
// Response: { success, user }
```

#### Change Password
```typescript
const response = await authService.changePassword(
  'currentPassword',
  'newPassword123',
  'newPassword123'
);
// Response: { success, message }
```

### Preferences

#### Get Preferences
```typescript
const response = await authService.getPreferences();
// Response: { success, preferences: { theme, notifications, emailDigest } }
```

#### Update Preferences
```typescript
const response = await authService.updatePreferences({
  theme: 'dark',
  notifications: true,
  emailDigest: 'weekly'
});
// Response: { success, message, preferences }
```

### Scan History

#### Get Scan History
```typescript
const response = await authService.getScanHistory(limit, skip);
// Response: { success, history, total }
```

#### Add Scan Record
```typescript
const response = await authService.addScanRecord(
  'account_name',
  'instagram',
  75
);
// Response: { success, message }
```

## Token Management

### Automatic Token Refresh

Tokens are automatically refreshed when they expire. The service:
1. Checks if response is 401 (Unauthorized)
2. Uses refreshToken to get new accessToken
3. Retries the original request
4. Updates localStorage with new tokens

### Manual Token Access

```typescript
// Get current access token
const token = authService.getAccessToken();

// Check if authenticated
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get stored user data
const user = authService.getUser();
```

## Error Handling

```typescript
import authService from './services/authService';

try {
  const response = await authService.login(email, password);
  
  if (response.success) {
    // Handle success
  } else {
    // Handle validation error
    console.error(response.message);
  }
} catch (error: any) {
  // Handle network/server error
  if (error.response?.status === 401) {
    console.error('Unauthorized');
  } else if (error.response?.status === 400) {
    console.error('Bad request:', error.response.data.message);
  } else {
    console.error('Network error');
  }
}
```

## Setting Up SettingsView with Backend

Update `components/dashboard/SettingsView.tsx` to save settings to backend:

```typescript
const handleSaveProfile = async () => {
  try {
    const response = await authService.updateProfile({
      username: form.username,
      firstName: form.firstName,
      lastName: form.lastName
    });
    
    if (response.success) {
      setNotification('Profile updated successfully!');
    }
  } catch (error) {
    setNotification('Failed to update profile');
  }
};

const handleUpdateTheme = async (theme: string) => {
  try {
    await authService.updatePreferences({ theme });
    setNotification('Theme updated!');
  } catch (error) {
    setNotification('Failed to update theme');
  }
};
```

## Security Best Practices

1. **HTTPS Only**: In production, only use HTTPS
2. **Secure Storage**: Tokens in localStorage are vulnerable; use httpOnly cookies if possible
3. **Token Expiry**: Access tokens expire in 15 minutes
4. **CORS**: Backend only accepts requests from frontend domain
5. **Rate Limiting**: 100 requests per 15 minutes
6. **Email Verification**: Required before login
7. **Password Hashing**: bcryptjs with 10 salt rounds

## Troubleshooting

### Issue: CORS Error
**Solution**: Ensure backend `.env` has correct CORS_ORIGIN:
```env
CORS_ORIGIN=http://localhost:3000
```

### Issue: 401 Unauthorized
**Solution**: Token may be expired. AuthService automatically refreshes it. If refresh fails:
```typescript
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
window.location.href = '/';
```

### Issue: Email Not Sending
**Solution**: Check backend `.env` email configuration:
```env
# For Gmail:
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=app-specific-password

# For SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
```

### Issue: MongoDB Connection Failed
**Solution**: Verify MongoDB URI:
```env
# Local:
MONGODB_URI=mongodb://localhost:27017/fake-account-detector

# Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fake-account-detector
```

## Testing the Integration

### 1. Register User
```bash
# In browser console:
await authService.register('test@example.com', 'testuser', 'Pass123', 'Pass123')
```

### 2. Check Email
Look for verification email (check spam folder)

### 3. Verify Email
```bash
await authService.verifyEmail('token_from_email')
```

### 4. Login
```bash
await authService.login('test@example.com', 'Pass123')
```

### 5. Get Profile
```bash
await authService.getProfile()
```

### 6. Update Preferences
```bash
await authService.updatePreferences({ theme: 'light' })
```

## Environment Variables Checklist

### Frontend (`.env`)
- ✅ VITE_API_URL (optional, defaults to localhost:8000)

### Backend (`backend/.env`)
- ✅ NODE_ENV=development
- ✅ PORT=8000
- ✅ MONGODB_URI (local or Atlas)
- ✅ JWT_SECRET (change from default!)
- ✅ CORS_ORIGIN=http://localhost:3000
- ✅ Email service (Gmail or SMTP)
- ✅ FRONTEND_URL=http://localhost:3000

## Next Steps

1. ✅ Backend running on port 8000
2. ✅ authService.ts created with full API integration
3. 🔄 Update React components to use authService
4. 🔄 Test registration → email verification → login flow
5. 🔄 Connect dashboard to load user data from backend
6. 🔄 Update SettingsView to save to backend
7. 🔄 Add error handling and user feedback
8. 🔄 Deploy to production (change secrets!)

## Support

For issues:
1. Check browser console for errors
2. Check backend logs: `npm run dev`
3. Check MongoDB connection
4. Verify `.env` configuration
5. Test API endpoints with curl or Postman
