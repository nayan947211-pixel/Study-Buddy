# Netlify Deployment Guide

## 🚀 Deploy Study Buddy to Netlify

### Prerequisites
- GitHub account (already done ✅)
- Netlify account (sign up at netlify.com)
- MongoDB Atlas account (for database)
- Google Gemini API key

---

## Part 1: Deploy Backend (API) to Netlify

### Step 1: Create Netlify Configuration

The backend needs a `netlify.toml` file for serverless function deployment.

**File: `backend/netlify.toml`** (already created)
```toml
[build]
  command = "npm install"
  functions = "netlify/functions"
  publish = "."

[dev]
  command = "npm run dev"
  port = 3000
  publish = "."
  autoLaunch = false

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

### Step 2: Create Serverless Function Wrapper

We need to wrap Express app for Netlify Functions.

**File: `backend/netlify/functions/api.js`**
```javascript
const serverless = require('serverless-http');
const app = require('../../server');

// Export the handler
exports.handler = serverless(app);
```

### Step 3: Install Serverless HTTP

```bash
cd backend
npm install serverless-http
```

### Step 4: Deploy Backend to Netlify

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub

2. **Import Backend Project**
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub**
   - Select repository: `Romantic-Runtime/study-buddy`

3. **Configure Backend Build Settings**
   - **Base directory**: `backend`
   - **Build command**: `npm install`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`

4. **Add Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Click **"Add a variable"**
   - Add the following:

   ```
   MONGO_URI=mongodb+srv://anuragmishra3407_db_user:Ej9mMfLWs1nz9xNG@cluster0.hvzgztc.mongodb.net/?appName=Cluster0
   GEMINI_API_KEY=AIzaSyDeXpsyN8aBsKzXcnEvTGUIF3cKDtO7cog
   JWT_SECRET=study_buddy_super_secret_key_2024_production_grade_security_token
   CLIENT_URL=https://your-frontend-name.netlify.app
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for deployment to complete

6. **Copy Backend URL**
   - Your backend will be at: `https://your-backend-name.netlify.app`
   - API endpoints will be: `https://your-backend-name.netlify.app/api/*`

7. **Rename Site (Optional)**
   - Go to **Site settings** → **Site details** → **Change site name**
   - Choose something like: `study-buddy-api`
   - New URL: `https://study-buddy-api.netlify.app`

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Create Netlify Configuration for Frontend

**File: `frontend/netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Update Frontend Environment

1. **Login to Netlify**
   - Go to [netlify.com](https://netlify.com)

2. **Import Frontend Project**
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub**
   - Select repository: `Romantic-Runtime/study-buddy`

3. **Configure Frontend Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add:

   ```
   VITE_API_URL=https://study-buddy-api.netlify.app
   ```
   *(Replace with your actual backend URL from Part 1)*

5. **Deploy**
   - Click **"Deploy site"**
   - Wait for build to complete

6. **Copy Frontend URL**
   - Your frontend will be at: `https://your-frontend-name.netlify.app`

7. **Rename Site (Optional)**
   - Go to **Site settings** → **Site details** → **Change site name**
   - Choose something like: `study-buddy-app`
   - New URL: `https://study-buddy-app.netlify.app`

---

## Part 3: Update CORS Configuration

### After Both Deployments:

1. **Update Backend Environment Variables**
   - Go to your **Backend** site on Netlify
   - Navigate to **Site settings** → **Environment variables**
   - Update `CLIENT_URL`:
     ```
     CLIENT_URL=https://study-buddy-app.netlify.app
     ```
   *(Use your actual frontend URL)*

2. **Redeploy Backend**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

3. **Test CORS**
   - Visit your frontend URL
   - Try to login
   - Should work without CORS errors

---

## Part 4: MongoDB Atlas Configuration

1. **Login to MongoDB Atlas**
   - Go to [cloud.mongodb.com](https://cloud.mongodb.com)

2. **Whitelist All IPs**
   - Navigate to **Network Access**
   - Click **"Add IP Address"**
   - Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is required for Netlify's serverless functions
   - Click **"Confirm"**

---

## Part 5: Testing & Verification

### Health Check
1. Visit: `https://study-buddy-api.netlify.app/health`
2. Should return:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "uptime": 123
   }
   ```

### API Test
1. Visit: `https://study-buddy-api.netlify.app/api/quiz`
2. Should return quiz data or authentication required

### Frontend Test
1. Visit: `https://study-buddy-app.netlify.app`
2. Login with: `nayankumar@gmail.com` / `password123`
3. Test all features:
   - ✅ Upload PDF
   - ✅ Generate Quiz
   - ✅ Take Quiz
   - ✅ View Flashcards
   - ✅ Check Analytics
   - ✅ Study Planner

---

## Verification Checklist

✅ Backend deployed to Netlify
✅ Frontend deployed to Netlify
✅ Environment variables configured correctly
✅ MongoDB allows connections from anywhere (0.0.0.0/0)
✅ CORS configured with correct frontend URL
✅ Health check endpoint working
✅ Can login with test credentials
✅ Can upload PDF and generate quiz
✅ Analytics dashboard displays data
✅ All routes working (quiz, flashcards, planner, chat)

---

## Example URLs After Deployment

### Backend
- **API Base**: `https://study-buddy-api.netlify.app`
- **Health Check**: `https://study-buddy-api.netlify.app/health`
- **API Routes**: `https://study-buddy-api.netlify.app/api/*`

### Frontend
- **App**: `https://study-buddy-app.netlify.app`
- **Login**: `https://study-buddy-app.netlify.app/login`
- **Dashboard**: `https://study-buddy-app.netlify.app/analytics`

---

## Netlify-Specific Features

### Automatic Deployments
- Every push to `main` branch triggers automatic deployment
- No manual rebuild needed

### Deploy Previews
- Each pull request gets a preview URL
- Test changes before merging

### Environment Variables per Branch
- Set different variables for production and preview
- Useful for testing

### Custom Domains
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow DNS configuration steps
4. Update environment variables with new domain

---

## Troubleshooting

### Issue: ENOENT: no such file or directory, mkdir '/var/task/uploads'
**Cause**: Netlify Functions run in a read-only filesystem (except /tmp)
**Solution**: 
✅ Already fixed! The code now automatically uses `/tmp/uploads` in serverless environments.
- The `server.js` detects Netlify/Vercel environment
- Automatically uses `/tmp` directory for file uploads
- Works seamlessly without configuration changes

### Issue: 502 Bad Gateway or Function Timeout
**Cause**: Netlify functions have 10-second timeout on free tier
**Solutions**:
1. Optimize API queries (add indexes to MongoDB)
2. Reduce PDF processing time
3. Upgrade to Netlify Pro for 26-second timeout

### Issue: CORS Error
**Solution**: 
1. Check `CLIENT_URL` in backend env matches frontend URL exactly
2. Ensure it includes `https://`
3. No trailing slash
4. Redeploy backend after changing env vars

### Issue: Database Connection Failed
**Solutions**:
1. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Check `MONGO_URI` is correct in backend environment variables
3. Test connection locally first

### Issue: 404 on API Routes
**Solutions**:
1. Check `netlify.toml` redirects are configured
2. Verify functions directory is `netlify/functions`
3. Check `VITE_API_URL` in frontend points to backend
4. Include `/api` prefix in all API calls

### Issue: Build Fails
**Solutions**:
1. Check build logs in Netlify dashboard
2. Verify `package.json` scripts are correct
3. Clear cache and retry: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

### Issue: Environment Variables Not Working
**Solutions**:
1. Ensure variables are added in Netlify dashboard (not .env file)
2. Redeploy after adding/changing variables
3. For frontend, ensure `VITE_` prefix for Vite variables

---

## Performance Optimization

### Backend
1. **Use MongoDB Indexes**
   ```javascript
   // In your models
   userSchema.index({ email: 1 });
   quizSchema.index({ createdBy: 1 });
   ```

2. **Enable Response Caching**
   ```javascript
   // In server.js
   app.use((req, res, next) => {
     res.set('Cache-Control', 'public, max-age=300'); // 5 min cache
     next();
   });
   ```

### Frontend
1. **Already optimized with Vite**
   - Code splitting
   - Tree shaking
   - Minification

2. **Netlify CDN**
   - Automatically uses global CDN
   - Fast content delivery

---

## Monitoring & Logs

### Backend Logs
1. Go to **Functions** tab in Netlify
2. Click on function name
3. View recent invocations and logs

### Frontend Logs
1. Go to **Deploys** tab
2. Click on deployment
3. View build logs

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage stats

---

## Cost Considerations

### Netlify Free Tier Includes:
- ✅ 100GB bandwidth/month
- ✅ 125K function requests/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Deploy previews
- ✅ Continuous deployment

### When to Upgrade:
- Need longer function timeout (>10s)
- Higher traffic (>100GB/month)
- More build minutes
- Background functions

---

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Netlify's environment variable system
- ✅ Rotate secrets regularly

### 2. CORS
- ✅ Set specific origin (your frontend URL)
- ✅ Don't use `*` wildcard in production

### 3. Rate Limiting
Consider adding rate limiting:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Input Validation
- ✅ Already implemented with validation middleware
- ✅ Sanitize user inputs
- ✅ Use parameterized queries (Mongoose does this)

---

## Continuous Deployment Workflow

### 1. Development
```bash
# Work on feature branch
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 2. Preview
- Netlify creates preview deployment automatically
- Test at: `https://deploy-preview-XX--study-buddy-app.netlify.app`

### 3. Production
```bash
# Merge to main
git checkout main
git merge feature/new-feature
git push origin main
```
- Netlify automatically deploys to production

---

## Backup & Rollback

### Rollback to Previous Deploy
1. Go to **Deploys** tab
2. Find working deployment
3. Click **"Publish deploy"**
4. Instant rollback!

### Database Backup
1. Use MongoDB Atlas automated backups
2. Configure backup schedule
3. Test restore process

---

## Support Resources

- **Netlify Documentation**: https://docs.netlify.com
- **Netlify Forums**: https://answers.netlify.com
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Vite Docs**: https://vitejs.dev

---

## Quick Command Reference

### Push Updates
```bash
cd /Users/jarvis/Desktop/study-buddy
git add .
git commit -m "Your commit message"
git push origin main
# Netlify auto-deploys!
```

### Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### View Logs
```bash
# Install Netlify CLI (optional)
npm install -g netlify-cli

# Login
netlify login

# View logs
netlify functions:log api
```

---

*Last Updated: November 13, 2025*
*Platform: Netlify*
*Status: Ready for Deployment* ✅
