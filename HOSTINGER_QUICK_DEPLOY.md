# Quick Hostinger Deployment Guide

## 🚀 Fast Track Deployment (15 minutes)

### Step 1: Database Setup (5 minutes)
**Option A: Free External Database (Recommended)**
1. Go to [Neon.tech](https://neon.tech) 
2. Create free account and new PostgreSQL database
3. Copy the connection string (starts with `postgresql://`)

**Option B: Hostinger Database**
1. Login to Hostinger control panel
2. Go to Databases → Create PostgreSQL database
3. Copy connection details

### Step 2: Upload to Hostinger (5 minutes)
1. **Download/Clone your code** from Replit:
   - Click "Download as ZIP" or use Git: `git clone your-replit-url`

2. **Upload to Hostinger**:
   - Login to Hostinger File Manager
   - Navigate to `public_html` 
   - Upload and extract your project files

3. **Install dependencies** (via SSH or File Manager terminal):
   ```bash
   cd public_html
   npm install --production
   ```

### Step 3: Configure (5 minutes)
1. **Create `.env` file** in your root folder:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   SESSION_SECRET=your-random-secret-key-here
   PORT=3000
   ```

2. **Setup Database**:
   ```bash
   npm run db:push
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Configure Hostinger Node.js**:
   - Go to Hostinger panel → Node.js
   - Create new app:
     - Startup file: `dist/index.js`
     - Node.js version: 18.x
   - Add environment variables from your `.env` file

5. **Start the application**:
   ```bash
   npm start
   ```

### Step 4: Test Your Website
Visit your domain and test:
- ✅ Homepage loads
- ✅ Shop browsing (works without login)
- ✅ O Secours services (accessible to all)
- ✅ User registration/login
- ✅ My Account features

## 🔧 If Something Goes Wrong

**Build Errors:**
```bash
npm install
npm run build
```

**Database Issues:**
- Verify DATABASE_URL is correct
- Check if database allows external connections

**App Won't Start:**
- Check Hostinger error logs
- Ensure `dist/index.js` exists
- Verify Node.js version is 18+

## 📱 Your App Features (All Working)
- ✅ Shop/Online Store (no login required)
- ✅ O Secours Services (accessible to all users)  
- ✅ User Registration/Login System
- ✅ Affiliate Dashboard (in My Account)
- ✅ Payment Gateways (Orange Money, SAMA Money)
- ✅ Admin Panel
- ✅ Mobile-friendly design

## 🎯 Production URLs
After deployment, your app will be available at:
- Main site: `https://your-domain.com`
- Shop: `https://your-domain.com/shop`
- O Secours: `https://your-domain.com/services/o-secours-page`

Need help? Check the detailed `DEPLOYMENT_GUIDE.md` for troubleshooting!