# Heroku Deployment Guide

## Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository

## Step 1: Install Heroku CLI
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

## Step 2: Login to Heroku
```bash
heroku login
```

## Step 3: Create Heroku App
```bash
cd backend

# Create app
heroku create supply-chain-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Add Redis addon
heroku addons:create heroku-redis:mini

# Add buildpack
heroku buildpacks:set heroku/python
```

## Step 4: Configure Environment Variables
```bash
# Set production environment variables
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set APP_ENV="production"
heroku config:set DEBUG="False"
heroku config:set JWT_SECRET_KEY="your-jwt-secret"

# Get database URL (already set by addon)
heroku config:get DATABASE_URL

# Optional: External services
heroku config:set MAPBOX_ACCESS_TOKEN="your-token"
heroku config:set SENTRY_DSN="your-sentry-dsn"
```

## Step 5: Create Procfile

**Location:** `backend/Procfile`
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
worker: celery -A app.core.celery worker --loglevel=info
```

## Step 6: Create runtime.txt

**Location:** `backend/runtime.txt`
```
python-3.11.7
```

## Step 7: Update requirements.txt

Add production dependencies:
```bash
# backend/requirements.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
```

## Step 8: Deploy
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Add Heroku remote
heroku git:remote -a supply-chain-api

# Deploy
git push heroku main

# Run migrations
heroku run alembic upgrade head

# Seed database
heroku run python scripts/seed_data.py

# Check logs
heroku logs --tail
```

## Step 9: Scale Workers
```bash
# Scale web dynos
heroku ps:scale web=1

# Scale celery workers
heroku ps:scale worker=1
```

## Step 10: Enable SSL
```bash
# Automatic SSL (included in paid plans)
heroku certs:auto:enable
```

## Your Backend API URL
```
https://supply-chain-api.herokuapp.com
```

## Troubleshooting

### Check Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Run Commands
```bash
heroku run python manage.py shell
```

### Database Backup
```bash
heroku pg:backups:capture
heroku pg:backups:download
```

## Cost Estimate

- **Hobby Plan**: $7/month (1 web, 1 worker)
- **Mini Postgres**: Included in free tier
- **Mini Redis**: $3/month
- **Total**: ~$10/month