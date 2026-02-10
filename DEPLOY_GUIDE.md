# CWS Frontend Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Manual Deploy
1. Push changes to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Import `CWS-Frontend` project
5. Set environment variable: `VITE_API_BASE_URL=https://cws-backend-1-ixvd.onrender.com/api`
6. Deploy

### Option 2: CLI Deploy
```bash
# Install Vercel CLI
npm i -g vercel@latest

# Deploy
vercel --prod
```

### Option 3: GitHub Actions (Auto-deploy)
Create `.github/workflows/deploy.yml` with Vercel webhook

## ✅ After Deployment
- Frontend URL: https://cws-frontend-4mptq0611-chrisnshuti943-2374s-projects.vercel.app
- Backend API: https://cws-backend-1-ixvd.onrender.com/api
- Test login with finance@gmail.com / finance123
