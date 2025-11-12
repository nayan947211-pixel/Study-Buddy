# 🚀 Vercel Deployment Guide

## Complete Step-by-Step Deployment Instructions

### Prerequisites ✅
- [ ] GitHub account
- [ ] Vercel account (free tier works)
- [ ] MongoDB Atlas database set up
- [ ] Google Gemini API key obtained
- [ ] Code ready and tested locally

---

## Part 1: Prepare for Deployment

### 1. Update Frontend API URLs

You need to create an environment-based API URL configuration.

**Create `frontend/src/config/api.js`:**
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app' 
  : 'http://localhost:3000';

export default API_BASE_URL;
```

**Then update all API calls in your components to use this:**
```javascript
import API_BASE_URL from '../config/api';

// Instead of:
axios.get('http://localhost:3000/api/quiz')

// Use:
axios.get(`${API_BASE_URL}/api/quiz`)
```

### 2. Verify .gitignore Files

Make sure these files are NOT committed:
- `backend/.env`
- `backend/node_modules/`
- `backend/uploads/*` (except .gitkeep)
- `frontend/.env`
- `frontend/node_modules/`
- `frontend/dist/`

---

## Part 2: Push to GitHub

### 1. Initialize Git (if not already done)
```bash
cd /Users/jarvis/Desktop/study-buddy
git init
git add .
git commit -m "Initial commit - Study Buddy ready for deployment"
```

### 2. Create GitHub Repository
1. Go to https://github.com
2. Click "New Repository"
3. Name: `study-buddy`
4. Visibility: Public or Private
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/Romantic-Runtime/study-buddy.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy Backend to Vercel

### 1. Import Project
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your `study-buddy` repository from GitHub
4. Authorize Vercel to access your GitHub

### 2. Configure Backend Project
- **Project Name**: `study-buddy-backend`
- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: (leave empty)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

### 3. Add Environment Variables
Click "Environment Variables" and add:

```
MONGO_URI = mongodb+srv://anuragmishra3407_db_user:Ej9mMfLWs1nz9xNG@cluster0.hvzgztc.mongodb.net/?appName=Cluster0

GEMINI_API_KEY = AIzaSyDeXpsyN8aBsKzXcnEvTGUIF3cKDtO7cog

JWT_SECRET = study_buddy_super_secret_key_2024_production_grade_security_token

CLIENT_URL = https://your-frontend-domain.vercel.app
(You'll update this after frontend deployment)

NODE_ENV = production

PORT = 3000
```

### 4. Deploy Backend
1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. **Copy the backend URL** (e.g., `https://study-buddy-backend.vercel.app`)

### 5. Test Backend
Visit: `https://your-backend-url.vercel.app/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-13T...",
  "uptime": 0
}
```

---

## Part 4: Deploy Frontend to Vercel

### 1. Update API Configuration

**Before deploying frontend, update the API URL:**

Create or update `frontend/src/config/api.js`:
```javascript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://study-buddy-backend.vercel.app' // Your actual backend URL
  : 'http://localhost:3000';

export default API_BASE_URL;
```

**Update all API calls throughout your app:**

Files to update:
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/quiz.jsx`
- `frontend/src/pages/Flashcards.jsx`
- `frontend/src/pages/Planner.jsx`
- `frontend/src/pages/Chat.jsx`
- `frontend/src/pages/Analytics.jsx`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

Replace all instances of:
```javascript
'http://localhost:3000/api/...'
```

With:
```javascript
`${API_BASE_URL}/api/...`
```

### 2. Commit Changes
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

### 3. Import Frontend Project
1. Back to Vercel Dashboard
2. Click "Add New" → "Project"
3. Select same `study-buddy` repository
4. Click "Import"

### 4. Configure Frontend Project
- **Project Name**: `study-buddy-frontend`
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy Frontend
1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. **Copy the frontend URL** (e.g., `https://study-buddy-frontend.vercel.app`)

---

## Part 5: Configure CORS

### 1. Update Backend Environment Variable
1. Go to your backend project on Vercel
2. Click "Settings" → "Environment Variables"
3. Edit `CLIENT_URL` variable
4. Set value to your frontend URL: `https://study-buddy-frontend.vercel.app`
5. Click "Save"

### 2. Redeploy Backend
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for redeployment

---

## Part 6: Configure MongoDB Atlas

### 1. Whitelist Vercel IPs
1. Go to MongoDB Atlas dashboard
2. Click "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Vercel IPs
5. Click "Confirm"

### 2. Test Connection
Visit your backend health endpoint again to verify DB connection.

---

## Part 7: Final Testing

### Test Checklist
- [ ] Visit frontend URL
- [ ] Register a new account
- [ ] Auto-login works after registration
- [ ] Upload a PDF
- [ ] Generate a quiz
- [ ] Take the quiz
- [ ] Check analytics dashboard
- [ ] Generate flashcards
- [ ] Study flashcards
- [ ] Create study topic
- [ ] Use AI chat
- [ ] All data persists after refresh

---

## Part 8: Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Vercel Dashboard → Your frontend project
2. Click "Settings" → "Domains"
3. Enter your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

### Add Custom Domain to Backend
1. Same process for backend project
2. Update `CLIENT_URL` in backend env vars
3. Update `API_BASE_URL` in frontend
4. Commit and redeploy frontend

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Make sure `CLIENT_URL` in backend matches frontend URL exactly (no trailing slash)

### Issue: Database Connection Failed
**Solution**: 
- Check MongoDB Atlas IP whitelist
- Verify `MONGO_URI` is correct
- Check MongoDB cluster is running

### Issue: 500 Error on API Calls
**Solution**:
- Check Vercel function logs (Dashboard → Project → Logs)
- Verify all environment variables are set
- Check for missing dependencies

### Issue: Build Failed
**Solution**:
- Check build logs
- Verify package.json scripts
- Ensure all dependencies are in package.json (not devDependencies for production)

### Issue: Uploads Not Working
**Solution**:
- Vercel has 50MB limit for serverless functions
- Consider using cloud storage (AWS S3, Cloudinary) for large files

---

## Environment Variables Checklist

### Backend (Vercel)
- [x] `MONGO_URI`
- [x] `GEMINI_API_KEY`
- [x] `JWT_SECRET`
- [x] `CLIENT_URL`
- [x] `NODE_ENV`
- [x] `PORT`

### Frontend (Code)
- [x] `API_BASE_URL` in config/api.js

---

## Deployment Commands Reference

```bash
# Local development
npm run dev

# Build for production (frontend)
npm run build

# Preview production build (frontend)
npm run preview

# Seed database
node backend/seedData.js
```

---

## Important Notes

### File Upload Limits
- Vercel serverless functions: 50MB max
- Consider cloud storage for larger files

### Database Connections
- Use MongoDB Atlas (serverless-friendly)
- Connection pooling is handled automatically

### Environment Variables
- Never commit .env files
- Use Vercel dashboard for production vars
- Redeploy after changing env vars

### Costs
- Vercel Free Tier: Sufficient for most projects
- MongoDB Atlas Free Tier: 512MB storage
- Google Gemini API: Check current pricing

---

## Success! 🎉

Your Study Buddy app is now live!

**Frontend**: https://study-buddy-frontend.vercel.app
**Backend**: https://study-buddy-backend.vercel.app

Share it with friends and start studying smarter!

---

## Monitoring & Maintenance

### Monitor Performance
1. Vercel Analytics (Dashboard → Analytics)
2. Check function execution times
3. Monitor bandwidth usage

### Update Deployment
```bash
git add .
git commit -m "Update: description"
git push origin main
```
Vercel auto-deploys on every push to main branch!

### Rollback if Needed
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

*Last Updated: November 13, 2025*
*Deployment Status: Production Ready*
