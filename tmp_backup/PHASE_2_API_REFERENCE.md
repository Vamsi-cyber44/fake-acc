# Phase 2 API Reference - Scan Management

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## User Scan Endpoints

### 1. Submit Scan for Analysis
**Endpoint**: `POST /scan/profile`  
**Authentication**: Required (User JWT)  
**Rate Limit**: 10 scans per day per user  

**Request Body**:
```json
{
  "username": "target_account",
  "platform": "instagram",
  "followers": 5000,
  "following": 1200,
  "postsCount": 150,
  "isVerified": true,
  "isPrivate": false,
  "bio": "Travel influencer",
  "profilePictureUrl": "https://example.com/pic.jpg",
  "fullName": "Target Person"
}
```

**Required Fields**:
- `username` (string, 2-100 chars)
- `platform` (enum: instagram | tiktok | twitter | facebook)

**Optional Fields**:
- `followers` (number, >= 0)
- `following` (number, >= 0)
- `postsCount` (number, >= 0)
- `isVerified` (boolean)
- `isPrivate` (boolean)
- `bio` (string, max 500)
- `profilePictureUrl` (valid URI)
- `fullName` (string, max 100)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scanId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "platform": "instagram",
    "targetUsername": "target_account",
    "status": "completed",
    "inputData": {
      "followers": 5000,
      "following": 1200,
      "postsCount": 150,
      "isVerified": true,
      "isPrivate": false,
      "bio": "Travel influencer",
      "fullName": "Target Person"
    },
    "analysisResults": {
      "riskScore": 32,
      "verdict": "REAL",
      "confidence": 0.89,
      "explanation": "Account demonstrates legitimate engagement patterns consistent with real user behavior",
      "triggeredIndicators": []
    },
    "detectionMetrics": {
      "usernameScore": 85,
      "followerMetricsScore": 78,
      "verificationScore": 95,
      "postCountScore": 82,
      "bioScore": 88,
      "profileCompletenessScore": 92,
      "activityPatternScore": 75
    },
    "createdAt": "2025-02-07T16:53:00.000Z"
  }
}
```

**Error Responses**:
```json
// 400 - Validation Error
{
  "success": false,
  "message": "\"username\" must be at least 2 characters long"
}

// 401 - Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}

// 429 - Rate Limited
{
  "success": false,
  "message": "Rate limit exceeded. Maximum 10 scans per day"
}

// 500 - Server Error
{
  "success": false,
  "message": "Error processing scan"
}
```

---

### 2. Get Scan History
**Endpoint**: `GET /scan/history`  
**Authentication**: Required (User JWT)  
**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `verdict` (enum: REAL | SUSPICIOUS | BOTNET | FAKE, optional)
- `platform` (enum: instagram | tiktok | twitter | facebook, optional)

**Example**:
```
GET /scan/history?page=1&limit=20&verdict=SUSPICIOUS
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "scanId": "507f1f77bcf86cd799439011",
        "platform": "instagram",
        "targetUsername": "target_account",
        "verdict": "REAL",
        "riskScore": 32,
        "confidence": 0.89,
        "createdAt": "2025-02-07T16:53:00.000Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### 3. Get Scan Details
**Endpoint**: `GET /scan/:scanId`  
**Authentication**: Required (User JWT)  
**Path Parameters**:
- `scanId` (string, MongoDB ObjectId)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scanId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "platform": "instagram",
    "targetUsername": "target_account",
    "scanType": "deep",
    "status": "completed",
    "inputData": { ... },
    "analysisResults": { ... },
    "detectionMetrics": { ... },
    "forensicData": {
      "contentAnalysis": [
        {
          "text": "Sample content from profile",
          "reason": "Analyzed for sentiment and authenticity",
          "timestamp": "2025-02-07T16:53:00.000Z"
        }
      ],
      "suspiciousPatterns": [],
      "anomalies": []
    },
    "adminReview": null,
    "createdAt": "2025-02-07T16:53:00.000Z",
    "updatedAt": "2025-02-07T16:53:05.000Z"
  }
}
```

**Error Responses**:
```json
// 404 - Not Found
{
  "success": false,
  "message": "Scan not found"
}

// 403 - Forbidden (trying to access another user's scan)
{
  "success": false,
  "message": "You do not have permission to view this scan"
}
```

---

### 4. Download Forensic Report
**Endpoint**: `GET /scan/report/download/:scanId`  
**Authentication**: Required (User JWT)  
**Response**: PDF file download  

**Example**:
```bash
curl -X GET http://localhost:8000/api/scan/report/download/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <jwt_token>" \
  -o scan_report.pdf
```

**Error Responses**:
```json
// 404 - Not Found
{
  "success": false,
  "message": "Scan not found"
}
```

---

## Admin Scan Endpoints

### 1. List All Scans (Admin)
**Endpoint**: `GET /admin/scans`  
**Authentication**: Required (Admin JWT)  
**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `platform` (enum: instagram | tiktok | twitter | facebook, optional)
- `verdict` (enum: REAL | SUSPICIOUS | BOTNET | FAKE, optional)
- `userId` (string, MongoDB ObjectId, optional)
- `status` (enum: pending | processing | completed | failed, optional)
- `sortBy` (string: createdAt | riskScore, default: createdAt)
- `order` (enum: asc | desc, default: desc)

**Example**:
```
GET /admin/scans?platform=instagram&verdict=SUSPICIOUS&page=1&limit=20&sortBy=riskScore&order=desc
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "scanId": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439010",
        "platform": "instagram",
        "targetUsername": "target_account",
        "verdict": "SUSPICIOUS",
        "riskScore": 72,
        "confidence": 0.85,
        "status": "completed",
        "createdAt": "2025-02-07T16:53:00.000Z",
        "userName": "user@example.com"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Error Responses**:
```json
// 401 - Unauthorized
{
  "success": false,
  "message": "Unauthorized"
}

// 403 - Forbidden (not admin)
{
  "success": false,
  "message": "Admin access required"
}
```

---

### 2. Get Scan Details (Admin)
**Endpoint**: `GET /admin/scans/:scanId`  
**Authentication**: Required (Admin JWT)  
**Path Parameters**:
- `scanId` (string, MongoDB ObjectId)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "scanId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "platform": "instagram",
    "targetUsername": "target_account",
    "scanType": "deep",
    "status": "completed",
    "inputData": { ... },
    "analysisResults": {
      "riskScore": 72,
      "verdict": "SUSPICIOUS",
      "confidence": 0.85,
      "explanation": "Detected multiple red flags: unusual follower patterns, engagement anomalies",
      "triggeredIndicators": [
        "Engagement-follower mismatch",
        "Unusual posting frequency",
        "Fake follower detection"
      ]
    },
    "detectionMetrics": { ... },
    "forensicData": { ... },
    "adminReview": {
      "reviewedBy": "507f1f77bcf86cd799439009",
      "reviewedAt": "2025-02-07T17:00:00.000Z",
      "comments": "Confirmed as spam network - similar patterns found in related accounts",
      "overrideVerdict": null
    },
    "user": {
      "userId": "507f1f77bcf86cd799439010",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "user",
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    "createdAt": "2025-02-07T16:53:00.000Z",
    "updatedAt": "2025-02-07T17:00:05.000Z"
  }
}
```

---

### 3. Review Scan (Admin)
**Endpoint**: `POST /admin/scans/:scanId/review`  
**Authentication**: Required (Admin JWT)  
**Path Parameters**:
- `scanId` (string, MongoDB ObjectId)

**Request Body**:
```json
{
  "overrideVerdict": "BOTNET",
  "comments": "Additional evidence from external sources confirms bot network status. Coordinated follow/unfollow patterns detected."
}
```

**Fields**:
- `overrideVerdict` (enum: REAL | SUSPICIOUS | BOTNET | FAKE, optional)
  - If not provided, keeps original verdict
  - If provided, updates verdict and logs override
- `comments` (string, max 1000, required)
  - Admin's justification for review or override

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Scan reviewed successfully",
  "data": {
    "scanId": "507f1f77bcf86cd799439011",
    "originalVerdict": "SUSPICIOUS",
    "newVerdict": "BOTNET",
    "adminReview": {
      "reviewedBy": "507f1f77bcf86cd799439009",
      "reviewedAt": "2025-02-07T17:05:00.000Z",
      "comments": "Additional evidence from external sources confirms bot network status",
      "overrideVerdict": "BOTNET"
    }
  }
}
```

**Error Responses**:
```json
// 404 - Not Found
{
  "success": false,
  "message": "Scan not found"
}

// 400 - Invalid Override Verdict
{
  "success": false,
  "message": "Invalid override verdict"
}
```

---

### 4. Delete Scan (Admin)
**Endpoint**: `DELETE /admin/scans/:scanId`  
**Authentication**: Required (Admin JWT)  
**Path Parameters**:
- `scanId` (string, MongoDB ObjectId)

**Query Parameters**:
- `reason` (string, optional) - Reason for deletion
- `hardDelete` (boolean, default: false) - Permanently remove vs soft delete

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Scan deleted successfully",
  "data": {
    "scanId": "507f1f77bcf86cd799439011",
    "deletedAt": "2025-02-07T17:10:00.000Z",
    "deletedBy": "507f1f77bcf86cd799439009",
    "reason": "Spam test case - duplicate submission"
  }
}
```

**Error Responses**:
```json
// 404 - Not Found
{
  "success": false,
  "message": "Scan not found"
}

// 403 - Forbidden
{
  "success": false,
  "message": "Admin access required"
}
```

---

## Response Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Missing required permission (admin) or accessing unauthorized data |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Verdict Classifications

| Verdict | Risk Score | Meaning | Action |
|---------|-----------|---------|--------|
| REAL | 0-25 | Legitimate account | ✅ Safe |
| SUSPICIOUS | 26-60 | Potentially problematic | ⚠️ Caution |
| BOTNET | 61-85 | Likely automated network | 🚫 Block |
| FAKE | 86-100 | Definitely fraudulent | 🚫 Ban |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /scan/profile | 10 | Per day |
| GET /scan/history | 30 | Per minute |
| GET /scan/:scanId | 60 | Per minute |
| GET /admin/scans | 100 | Per minute |
| POST /admin/scans/:scanId/review | 50 | Per minute |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "error": "error_code_if_available",
  "details": "Additional context if available"
}
```

---

## Example cURL Commands

### Submit a Scan
```bash
curl -X POST http://localhost:8000/api/scan/profile \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "suspicious_account",
    "platform": "instagram",
    "followers": 50000,
    "following": 100,
    "postsCount": 20
  }'
```

### Get User Scan History
```bash
curl -X GET "http://localhost:8000/api/scan/history?limit=10&verdict=SUSPICIOUS" \
  -H "Authorization: Bearer <jwt_token>"
```

### Admin List All Scans
```bash
curl -X GET "http://localhost:8000/api/admin/scans?platform=instagram&verdict=BOTNET&sortBy=riskScore&order=desc" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

### Admin Review Scan with Override
```bash
curl -X POST http://localhost:8000/api/admin/scans/507f1f77bcf86cd799439011/review \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "overrideVerdict": "BOTNET",
    "comments": "Confirmed coordinated spam network through external analysis"
  }'
```

### Admin Delete Scan
```bash
curl -X DELETE "http://localhost:8000/api/admin/scans/507f1f77bcf86cd799439011?reason=test_case&hardDelete=false" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

---

## Integration Notes

1. **Frontend should store JWT** from login endpoint and include in all requests
2. **Handle rate limits gracefully** - show user message when limit reached
3. **Validate platform enum** on frontend before submission
4. **Show verdict color coding**: 
   - REAL = Green
   - SUSPICIOUS = Yellow
   - BOTNET = Red
   - FAKE = Dark Red
5. **Admin panel needs permission check** - only show admin features to admin users
6. **Download reports** through GET /scan/report/download/:scanId
7. **Poll status** for async scans (check status field)

---

**Last Updated**: February 7, 2025  
**API Version**: 2.0 (Phase 2)  
**Server**: http://localhost:8000
