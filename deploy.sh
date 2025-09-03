#!/bin/bash

# Elverra Global Deployment Script
# This script helps prepare your project for Hostinger deployment

echo "🚀 Preparing Elverra Global for Hostinger Deployment..."

# Create deployment directory
mkdir -p deployment
cd deployment

echo "📦 Building the project..."
# Build the project
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Create production package structure
echo "📁 Creating deployment package..."

# Copy essential files for production
cp -r ../server ./
cp -r ../dist ./
cp -r ../shared ./
cp ../package.json ./
cp ../package-lock.json ./
cp ../drizzle.config.ts ./

# Create production .env template
cat > .env.production << EOL
# Production Environment Variables
DATABASE_URL=postgresql://username:password@host:port/database_name
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret_here
PORT=3000

# Payment Gateway Credentials
ORANGE_CLIENT_ID=your_orange_client_id
ORANGE_CLIENT_SECRET=your_orange_client_secret
ORANGE_MERCHANT_KEY=your_orange_merchant_key
SAMA_MERCHANT_CODE=your_sama_merchant_code
SAMA_PUBLIC_KEY=your_sama_public_key
SAMA_TRANSACTION_KEY=your_sama_transaction_key
SAMA_USER_ID=your_sama_user_id

# Stripe Credentials (Optional)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
EOL

# Create deployment README
cat > DEPLOYMENT_README.md << EOL
# Deployment Package Ready!

This folder contains everything needed for Hostinger deployment:

## Files included:
- \`server/\` - Backend application code
- \`dist/\` - Built frontend and backend files  
- \`shared/\` - Database schemas
- \`package.json\` - Dependencies
- \`.env.production\` - Environment variables template

## Next Steps:
1. Rename \`.env.production\` to \`.env\` 
2. Fill in your actual database and API credentials
3. Upload this entire folder to your Hostinger public_html directory
4. Run: \`npm install --production\`
5. Run: \`npm run db:push\` (to set up database)
6. Configure Node.js app in Hostinger panel with startup file: \`dist/index.js\`

## Important:
- Update DATABASE_URL with your production database
- Add all environment variables in Hostinger control panel
- Test the application thoroughly after deployment

For detailed instructions, see ../DEPLOYMENT_GUIDE.md
EOL

echo "✅ Deployment package created in ./deployment folder"
echo ""
echo "📋 Next Steps:"
echo "1. Edit deployment/.env.production with your actual credentials"
echo "2. Rename it to .env"
echo "3. Upload the deployment folder contents to your Hostinger server"
echo "4. Follow the full deployment guide in DEPLOYMENT_GUIDE.md"
echo ""
echo "🌟 Your Elverra Global application is ready for deployment!"