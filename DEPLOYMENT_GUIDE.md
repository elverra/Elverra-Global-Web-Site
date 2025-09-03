# Hostinger Deployment Guide for Elverra Global

This guide will help you deploy your Elverra Global application to Hostinger hosting.

## Prerequisites

1. **Hostinger Account** with Node.js hosting support
2. **SSH Access** to your Hostinger server
3. **Git** installed on your local machine
4. **PostgreSQL Database** (you'll need to set this up on Hostinger or use external service)

## Step 1: Prepare Your Project for Production

### 1.1 Environment Variables Setup
Create a production `.env` file with the following variables:
```bash
DATABASE_URL=your_production_database_url
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret_key
PORT=3000

# Payment Gateway Credentials (if available)
ORANGE_CLIENT_ID=your_orange_client_id
ORANGE_CLIENT_SECRET=your_orange_client_secret
ORANGE_MERCHANT_KEY=your_orange_merchant_key
SAMA_MERCHANT_CODE=your_sama_merchant_code
SAMA_PUBLIC_KEY=your_sama_public_key
SAMA_TRANSACTION_KEY=your_sama_transaction_key
SAMA_USER_ID=your_sama_user_id

# Stripe Credentials (if using)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 1.2 Build the Project
Before deployment, build your project:
```bash
npm run build
```

This creates:
- Frontend build files in `dist/` folder
- Backend bundle in `dist/index.js`

## Step 2: Database Setup

### Option A: Hostinger PostgreSQL Database
1. Log into your Hostinger control panel
2. Navigate to Databases section
3. Create a new PostgreSQL database
4. Note down the connection details

### Option B: External Database Service (Recommended)
For better performance and management, consider using:
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - PostgreSQL hosting

## Step 3: Deploy to Hostinger

### 3.1 Upload Files via SSH
1. Connect to your Hostinger server via SSH:
```bash
ssh username@your-domain.com
```

2. Navigate to your domain's public folder:
```bash
cd public_html
```

3. Upload your project files (you can use SCP, SFTP, or Git):

#### Using Git (Recommended):
```bash
git clone https://github.com/your-username/elverra-global.git .
cd elverra-global
npm install --production
```

#### Using File Upload:
Upload these essential files/folders:
- `server/` (backend code)
- `dist/` (built frontend and backend)
- `shared/` (shared schemas)
- `package.json`
- `drizzle.config.ts`
- `.env` (production version)

### 3.2 Install Dependencies
```bash
npm install --production
```

### 3.3 Database Migration
Run database migrations:
```bash
npm run db:push
```

### 3.4 Start the Application
```bash
npm start
```

## Step 4: Configure Hostinger Settings

### 4.1 Node.js Application Setup
1. Go to Hostinger control panel
2. Navigate to "Node.js" section
3. Create new Node.js application:
   - **Application root**: `/public_html`
   - **Application URL**: your domain
   - **Application startup file**: `dist/index.js`
   - **Node.js version**: 18.x or higher

### 4.2 Environment Variables
In Hostinger control panel, add environment variables:
- Go to Node.js application settings
- Add all variables from your `.env` file

### 4.3 Domain Configuration
1. Point your domain to the Node.js application
2. Configure SSL certificate (usually automatic with Hostinger)

## Step 5: File Structure for Deployment

Your final deployment should look like this:
```
public_html/
├── server/
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── dist/
│   ├── index.js (built backend)
│   └── assets/ (built frontend)
├── shared/
│   └── schema.ts
├── package.json
├── .env
└── drizzle.config.ts
```

## Step 6: Post-Deployment Checklist

### 6.1 Test the Application
1. Visit your domain
2. Test key functionalities:
   - User registration/login
   - Shop browsing (works without login)
   - O Secours service viewing
   - Payment gateway integration

### 6.2 Database Verification
1. Check if tables are created correctly
2. Verify sample data is populated
3. Test user registration and data storage

### 6.3 SSL and Security
1. Verify SSL certificate is active
2. Check that all API endpoints work over HTTPS
3. Test payment gateway connections

## Step 7: Maintenance and Updates

### 7.1 Updating the Application
To update your deployed application:
```bash
# On your server
git pull origin main
npm install
npm run build
npm run db:push
# Restart Node.js application from Hostinger panel
```

### 7.2 Monitoring
- Monitor application logs via Hostinger control panel
- Set up error logging for debugging
- Monitor database performance

## Troubleshooting

### Common Issues:

1. **Build Errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check firewall settings
   - Ensure database server is accessible

3. **Static Files Not Loading**
   - Verify `dist/assets` folder exists
   - Check file permissions
   - Ensure proper routing for static assets

4. **Environment Variables Not Working**
   - Double-check variable names in Hostinger panel
   - Restart Node.js application after changes

### Support
- Hostinger Support: Available 24/7 via live chat
- Documentation: Check Hostinger knowledge base for Node.js hosting

## Production Optimizations

1. **Enable Gzip Compression**
2. **Set up CDN** for static assets
3. **Configure Caching** headers
4. **Monitor Performance** with tools like New Relic or DataDog
5. **Set up Backup** strategy for database

---

**Note**: This application includes payment gateway integration (Orange Money, SAMA Money, Stripe). Ensure you have proper credentials and test in sandbox/staging environment before going live.