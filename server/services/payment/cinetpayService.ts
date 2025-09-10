import axios from 'axios';
import { db } from '../../db';
import { users } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { authService } from '../authService';

interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  notifyUrl: string;
  returnUrl: string;
  paymentUrl: string;
}

class CinetPayService {
  private config: CinetPayConfig;

  constructor() {
    // Log environment variables for debugging (without sensitive data)
    const config = {
      hasApiKey: !!process.env.CINETPAY_API_KEY,
      hasSiteId: !!process.env.CINETPAY_SITE_ID,
      appUrl: process.env.APP_URL,
      paymentUrl: process.env.CINETPAY_PAYMENT_URL || 'default',
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('CinetPay Config:', JSON.stringify(config, null, 2));
    
    if (!process.env.CINETPAY_API_KEY || !process.env.CINETPAY_SITE_ID) {
      console.warn('⚠️ CinetPay API key or Site ID is missing. CinetPay payments will not work.');
    }

    this.config = {
      apiKey: process.env.CINETPAY_API_KEY || '',
      siteId: process.env.CINETPAY_SITE_ID || '',
      notifyUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/payments/cinetpay-webhook`,
      returnUrl: `${process.env.APP_URL || 'http://localhost:5000'}/my-account?payment=success`,
      paymentUrl: process.env.CINETPAY_PAYMENT_URL || 'https://api-checkout.cinetpay.com/v2/payment'
    };
  }

  /**
   * Safely extract error details from unknown error type
   */
  private getErrorDetails(error: unknown): { message: string; data?: any } {
    if (axios.isAxiosError(error)) {
      return {
        message: error.message,
        data: error.response?.data
      };
    } else if (error instanceof Error) {
      return { message: error.message };
    }
    return { message: 'Unknown error' };
  }

  /**
   * Initiate a payment with CinetPay
   */
  async initiatePayment(params: {
    amount: number;
    currency?: string;
    description?: string;
    userId: string;
    metadata?: Record<string, any>;
  }): Promise<{
    paymentUrl: string;
    paymentToken: string;
  }> {
    try {
      const transactionId = `ELVERRA-${Date.now()}`;
      
      // Prepare payload according to CinetPay official documentation v2
      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: transactionId,
        amount: params.amount,
        currency: params.currency || 'XOF',
        description: params.description || 'Elverra Global Payment',
        notify_url: this.config.notifyUrl,
        return_url: this.config.returnUrl,
        channels: 'ALL', // Support all payment methods
        lang: 'FR',
        customer_id: params.userId,
        customer_name: 'Client',
        customer_surname: 'Elverra',
        customer_email: 'contact@elverra.com',
        customer_phone_number: '+22373402073',
        customer_address: 'Bamako',
        customer_city: 'Bamako',
        customer_country: 'ML',
        customer_state: 'ML',
        customer_zip_code: '00000'
      };
      
      console.log('Envoi de la requête à CinetPay:', JSON.stringify(payload, null, 2));

      const config = {
        method: 'post',
        url: 'https://api-checkout.cinetpay.com/v2/payment',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Elverra-Global-Web-Site/1.0'
        },
        data: JSON.stringify(payload),
        timeout: 10000 // 10 seconds timeout
      };

      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      let lastError: unknown;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt} - Sending request to CinetPay API`);
          console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: JSON.parse(config.data as string)
          });
          
          console.log('Sending request to CinetPay API:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: payload
          });
          
          const response = await axios(config);
          
          // Check if response is HTML error page
          if (typeof response.data === 'string' && (response.data.startsWith('<!DOCTYPE') || response.data.includes('html'))) {
            const errorHtml = response.data;
            console.error('CinetPay returned HTML error page. Status:', response.status);
            console.error('Response headers:', response.headers);
            console.error('Response body (first 1000 chars):', errorHtml.substring(0, 1000));
            
            // Try to extract error message from HTML
            const errorMatch = errorHtml.match(/<title>(.*?)<\/title>/i) || 
                             errorHtml.match(/<h1>(.*?)<\/h1>/i) ||
                             errorHtml.match(/<p[^>]*>(.*?)<\/p>/i);
            const errorMessage = errorMatch ? 
              `CinetPay Error: ${errorMatch[1]}` : 
              'CinetPay API returned an HTML error page';
              
            throw new Error(errorMessage);
          }
          
          console.log('CinetPay API Response:', {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
          });
          
          // Validate API response structure according to official docs
          if (response.data?.code === "201" && response.data?.data?.payment_url) {
            return {
              paymentUrl: response.data.data.payment_url,
              paymentToken: response.data.data.payment_token || transactionId
            };
          }
          
          // Handle error responses from CinetPay
          if (response.data?.code && response.data?.code !== "201") {
            throw new Error(`CinetPay API Error [${response.data.code}]: ${response.data.message || response.data.description}`);
          }
          
          throw new Error('Invalid CinetPay response structure: ' + JSON.stringify(response.data));
        } catch (error: unknown) {
          lastError = error;
          
          let errorCode: string | undefined;
          if (axios.isAxiosError(error)) {
            errorCode = error.code;
          } else if (error instanceof Error && 'code' in error) {
            errorCode = (error as any).code;
          }
          
          // Handle network errors specifically
          if (errorCode === 'ECONNABORTED' || errorCode === 'ETIMEDOUT') {
            console.warn(`CinetPay network timeout (attempt ${attempt}/${maxRetries}), retrying in ${attempt * 2}s...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
          
          // Handle other errors
          const { message, data } = this.getErrorDetails(error);
          
          // Handle HTML responses specifically
          if (message.includes('HTML error page')) {
            console.error('CinetPay returned an HTML error page. Please check your API configuration.');
          }
          
          console.error('Erreur détaillée CinetPay:', data || message);
          console.error('CinetPay payment initiation error:', error);
          throw new Error('Failed to initiate payment with CinetPay');
        }
      }
      
      throw lastError || new Error('Failed to initiate payment after multiple attempts');
    } catch (error) {
      const { message, data } = this.getErrorDetails(error);
      console.error('Final CinetPay error:', data || message);
      throw new Error('Failed to initiate payment with CinetPay');
    }
  }

  /**
   * Verify a payment status
   */
  async verifyPayment(paymentToken: string): Promise<{
    status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'EXPIRED' | 'CANCELED';
    amount: number;
    currency: string;
    metadata: Record<string, any>;
    paymentMethod: string;
    transactionId: string;
    operatorId?: string;
  }> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.config.paymentUrl}/${paymentToken}/check`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Réponse de CinetPay:', JSON.stringify(response.data, null, 2));

      if (response.data.code === '00') {
        return {
          status: response.data.data.status,
          amount: response.data.data.amount,
          currency: response.data.data.currency,
          metadata: response.data.data.metadata || {},
          paymentMethod: response.data.data.payment_method || '',
          transactionId: response.data.data.transaction_id || '',
          operatorId: response.data.data.operator_id
        };
      }

      throw new Error('Failed to verify payment with CinetPay');
    } catch (error) {
      const { message, data } = this.getErrorDetails(error);
      console.error('Erreur détaillée CinetPay:', data || message);
      console.error('CinetPay payment verification error:', error);
      throw new Error('Failed to verify payment with CinetPay');
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // TO DO: implement authentication logic for verification
    throw new Error('Authentication logic not implemented for verification');
  }

  /**
   * Store CinetPay token for a user
   */
  async storeUserToken(userId: string, token: string, expiresIn: number): Promise<void> {
    await authService.updateCinetPayToken(userId, token, expiresIn);
  }

  /**
   * Get CinetPay token for a user
   */
  async getUserToken(userId: string): Promise<string | null> {
    return authService.getCinetPayToken(userId);
  }
}

// Declare the cinetpayService variable after the class definition
let cinetpayService: CinetPayService;

// Function to initialize CinetPay service
export function initializeCinetPayService() {
  try {
    const requiredVars = {
      CINETPAY_API_KEY: process.env.CINETPAY_API_KEY,
      CINETPAY_SITE_ID: process.env.CINETPAY_SITE_ID,
      APP_URL: process.env.APP_URL || 'http://localhost:5000' // Default to localhost if not set
    };

    // Set default APP_URL if not provided
    if (!process.env.APP_URL) {
      process.env.APP_URL = requiredVars.APP_URL;
      console.warn('APP_URL not set, using default:', requiredVars.APP_URL);
    }

    const missingVars = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length === 0) {
      cinetpayService = new CinetPayService();
      console.log('CinetPay service initialized successfully');
      return true;
    } else {
      console.warn('CinetPay service not initialized - missing required environment variables:', missingVars);
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize CinetPay service:', error);
    return false;
  }
}

// Initialize the service immediately
initializeCinetPayService();

export { cinetpayService };
