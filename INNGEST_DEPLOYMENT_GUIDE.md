# Inngest Setup and Deployment Guide

## 🚀 Running Inngest Locally

### 1. Install Inngest CLI
```bash
npm install -g inngest-cli
```

### 2. Start Your Next.js App
```bash
npm run dev
```

### 3. Start Inngest Dev Server
```bash
npx inngest-cli dev
```

### 4. Manual Data Update (Alternative)
If Inngest dev server has port conflicts, you can manually trigger updates:

```bash
# Make a POST request to trigger job opportunities update
curl -X POST http://localhost:3000/api/manual-update
```

## 🌐 Deploying Inngest to Production

### Option 1: Vercel (Recommended)

1. **Deploy your Next.js app to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set up Inngest Cloud:**
   - Go to [inngest.com](https://inngest.com)
   - Create an account and new app
   - Get your Inngest keys

3. **Add Environment Variables to Vercel:**
   ```bash
   vercel env add INNGEST_EVENT_KEY
   vercel env add INNGEST_SIGNING_KEY
   vercel env add GEMINI_API_KEY
   vercel env add DATABASE_URL
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

1. **Connect your GitHub repo to Railway**
2. **Add environment variables:**
   - `INNGEST_EVENT_KEY`
   - `INNGEST_SIGNING_KEY`
   - `GEMINI_API_KEY`
   - `DATABASE_URL`

3. **Deploy automatically**

### Option 3: Self-hosted with Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Deploy with Docker Compose:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - INNGEST_EVENT_KEY=${INNGEST_EVENT_KEY}
         - INNGEST_SIGNING_KEY=${INNGEST_SIGNING_KEY}
         - GEMINI_API_KEY=${GEMINI_API_KEY}
         - DATABASE_URL=${DATABASE_URL}
   ```

## 🔧 Environment Variables Required

```env
# Database
DATABASE_URL="your_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
CLERK_SECRET_KEY="your_clerk_secret"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key"

# Inngest (for production)
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"
```

## 📊 Monitoring Your Functions

1. **Inngest Dashboard:** Visit your Inngest app dashboard
2. **Function Logs:** Check function execution logs
3. **Manual Triggers:** Use the `/api/manual-update` endpoint

## 🎯 Scheduled Functions

- **Industry Insights:** Every Sunday at midnight
- **Job Opportunities:** Every day at 6 AM

## 🚨 Troubleshooting

### Port Conflicts
If you get port binding errors:
```bash
# Kill existing processes
taskkill /f /im node.exe
# Or on Mac/Linux
pkill -f node
```

### Function Not Triggering
1. Check environment variables
2. Verify Inngest keys
3. Check function registration in `/api/inngest/route.ts`

### Database Issues
1. Run migrations: `npx prisma migrate deploy`
2. Check database connection
3. Verify Prisma schema
