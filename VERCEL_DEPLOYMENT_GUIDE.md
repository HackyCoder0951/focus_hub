# Focus Hub - Complete Vercel Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Deployment Methods](#deployment-methods)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Custom Domain Setup](#custom-domain-setup)

---

## Prerequisites

Before deploying to Vercel, ensure you have:

- ✅ **GitHub/GitLab/Bitbucket Account** - Your code repository hosted on a Git platform
- ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- ✅ **Supabase Project** - Active Supabase project with database configured
- ✅ **API Keys** - All necessary API keys (GROQ AI, etc.)
- ✅ **Node.js** - v18.x or higher installed locally (for testing)

---

## Pre-Deployment Checklist

### 1. **Verify Project Structure**

Ensure your project has these essential files:

```
focus_hub/
├── package.json          ✓ (Build scripts configured)
├── vercel.json          ✓ (Vercel configuration)
├── vite.config.ts       ✓ (Vite build configuration)
├── index.html           ✓ (Entry point)
├── src/                 ✓ (Source code)
└── dist/                (Will be generated during build)
```

### 2. **Review Build Configuration**

Your `package.json` should have:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

✅ **Already configured in your project**

### 3. **Verify vercel.json Configuration**

Your current `vercel.json`:

```json
{
  "builds": [
    { 
      "src": "package.json", 
      "use": "@vercel/static-build", 
      "config": { "distDir": "dist" } 
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

✅ **Perfect for SPA routing**

### 4. **Clean Build Test (Recommended)**

Before deploying, test the build locally:

```bash
# Install dependencies
npm install
# or if using bun
bun install

# Run production build
npm run build
# or
bun run build

# Preview the production build
npm run preview
# or
bun run preview
```

Visit `http://localhost:4173` to verify the build works correctly.

---

## Environment Variables Setup

### 🔐 **Important Security Note**

Your Supabase credentials are currently hardcoded in the source code:

**File:** `src/integrations/supabase/client.ts`

```typescript
const SUPABASE_URL = "https://hfiltwodcwlqwxrwfjyp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### **Recommended Approach: Use Environment Variables**

#### Step 1: Create `.env` file locally

Create a `.env` file in your project root (add to `.gitignore`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://hfiltwodcwlqwxrwfjyp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaWx0d29kY3dscXd4cndmanlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDM1NjUsImV4cCI6MjA2Njc3OTU2NX0.hZtaDcr5z_l0YlsMj47zO4I6zW1lEmt9QM8ZJAJMouI

# GROQ AI Configuration (if using)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Other API Keys (if any)
VITE_APP_ENV=production
```

#### Step 2: Update Supabase Client Configuration

Modify `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hfiltwodcwlqwxrwfjyp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

#### Step 3: Update `.gitignore`

Ensure `.env` files are ignored:

```gitignore
# Environment Variables
.env
.env.local
.env.*.local
```

---

## Deployment Methods

### 🚀 **Method 1: Deploy via Vercel Dashboard (Recommended for Beginners)**

#### Step-by-Step:

1. **Visit Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub/GitLab/Bitbucket account

2. **Import Your Project**
   - Click **"Add New Project"**
   - Select **"Import Git Repository"**
   - Choose your Focus Hub repository
   - Click **"Import"**

3. **Configure Project Settings**

   **Framework Preset:** Vite
   
   **Build & Output Settings:**
   - Build Command: `npm run build` or `bun run build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `bun install`

   ![Vercel Configuration Example]

4. **Add Environment Variables**

   Click **"Environment Variables"** and add:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://hfiltwodcwlqwxrwfjyp.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key` |
   | `VITE_GROQ_API_KEY` | `your_groq_api_key` |

   **Important:** 
   - Set these for **Production**, **Preview**, and **Development** environments
   - Click **"Add"** after each variable

5. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (2-5 minutes)
   - You'll get a deployment URL like: `https://focus-hub-xyz.vercel.app`

---

### 🚀 **Method 2: Deploy via Vercel CLI (Advanced)**

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
# or
bun add -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the authentication prompts.

#### Step 3: Navigate to Project Directory

```bash
cd /home/hackycoder/mca_labs/focus_hub
```

#### Step 4: Initialize Vercel Project

```bash
vercel
```

You'll be asked:
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N** (first time)
- Project name? **focus-hub** (or your preferred name)
- Directory? **./** (press Enter)
- Override settings? **N**

#### Step 5: Add Environment Variables

```bash
# Add each environment variable
vercel env add VITE_SUPABASE_URL
# When prompted, paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key

vercel env add VITE_GROQ_API_KEY
# Paste your GROQ API key (if applicable)
```

For each variable, select:
- Environment: **Production, Preview, Development** (Select all)

#### Step 6: Deploy to Production

```bash
vercel --prod
```

Your app will be deployed! You'll receive:
- **Preview URL**: `https://focus-hub-preview.vercel.app`
- **Production URL**: `https://focus-hub.vercel.app`

---

### 🚀 **Method 3: Automatic Deployments with Git Integration**

#### Setup Automatic Deployments:

1. **Connect Repository** (if not already done)
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Follow Method 1 steps

2. **Configure Git Integration**
   - Vercel automatically deploys:
     - **Production**: Commits to `main` or `master` branch
     - **Preview**: Pull requests and other branches

3. **Workflow**
   ```bash
   # Make changes locally
   git add .
   git commit -m "Update feature"
   git push origin main
   
   # Vercel automatically builds and deploys!
   ```

4. **Preview Deployments**
   - Create a new branch:
     ```bash
     git checkout -b feature/new-feature
     git push origin feature/new-feature
     ```
   - Vercel creates a preview deployment
   - Test before merging to main

---

## Post-Deployment Configuration

### 1. **Verify Deployment**

After deployment, check:

✅ **Homepage Loads:** Visit your Vercel URL  
✅ **Routing Works:** Test navigation between pages  
✅ **Supabase Connection:** Check login/signup functionality  
✅ **API Integrations:** Test GROQ AI features  
✅ **Console Errors:** Open browser DevTools and check for errors

### 2. **Configure Supabase**

#### Update Supabase Allowed Origins:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `hfiltwodcwlqwxrwfjyp`
3. Navigate to: **Settings** → **API** → **API Settings**
4. Find **Site URL** and add:
   ```
   https://your-vercel-url.vercel.app
   ```

5. In **Redirect URLs**, add:
   ```
   https://your-vercel-url.vercel.app/*
   https://your-vercel-url.vercel.app/auth/callback
   ```

6. Save changes

### 3. **Configure CORS (if applicable)**

If you have backend APIs, ensure they allow your Vercel domain:

```javascript
// Example Express.js CORS configuration
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-vercel-url.vercel.app',
    'http://localhost:5173' // for local development
  ]
}));
```

### 4. **Setup Analytics (Optional)**

Vercel provides free analytics:

1. Go to your project in Vercel Dashboard
2. Navigate to **Analytics** tab
3. Enable **Web Analytics**
4. Monitor traffic, performance, and errors

---

## Troubleshooting

### ❌ **Build Failed**

**Issue:** `npm install` fails or build command errors

**Solutions:**
1. **Check Node Version:**
   ```bash
   # Specify Node version in package.json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Lock File Issue:**
   - If using `bun.lockb`, Vercel might not support it
   - Solution: Generate `package-lock.json`:
     ```bash
     rm bun.lockb
     npm install
     git add package-lock.json
     git commit -m "Add npm lock file"
     git push
     ```

3. **Check Build Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click failed deployment → View build logs
   - Look for specific error messages

### ❌ **404 on Page Refresh**

**Issue:** Refreshing any page except home shows 404

**Solution:** Already configured in your `vercel.json` ✅

```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### ❌ **Environment Variables Not Working**

**Issue:** App can't connect to Supabase or APIs

**Solutions:**
1. **Check Variable Names:**
   - Vite requires `VITE_` prefix: `VITE_SUPABASE_URL`
   - Not: `REACT_APP_` or `NEXT_PUBLIC_`

2. **Verify in Vercel Dashboard:**
   - Project → Settings → Environment Variables
   - Ensure variables are set for **Production** environment

3. **Redeploy:**
   ```bash
   vercel --prod --force
   ```
   Or in dashboard: **Deployments** → **Redeploy**

### ❌ **Blank Page / White Screen**

**Solutions:**
1. **Check Browser Console:**
   - Open DevTools (F12) → Console tab
   - Look for errors (API connection, missing resources)

2. **Check Build Output:**
   - Ensure `dist/` folder has `index.html` and `assets/`
   - Test locally: `npm run build && npm run preview`

3. **Verify Base URL:**
   - In `vite.config.ts`, ensure no incorrect `base` path:
   ```typescript
   export default defineConfig({
     // base: '/', // Should be root for Vercel
   })
   ```

### ❌ **CORS Errors**

**Issue:** API requests blocked by CORS policy

**Solution:**
1. **Update Supabase Allowed Origins** (see Post-Deployment step 2)
2. **For Custom APIs:** Add Vercel domain to CORS whitelist

---

## Custom Domain Setup

### 🌐 **Add Your Own Domain**

#### Step 1: Purchase Domain
- Use providers like: **Namecheap**, **GoDaddy**, **Cloudflare**, etc.

#### Step 2: Add Domain in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your domain: `focushub.com` or `www.focushub.com`
5. Click **Add**

#### Step 3: Configure DNS

Vercel will provide DNS records. Update your domain provider:

**For Root Domain (focushub.com):**
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel IP)

**For Subdomain (www.focushub.com):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

#### Step 4: Wait for DNS Propagation
- Usually takes 5 minutes to 48 hours
- Check status in Vercel Dashboard

#### Step 5: SSL Certificate
- Vercel automatically provisions SSL (HTTPS)
- Your site will be secure: `https://focushub.com`

---

## Deployment Checklist

Use this checklist before going live:

- [ ] All features tested locally
- [ ] Production build succeeds: `npm run build`
- [ ] Environment variables configured in Vercel
- [ ] Supabase URL and keys correct
- [ ] Supabase allowed origins updated
- [ ] API integrations tested
- [ ] No console errors in production build
- [ ] SEO meta tags configured (if needed)
- [ ] Analytics setup (optional)
- [ ] Custom domain configured (if applicable)
- [ ] Database migrations applied (Supabase)
- [ ] Error monitoring setup (optional: Sentry)

---

## Continuous Deployment Workflow

### Daily Development Flow:

```bash
# 1. Create feature branch
git checkout -b feature/awesome-feature

# 2. Make changes and commit
git add .
git commit -m "Add awesome feature"

# 3. Push to GitHub
git push origin feature/awesome-feature

# 4. Vercel creates Preview Deployment
# Check preview URL in GitHub PR or Vercel dashboard

# 5. Test preview deployment

# 6. Merge to main
git checkout main
git merge feature/awesome-feature
git push origin main

# 7. Vercel automatically deploys to Production! 🎉
```

---

## Additional Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vite Deployment Guide:** [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel CLI Reference:** [vercel.com/docs/cli](https://vercel.com/docs/cli)

---

## Support

If you encounter issues:

1. **Check Vercel Build Logs:** Most issues show up here
2. **Vercel Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com)

---

## Summary

Your Focus Hub project is **ready for Vercel deployment**! 🚀

**Quick Deploy (5 minutes):**
1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Add environment variables
5. Deploy!

**Production URL:** `https://your-focus-hub.vercel.app`

---

**Happy Deploying! 🎉**

---

*Last Updated: December 24, 2025*
