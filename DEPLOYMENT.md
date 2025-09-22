# ACC Website Deployment Guide

This guide explains how to deploy the ACC website to Vercel with automated testing.

## 🚀 Deployment Methods

### **Method 1: GitHub Actions (Recommended)**

**Automatic deployment when you push to main/master branch:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **GitHub Actions automatically:**
   - Runs tests
   - Builds application
   - Deploys to Vercel (if tests pass)
   - Blocks deployment (if tests fail)

### **Method 2: Manual Deployment with Tests**

**Windows:**
```bash
# Run the Windows deployment script
npm run deploy:windows
# OR
deploy.bat
```

**Mac/Linux:**
```bash
# Run the Unix deployment script
npm run deploy:unix
# OR
./deploy.sh
```

**Any Platform:**
```bash
# Run tests and deploy
npm run deploy
```

### **Method 3: Vercel CLI Only**

**If you want to skip tests (not recommended):**
```bash
# Deploy without running tests
npm run vercel:deploy

# Deploy preview
npm run vercel:preview
```

## 🔧 Setup Instructions

### **1. GitHub Repository Setup**

1. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/acc-website.git
   git push -u origin main
   ```

2. **Set up GitHub Secrets:**
   - Go to GitHub Repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `RESEND_API_KEY`

### **2. Vercel Setup**

1. **Connect GitHub to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository

2. **Configure Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
     - `NEXTAUTH_SECRET` = `your-secret-key`
     - `NEXT_PUBLIC_SUPABASE_URL` = `your-supabase-url`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-key`
     - `RESEND_API_KEY` = `your-resend-key`

3. **Configure Build Settings:**
   - Build Command: `npm run predeploy`
   - Install Command: `npm ci`
   - Output Directory: `.next`

### **3. Local Development Setup**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link to Vercel project:**
   ```bash
   vercel link
   ```

## 🧪 Testing Before Deployment

### **Run Tests Locally:**
```bash
# Run all tests
npm run test

# Run tests against production URL
npm run test:ci
```

### **Test Results:**
- ✅ **All tests pass** → Safe to deploy
- ❌ **Any test fails** → Fix issues before deploying

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass locally (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Environment variables are configured
- [ ] GitHub secrets are set up
- [ ] Vercel project is linked

## 🚨 Troubleshooting

### **Tests Failing:**
1. Check test output for specific errors
2. Fix the failing functionality
3. Re-run tests until they pass
4. Then deploy

### **Build Failing:**
1. Check for TypeScript errors
2. Check for missing dependencies
3. Fix build issues
4. Re-run build until successful

### **Deployment Failing:**
1. Check Vercel logs
2. Verify environment variables
3. Check GitHub Actions logs
4. Ensure all tests pass

## 🔄 Workflow Summary

### **Development Workflow:**
1. **Develop locally** → `npm run dev`
2. **Test changes** → `npm run test`
3. **Commit changes** → `git commit -m "message"`
4. **Push to GitHub** → `git push`
5. **GitHub Actions runs tests** → Automatic
6. **Vercel deploys** → Automatic (if tests pass)

### **Emergency Deployment:**
If you need to deploy without tests (not recommended):
```bash
npm run vercel:deploy
```

## 📊 Monitoring

### **GitHub Actions:**
- Check Actions tab in GitHub repository
- View test results and deployment status

### **Vercel Dashboard:**
- Check deployment status
- View deployment logs
- Monitor performance

### **Test Results:**
- All tests must pass before deployment
- Failed tests block deployment automatically

## 🎯 Best Practices

1. **Always run tests before committing**
2. **Never skip tests in production**
3. **Fix failing tests immediately**
4. **Keep environment variables secure**
5. **Monitor deployment logs**
6. **Test in staging before production**

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review test output
3. Check Vercel logs
4. Check GitHub Actions logs
5. Verify environment variables

---

**Remember:** Tests are your safety net. Never deploy without running them!
