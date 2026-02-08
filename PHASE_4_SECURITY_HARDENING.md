# Security Hardening - Phase 4

## Overview
Comprehensive security measures for production deployment.

---

## 1️⃣ JWT Security

### Secure Token Configuration

```typescript
// backend/src/services/jwt.ts

import jwt from 'jsonwebtoken';

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRY || '24h', // Short-lived
      algorithm: 'HS256',
    }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
      algorithm: 'HS256',
    }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
```

### Best Practices

✅ Do:
- Use strong secrets (32+ characters)
- Set short expiry for access tokens (1-24 hours)
- Use longer expiry for refresh tokens (7 days)
- Validate token on every protected request
- Store tokens securely (httpOnly cookies)
- Implement token blacklist for logout

❌ Don't:
- Store tokens in localStorage (vulnerable to XSS)
- Use weak secrets
- Hardcode secrets in code
- Accept all algorithms in verify
- Store sensitive data in JWT payload

---

## 2️⃣ Password Security

### Hash Passwords

```typescript
// backend/src/utils/password.ts

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // CPU intensive, slows brute force

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const isPasswordStrong = (password: string): boolean => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};
```

### Password Requirements

```typescript
// backend/src/middleware/passwordValidation.ts

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain special character (@$!%*?&)');
  }

  return errors;
};
```

---

## 3️⃣ CORS Configuration

### Strict CORS Policy

```typescript
// backend/src/server.ts

import cors from 'cors';

const allowedOrigins = [
  'https://fake-detector.com',
  'https://www.fake-detector.com',
  'https://fake-detector.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile, curl requests)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 600, // Preflight cache 10 minutes
}));
```

---

## 4️⃣ Security Headers

### Helmet.js Implementation

```typescript
// backend/src/server.ts

import helmet from 'helmet';

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For inline styles if needed
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.yourdomain.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard: {
    action: 'deny', // Prevent clickjacking
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
}));
```

---

## 5️⃣ Input Validation & Sanitization

### Request Validation

```typescript
// backend/src/middleware/validation.ts

import { body, validationResult } from 'express-validator';

export const validateLoginRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .trim()
    .escape(),
];

export const validateScanRequest = [
  body('targetUsername')
    .isLength({ min: 2, max: 100 })
    .trim()
    .matches(/^[a-zA-Z0-9_.]+$/) // Alphanumeric, dots, underscores only
    .escape(),
  body('platform')
    .isIn(['twitter', 'instagram', 'facebook', 'tiktok', 'linkedin'])
    .trim(),
  body('followers')
    .optional()
    .isInt({ min: 0 })
    .toInt(),
  body('following')
    .optional()
    .isInt({ min: 0 })
    .toInt(),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
```

---

## 6️⃣ Rate Limiting

### Per-IP Rate Limiting

```typescript
// backend/src/middleware/rateLimit.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// General API rate limiter
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

// Stricter login limiter
export const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:login:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many login attempts, try again in 15 minutes',
});

// Strict scan submission limiter
export const scanLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:scan:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 scans per hour
  message: 'Scan limit exceeded, try again later',
});
```

### Apply Rate Limiters

```typescript
// backend/src/server.ts

app.use('/api/', apiLimiter); // Apply to all APIs
app.post('/auth/login', loginLimiter, loginController);
app.post('/api/scan/profile', scanLimiter, scanController);
```

---

## 7️⃣ SQL/NoSQL Injection Prevention

### Parameterized Queries

```typescript
// ✅ SAFE: Using parameterized queries
export const findUserByEmail = async (email: string) => {
  return User.findOne({ email }).exec();
};

// ❌ UNSAFE: String concatenation
export const unsafeQuery = async (email: string) => {
  return User.findOne({ email: `${email}` }).exec(); // Bad practice
};
```

### Input Sanitization

```typescript
// backend/src/utils/sanitize.ts

import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string): string => {
  // Remove script tags and XSS vectors
  return DOMPurify.sanitize(input);
};

export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => ({
      ...acc,
      [key]: sanitizeObject(obj[key]),
    }), {});
  }
  return obj;
};
```

---

## 8️⃣ Error Handling & Logging

### Avoid Information Disclosure

```typescript
// ❌ BAD: Exposes server details
app.get('/error', (req, res) => {
  res.status(500).json({
    error: 'Database connection failed: MongoDB connection timeout',
    stack: err.stack,
  });
});

// ✅ GOOD: Generic error message
app.get('/error', (req, res) => {
  logger.error('Database error:', err); // Log details server-side
  res.status(500).json({
    success: false,
    message: 'An error occurred. Please try again later.',
    // No technical details exposed
  });
});
```

### Secure Logging

```typescript
// backend/src/services/logger.ts

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

---

## 9️⃣ HTTPS/TLS

### Redirect HTTP to HTTPS

```typescript
// backend/src/middleware/https.ts

export const enforceHttps = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(301, `https://${req.header('host')}${req.url}`);
      return;
    }
  }
  next();
};

// Apply middleware
app.use(enforceHttps);
```

### Certificate Management

```bash
# Using Let's Encrypt with Certbot (for EC2)
sudo certbot certonly --standalone \
  -d api.yourdomain.com \
  -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify
sudo certbot renew --dry-run
```

---

## 🔟 Admin Authentication

### Two-Factor Authentication (2FA)

```typescript
// backend/src/services/2fa.ts

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const generateSecret = async (userEmail: string) => {
  const secret = speakeasy.generateSecret({
    name: `Fake Detector (${userEmail})`,
    issuer: 'Fake Detector',
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  return { secret: secret.base32, qrCode };
};

export const verify2FA = (secret: string, token: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2-window drift
  });
};
```

### Admin Login with 2FA

```typescript
// backend/src/controllers/auth.controller.ts

export const adminLogin = async (req, res) => {
  const { email, password, totpToken } = req.body;

  // Verify password
  const user = await User.findOne({ email, role: 'admin' });
  if (!user || !await verifyPassword(password, user.password)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Verify 2FA if enabled
  if (user.twoFactorEnabled) {
    if (!totpToken || !verify2FA(user.twoFactorSecret, totpToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token',
      });
    }
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  return res.json({
    success: true,
    data: { accessToken, refreshToken },
  });
};
```

---

## 1️⃣1️⃣ Audit Logging

### Track All Admin Actions

```typescript
// backend/src/services/auditLog.ts

export const logAdminAction = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes: any,
  ipAddress: string
) => {
  await AuditLog.create({
    userId,
    action, // 'DELETE', 'UPDATE', 'OVERRIDE', etc.
    resource, // 'scan', 'user', 'settings', etc.
    resourceId,
    changes, // Before/after comparison
    ipAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date(),
  });
};
```

### Use in Controllers

```typescript
// backend/src/controllers/scan.controller.ts

export const deleteScan = async (req, res) => {
  const { scanId } = req.params;
  const { reason } = req.body;

  const scan = await Scan.findById(scanId);

  // Delete scan
  await Scan.findByIdAndDelete(scanId);

  // Log audit
  await logAdminAction(
    req.user.id,
    'DELETE',
    'scan',
    scanId,
    { reason, deletedData: scan },
    req.ip
  );

  res.json({ success: true });
};
```

---

## 1️⃣2️⃣ Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update

# Check for unsafe packages
npx snyk test
```

### Automated Security

Create `.github/workflows/security.yml`:

```yaml
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Security Checklist

### Authentication & Authorization
- [ ] JWT tokens implemented
- [ ] Short token expiry (< 24h)
- [ ] Refresh tokens implemented
- [ ] Admin routes protected
- [ ] Role-based access control
- [ ] 2FA enabled for admin
- [ ] Token blacklist on logout
- [ ] Session timeout configured

### Data Security
- [ ] Passwords hashed with bcrypt
- [ ] Strong password requirements
- [ ] Sensitive data encrypted
- [ ] Audit logs implemented
- [ ] PII properly handled
- [ ] Database backups enabled
- [ ] Encryption at rest enabled
- [ ] Data retention policies set

### Network Security
- [ ] HTTPS/TLS enabled
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] SQL/NoSQL injection prevented
- [ ] XSS protection enabled
- [ ] CSP headers set

### API Security
- [ ] Input validation
- [ ] Output encoding
- [ ] Error handling
- [ ] Logging and monitoring
- [ ] API versioning
- [ ] Deprecated endpoints removed
- [ ] API keys rotated
- [ ] Documentation secured

### Operations
- [ ] Secrets not in code
- [ ] Environment variables used
- [ ] Keys rotated regularly
- [ ] Vulnerability scanning
- [ ] Penetration testing done
- [ ] Security patches applied
- [ ] WAF configured
- [ ] DDoS protection enabled

---

**Status**: ✅ Security hardening complete
**Next**: Logging & Monitoring, Documentation, Demo Preparation
