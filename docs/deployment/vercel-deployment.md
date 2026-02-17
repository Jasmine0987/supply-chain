# Vercel Deployment Guide

## Prerequisites
- Vercel account
- Git repository
- GitHub/GitLab account (recommended)

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import your Git repository
4. Select **frontend** directory as root

### Step 2: Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables

Add in project settings:
```
VITE_API_BASE_URL=https://supply-chain-api.herokuapp.com
VITE_WS_URL=wss://supply-chain-api.herokuapp.com/ws
VITE_MAPBOX_ACCESS_TOKEN=your-token
VITE_ENABLE_ANALYTICS=true
VITE_APP_ENV=production
```

### Step 4: Deploy

Click **Deploy** - Vercel will automatically deploy and provide URL.

## Option 2: Deploy via CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
cd frontend

# First deployment
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# Project name? supply-chain-frontend
# Directory? ./
# Override settings? No

# Production deployment
vercel --prod
```

### Step 4: Set Environment Variables
```bash
vercel env add VITE_API_BASE_URL
# Enter value: https://supply-chain-api.herokuapp.com

vercel env add VITE_MAPBOX_ACCESS_TOKEN
# Enter your token

# Redeploy with new env vars
vercel --prod
```

## Your Frontend URL
```
https://supply-chain-frontend.vercel.app
```

## Custom Domain

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., app.yourcompany.com)
3. Follow DNS configuration instructions

### Step 2: Configure DNS

Add these records to your domain:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation

SSL certificates are automatically provisioned.

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Push to `main` branch
- **Preview**: Push to any other branch or PR

## Environment-Specific Builds
```bash
# Production
vercel --prod

# Preview
vercel

# Development (local)
vercel dev
```

## Performance Optimizations

### Enable Edge Functions

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://supply-chain-api.herokuapp.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
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

## Cost Estimate

- **Hobby Plan**: Free
  - 100 GB bandwidth
  - Unlimited websites
  - Automatic SSL

- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - Advanced analytics
  - Password protection

## Troubleshooting

### Build Fails

Check build logs in Vercel dashboard:
```
Project → Deployments → Click on failed deployment → View build logs
```

### Environment Variables Not Working

1. Ensure variables start with `VITE_`
2. Redeploy after adding variables
3. Check production vs preview environment

### API CORS Errors

Update backend CORS settings to include Vercel domain:
```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://supply-chain-frontend.vercel.app",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```