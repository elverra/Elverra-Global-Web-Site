// Interfaces pour les configurations
export interface PaymentConfig {
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  defaultCurrency: string;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
}

export interface EmailConfig {
  sendgridApiKey: string;
  from: string;
}

export interface SecurityConfig {
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  cookieSecret: string;
  sessionSecret: string;
}

export interface OrangeMoneyConfig {
  baseUrl: string;
  merchantKey: string;
  clientId: string;
  clientSecret: string;
  webhookSecret: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
  currency: string;
}

export interface SamaMoneyConfig {
  baseUrl: string;
  apiKey: string;
  merchantId: string;
  merchantCode: string;
  userId: string;
  publicKey: string;
  transactionKey: string;
  callbackUrl: string;
}

export interface FeatureFlags {
  enableEmailVerification: boolean;
  enablePhoneVerification: boolean;
  enable2FA: boolean;
}

export interface FileUploadConfig {
  maxFileSize: string;
  uploadDir: string;
}

export interface LoggingConfig {
  level: string;
  enableRequestLogging: boolean;
}

export interface AdminConfig {
  email: string;
  password: string;
}

export interface AppConfig {
  // Core
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  frontendUrl: string;
  apiUrl: string;
  
  // Modules
  auth: AuthConfig;
  database: DatabaseConfig;
  email: EmailConfig;
  orangeMoney: OrangeMoneyConfig;
  samaMoney: SamaMoneyConfig;
  payment: PaymentConfig;
  security: SecurityConfig;
  fileUpload: FileUploadConfig;
  features: FeatureFlags;
  admin: AdminConfig;
  logging: LoggingConfig;
  
  // Computed
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

// Configuration pour Orange Money
console.log('Loading Orange Money configuration...');
console.log('ORANGE_MONEY_BASE_URL:', process.env.ORANGE_MONEY_BASE_URL ? '***' : 'NOT SET');
console.log('ORANGE_MONEY_MERCHANT_KEY:', process.env.ORANGE_MONEY_MERCHANT_KEY ? '***' : 'NOT SET');
console.log('ORANGE_MONEY_CLIENT_ID:', process.env.ORANGE_MONEY_CLIENT_ID ? '***' : 'NOT SET');
console.log('ORANGE_MONEY_CLIENT_SECRET:', process.env.ORANGE_MONEY_CLIENT_SECRET ? '***' : 'NOT SET');

const orangeMoneyConfig: OrangeMoneyConfig = {
  baseUrl: process.env.ORANGE_MONEY_BASE_URL || 'https://api.orange.com/orange-money-webpay/v1',
  merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY || '',
  clientId: process.env.ORANGE_MONEY_CLIENT_ID || '',
  clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET || '',
  webhookSecret: process.env.ORANGE_MONEY_WEBHOOK_SECRET || '',
  callbackUrl: process.env.ORANGE_MONEY_CALLBACK_URL || '',
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  currency: process.env.DEFAULT_CURRENCY || 'OUV',
};

console.log('Orange Money config loaded:', {
  ...orangeMoneyConfig,
  merchantKey: orangeMoneyConfig.merchantKey ? '***' : 'MISSING',
  clientId: orangeMoneyConfig.clientId ? '***' : 'MISSING',
  clientSecret: orangeMoneyConfig.clientSecret ? '***' : 'MISSING',
  webhookSecret: orangeMoneyConfig.webhookSecret ? '***' : 'MISSING'
});

// Configuration pour SAMA Money
const samaMoneyConfig: SamaMoneyConfig = {
  baseUrl: process.env.SAMA_MONEY_BASE_URL || 'https://smarchandamatest.sama.money/V1',
  apiKey: process.env.SAMA_MONEY_API_KEY || '',
  merchantId: process.env.SAMA_MONEY_MERCHANT_ID || '',
  merchantCode: process.env.SAMA_MONEY_MERCHANT_CODE || '',
  userId: process.env.SAMA_MONEY_USER_ID || '',
  publicKey: process.env.SAMA_MONEY_PUBLIC_KEY || '',
  transactionKey: process.env.SAMA_MONEY_TRANSACTION_KEY || '',
  callbackUrl: process.env.SAMA_MONEY_CALLBACK_URL || '',
};

// Configuration de l'application
export const appConfig: AppConfig = {
  // Core
  nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  
  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/elverra_global',
    ssl: process.env.DATABASE_SSL === 'true',
  },
  
  // Email - SendGrid
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.SMTP_FROM || 'Elverra Global <noreply@elverraglobal.com>',
  },
  
  // Payment Gateways
  orangeMoney: orangeMoneyConfig,
  samaMoney: samaMoneyConfig,
  
  // Payment Configuration
  payment: {
    successUrl: process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/payment/success',
    cancelUrl: process.env.PAYMENT_CANCEL_URL || 'http://localhost:3000/payment/cancel',
    webhookUrl: process.env.PAYMENT_WEBHOOK_URL || 'http://localhost:5000/api/payments/webhook',
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'OUV',
  },
  
  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS 
      ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) 
      : 15 * 60 * 1000, // 15 minutes
    rateLimitMax: process.env.RATE_LIMIT_MAX 
      ? parseInt(process.env.RATE_LIMIT_MAX, 10) 
      : 100, // 100 requêtes par fenêtre
  },
  
  // File Uploads
  fileUpload: {
    maxFileSize: process.env.MAX_FILE_SIZE || '5MB',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  
  // Feature Flags
  features: {
    enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
    enablePhoneVerification: process.env.ENABLE_PHONE_VERIFICATION !== 'false',
    enable2FA: process.env.ENABLE_2FA === 'true',
  },
  
  // Admin Configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  },
  
  // Computed properties
  get isProduction() {
    return this.nodeEnv === 'production';
  },
  
  get isDevelopment() {
    return this.nodeEnv === 'development';
  },
  
  get isTest() {
    return this.nodeEnv === 'test';
  },
};
