# Frontend Implementation Guide - Phase 3

**Target**: Build React components for Phase 2 API integration  
**Status**: Ready for development  
**API Base**: `http://localhost:8000/api`  

---

## 📋 Frontend Components To Build

### 1. ScanView.tsx - User Scan Submission Interface

**Location**: `components/dashboard/ScanView.tsx`

**Features**:
- [ ] Form with input fields:
  - [x] Username (text input, 2-100 chars)
  - [x] Platform selector (dropdown: instagram|tiktok|twitter|facebook)
  - [x] Optional fields toggle
    - [x] Followers count (number)
    - [x] Following count (number)
    - [x] Posts count (number)
    - [x] Verified checkbox
    - [x] Private checkbox
    - [x] Bio (text area)
    - [x] Full name (text input)
- [ ] Submit button with loading state
- [ ] Form validation before submission
- [ ] Error message display
- [ ] Results display:
  - [ ] Risk score gauge (0-100) with color coding
  - [ ] Verdict badge (REAL|SUSPICIOUS|BOTNET|FAKE)
  - [ ] Confidence percentage
  - [ ] Explanation text
  - [ ] Triggered indicators list
- [ ] Add to history button
- [ ] Download report button

**API Endpoint**: `POST /api/scan/profile`

**Sample Code Structure**:
```typescript
import { useState } from 'react';
import { scanProfile } from '@/services/api';

export const ScanView = () => {
  const [formData, setFormData] = useState({
    username: '',
    platform: 'instagram',
    // optional fields...
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await scanProfile(formData);
      setResults(data);
    } catch (error) {
      // show error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    // Form JSX...
  );
};
```

---

### 2. HistoryView.tsx - User Scan History

**Location**: `components/dashboard/HistoryView.tsx`

**Features**:
- [ ] Scan history list/table with columns:
  - [ ] Date (created timestamp)
  - [ ] Username (target account)
  - [ ] Platform icon
  - [ ] Verdict badge with color
  - [ ] Risk score
  - [ ] Confidence %
  - [ ] Actions (View, Download)
- [ ] Pagination controls:
  - [ ] Previous/Next buttons
  - [ ] Page indicator
  - [ ] Items per page selector
- [ ] Filtering:
  - [ ] Filter by verdict
  - [ ] Filter by platform
  - [ ] Sort by date or risk score
- [ ] Empty state message if no scans
- [ ] Loading spinner while fetching
- [ ] Click row to view full details modal

**API Endpoints**:
- `GET /api/scan/history?page=1&limit=10`
- `GET /api/scan/:scanId`
- `GET /api/scan/report/download/:scanId`

**Sample Code Structure**:
```typescript
import { useEffect, useState } from 'react';
import { getScanHistory, getScanById } from '@/services/api';

export const HistoryView = () => {
  const [scans, setScans] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadScans();
  }, [page]);
  
  const loadScans = async () => {
    try {
      const data = await getScanHistory(page, 10);
      setScans(data.scans);
      setTotal(data.pagination.total);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    // Table/List JSX...
  );
};
```

---

### 3. Admin Scan Management UI

**Location**: New file: `components/admin/AdminScanManagement.tsx`

**Features**:
- [ ] Scan list view:
  - [ ] Table with columns: Date, Username, Platform, Verdict, Risk Score, User, Actions
  - [ ] Filtering dropdown for:
    - [ ] Platform (all|instagram|tiktok|twitter|facebook)
    - [ ] Verdict (all|REAL|SUSPICIOUS|BOTNET|FAKE)
    - [ ] Status (all|pending|processing|completed|failed)
  - [ ] Sorting options (by date, risk score)
  - [ ] Pagination (default 20 per page)
  - [ ] Total count display
  - [ ] Refresh button
- [ ] Scan detail modal:
  - [ ] Full scan information
  - [ ] Input data displayed
  - [ ] Analysis results
  - [ ] Detection metrics breakdown
  - [ ] Forensic data if available
- [ ] Review panel:
  - [ ] Original verdict display
  - [ ] Override verdict dropdown (REAL|SUSPICIOUS|BOTNET|FAKE)
  - [ ] Comment text area
  - [ ] Review button (saves changes)
  - [ ] Cancel button
- [ ] Actions:
  - [ ] View details button
  - [ ] Review button
  - [ ] Download report button
  - [ ] Delete button (with confirmation)

**API Endpoints**:
- `GET /api/admin/scans?platform=X&verdict=Y&page=Z`
- `GET /api/admin/scans/:scanId`
- `POST /api/admin/scans/:scanId/review`
- `DELETE /api/admin/scans/:scanId`

**Sample Code Structure**:
```typescript
import { useState, useEffect } from 'react';
import { getAllScans, getScanDetails, reviewScan, deleteScan } from '@/services/api';

export const AdminScanManagement = () => {
  const [scans, setScans] = useState([]);
  const [filters, setFilters] = useState({
    platform: 'all',
    verdict: 'all',
    page: 1
  });
  const [selectedScan, setSelectedScan] = useState(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  
  useEffect(() => {
    loadScans();
  }, [filters]);
  
  const loadScans = async () => {
    try {
      const data = await getAllScans(filters);
      setScans(data.scans);
    } catch (error) {
      // handle error
    }
  };
  
  const handleReview = async (scanId, overrideVerdict, comments) => {
    try {
      await reviewScan(scanId, { overrideVerdict, comments });
      loadScans();
      setShowReviewPanel(false);
    } catch (error) {
      // handle error
    }
  };
  
  return (
    // Admin UI JSX...
  );
};
```

---

### 4. Update services/api.ts - Scan Endpoints

**Location**: `services/api.ts`

**New Functions to Add**:

```typescript
// User Scan Endpoints
export const scanProfile = async (data: {
  username: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook';
  followers?: number;
  following?: number;
  postsCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
  bio?: string;
  profilePictureUrl?: string;
  fullName?: string;
}) => {
  return httpClient.post('/scan/profile', data);
};

export const getScanHistory = async (page: number = 1, limit: number = 10) => {
  return httpClient.get(`/scan/history?page=${page}&limit=${limit}`);
};

export const getScanById = async (scanId: string) => {
  return httpClient.get(`/scan/${scanId}`);
};

export const downloadScanReport = async (scanId: string) => {
  return httpClient.get(`/scan/report/download/${scanId}`, {
    responseType: 'blob'
  });
};

// Admin Scan Endpoints
export const getAllScans = async (filters: {
  platform?: string;
  verdict?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return httpClient.get(`/admin/scans?${params}`);
};

export const getScanDetails = async (scanId: string) => {
  return httpClient.get(`/admin/scans/${scanId}`);
};

export const reviewScan = async (scanId: string, data: {
  overrideVerdict?: string;
  comments: string;
}) => {
  return httpClient.post(`/admin/scans/${scanId}/review`, data);
};

export const deleteScan = async (scanId: string, reason?: string) => {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return httpClient.delete(`/admin/scans/${scanId}${params}`);
};
```

---

## 🎨 UI Components Reference

### Verdict Badge Component
```typescript
interface VerdictBadgeProps {
  verdict: 'REAL' | 'SUSPICIOUS' | 'BOTNET' | 'FAKE';
}

const verdictColors = {
  REAL: { bg: 'bg-green-100', text: 'text-green-800' },
  SUSPICIOUS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  BOTNET: { bg: 'bg-red-100', text: 'text-red-800' },
  FAKE: { bg: 'bg-red-900 text-red-100', text: 'text-red-100' }
};

export const VerdictBadge = ({ verdict }: VerdictBadgeProps) => {
  const colors = verdictColors[verdict];
  return (
    <span className={`px-3 py-1 rounded-full ${colors.bg} ${colors.text}`}>
      {verdict}
    </span>
  );
};
```

### Risk Score Gauge Component
```typescript
interface RiskScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScoreGauge = ({ score, size = 'md' }: RiskScoreGaugeProps) => {
  const color = score <= 25 ? 'text-green-500' : 
                score <= 60 ? 'text-yellow-500' : 
                score <= 85 ? 'text-orange-500' : 'text-red-500';
  
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };
  
  return (
    <div className="text-center">
      <div className={`${sizes[size]} font-bold ${color}`}>{score}</div>
      <div className="text-gray-500 text-sm">Risk Score</div>
    </div>
  );
};
```

### Platform Icon Component
```typescript
type Platform = 'instagram' | 'tiktok' | 'twitter' | 'facebook';

export const PlatformIcon = ({ platform }: { platform: Platform }) => {
  const icons = {
    instagram: '📷',
    tiktok: '🎵',
    twitter: '𝕏',
    facebook: 'f'
  };
  
  return <span className="text-xl">{icons[platform]}</span>;
};
```

---

## 🔌 Integration Checklist

### Before Building
- [ ] Understand Phase 2 API structure (read PHASE_2_API_REFERENCE.md)
- [ ] Verify backend is running (`npm start` in backend folder)
- [ ] Test one API endpoint with curl or Postman
- [ ] Check authentication token format (JWT Bearer token)

### While Building
- [ ] Import API functions from `services/api.ts`
- [ ] Handle loading states (show spinner, disable buttons)
- [ ] Handle error states (show user-friendly error messages)
- [ ] Validate form inputs before submission
- [ ] Show success/error toasts after operations
- [ ] Implement pagination for list views
- [ ] Add keyboard shortcuts for common actions

### After Building
- [ ] Test all endpoints with real data
- [ ] Test error scenarios (invalid data, network errors)
- [ ] Test pagination and filtering
- [ ] Test admin-only features with non-admin accounts
- [ ] Check TypeScript errors: `npm run build`
- [ ] Verify no console errors/warnings
- [ ] Test on mobile screens (responsive design)
- [ ] Performance test (load times, animations smooth)

---

## 📊 Data Structures

### Scan Result Object
```typescript
interface ScanResult {
  scanId: string;
  userId: string;
  platform: 'instagram' | 'tiktok' | 'twitter' | 'facebook';
  targetUsername: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  inputData: {
    followers?: number;
    following?: number;
    postsCount?: number;
    isVerified?: boolean;
    isPrivate?: boolean;
    bio?: string;
    profilePictureUrl?: string;
    fullName?: string;
  };
  analysisResults: {
    riskScore: number;
    verdict: 'REAL' | 'SUSPICIOUS' | 'BOTNET' | 'FAKE';
    confidence: number;
    explanation: string;
    triggeredIndicators: string[];
  };
  createdAt: string;
  updatedAt: string;
}
```

### Scan History Item
```typescript
interface ScanHistoryItem {
  scanId: string;
  platform: string;
  targetUsername: string;
  verdict: 'REAL' | 'SUSPICIOUS' | 'BOTNET' | 'FAKE';
  riskScore: number;
  confidence: number;
  createdAt: string;
  status: string;
}
```

### Admin Scan Item
```typescript
interface AdminScanItem {
  scanId: string;
  userId: string;
  platform: string;
  targetUsername: string;
  verdict: 'REAL' | 'SUSPICIOUS' | 'BOTNET' | 'FAKE';
  riskScore: number;
  confidence: number;
  status: string;
  createdAt: string;
  userName: string;
}
```

---

## 🧪 Testing Sample Data

### Valid Scan Input
```javascript
{
  username: "real_instagram_user",
  platform: "instagram",
  followers: 5000,
  following: 1200,
  postsCount: 150,
  isVerified: true,
  isPrivate: false,
  bio: "Travel influencer • Photography lover",
  fullName: "John Smith"
}
```

### Expected Result (REAL)
```javascript
{
  scanId: "...",
  riskScore: 32,
  verdict: "REAL",
  confidence: 0.89,
  explanation: "Account demonstrates legitimate engagement patterns",
  triggeredIndicators: []
}
```

### Expected Result (SUSPICIOUS)
```javascript
{
  scanId: "...",
  riskScore: 65,
  verdict: "SUSPICIOUS",
  confidence: 0.75,
  explanation: "Detected unusual engagement patterns inconsistent with follower count",
  triggeredIndicators: [
    "Engagement-follower mismatch",
    "Unusual posting frequency",
    "Inconsistent follower growth"
  ]
}
```

---

## 🛠️ Common Tasks

### Get User's JWT Token (for testing)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Copy the token value from response
```

### Call API from Component
```typescript
import { scanProfile } from '@/services/api';

const handleSubmit = async (formData) => {
  try {
    const result = await scanProfile(formData);
    console.log('Scan result:', result.data);
  } catch (error) {
    console.error('Scan failed:', error.message);
  }
};
```

### Handle File Download (Report)
```typescript
import { downloadScanReport } from '@/services/api';

const handleDownload = async (scanId: string) => {
  try {
    const blob = await downloadScanReport(scanId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_${scanId}.pdf`;
    a.click();
  } catch (error) {
    console.error('Download failed:', error);
  }
};
```

---

## 🚀 Quick Start

1. **Review API Reference**
   - Read: `PHASE_2_API_REFERENCE.md`
   - Test: Use curl to verify endpoints work

2. **Create Components**
   - Start with ScanView (simplest)
   - Then HistoryView (list + pagination)
   - Finally AdminScanManagement (most complex)

3. **Update API Service**
   - Add new functions to `services/api.ts`
   - Test each function individually

4. **Test Integration**
   - Use existing Dashboard navigation
   - Add new routes if needed
   - Verify all flows work end-to-end

5. **Polish & Deploy**
   - Add error boundaries
   - Improve UI/UX
   - Performance optimization

---

## 📚 Reference Files

- **API Reference**: `PHASE_2_API_REFERENCE.md`
- **Implementation Details**: `PHASE_2_COMPLETION.md`
- **Project Status**: `PROJECT_STATUS_PHASE_2.md`
- **Backend Models**: `backend/src/models/Scan.ts`
- **Routes**: `backend/src/routes/scan.routes.ts`

---

**Phase 3 Ready**: ✅  
**Backend Stable**: ✅  
**Documentation Complete**: ✅  

Ready to build amazing frontend! 🚀
