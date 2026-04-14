# 🚀 Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Supabase project set up with database

## Step 1: Prepare Repository

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LeetCode Tracker"
   ```

2. **Create GitHub Repository**:
   - Go to github.com/new
   - Name it: `leetcode-tracker`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/leetcode-tracker.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Supabase

1. **Run Database Setup**:
   - Open Supabase Dashboard → SQL Editor
   - Copy content from `SETUP_DATABASE.sql`
   - Paste and click "Run"
   - Verify all 8 tables are created

2. **Get API Credentials**:
   - Go to Project Settings → API
   - Copy:
     - Project URL: `https://xxx.supabase.co`
     - anon/public key: `eyJhbGc...`

## Step 3: Deploy to Vercel

### Option A: One-Click Deploy
1. Click the button in README.md
2. Connect your GitHub account
3. Select the repository
4. Add environment variables (see below)
5. Click "Deploy"

### Option B: Manual Deploy
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

5. **Add Environment Variables**:
   ```
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

6. Click "Deploy"

## Step 4: Post-Deployment

1. **Test the Deployment**:
   - Visit your Vercel URL
   - Try signing up
   - Test all features

2. **Change Admin Password**:
   - Login as admin (admin/admin123)
   - Go to Supabase → Table Editor → users
   - Update admin password hash

3. **Set Up Custom Domain** (Optional):
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records

## Environment Variables Explained

### JWT_SECRET
- **Purpose**: Encrypts user authentication tokens
- **How to generate**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### NEXT_PUBLIC_SUPABASE_URL
- **Purpose**: Your Supabase project URL
- **Where to find**: Supabase → Project Settings → API → Project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Purpose**: Public API key for Supabase
- **Where to find**: Supabase → Project Settings → API → anon/public key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

### Database Connection Issues
- Verify Supabase URL is correct
- Check anon key is correct
- Ensure RLS policies are enabled

### Authentication Not Working
- Verify JWT_SECRET is set
- Check it's at least 32 characters
- Ensure it's the same across all deployments

### Features Not Working
- Check browser console for errors
- Verify all tables exist in Supabase
- Check Vercel function logs

## Updating Your Deployment

1. **Make changes locally**
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Vercel auto-deploys** from main branch

## Rollback

If something breaks:
1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find a working deployment
4. Click "..." → "Promote to Production"

## Security Checklist

- [ ] Changed default admin password
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables are set in Vercel
- [ ] .env.local is in .gitignore
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is enabled (automatic with Vercel)

## Performance Tips

1. **Enable Vercel Analytics**:
   - Dashboard → Analytics → Enable

2. **Set up Caching**:
   - Already configured in next.config.js

3. **Monitor Usage**:
   - Supabase Dashboard → Database → Usage
   - Vercel Dashboard → Analytics

## Support

- **Issues**: GitHub Issues
- **Vercel Docs**: vercel.com/docs
- **Supabase Docs**: supabase.com/docs
- **Next.js Docs**: nextjs.org/docs

---

🎉 **Congratulations!** Your LeetCode Tracker is now live!
