# Deployment Guide for Deriv App

This document outlines how to deploy the Deriv application to Vercel or Netlify, and how to test locally.

## Prerequisites

- Node.js 20.x (required, not 22.x)
- npm 9.x or higher
- Docker (optional, for local testing)
- Git
- **Application ID from Deriv**: Register at https://developers.binary.com/applications/

## Application ID Setup

**REQUIRED**: The app needs a Deriv Application ID to connect to the API.

1. **Register your app** at [https://developers.binary.com/applications/](https://developers.binary.com/applications/)
2. **Configure redirect URLs**:
    - For local: `http://localhost:8443`
    - For production: `https://your-domain.netlify.app` (or your actual domain)
3. **Add the Application ID** to `packages/core/src/config.js`:

    ```javascript
    export const user_app_id = 'YOUR_APP_ID_FROM_BINARY_HERE';
    ```

4. **Commit and push** the config file to GitHub

## Local Development

### Setup

```bash
npm run bootstrap
npm run build:all
npm run serve core
```

Server will be available at `https://localhost:8443`

## Docker Build & Testing

### Build Docker Image Locally

```bash
docker build -t deriv-app:latest .
```

### Run with Docker Compose (Recommended for Testing)

```bash
docker-compose up --build
```

Access the app at `http://localhost:8080`

### Run Docker Container Directly

```bash
docker run -p 8080:80 deriv-app:latest
```

## Vercel Deployment

### Option 1: Deploy from Git (Recommended)

1. **Connect your GitHub repo to Vercel**:

    - Go to https://vercel.com/new
    - Select "Import Git Repository"
    - Authenticate and select `https://github.com/Techtoxic/derivapp.git`

2. **Configure Build Settings**:

    - Framework: `Next.js` (or select "Other" and keep defaults)
    - Build Command: `npm run build:all`
    - Install Command: `npm run bootstrap`
    - Output Directory: `packages/core/dist`
    - Environment Variables: Add any needed .env variables

3. **Deploy**:
    - Click "Deploy"
    - Vercel will automatically build and deploy

### Option 2: Deploy with Docker

If Vercel supports Docker deployments in your plan:

1. **Ensure Docker is configured in your repo**:

    - Dockerfile ✓ (already present)
    - .dockerignore ✓ (already present)
    - vercel.json ✓ (already configured)

2. **Push to GitHub**:

    ```bash
    git add Dockerfile docker-compose.yml .dockerignore .vercelignore vercel.json
    git commit -m "Add Docker deployment configuration"
    git push origin main
    ```

3. **Deploy to Vercel**:
    - Vercel will detect `Dockerfile` and automatically use Docker for deployment

## Netlify Deployment (Recommended - Better for Monorepos)

**Advantages over Vercel**: No memory restrictions on builds, better monorepo support, faster deployments.

### Deploy to Netlify

1. **Connect GitHub to Netlify**:

    - Go to https://app.netlify.com/start
    - Click "Connect to Git"
    - Select GitHub and authenticate
    - Select `Techtoxic/derivapp` repository

2. **Configure Build Settings**:

    - Netlify will auto-detect `netlify.toml` configuration
    - Build command: `npm run bootstrap && npm run build:all`
    - Publish directory: `packages/core/dist`
    - Node version: 20 (specified in netlify.toml)

3. **Deploy**:
    - Click "Save & Deploy"
    - Netlify will build and deploy automatically
    - Your app will be available at `https://your-site-name.netlify.app`

### Configure Environment Variables (Netlify Dashboard)

**Important**: Do NOT set `NODE_ENV=production` during build - the build needs dev dependencies (like husky).

1. Go to Site Settings → Environment
2. **If using custom server** (optional): Add these variables:
    - `NODE_ENV`: `production` (only for runtime, not build)
    - `NODE_VERSION`: `20` (already set in netlify.toml)
3. Re-deploy the site if you added any new variables

### Troubleshooting Netlify Build Failures

**Error: "husky: not found"**

- This happens if `NODE_ENV=production` is set during the build phase
- **Fix**: Remove `NODE_ENV=production` from Netlify build environment (netlify.toml is already configured correctly)
- The build needs dev dependencies including husky to set up git hooks

**Build timeout or out of memory**

- Netlify has generous build quotas (better than Vercel's free tier)
- If still timing out, check if `npm run build:all` is completing locally first

### Redeploy After Fix

Once you've pushed the fix to GitHub (commit cb51c0976e):

1. Go to https://app.netlify.com/sites/YOUR-SITE/deploys
2. Click "Retry deploy" on the failed build
3. New build will use the fixed netlify.toml configuration

## Troubleshooting

### "Cannot read properties of null" in webpack build

- This is fixed in the Dockerfile with sed command that patches the svg-sprite-loader regex
- The regex now normalizes Windows paths before matching

### Port 8443 Already in Use (Local Dev)

- Kill existing process: `lsof -ti:8443 | xargs kill -9` (Mac/Linux)
- Or change port in webpack config: `packages/core/build/webpack.config.js`

### Missing Package Artifacts

- Always run `npm run bootstrap` before `npm run build:all`
- Bootstrap installs all workspace dependencies correctly
- Rebuild if needed: `npm run clean && npm run bootstrap && npm run build:all`

### Build Environment Errors

**"husky: not found" on Netlify**

- Caused by `NODE_ENV=production` during build phase
- **Fix**: Use netlify.toml already in repo (NODE_ENV only set at runtime, not build)
- Netlify needs dev dependencies during build

**Unsupported engine warnings for @deriv-com/analytics**

- Warning about Node 18.x vs 20.x is normal - app works fine on Node 20.x
- Safe to ignore - all packages are compatible

## Key Improvements

The Docker configuration includes:

1. **Multi-stage Build**: Reduces final image size

    - Builder stage: Compiles all packages
    - Runtime stage: Only includes nginx and built artifacts

2. **Windows Path Fix**: Patches svg-sprite-loader regex

    - Prevents "Cannot read properties of null" errors
    - Makes builds consistent across Windows/Mac/Linux

3. **Node Version Lock**: Uses Node 20.x

    - Matches package.json engines requirement
    - Prevents compatibility issues

4. **Pre-build Directories**: Creates expected package paths
    - Prevents webpack copy plugin errors
    - Eliminates missing glob warnings

## Environment Variables

For Vercel deployment, you may need to add environment variables:

- `NODE_ENV=production`
- Any API keys or configuration specific to your deployment
- Add via Vercel Dashboard: Settings → Environment Variables

## Monitoring

After deployment:

1. Check build logs in Vercel Dashboard
2. Monitor deployed app health and performance
3. Use Vercel Analytics to track performance

## Rollback

To rollback a deployment:

1. Go to Vercel Dashboard for your project
2. Click "Deployments"
3. Find the previous successful deployment
4. Click the three dots menu and select "Redeploy"

---

For more help, see the main README.md or check Vercel documentation at https://vercel.com/docs
