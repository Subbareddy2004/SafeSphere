# 🚀 Deployment Guide - Fix 404 Errors

## Issue: 404 Errors in Production

You're seeing 404 errors because the production build needs to be rebuilt and redeployed.

---

## ✅ Quick Fix Steps

### IMPORTANT: Fixed Navigation Links
All `<a href>` tags have been replaced with React Router `<Link to>` components. This fixes 404 errors in production.

### 1. Build the Project
```bash
npm run build
```

This creates the `dist` folder with your production files.

### 2. Deploy to Firebase
```bash
firebase deploy
```

Or deploy only hosting:
```bash
firebase deploy --only hosting
```

### 3. Clear Browser Cache
After deployment:
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache completely

---

## 🔧 What Was Fixed

### firebase.json Updates
- ✅ Proper SPA routing (rewrites all routes to index.html)
- ✅ Cache headers for static assets
- ✅ Removed unused functions configuration

### Why 404 Errors Happened
1. Old build was deployed
2. Routes weren't properly configured
3. Browser cache had old version

---

## 📋 Complete Deployment Checklist

### Before Deployment

- [ ] All environment variables set in `.env`
- [ ] Firebase project initialized
- [ ] Firestore rules deployed
- [ ] All dependencies installed (`npm install`)

### Build & Deploy

```bash
# 1. Clean previous build
rm -rf dist

# 2. Build for production
npm run build

# 3. Test build locally (optional)
npm run preview

# 4. Deploy to Firebase
firebase deploy

# 5. Deploy only specific services (optional)
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

### After Deployment

- [ ] Test all routes:
  - `/` - Home
  - `/login` - Login
  - `/register` - Register
  - `/dashboard` - User Dashboard
  - `/admin` - Admin Dashboard
  - `/helpboard` - Help Board
  - `/directory` - Directory
  - `/seed` - Seed Database

- [ ] Test on mobile devices
- [ ] Clear browser cache
- [ ] Test emergency alerts
- [ ] Test AI chatbot
- [ ] Test voice features

---

## 🌐 Environment Variables

Make sure these are set in `.env`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_GEMINI_API_KEY=your_gemini_key
```

**Note:** Vite requires `VITE_` prefix for environment variables!

---

## 🐛 Troubleshooting

### Issue: Still Getting 404 Errors

**Solution 1: Clear Firebase Hosting Cache**
```bash
firebase hosting:disable
firebase deploy --only hosting
```

**Solution 2: Check Build Output**
```bash
# Make sure dist folder exists
ls -la dist

# Should contain:
# - index.html
# - assets/ folder
# - vite.svg or other assets
```

**Solution 3: Verify Firebase Project**
```bash
firebase projects:list
firebase use your-project-id
```

### Issue: Routes Work Locally But Not in Production

This means the build wasn't deployed. Run:
```bash
npm run build
firebase deploy --only hosting
```

### Issue: Environment Variables Not Working

Vite requires `VITE_` prefix:
- ❌ `FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_API_KEY`

Rebuild after changing .env:
```bash
npm run build
firebase deploy
```

### Issue: Old Version Still Showing

Clear cache:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

Or:
```bash
# Add cache busting to firebase.json (already done)
firebase deploy --only hosting
```

---

## 📱 Testing Deployment

### Test All Routes
```bash
# Your production URL
https://your-project.web.app/

# Test routes:
https://your-project.web.app/login
https://your-project.web.app/dashboard
https://your-project.web.app/admin
https://your-project.web.app/helpboard
https://your-project.web.app/directory
```

### Test Features
1. **Login/Register** - Should work
2. **Dashboard** - Should load
3. **Emergency Button** - Should be visible
4. **AI Chatbot** - Should open
5. **Voice Input** - Should work (requires HTTPS)
6. **Help Board** - Should load posts
7. **Directory** - Should show contacts

---

## 🔒 Security Checklist

Before going live:

- [ ] Update Firestore rules (remove development rules)
- [ ] Set up proper authentication
- [ ] Enable Firebase App Check
- [ ] Set up monitoring
- [ ] Configure CORS if needed
- [ ] Review API keys (restrict in Firebase Console)

---

## 📊 Monitoring

After deployment, monitor:

1. **Firebase Console**
   - Hosting usage
   - Firestore reads/writes
   - Authentication users

2. **Browser Console**
   - Check for errors
   - Verify API calls
   - Test all features

3. **Performance**
   - Page load times
   - API response times
   - Voice recognition speed

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Deploy
firebase deploy                    # Deploy everything
firebase deploy --only hosting     # Deploy only hosting
firebase deploy --only firestore   # Deploy only Firestore rules

# Firebase
firebase login          # Login to Firebase
firebase init           # Initialize Firebase
firebase projects:list  # List projects
firebase use project-id # Switch project

# Troubleshooting
rm -rf dist            # Remove old build
rm -rf node_modules    # Remove dependencies
npm install            # Reinstall dependencies
```

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ All routes load without 404 errors
- ✅ Login/Register works
- ✅ Dashboard displays correctly
- ✅ Emergency button is visible
- ✅ AI chatbot opens and responds
- ✅ Voice input works (on HTTPS)
- ✅ Help board shows posts
- ✅ Directory shows contacts
- ✅ Mobile layout works
- ✅ No console errors

---

## 🚀 Deploy Now!

Run these commands:

```bash
# 1. Build
npm run build

# 2. Deploy
firebase deploy

# 3. Test
# Open your production URL and test all features
```

**Your app should now work perfectly in production!** 🎉
