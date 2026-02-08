# Phase 4 - Logging & Monitoring Setup Guide

## 📊 Overview

This guide covers setting up comprehensive logging, error tracking, and performance monitoring for production deployment. Includes Winston logger, Sentry error tracking, and New Relic APM.

---

## 1️⃣ Winston Logger Configuration

### Installation

```bash
npm install winston winston-daily-rotate-file
```

### Backend Logger Setup

**File: `src/utils/logger.ts`**

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports (where logs are stored)
const transports = [
  // Console output
  new winston.transports.Console(),

  // Daily rotating file for errors
  new DailyRotateFile({
    level: 'error',
    filename: path.join('logs', 'errors', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.uncolorize(),
  }),

  // Daily rotating file for all logs
  new DailyRotateFile({
    level: 'info',
    filename: path.join('logs', 'app', 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.uncolorize(),
  }),

  // Daily rotating file for debug logs (dev only)
  ...(process.env.NODE_ENV === 'development'
    ? [
        new DailyRotateFile({
          level: 'debug',
          filename: path.join('logs', 'debug', 'debug-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          format: winston.format.uncolorize(),
        }),
      ]
    : []),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

export default logger;
```

### Usage Examples

```typescript
import logger from './utils/logger';

// Info logging
logger.info('User registered successfully', {
  userId: user.id,
  email: user.email,
});

// Warning logging
logger.warn('Unusual activity detected', {
  userId: userId,
  action: 'multiple_failed_logins',
  attempts: 5,
});

// Error logging
logger.error('Database connection failed', {
  error: err.message,
  code: err.code,
  timestamp: new Date(),
});

// Debug logging (dev only)
logger.debug('Processing scan submission', {
  username: username,
  platform: platform,
});
```

### Log Levels Configuration

**Development (.env.development):**
```env
LOG_LEVEL=debug
```

**Production (.env.production):**
```env
LOG_LEVEL=info
```

### Log Directory Structure

```
logs/
  app/
    app-2024-01-15.log
    app-2024-01-14.log
  errors/
    error-2024-01-15.log
    error-2024-01-14.log
  debug/
    debug-2024-01-15.log
```

---

## 2️⃣ API Request Logging Middleware

### Installation

```bash
npm install morgan
```

### Setup HTTP Request Logging

**File: `src/middleware/requestLogger.ts`**

```typescript
import morgan from 'morgan';
import logger from '../utils/logger';
import { Request, Response } from 'express';

// Custom morgan token for user ID
morgan.token('user-id', (req: Request) => {
  return (req.user as any)?.id || 'anonymous';
});

// Custom morgan token for response time
morgan.token('response-time-ms', (req: Request, res: Response) => {
  if (!res.getHeader('x-response-time')) return '';
  return res.getHeader('x-response-time') as string;
});

// Define custom format
const morganFormat = ':remote-addr - :user-id - ":method :url HTTP/:http-version" :status :response-time-ms ms - ":user-agent"';

// Create morgan middleware
export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
  skip: (req: Request, res: Response) => {
    // Skip health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Middleware to capture response time
export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: Function
) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('x-response-time', `${duration}ms`);
  });

  next();
};
```

### Apply Middleware to Express App

**File: `src/server.ts`**

```typescript
import express from 'express';
import { requestLogger, responseTimeMiddleware } from './middleware/requestLogger';
import logger from './utils/logger';

const app = express();

// Add logging middleware
app.use(responseTimeMiddleware);
app.use(requestLogger);

// Log application startup
app.listen(PORT, () => {
  logger.info('Application started', {
    port: PORT,
    environment: process.env.NODE_ENV,
    timestamp: new Date(),
  });
});
```

---

## 3️⃣ Sentry Error Tracking

### Installation

```bash
npm install @sentry/node @sentry/tracing
```

### Sentry Integration Setup

**File: `src/utils/sentry.ts`**

```typescript
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { Express } from 'express';

export function initializeSentry(app: Express) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    maxBreadcrumbs: 50,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Express({
        app,
        request: true,
        serverName: true,
        transaction: 'path',
      }),
    ],
    beforeSend(event) {
      // Filter out health check requests
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },
  });

  // The request handler must be the first middleware
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  return Sentry;
}

export function addErrorHandler(app: Express) {
  // The error handler must be registered before any other error middleware
  app.use(Sentry.Handlers.errorHandler());
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: context?.tags || {},
    extra: context?.extra || {},
  });
}

export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  Sentry.captureMessage(message, level);
}
```

### Sentry Environment Configuration

**.env.production:**
```env
SENTRY_DSN=https://key@sentry.io/project-id
```

**.env.development:**
```env
# Leave empty or use test DSN for development
SENTRY_DSN=
```

### Application Integration

**File: `src/server.ts`**

```typescript
import express from 'express';
import { initializeSentry, addErrorHandler } from './utils/sentry';
import logger from './utils/logger';

const app = express();

// Initialize Sentry early
if (process.env.SENTRY_DSN) {
  initializeSentry(app);
  logger.info('Sentry initialized');
}

// ... other middleware and routes ...

// Error handler
app.use((err: Error, req: Express.Request, res: Express.Response, next: Function) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Send to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      contexts: {
        express: {
          url: req.url,
          method: req.method,
          headers: req.headers,
        },
      },
    });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Add Sentry error handler
if (process.env.SENTRY_DSN) {
  addErrorHandler(app);
}
```

### Capturing Specific Errors

```typescript
import { captureException, captureMessage } from './utils/sentry';

// Capture authentication errors
app.post('/auth/login', async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      captureMessage('Login failed - user not found', 'warning');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    captureException(error as Error, {
      tags: { action: 'login' },
      extra: { email: req.body.email },
    });
  }
});

// Capture business logic errors
app.post('/api/scan', async (req, res) => {
  try {
    const result = await performScan(req.body.username);
  } catch (error) {
    captureException(error as Error, {
      tags: { action: 'scan', username: req.body.username },
      extra: { platform: req.body.platform },
    });
  }
});
```

---

## 4️⃣ New Relic APM Integration

### Installation

```bash
npm install newrelic
```

### New Relic Configuration

**File: `newrelic.js`** (Must be first in app)

```javascript
'use strict'

// Configure New Relic
exports.config = {
  app_name: ['Fake Account Detector'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  },
  // Transaction tracing
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    top_n: 20,
  },
  // Error collector
  error_collector: {
    enabled: true,
    capture_events: true,
    max_samples: 100,
  },
  // Custom insights
  custom_insights: {
    enabled: true,
  },
  // High security mode (disable for development)
  high_security: process.env.NODE_ENV === 'production',
  // API host
  host: 'collector.newrelic.com',
  port: 443,
  // Distributed tracing
  distributed_tracing: {
    enabled: true,
  },
};

// Exclude certain URLs from monitoring
if (process.env.NEW_RELIC_LICENSE_KEY) {
  exports.config.rules = {
    ignore: [
      '^/health$',
      '^/metrics$',
    ]
  };
}
```

### Initialize New Relic in App

**File: `src/server.ts`**

```typescript
// MUST be at the very top
import newrelic from 'newrelic';

import express from 'express';
import logger from './utils/logger';

const app = express();

// Log New Relic initialization
logger.info('New Relic monitoring initialized', {
  appName: 'Fake Account Detector',
  environment: process.env.NODE_ENV,
});

// Custom metrics for New Relic
export function recordMetric(name: string, value: number, unit: string = '') {
  if (newrelic) {
    newrelic.recordMetric(`Custom/${name}`, value);
  }
}

// Usage in routes
app.post('/api/scan', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const result = await performScan(req.body.username);
    const duration = Date.now() - startTime;
    
    // Record custom metrics
    recordMetric('Scan/Duration', duration);
    recordMetric('Scan/Success', 1);
    
    res.json(result);
  } catch (error) {
    recordMetric('Scan/Error', 1);
    res.status(500).json({ error: 'Scan failed' });
  }
});
```

### Environment Configuration

**.env.production:**
```env
NEW_RELIC_LICENSE_KEY=your-license-key
```

**.env.development:**
```env
# Leave empty to disable New Relic in development
NEW_RELIC_LICENSE_KEY=
```

---

## 5️⃣ Custom Logging Patterns

### User Activity Logging

```typescript
// Log user registration
logger.info('User registered', {
  userId: newUser.id,
  email: newUser.email,
  timestamp: new Date(),
});

// Log user login
logger.info('User login', {
  userId: user.id,
  email: user.email,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});

// Log failed login attempt
logger.warn('Failed login attempt', {
  email: req.body.email,
  reason: 'invalid_password',
  ipAddress: req.ip,
  attempts: attemptCount,
});
```

### Scan Activity Logging

```typescript
// Log scan submission
logger.info('Scan submitted', {
  userId: req.user.id,
  username: req.body.username,
  platform: req.body.platform,
  timestamp: new Date(),
});

// Log scan completion
logger.info('Scan completed', {
  scanId: scan.id,
  userId: scan.userId,
  platform: scan.platform,
  duration: `${duration}ms`,
  verdict: scan.verdict,
});

// Log scan error
logger.error('Scan failed', {
  scanId: scan.id,
  username: req.body.username,
  platform: req.body.platform,
  error: error.message,
  stack: error.stack,
});
```

### Admin Action Logging

```typescript
// Log admin actions (audit trail)
logger.info('Admin action', {
  adminId: req.user.id,
  action: 'OVERRIDE_VERDICT',
  targetScanId: scan.id,
  oldVerdict: scan.verdict,
  newVerdict: newVerdict,
  reason: req.body.reason,
  timestamp: new Date(),
});

// Log admin deletion
logger.warn('Admin deletion', {
  adminId: req.user.id,
  action: 'DELETE_SCAN',
  targetScanId: scanId,
  reason: req.body.reason,
  timestamp: new Date(),
});

// Log admin user deletion
logger.warn('Admin user deletion', {
  adminId: req.user.id,
  action: 'DELETE_USER',
  targetUserId: userId,
  timestamp: new Date(),
});
```

---

## 6️⃣ Audit Logging System

### Installation

```bash
npm install mongoose
```

### Audit Log Model

**File: `src/models/AuditLog.ts`**

```typescript
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['DELETE_SCAN', 'OVERRIDE_VERDICT', 'DELETE_USER', 'UPDATE_SETTINGS'],
      required: true,
      index: true,
    },
    targetId: {
      type: String, // Scan ID or User ID
      required: true,
    },
    targetType: {
      type: String,
      enum: ['SCAN', 'USER'],
      required: true,
    },
    details: {
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed,
      reason: String,
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true }
);

// Create index for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
```

### Audit Logging Service

**File: `src/services/auditLogger.ts`**

```typescript
import { AuditLog } from '../models/AuditLog';
import logger from '../utils/logger';

export async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  targetType: string,
  details: any,
  ipAddress: string,
  userAgent: string
) {
  try {
    const auditLog = new AuditLog({
      adminId,
      action,
      targetId,
      targetType,
      details,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
    });

    await auditLog.save();

    // Also log to Winston
    logger.info('Audit log created', {
      adminId,
      action,
      targetId,
      ipAddress,
    });
  } catch (error) {
    logger.error('Failed to create audit log', {
      error: (error as Error).message,
      adminId,
      action,
    });
  }
}

// Usage in routes
app.delete('/api/admin/scans/:scanId', adminOnly, async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.scanId);

    // Log the action
    await logAdminAction(
      req.user.id,
      'DELETE_SCAN',
      req.params.scanId,
      'SCAN',
      {
        platform: scan.platform,
        username: scan.username,
      },
      req.ip!,
      req.get('user-agent')!
    );

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});
```

---

## 7️⃣ Log Monitoring & Analysis

### View Recent Logs

```bash
# View all logs
tail -f logs/app/app-*.log

# View error logs only
tail -f logs/errors/error-*.log

# View debug logs
tail -f logs/debug/debug-*.log

# Search logs
grep "User registered" logs/app/app-*.log

# Get error count
grep -c "error" logs/errors/error-*.log
```

### Log Analysis Commands

```bash
# Count errors by type
grep "error" logs/errors/error-*.log | cut -d':' -f2 | sort | uniq -c | sort -rn

# Find slow API requests
grep "ms" logs/app/app-*.log | grep -oP '\d+ms' | sort -n | tail -20

# Get request summary
cat logs/app/app-*.log | grep "HTTP" | awk '{print $6}' | sort | uniq -c

# Find failed authentications
grep "Failed login" logs/app/app-*.log | wc -l
```

### Set Up Log Rotation

The Winston configuration already includes daily log rotation:
- Logs rotate daily
- Old logs kept for 30 days (errors) / 7 days (debug)
- Max file size: 20MB before rotation
- Automatic cleanup of old files

### Monitor Log Directory Size

```bash
# Check current log size
du -sh logs/

# Check individual log sizes
du -sh logs/app/
du -sh logs/errors/
du -sh logs/debug/
```

---

## 8️⃣ Monitoring Dashboards

### Create Monitoring Dashboard

Create a simple monitoring page to view system health:

**File: `src/routes/monitoring.routes.ts`**

```typescript
import express from 'express';
import { AuditLog } from '../models/AuditLog';
import logger from '../utils/logger';

const router = express.Router();

// Admin only middleware
const adminOnly = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
};

// System health endpoint
router.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
  });
});

// Recent logs endpoint
router.get('/logs/recent', adminOnly, async (req, res) => {
  const lines = parseInt(req.query.lines as string) || 100;
  
  // Read from log file
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const logPath = path.join('logs', 'app', `app-${new Date().toISOString().split('T')[0]}.log`);
    const content = await fs.readFile(logPath, 'utf-8');
    const logLines = content.split('\n').slice(-lines);
    
    res.json({ logs: logLines });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// Audit logs endpoint
router.get('/logs/audit', adminOnly, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  
  try {
    const auditLogs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('adminId', 'email');
    
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Error summary endpoint
router.get('/logs/errors', adminOnly, async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const logPath = path.join('logs', 'errors', `error-${new Date().toISOString().split('T')[0]}.log`);
    const content = await fs.readFile(logPath, 'utf-8');
    const errorCount = content.split('\n').filter(l => l.length > 0).length;
    
    res.json({
      date: new Date().toISOString().split('T')[0],
      errorCount,
      errors: content.split('\n').slice(-20), // Last 20 errors
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

export default router;
```

---

## 9️⃣ Performance Monitoring

### Track Key Metrics

```typescript
// Track database query performance
import { performance } from 'perf_hooks';

export async function trackQuery<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    logger.debug(`Query: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
    });
    
    // Alert if slow
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${name}`, {
        duration: `${duration.toFixed(2)}ms`,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`Query failed: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      error: (error as Error).message,
    });
    throw error;
  }
}

// Usage
const users = await trackQuery('get-all-users', async () => {
  return User.find();
});
```

### Response Time Tracking

```typescript
// Middleware to track response times
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        path: req.path,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // Track metrics
    recordMetric(`Response/Duration/${req.method}/${req.path}`, duration);
  });

  next();
});
```

---

## 🔟 Alerting & Notifications

### Alert Conditions

```typescript
// Alert on high error rate
const errorCount = logContent.split('\n').filter(l => l.includes('error')).length;
if (errorCount > 10) {
  logger.error('High error rate detected', {
    errorCount,
    threshold: 10,
  });
  // Send to Slack/PagerDuty
}

// Alert on slow database
const avgQueryTime = getTotalQueryTime() / queryCount;
if (avgQueryTime > 500) {
  logger.warn('Slow database detected', {
    avgQueryTime: `${avgQueryTime.toFixed(2)}ms`,
    threshold: 500,
  });
}

// Alert on memory usage
const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
if (memUsage > 500) { // 500MB
  logger.warn('High memory usage', {
    heapUsed: `${memUsage.toFixed(2)}MB`,
    threshold: 500,
  });
}
```

---

## 1️⃣1️⃣ Best Practices

### Logging Do's
✅ Log important business events
✅ Log authentication attempts (success & failure)
✅ Log admin actions with context
✅ Log errors with stack traces
✅ Use appropriate log levels
✅ Include timestamps and context
✅ Redact sensitive data (passwords, tokens)
✅ Use structured logging

### Logging Don'ts
❌ Log sensitive data (passwords, credit cards, SSN)
❌ Log passwords in any form
❌ Log full request bodies with user input
❌ Use console.log in production
❌ Log too verbosely in production
❌ Store logs indefinitely
❌ Ignore error logs
❌ Log without context

### Security Logging
```typescript
// ✅ DO: Log with redaction
logger.info('User login', {
  userId: user.id,
  email: user.email.split('@')[0] + '@***', // Redacted
  timestamp: new Date(),
});

// ❌ DON'T: Log sensitive data
logger.info('User login', {
  userId: user.id,
  email: user.email, // Not redacted
  password: user.password, // NEVER log password
});
```

---

## 1️⃣2️⃣ Setup Checklist

### Development Environment
- [ ] Install Winston logger
- [ ] Create logger configuration
- [ ] Add request logging middleware
- [ ] Implement custom logging patterns
- [ ] Test log rotation
- [ ] Verify log files are created

### Production Setup
- [ ] Install Winston logger
- [ ] Install Sentry client
- [ ] Install New Relic agent
- [ ] Configure all services
- [ ] Set environment variables
- [ ] Test error capture (Sentry)
- [ ] Test metrics (New Relic)
- [ ] Set up alerting
- [ ] Create monitoring dashboard
- [ ] Test audit logging

### Monitoring Dashboard
- [ ] Create health endpoint
- [ ] Create logs endpoint
- [ ] Create audit logs endpoint
- [ ] Create error summary endpoint
- [ ] Test all endpoints
- [ ] Secure with authentication

### Maintenance
- [ ] Daily log review
- [ ] Weekly error analysis
- [ ] Monthly performance review
- [ ] Check log storage usage
- [ ] Verify alert thresholds
- [ ] Test log recovery
- [ ] Document procedures

---

## Summary

**Phase 4 - Logging & Monitoring Complete ✅**

- ✅ Winston logger configured for file-based logging
- ✅ Request logging with Morgan
- ✅ Sentry error tracking integrated
- ✅ New Relic APM monitoring
- ✅ Audit logging for admin actions
- ✅ Performance metrics tracking
- ✅ Monitoring dashboard endpoints
- ✅ Alert conditions defined
- ✅ Log rotation and retention
- ✅ Best practices documented

**Next: Documentation Finalization & Demo Preparation**
