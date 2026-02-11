# Backend Deployment Guide - Phase 4

## Overview
This guide covers deploying the Node.js/Express backend to production cloud platforms.

## Option 1: Deploy to Railway.app (Recommended - Easiest)

### Step 1: Prepare Backend

1. Ensure `package.json` has start script:
   ```json
   "scripts": {
     "start": "node src/server.ts",
     "dev": "ts-node src/server.ts",
     "build": "tsc"
   }
   ```

2. Create `tsconfig.json` in backend:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

3. Create `.railwayignore`:
   ```
   node_modules/
   dist/
   .git/
   .env.development
   .env.example
   README.md
   ```

### Step 2: Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub account
3. Create new project

### Step 3: Connect Git Repository

1. Click "New Project" → "Deploy from GitHub"
2. Select your repository
3. Select backend folder (if monorepo)
4. Click "Deploy"

### Step 4: Configure Environment Variables

1. In Railway dashboard, go to "Variables"
2. Add all variables from `.env.production`:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRY`
   - `JWT_REFRESH_SECRET`
   - `CORS_ORIGIN`
   - `SERVER_PORT=8000`
   - etc.

### Step 5: Deploy

1. Railway auto-deploys on git push
2. Watch logs in dashboard
3. When "Railway assigned a public URL", note it
4. Update frontend `VITE_API_BASE_URL` to this URL

### Verification

```bash
curl https://your-railway-url/health
# Expected response: { "status": "ok" }
```

---

## Option 2: Deploy to Heroku

### Step 1: Install Heroku CLI

```bash
# Windows
choco install heroku-cli

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login to Heroku

```bash
heroku login
# Opens browser for authentication
```

### Step 3: Create Heroku App

```bash
heroku create your-app-name

# Example
heroku create fake-detector-api
```

### Step 4: Add Buildpack

```bash
heroku buildpacks:add heroku/nodejs
```

### Step 5: Set Environment Variables

```bash
heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set JWT_EXPIRY="24h"
heroku config:set CORS_ORIGIN="https://your-frontend-url"
# Add other variables...
```

### Step 6: Create Procfile

In backend root directory, create `Procfile`:
```
web: npm start
```

### Step 7: Deploy

```bash
# Deploy
git push heroku main

# Or if on different branch
git push heroku your-branch:main

# View logs
heroku logs --tail

# Test health endpoint
curl https://your-app-name.herokuapp.com/health
```

---

## Option 3: Deploy to AWS EC2

### Step 1: Create EC2 Instance

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to EC2
3. Click "Launch Instance"
4. Select:
   - **AMI**: Ubuntu 20.04 LTS (free tier)
   - **Instance Type**: t2.micro (free tier)
5. Configure:
   - Security groups: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (custom)
6. Create key pair and download `.pem` file
7. Launch instance

### Step 2: Connect to Instance

```bash
# Change permissions
chmod 400 your-key-pair.pem

# SSH into instance
ssh -i your-key-pair.pem ubuntu@your-instance-ip
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx (reverse proxy)
sudo apt install -y nginx
```

### Step 4: Clone & Setup Backend

```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Step 5: Configure Environment

```bash
# Create .env file
sudo nano .env.production

# Paste environment variables (see .env.production template)
# Save: Ctrl+O, Enter, Ctrl+X
```

### Step 6: Setup PM2

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'fake-detector-api',
      script: './dist/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log'
    }
  ]
};
```

### Step 7: Configure Nginx

Edit `/etc/nginx/sites-available/default`:
```nginx
upstream fake_detector_api {
  server localhost:8000;
}

server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name api.yourdomain.com;

  location / {
    proxy_pass http://fake_detector_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Reload nginx:
```bash
sudo systemctl reload nginx
```

### Step 8: Start Application

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config for auto-restart
pm2 startup
pm2 save

# View logs
pm2 logs
```

### Step 9: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Cert auto-renews every 90 days
```

### Step 10: Monitor

```bash
# Monitor CPU/memory
pm2 monit

# View all processes
pm2 list

# Restart app if needed
pm2 restart fake-detector-api
```

---

## Option 4: Docker Deployment

### Step 1: Create Dockerfile

Create `Dockerfile` in backend root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8000

# Start app
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore

```
node_modules
dist
.git
.env.development
.env.example
README.md
```

### Step 3: Build & Run Locally

```bash
# Build image
docker build -t fake-detector-api:latest .

# Run container
docker run -d \
  -p 8000:8000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-secret" \
  --name fake-detector-api \
  fake-detector-api:latest

# View logs
docker logs -f fake-detector-api

# Stop container
docker stop fake-detector-api
```

### Step 4: Deploy to Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image
docker tag fake-detector-api:latest username/fake-detector-api:latest

# Push to registry
docker push username/fake-detector-api:latest

# Pull and run on production
docker pull username/fake-detector-api:latest
docker run -d \
  -p 8000:8000 \
  -e MONGODB_URI="your-mongodb-uri" \
  --name fake-detector-api \
  username/fake-detector-api:latest
```

---

## Post-Deployment Verification

### Health Check

```bash
curl https://your-backend-url/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-02-08T10:30:00Z",
  "environment": "production"
}
```

### Test API Endpoint

```bash
# Login endpoint
curl -X POST https://your-backend-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword"
  }'

# Should return token or error
```

### Monitor Logs

- Railway: View in dashboard
- Heroku: `heroku logs --tail`
- EC2: `pm2 logs`
- Docker: `docker logs -f container-name`

---

## Update Frontend API URL

In frontend `.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-deployed-url
```

Rebuild frontend:
```bash
npm run build
```

---

## Performance Optimization

### API Response Times
- Target: < 500ms for most endpoints
- Monitor with:
  ```javascript
  // In middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${duration}ms`);
    });
    next();
  });
  ```

### Database Optimization
- Enable indexes (already done in setup)
- Use connection pooling
- Implement query caching

### Auto-scaling
- Railway: Automatic
- Heroku: Use Dyno scaling
- EC2: Use Auto Scaling Groups
- Docker: Use container orchestration (Kubernetes)

---

## Security Hardening

```javascript
// In server.ts
import helmet from 'helmet';
import cors from 'cors';

// Apply security headers
app.use(helmet());

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// HTTPS redirect
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## Rollback Plan

### Railway
```
Click "Rollback" on previous deployment
```

### Heroku
```bash
heroku releases
heroku rollback v123
```

### EC2
```bash
pm2 revert
# or
git reset --hard previous-commit
npm run build
pm2 restart all
```

---

## Deployment Checklist

- [ ] Backend code ready
- [ ] Environment variables configured
- [ ] MongoDB Atlas connected
- [ ] Health endpoint working
- [ ] API endpoints tested
- [ ] CORS configured correctly
- [ ] JWT tokens working
- [ ] SSL/HTTPS enabled
- [ ] Logs accessible
- [ ] Monitoring setup
- [ ] Auto-restart configured
- [ ] Backup enabled
- [ ] Frontend points to correct API URL

---

**Status**: ✅ Ready for backend deployment
**Next**: Frontend Deployment Guide
