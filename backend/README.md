# Elverra Backend API

Backend Node.js Express server for Elverra Global payments and Ô Secours token management.

## Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Required environment variables:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `ORANGE_BASIC_AUTH`: Orange Money basic auth token
- `ORANGE_MERCHANT_KEY`: Orange Money merchant key
- `SAMA_TRANSAC`: SAMA Money transaction ID
- `SAMA_CLE_PUBLIQUE`: SAMA Money public key

## Development

```bash
npm run dev  # Start with nodemon
npm start    # Start production
```

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Payments
- `POST /api/payments/initiate-orange-money` - Start Orange Money payment
- `POST /api/payments/initiate-sama-money` - Start SAMA Money payment
- `POST /api/payments/verify` - Verify payment status
- `POST /api/payments/orange-money-webhook` - Orange Money webhook
- `POST /api/payments/cinetpay-webhook` - CinetPay webhook

### Ô Secours
- `GET /api/secours/subscriptions?userId=xxx` - Get user subscriptions
- `POST /api/secours/subscriptions` - Create subscription
- `GET /api/secours/transactions?userId=xxx` - Get user transactions
- `GET /api/secours/requests?userId=xxx` - Get rescue requests
- `POST /api/secours/requests` - Create rescue request

## Deployment

The backend can be deployed to:
- Railway
- Render
- Heroku
- VPS with PM2

Make sure to set all environment variables in your deployment platform.
