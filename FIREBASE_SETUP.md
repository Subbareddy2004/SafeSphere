# 🔥 Firebase Setup Instructions

## Error: auth/configuration-not-found

This means Firebase Authentication is not enabled in your Firebase Console.

## Step-by-Step Fix:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com

### 2. Select Your Project
Click on: **safecsp-58816**

### 3. Enable Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get Started"** button (if you see it)
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle the **"Enable"** switch to ON
6. Click **"Save"**

### 4. Enable Firestore Database (if not already done)

1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select your preferred location (e.g., us-central)
5. Click **"Enable"**

### 5. Deploy Firestore Security Rules

Open your terminal and run:
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to Firebase Console:
1. Go to **Firestore Database** → **Rules** tab
2. Copy the content from your `firestore.rules` file
3. Click **"Publish"**

### 6. Verify Setup

After enabling Authentication and Firestore:
1. Restart your dev server: `npm run dev`
2. Visit: http://localhost:5173/seed
3. Click "Seed Database"
4. You should see success messages

---

## Quick Checklist

- [ ] Firebase Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] Firestore Database created
- [ ] Firestore rules deployed
- [ ] Dev server restarted

---

## Test Your Setup

Once everything is enabled, you can:

1. **Seed the database**: Visit `/seed` and click the button
2. **Login as admin**: 
   - Email: admin@safesphere.com
   - Password: admin123456
3. **Access admin dashboard**: Navigate to `/admin`

---

## Still Having Issues?

### Check Firebase Console:
1. **Authentication** → Should show "Email/Password" as enabled
2. **Firestore Database** → Should show your database
3. **Project Settings** → Verify your config matches `.env` file

### Verify .env file:
Your `.env` should have:
```
VITE_FIREBASE_API_KEY=AIzaSyD2hf37MXerH55ZNeuf_LPXOCdI-UgHGXE
VITE_FIREBASE_AUTH_DOMAIN=safecsp-58816.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=safecsp-58816
VITE_FIREBASE_STORAGE_BUCKET=safecsp-58816.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=192273236615
VITE_FIREBASE_APP_ID=1:192273236615:web:eba036f86f02903141ee22
```

### Common Issues:
- **"auth/configuration-not-found"** → Authentication not enabled
- **"permission-denied"** → Firestore rules not deployed
- **"app/invalid-api-key"** → Wrong API key in .env
- **Changes not reflecting** → Restart dev server after .env changes
