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
    this.config = {
      apiKey: process.env.CINETPAY_API_KEY || '',
      siteId: process.env.CINETPAY_SITE_ID || '',
      notifyUrl: `${process.env.APP_URL}/api/payments/cinetpay-webhook`,
      returnUrl: `${process.env.APP_URL}/my-account?payment=success`,
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
      
      // Prepare payload according to CinetPay documentation
      const payload = {
        apikey: this.config.apiKey,
        site_id: this.config.siteId,
        transaction_id: transactionId,
        amount: params.amount,
        currency: params.currency || 'XOF',
        description: params.description || 'Elverra Global Payment',
        notify_url: this.config.notifyUrl,
        return_url: this.config.returnUrl,
        channels: 'MOBILE_MONEY', // Use MOBILE_MONEY as per documentation
        metadata: params.userId,
        lang: 'FR',
        customer_id: params.userId,
        customer_name: params.metadata?.name || 'Client',
        customer_surname: params.metadata?.surname || 'Elverra',
        customer_email: params.metadata?.email || '',
        customer_phone_number: params.metadata?.phone || '',
        customer_address: params.metadata?.address || '',
        customer_city: params.metadata?.city || '',
        customer_country: params.metadata?.country || 'ML',
        customer_state: params.metadata?.state || 'ML',
        customer_zip_code: params.metadata?.zipCode || '',
        invoice_data: {
          'Service': 'Abonnement Elverra',
          'Référence': transactionId,
        },
        ...(params.metadata || {})
      };
      
      console.log('Envoi de la requête à CinetPay:', JSON.stringify(payload, null, 2));

      const config = {
        method: 'post',
        url: 'https://api-checkout.cinetpay.com/v2/payment',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: JSON.stringify(payload),
        timeout: 10000 // 10 seconds timeout
      };

      // Implement retry logic with exponential backoff
      const maxRetries = 3;
      let lastError: unknown;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await axios(config);
          
          // Check if response is HTML error page
          if (typeof response.data === 'string' && response.data.startsWith('<!DOCTYPE')) {
            throw new Error(`CinetPay returned HTML error page: ${response.data.substring(0, 100)}...`);
          }
          
          console.log('Réponse de CinetPay:', JSON.stringify(response.data, null, 2));
          
          // Validate API response structure
          if (response.data?.data?.payment_url) {
            return {
              paymentUrl: response.data.data.payment_url,
              paymentToken: response.data.data.payment_token || transactionId
            };
          }
          
          throw new Error('Invalid CinetPay response: ' + JSON.stringify(response.data));
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

export const cinetpayService = new CinetPayService();
