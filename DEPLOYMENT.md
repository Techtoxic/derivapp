# Deployment Guide for Deriv App

This document outlines how to deploy the Deriv application to Vercel using Docker, and how to test locally.

## Prerequisites

- Node.js 20.x (required, not 22.x)
- npm 9.x or higher
- Docker (for local testing before Vercel deployment)
- Git

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

## Troubleshooting

### Build Fails with Node Version Error

- Ensure Node.js 20.x is installed locally
- Vercel will use Node 20.x specified in `package.json` engines field
- Check: `node --version` (should be 20.x.x)

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
