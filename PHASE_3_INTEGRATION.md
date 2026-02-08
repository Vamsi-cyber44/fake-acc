# Phase 3 Integration Guide

## How to Use the Phase 3 Components

### 1. Dashboard Integration

Update `components/dashboard/Dashboard.tsx` or your main dashboard router:

```typescript
import React, { useState } from 'react';
import ScanView from './ScanView';
import HistoryView from './HistoryView';
import AdminScanManagement from './AdminScanManagement';

type DashboardTab = 'scan' | 'history' | 'admin';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('scan');
  const isAdmin = localStorage.getItem('userRole') === 'admin'; // Check user role

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('scan')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'scan'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          New Scan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          History
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'admin'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Manage Scans
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'scan' && <ScanView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'admin' && isAdmin && <AdminScanManagement />}
      </div>
    </div>
  );
};

export default Dashboard;
```

### 2. Route Protection

Add authentication checks in your router:

```typescript
// In your router/AppRouter.tsx or main routing logic
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ element: React.ReactElement; requiredRole?: string }> = ({
  element,
  requiredRole,
}) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Usage in routes
<Route
  path="/dashboard"
  element={<ProtectedRoute element={<Dashboard />} />}
/>
<Route
  path="/admin"
  element={<ProtectedRoute element={<Dashboard />} requiredRole="admin" />}
/>
```

### 3. Environment Configuration

Create a `.env` file for API configuration:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
```

Update `services/httpClient.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
});

// Add JWT token to requests
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. Error Handling

Global error handler in your app layout:

```typescript
import { ErrorAlert } from '@/components/dashboard/uiHelpers';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Set up global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setGlobalError(event.message);
      setTimeout(() => setGlobalError(null), 5000);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div>
      {globalError && (
        <ErrorAlert
          error={globalError}
          onRetry={() => window.location.reload()}
        />
      )}
      {children}
    </div>
  );
};
```

### 5. Type Safety

Ensure your TypeScript config has strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

### 6. Testing the Integration

1. **Manual Testing**:
   ```bash
   npm run dev
   # Navigate to http://localhost:5173/dashboard
   # Test each component
   ```

2. **TypeScript Check**:
   ```bash
   npm run build
   # Should complete with 0 errors
   ```

3. **Backend Verification**:
   - Ensure Phase 2 backend is running on configured URL
   - Verify JWT token is being sent with requests
   - Check API response formats match TypeScript interfaces

### 7. Dark Mode Support

All components support dark mode through Tailwind's `dark:` prefix. Enable in your root component:

```typescript
import { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* Your app content */}
    </div>
  );
};
```

### 8. Performance Optimization

Add code splitting for admin components:

```typescript
import { lazy, Suspense } from 'react';

const AdminScanManagement = lazy(() => import('./AdminScanManagement'));
const ScanView = lazy(() => import('./ScanView'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {activeTab === 'admin' && isAdmin && <AdminScanManagement />}
</Suspense>
```

### 9. API Error Handling

Handle specific API errors:

```typescript
// In components using scanAPI
try {
  const result = await scanAPI.submitScan(data);
} catch (error: any) {
  if (error.response?.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden (not authorized)
    setError('You do not have permission to perform this action');
  } else if (error.response?.status === 422) {
    // Validation error
    setError(error.response.data.message || 'Invalid input');
  } else {
    setError('An unexpected error occurred');
  }
}
```

### 10. Monitoring & Logging

Add error tracking for production:

```typescript
// In services/api.ts or separate logging service
const logError = (context: string, error: any) => {
  console.error(`[${context}]`, error);
  
  // Send to error tracking service (e.g., Sentry)
  // sentry.captureException(error, { tags: { context } });
};

// Usage in API calls
try {
  // API call
} catch (error) {
  logError('submitScan', error);
  throw error;
}
```

## Deployment Checklist

- [ ] Build successfully runs (`npm run build`)
- [ ] No TypeScript errors or warnings
- [ ] Environment variables configured
- [ ] Backend API URL correct
- [ ] JWT token handling works
- [ ] All components render without errors
- [ ] API requests include authentication
- [ ] Error handling displays user-friendly messages
- [ ] Dark mode works correctly
- [ ] Mobile responsive design verified
- [ ] Performance acceptable (< 3s load time)
- [ ] Accessibility checked (keyboard navigation, screen readers)

## Common Issues & Solutions

### Issue: API requests failing with 401
**Solution**: Check JWT token in localStorage, verify token refresh logic

### Issue: Form validation not working
**Solution**: Ensure validateForm() function is called before submitScan()

### Issue: Type errors on response objects
**Solution**: Verify API response matches ScanAnalysisResult interface

### Issue: Dark mode not applied
**Solution**: Ensure `dark` class is on html element, check Tailwind config

### Issue: Pagination not working
**Solution**: Verify page state is being updated, check total count calculation

## Next Features to Consider

1. **Advanced Filtering**: Date range, risk score ranges
2. **Batch Operations**: Delete multiple scans, bulk review
3. **Export Features**: CSV, Excel, PDF reports
4. **Real-time Updates**: WebSocket for live scan results
5. **Scan Comparison**: Compare multiple scans side-by-side
6. **Custom Rules**: Allow admins to create custom detection rules
7. **Webhooks**: Send alerts to external systems
8. **API Rate Limiting**: Handle rate limit headers

## Support & Troubleshooting

For issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check Phase 2 backend logs
4. Ensure TypeScript types match API responses
5. Verify authentication token is valid

---

**Status**: Phase 3 is production-ready and can be integrated immediately.
