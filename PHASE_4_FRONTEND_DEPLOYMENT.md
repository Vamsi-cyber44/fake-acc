# Frontend Deployment Guide - Phase 4

## Overview
This guide covers deploying the React/Vite frontend to production platforms.

## Pre-Deployment Checklist

- [ ] Backend API deployed and URL known
- [ ] CORS configured on backend
- [ ] Frontend environment variables updated
- [ ] Build runs without errors
- [ ] All tests pass
- [ ] TypeScript strict mode errors resolved

---

## Option 1: Vercel (Recommended - Zero Config)

### Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Import Project

1. Click "Add New Project"
2. Select "Import Git Repository"
3. Choose your GitHub repository
4. Select frontend folder (if monorepo):
   - Root: ./
   - Framework: Vite
   - Output: dist

### Step 3: Configure Environment

1. In "Environment Variables", add:
   ```
   VITE_API_BASE_URL=https://your-backend-url
   VITE_API_TIMEOUT=30000
   VITE_ENVIRONMENT=production
   VITE_APP_VERSION=1.0.0
   ```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel auto-builds and deploys
3. Get public URL (e.g., `fake-detector.vercel.app`)

### Step 5: Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your domain (e.g., `fake-detector.com`)
3. Follow DNS configuration
4. SSL auto-enabled

### Verification

```bash
curl https://your-vercel-url
# Should return HTML homepage
```

---

## Option 2: Netlify

### Step 1: Create Netlify Account

1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize Netlify

### Step 2: Connect Repository

1. Click "Add new site"
2. Select "Import an existing project"
3. Choose GitHub
4. Select your repository

### Step 3: Configure Build

1. Set build command: `npm run build`
2. Set publish directory: `dist`
3. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-url
   VITE_API_TIMEOUT=30000
   ```

### Step 4: Deploy

1. Click "Deploy site"
2. Netlify builds and deploys
3. Get URL (e.g., `fake-detector-netlify.app`)

### Custom Domain

1. Domain settings
2. Add custom domain
3. Configure DNS
4. SSL auto-enabled

---

## Option 3: GitHub Pages

### Step 1: Create GitHub Pages Site

1. Ensure repo is public
2. Go to repository settings
3. Enable GitHub Pages

### Step 2: Configure

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 3: Add Repository Secret

1. Go to Settings → Secrets
2. Add `API_BASE_URL` with your backend URL

### Step 4: Push & Deploy

```bash
git push origin main
# GitHub Actions automatically builds and deploys
```

Your site is now at: `https://username.github.io/repo-name`

---

## Option 4: AWS S3 + CloudFront

### Step 1: Create S3 Bucket

1. Go to AWS S3
2. Click "Create bucket"
3. Name: `fake-detector-frontend`
4. Uncheck "Block all public access"
5. Create bucket

### Step 2: Enable Static Website Hosting

1. Select bucket
2. Go to Properties
3. Enable "Static website hosting"
4. Index document: `index.html`
5. Error document: `index.html`

### Step 3: Bucket Policy

Add bucket policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fake-detector-frontend/*"
    }
  ]
}
```

### Step 4: Build & Upload

```bash
# Build
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS
aws configure
# Enter Access Key, Secret Key, Region

# Sync files
aws s3 sync dist/ s3://fake-detector-frontend/ --delete

# Invalidate CloudFront cache (if using CDN)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Step 5: CloudFront CDN (Optional)

1. Go to CloudFront
2. Create distribution
3. Origin: S3 bucket URL
4. Enable compression
5. Create distribution
6. Note distribution domain
7. Update DNS CNAME to CloudFront domain

---

## Option 5: Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in frontend root:

```dockerfile
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create nginx.conf

```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name _;

    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
    }

    location /api {
      proxy_pass http://backend-api:8000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
    }
  }
}
```

### Step 3: Build & Run

```bash
# Build
docker build \
  --build-arg VITE_API_BASE_URL="https://your-backend-url" \
  -t fake-detector-frontend:latest .

# Run
docker run -d \
  -p 80:80 \
  --name fake-detector-frontend \
  fake-detector-frontend:latest

# Test
curl http://localhost
```

---

## Environment Configuration

### Development (.env.development)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=development
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=production
VITE_APP_VERSION=1.0.0
```

### Build & Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash

# Build
npm run build

# Check build success
if [ $? -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
# netlify deploy --prod --dir=dist

# Or deploy to S3
# aws s3 sync dist/ s3://bucket-name/ --delete

echo "✓ Deployment successful!"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Continuous Deployment

### Automatic Deployment on Push

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
      - '.github/workflows/deploy.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

Add secrets to GitHub:
1. Settings → Secrets → New repository secret
2. Add: `API_BASE_URL`, `VERCEL_TOKEN`, etc.

---

## Performance Optimization

### 1. Enable Compression

Vercel/Netlify: Automatic ✓

S3/CloudFront:
```bash
# Enable gzip
aws s3 cp dist/assets/index.js s3://bucket/ \
  --content-encoding gzip \
  --content-type "application/javascript"
```

### 2. Cache Headers

In `vite.config.ts`:
```typescript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'lucide': ['lucide-react'],
        }
      }
    }
  }
}
```

### 3. Code Splitting

Already configured in Vite build. Check bundle:
```bash
npm run build
# View dist/ size
```

### 4. Image Optimization

- Use WebP format
- Compress images
- Lazy load images
- Use CDN for images

---

## Security Headers

### For Vercel/Netlify

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### For S3/CloudFront

Use CloudFront response headers:
1. Go to CloudFront distribution
2. Create response headers policy
3. Add security headers
4. Attach to behavior

---

## Monitoring & Analytics

### Vercel Analytics

1. Link project to Vercel
2. Enable Web Analytics
3. View dashboard

### Custom Monitoring

Add to frontend:
```typescript
// services/monitoring.ts
export const trackEvent = (name: string, data?: any) => {
  if (window.gtag) {
    window.gtag('event', name, data);
  }
};

export const trackPageView = (path: string) => {
  trackEvent('page_view', { page_path: path });
};
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
npm ci
npm cache clean --force

# Rebuild
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### API Requests Fail
- Check `VITE_API_BASE_URL` is correct
- Verify backend CORS allows frontend domain
- Check network tab in DevTools

### Page Not Found on Reload
- Ensure SPA routing is configured
- All requests should fallback to `index.html`

### Slow Performance
- Check bundle size: `npm run build`
- Enable compression
- Use CDN for static assets
- Optimize images

---

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Environment variables configured
- [ ] Build runs successfully
- [ ] No TypeScript errors
- [ ] No console errors in DevTools
- [ ] API calls work from deployed frontend
- [ ] Forms submit successfully
- [ ] Reports download correctly
- [ ] Responsive design works on mobile
- [ ] Dark mode works
- [ ] Performance acceptable (< 3s load)
- [ ] SSL/HTTPS enabled
- [ ] Monitoring/analytics working

---

## Post-Deployment

### Monitor Errors
- Check browser console errors
- Monitor API response times
- Watch error logs

### Performance Metrics
- Lighthouse score target: 80+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s

### User Feedback
- Collect bug reports
- Monitor usage patterns
- Iterate on improvements

---

**Status**: ✅ Frontend deployment ready
**Next**: E2E Integration Testing
