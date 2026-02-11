# MongoDB Atlas Setup Guide - Phase 4

## Overview
This guide walks through setting up a production-grade MongoDB database using MongoDB Atlas cloud service.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Create account with:
   - Email
   - Password
   - Organization name
4. Verify email address
5. Accept terms

## Step 2: Create a Cluster

1. Click "Create a Deployment"
2. Select **Serverless** for free tier or **M0 Sandbox** for testing
3. Choose provider: AWS/Google Cloud/Azure
4. Select region closest to your users
5. Click "Create"
   - Cluster creation takes 5-10 minutes

## Step 3: Configure Security

### Network Access
1. Go to "Network Access" in sidebar
2. Click "Add IP Address"
3. Choose:
   - **For Development**: Add your IP address
   - **For Production**: Add `0.0.0.0/0` (allow all, or specific IPs)
4. Click "Confirm"

### Database Users
1. Go to "Database Access"
2. Click "Add New Database User"
3. Fill in:
   - **Username**: `fake-detector-user`
   - **Password**: Generate strong password (32+ chars)
   - **Built-in Role**: Select `readWriteAnyDatabase`
4. Click "Add User"
5. Save credentials securely

## Step 4: Get Connection String

1. Click "Connect" button on cluster
2. Choose "Drivers"
3. Select **Node.js** and version **4.x**
4. Copy connection string
5. Replace placeholders:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/<database>?retryWrites=true&w=majority
   ```
   Replace:
   - `<username>`: your database user
   - `<password>`: your database password
   - `<database>`: `fake-account-detector`

## Step 5: Update Environment Variables

Add to `.env.production`:
```env
MONGODB_URI=mongodb+srv://fake-detector-user:YOUR_PASSWORD@cluster.mongodb.net/fake-account-detector?retryWrites=true&w=majority
```

## Step 6: Create Database & Collections

### Option A: Using MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. In Atlas, click "Connect" → "Compass"
3. Copy connection string
4. Paste in Compass
5. Click "Connect"
6. Create database:
   - Right-click "Databases"
   - New Database
   - Name: `fake-account-detector`
   - Collection: `users`
7. Create more collections:
   - `scans`
   - `scan_results`
   - `audit_logs`
   - `refresh_tokens`

### Option B: Using Node.js Script

Create `scripts/setup-db.js`:

```javascript
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI;

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Create collections
    const collections = ['users', 'scans', 'scan_results', 'audit_logs', 'refresh_tokens'];
    
    for (const collectionName of collections) {
      const collection = await mongoose.connection.db.createCollection(collectionName);
      console.log(`✓ Created collection: ${collectionName}`);
    }

    // Create indexes
    const db = mongoose.connection.db;
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    console.log('✓ Created users indexes');

    // Scans indexes
    await db.collection('scans').createIndex({ userId: 1 });
    await db.collection('scans').createIndex({ createdAt: -1 });
    await db.collection('scans').createIndex({ status: 1 });
    console.log('✓ Created scans indexes');

    // Scan results indexes
    await db.collection('scan_results').createIndex({ scanId: 1 }, { unique: true });
    await db.collection('scan_results').createIndex({ verdict: 1 });
    console.log('✓ Created scan_results indexes');

    // Audit logs indexes
    await db.collection('audit_logs').createIndex({ userId: 1 });
    await db.collection('audit_logs').createIndex({ action: 1 });
    await db.collection('audit_logs').createIndex({ createdAt: -1 });
    console.log('✓ Created audit_logs indexes');

    console.log('\n✓ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
```

Run: `node scripts/setup-db.js`

## Step 7: Enable Backup

1. In Atlas, go to "Backup" section
2. Select **Continuous Backup** (recommended)
3. Set retention to 35 days
4. Enable point-in-time restore

## Step 8: Enable Monitoring

1. Go to "Monitoring" tab
2. Enable:
   - Operational metrics
   - Real-time data monitoring
   - Performance advisors
3. Set up alerts for:
   - High CPU usage
   - High memory usage
   - Slow queries
   - Connection errors

## Step 9: Test Connection

Create `scripts/test-connection.js`:

```javascript
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connection successful!');
    
    // Test write
    const db = mongoose.connection.db;
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✓ Write test successful:', result.insertedId);
    
    // Test read
    const doc = await testCollection.findOne({ _id: result.insertedId });
    console.log('✓ Read test successful:', doc);
    
    // Cleanup
    await testCollection.deleteOne({ _id: result.insertedId });
    
    await mongoose.disconnect();
    console.log('✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run: `node scripts/test-connection.js`

## Collections Schema Reference

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (user|admin),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

### Scans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  targetUsername: String,
  platform: String,
  status: String (pending|completed|failed),
  createdAt: Date,
  completedAt: Date,
  flags: [String],
  riskScore: Number
}
```

### Scan Results Collection
```javascript
{
  _id: ObjectId,
  scanId: ObjectId (ref: scans, unique),
  verdict: String (REAL|FAKE|SUSPICIOUS|BOTNET),
  riskScore: Number,
  confidence: Number,
  breakdown: {
    username: { score: Number, details: String, flags: [String] },
    metadata: { score: Number, details: String, flags: [String] },
    behavior: { score: Number, details: String, flags: [String] },
    image: { score: Number, details: String, flags: [String] },
    nlp: { score: Number, details: String, flags: [String] },
    network: { score: Number, details: String, flags: [String] }
  },
  explanation: String,
  createdAt: Date
}
```

### Audit Logs Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  action: String,
  resource: String,
  resourceId: String,
  changes: Object,
  ipAddress: String,
  userAgent: String,
  createdAt: Date
}
```

### Refresh Tokens Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  token: String (hashed),
  expiresAt: Date,
  createdAt: Date,
  revokedAt: Date
}
```

## Production Checklist

- [ ] Cluster created in MongoDB Atlas
- [ ] Network access configured
- [ ] Database user created with strong password
- [ ] Connection string saved securely
- [ ] Database and collections created
- [ ] Indexes created for performance
- [ ] Backup enabled
- [ ] Monitoring enabled
- [ ] Connection tested successfully
- [ ] Environment variable updated

## Maintenance

### Regular Tasks
- Monitor cluster metrics weekly
- Review slow queries
- Check backup status
- Verify disk space usage
- Rotate database passwords quarterly

### Performance Optimization
- Create indexes on frequently queried fields
- Archive old scan results (>1 year)
- Enable compression on collections
- Use connection pooling

### Security Best Practices
- Never expose connection string
- Use VPC/private endpoints in production
- Enable encryption at rest
- Regularly audit database access
- Use read-only users for monitoring

## Cost Considerations

- **Free Tier**: Up to 512MB storage
- **M0 Sandbox**: Free, 512MB limit
- **M2/M5**: $9-50/month, suitable for small projects
- **M10+**: $57+/month, for production

For this project, **M0 Sandbox** is sufficient for demo/evaluation phase.

## Troubleshooting

### Connection refused
- Check IP whitelist in Network Access
- Verify connection string is correct
- Ensure MongoDB user is created

### Slow queries
- Check indexes are created
- Review query patterns
- Use MongoDB Compass Explain Plan

### Disk space full
- Archive old documents
- Delete test data
- Upgrade cluster size

---

**Status**: ✅ Database setup ready
**Next**: Backend Deployment
