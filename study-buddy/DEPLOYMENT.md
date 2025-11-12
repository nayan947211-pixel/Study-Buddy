# Vercel Deployment Guide

## 🚀 Deploy Study Buddy to Vercel

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- MongoDB Atlas account (for database)
- Google Gemini API key

---

## Part 1: Deploy Backend (API)

### Step 1: Push to GitHub
```bash
cd /Users/jarvis/Desktop/study-buddy
git init
git add .
git commit -m "Initial commit - Study Buddy app"
git branch -M main
git remote add origin https://github.com/Romantic-Runtime/study-buddy.git
git push -u origin main
```

### Step 2: Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `Romantic-Runtime/study-buddy`
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

5. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://anuragmishra3407_db_user:Ej9mMfLWs1nz9xNG@cluster0.hvzgztc.mongodb.net/?appName=Cluster0
   GEMINI_API_KEY=AIzaSyDeXpsyN8aBsKzXcnEvTGUIF3cKDtO7cog
   JWT_SECRET=study_buddy_super_secret_key_2024_production_grade_security_token
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   PORT=3000
   ```

6. Click **Deploy**

7. After deployment, copy your backend URL:
   - Example: `https://study-buddy-backend.vercel.app`

---

## Part 2: Deploy Frontend

### Step 1: Update Frontend Environment

1. Go to Vercel dashboard
2. Click **"Add New Project"**
3. Import the same GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```
   Replace with your actual backend URL from Part 1

6. Click **Deploy**

---

## Part 3: Update CORS

### After both deployments:

1. Go to your **Backend** project on Vercel
2. Go to **Settings** → **Environment Variables**
3. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Redeploy** the backend:
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"Redeploy"**

---

## Part 4: MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Vercel's dynamic IPs
5. Click **Confirm**

---

## Verification Checklist

✅ Backend deployed and accessible
✅ Frontend deployed and accessible
✅ Environment variables set correctly
✅ MongoDB allows connections from anywhere
✅ CORS configured with correct frontend URL
✅ Can login with test user: nayankumar@gmail.com / password123
✅ Can upload PDF and generate quiz
✅ Analytics dashboard shows data

---

## Example URLs After Deployment

- **Frontend**: `https://study-buddy-frontend.vercel.app`
- **Backend API**: `https://study-buddy-backend.vercel.app`
- **Health Check**: `https://study-buddy-backend.vercel.app/health`

---

## Troubleshooting

### Issue: CORS Error
**Solution**: Make sure `CLIENT_URL` in backend matches your frontend URL exactly (including https://)

### Issue: Database Connection Failed
**Solution**: 
1. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
2. Verify `MONGO_URI` in backend environment variables

### Issue: 404 on API routes
**Solution**: Make sure your frontend is using the correct `VITE_API_URL`

### Issue: JWT errors
**Solution**: Ensure `JWT_SECRET` is set in backend environment variables

---

## Custom Domain (Optional)

### For Frontend:
1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` in backend environment variables

### For Backend:
1. Go to Vercel backend project → Settings → Domains
2. Add custom domain for API (e.g., api.yourdomain.com)
3. Update `VITE_API_URL` in frontend environment variables

---

## Environment Variables Summary

### Backend (.env)
```env
PORT=3000
MONGO_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.vercel.app
```

---

*Last Updated: November 13, 2025*
*Status: Ready for Deployment*
