const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import API routes
const subscriptionsHandler = require('./api/subscriptions.js');
const verifyHandler = require('./api/payments/verify.js');
const whatsappNotifyHandler = require('./api/notifications/whatsapp.js');

// API Routes
app.all('/api/subscriptions', subscriptionsHandler.default || subscriptionsHandler);
app.all('/api/payments/verify', verifyHandler.default || verifyHandler);
app.all('/api/notifications/whatsapp', whatsappNotifyHandler.default || whatsappNotifyHandler);

// Import other API handlers
const orangeMoneyHandler = require('./api/payments/initiate-orange-money.js');
const samaMoneyHandler = require('./api/payments/initiate-sama-money.js');
const cinetpayWebhookHandler = require('./api/payments/cinetpay-webhook.js');
const orangeWebhookHandler = require('./api/payments/orange-money-webhook.js');

app.all('/api/payments/initiate-orange-money', orangeMoneyHandler.default || orangeMoneyHandler);
app.all('/api/payments/initiate-sama-money', samaMoneyHandler.default || samaMoneyHandler);
app.all('/api/payments/cinetpay-webhook', cinetpayWebhookHandler.default || cinetpayWebhookHandler);
app.all('/api/payments/orange-money-webhook', orangeWebhookHandler.default || orangeWebhookHandler);

// Secours endpoints
const secoursSubscriptionsHandler = require('./api/secours/subscriptions.js');
const secoursTransactionsHandler = require('./api/secours/transactions.js');
const secoursRequestsHandler = require('./api/secours/requests.js');

app.all('/api/secours/subscriptions', secoursSubscriptionsHandler.default || secoursSubscriptionsHandler);
app.all('/api/secours/transactions', secoursTransactionsHandler.default || secoursTransactionsHandler);
app.all('/api/secours/requests', secoursRequestsHandler.default || secoursRequestsHandler);

// Products endpoints
const productsCountHandler = require('./api/products/count.js');
const productsPaymentHandler = require('./api/products/initiate-payment.js');

app.all('/api/products/count', productsCountHandler.default || productsCountHandler);
app.all('/api/products/initiate-payment', productsPaymentHandler.default || productsPaymentHandler);

// Client endpoints
const clientBillingHandler = require('./api/client/billing.js');

app.get('/api/client/billing', clientBillingHandler);

// Admin endpoints
const adminRoutes = require('./api/admin/index.js');
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Endpoint ${req.method} ${req.path} not found` 
  });
});

// Force restart by adding a comment
app.listen(PORT, () => {
  console.log(`🚀 Elverra Backend running on port ${PORT}`);
  console.log(`📱 Frontend URL: http://localhost:5173`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log('📋 Available endpoints:');
  console.log('- GET/POST /api/subscriptions');
  console.log('- POST /api/payments/verify');
  console.log('- POST /api/notifications/whatsapp');
  console.log('- POST /api/payments/initiate-orange-money');
  console.log('- POST /api/payments/initiate-sama-money');
  console.log('- POST /api/payments/cinetpay-webhook');
  console.log('- POST /api/payments/orange-money-webhook');
  console.log('- GET/POST /api/secours/subscriptions');
  console.log('- GET/POST /api/secours/transactions');
  console.log('- GET/POST /api/secours/requests');
  console.log('- GET /api/products/count');
  console.log('- POST /api/products/initiate-payment');
  console.log('- ✅ GET /api/client/billing');
  
  // Test if billing handler is loaded
  console.log('🔍 Billing handler loaded:', typeof clientBillingHandler === 'function');
});
