// services/payment/orangeMoneyService.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../../../shared/config.js';
import { db } from '../../db.js';
import { payments, paymentAttempts, subscriptions, type Payment, type PaymentAttempt, type PaymentStatus, PaymentMethod } from '../../../shared/schema.js';
import { OrangeMoneyPaymentResponse } from '../../../shared/types/orangeMoney.js';
import { eq } from 'drizzle-orm';

interface PaymentParams {
  userId?: string;
  amount: number;
  phoneNumber: string;
  description: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
}

export class OrangeMoneyService {
  private readonly baseUrl: string;
  private readonly merchantKey: string;
  private readonly authUrl: string;
  private readonly merchantAccountNumber: string;
  private readonly merchantCode: string;
  private readonly merchantName: string;
  private authHeader: string;
  private accessToken: string = '';
  private tokenExpiresAt: number = 0;
  private readonly isSandbox: boolean;

  constructor() {
    console.log('Initializing OrangeMoneyService with config:', {
      hasBaseUrl: !!appConfig.orangeMoney.baseUrl,
      hasMerchantKey: !!appConfig.orangeMoney.merchantKey,
      hasClientId: !!appConfig.orangeMoney.clientId,
      hasClientSecret: !!appConfig.orangeMoney.clientSecret
    });

    if (!appConfig.orangeMoney.baseUrl) {
      throw new Error('Orange Money base URL is not configured');
    }
    if (!appConfig.orangeMoney.merchantKey) {
      throw new Error('Orange Money merchant key is not configured');
    }
    if (!appConfig.orangeMoney.clientId || !appConfig.orangeMoney.clientSecret) {
      console.error('Missing Orange Money credentials:', {
        clientId: appConfig.orangeMoney.clientId ? '***' : 'MISSING',
        clientSecret: appConfig.orangeMoney.clientSecret ? '***' : 'MISSING'
      });
      throw new Error('Orange Money client ID or secret is missing');
    }

    this.isSandbox = appConfig.orangeMoney.environment === 'sandbox';
    this.baseUrl = appConfig.orangeMoney.baseUrl || (this.isSandbox 
      ? 'https://api.orange.com/orange-money-webpay/dev/v1'
      : 'https://api.orange.com/orange-money-webpay/v1');
    this.merchantKey = appConfig.orangeMoney.merchantKey;
    this.merchantAccountNumber = '7701900100';
    this.merchantCode = '101021';
    this.merchantName = 'ELVERRA GLOBAL';
    this.authUrl = this.isSandbox 
      ? 'https://api.orange.com/oauth/v3/token'
      : 'https://api.orange.com/oauth/v3/token';
    
    const credentials = Buffer.from(
      `${appConfig.orangeMoney.clientId}:${appConfig.orangeMoney.clientSecret}`
    ).toString('base64');
    
    this.authHeader = credentials;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      console.log('Using cached access token:', this.accessToken);
      return this.accessToken;
    }

    console.log('Generating new access token with authHeader:', this.authHeader);
    console.log('Merchant Key:', this.merchantKey);
    console.log('Auth URL:', this.authUrl);
    try {
      const tokenResponse = await axios.post(
        this.authUrl,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${this.authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'X-Merchant-Key': this.merchantKey
          },
        }
      );

      console.log('Token response:', {
        access_token: tokenResponse.data.access_token ? '***' : 'MISSING',
        expires_in: tokenResponse.data.expires_in
      });

      if (!tokenResponse.data.access_token) {
        throw new Error('No access token in response');
      }

      this.accessToken = tokenResponse.data.access_token;
      this.tokenExpiresAt = Date.now() + ((tokenResponse.data.expires_in || 3600) * 1000);
      
      return this.accessToken;
    } catch (error: any) {
      console.error('Error getting access token:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`Failed to get access token: ${error.message}`);
    }
  }

  async initiatePayment(params: PaymentParams): Promise<OrangeMoneyPaymentResponse> {
    const { userId, amount, phoneNumber, description, subscriptionId, metadata = {} } = params;
    
    if (!userId) throw new Error('User ID is required');
    if (!amount || amount <= 0) throw new Error('A valid amount is required');
    if (!phoneNumber) throw new Error('Phone number is required');
    if (!description) throw new Error('Description is required');
    const orderId = `OM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    const amountStr = Number(amount).toFixed(2); // Ensure two decimal places

    const paymentAttemptData = {
      id: uuidv4(),
      userId,
      amount: amountStr, // Use validated string
      currency: 'OUV',
      status: 'pending' as PaymentStatus,
      paymentMethod: 'orange_money' as PaymentMethod,
      metadata: {
        ...metadata,
        description: description.substring(0, 255),
        subscriptionId: subscriptionId || null, // Use null instead of undefined
        environment: this.isSandbox ? 'sandbox' : 'production',
        timestamp: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [paymentAttempt] = await db
      .insert(paymentAttempts)
      .values(paymentAttemptData)
      .returning();
      
    if (!paymentAttempt) {
      throw new Error('Failed to create payment attempt');
    }

    try {
      const accessToken = await this.getAccessToken();
      
      let baseCallbackUrl = appConfig.orangeMoney.callbackUrl;
      if (baseCallbackUrl.includes('${API_URL}')) {
        baseCallbackUrl = baseCallbackUrl.replace('${API_URL}', appConfig.apiUrl);
      }
      
      // For development, use ngrok or a publicly accessible callback URL
      if (this.isSandbox && (baseCallbackUrl.includes('localhost') || baseCallbackUrl.includes('127.0.0.1') || !baseCallbackUrl)) {
        // Use a development-friendly callback URL that Orange Money will accept
        baseCallbackUrl = 'https://fcc245ae3f67.ngrok-free.app/api/payments/orange/callback';
        console.log('Using development callback URL for Orange Money:', baseCallbackUrl);
        console.log('Note: For local development, you need to set up ngrok or use a publicly accessible URL');
      }
      
      const paymentRequestData = {
        merchant_key: this.merchantKey,
        currency: 'OUV', // ✅ Matches your test
        order_id: orderId,
        amount: amount.toString(),
        return_url: baseCallbackUrl,
        cancel_url: `${baseCallbackUrl}?cancel=true`,
        notif_url: baseCallbackUrl,
        lang: 'fr',
        reference: orderId
      };

      const apiUrl = `${this.baseUrl}/webpayment`; // ✅ Correct endpoint
      let paymentResponse;
      
      try {
        const logData = {
          ...paymentRequestData,
          merchant_key: '***'
        };

        console.log('Sending payment request to Orange Money API:', {
          url: apiUrl,
          method: 'POST',
          headers: {
            'Authorization': 'Bearer [REDACTED]',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Merchant-Key': '***'
          },
          data: logData
        });

        const requestConfig = {
          url: apiUrl,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Merchant-Key': this.merchantKey
          },
          data: paymentRequestData
        };

        console.log('Sending request to:', apiUrl);
        const response = await axios(requestConfig);
        paymentResponse = response.data;
        
        console.log('Orange Money payment response:', {
          status: response.status,
          data: {
            ...paymentResponse,
            ...(paymentResponse.payment_url && { payment_url: '***' })
          }
        });

        if (!paymentResponse.payment_url) {
          console.error('Invalid response from Orange Money API:', paymentResponse);
          throw new Error(paymentResponse.message || 'No payment URL in response from Orange Money');
        }
      } catch (error: any) {
        const errorDetails = {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: {
              ...error.config?.headers,
              Authorization: error.config?.headers?.Authorization ? '***' : undefined,
              'X-Merchant-Key': error.config?.headers?.['X-Merchant-Key'] ? '***' : undefined
            }
          }
        };
        
        console.error('Error making request to Orange Money:', errorDetails);
        
        if (appConfig.orangeMoney.environment === 'sandbox') {
          console.log('Trying sandbox endpoint as fallback...');
          const sandboxUrl = 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';
          
          try {
            const sandboxResponse = await axios.post(sandboxUrl, paymentRequestData, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Merchant-Key': this.merchantKey
              }
            });
            
            paymentResponse = sandboxResponse.data;

            if (!paymentResponse.payment_url) {
              throw new Error('No payment URL in sandbox response');
            }
            
            console.log('Successfully used sandbox fallback endpoint');
          } catch (sandboxError: any) {
            console.error('Sandbox fallback also failed:', {
              message: sandboxError.message,
              status: sandboxError.response?.status,
              data: sandboxError.response?.data
            });
            throw new Error(`Both production and sandbox endpoints failed. Last error: ${sandboxError.message}`);
          }
        } else {
          throw error;
        }
      }

      const paymentRecordData = {
        id: uuidv4(),
        userId,
        subscriptionId: subscriptionId || null,
        paymentAttemptId: paymentAttempt.id,
        amount: amount.toString(),
        currency: 'OUV', // ✅ Matches .env DEFAULT_CURRENCY and API test
        status: 'pending' as const,
        paymentMethod: 'orange_money' as const,
        paymentReference: orderId,
        externalTransactionId: paymentResponse.pay_token || paymentResponse.id || orderId,
        description: description.substring(0, 255),
        metadata: {
          ...metadata,
          description: description.substring(0, 255),
          paymentGateway: 'orange_money',
          paymentGatewayResponse: paymentResponse,
          environment: this.isSandbox ? 'sandbox' : 'production',
          timestamp: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Creating payment record:', {
        ...paymentRecordData,
        metadata: {
          ...paymentRecordData.metadata,
          paymentGatewayResponse: '***'
        }
      });

      const [payment] = await db
        .insert(payments)
        .values(paymentRecordData)
        .returning();

      const updateData = {
        paymentId: payment.id,
        status: 'pending' as const,
        updatedAt: new Date(),
        metadata: {
          ...(paymentAttempt.metadata as Record<string, unknown> || {}),
          paymentGateway: 'orange_money',
          paymentGatewayResponse: paymentResponse,
          lastUpdated: new Date().toISOString()
        }
      };

      await db
        .update(paymentAttempts)
        .set(updateData)
        .where(eq(paymentAttempts.id, paymentAttempt.id));

      if (subscriptionId) {
        try {
          await db.transaction(async (tx) => {
            await tx
              .update(subscriptions)
              .set({ 
                lastPaymentId: payment.id, 
                status: 'active',
                updatedAt: new Date() 
              })
              .where(eq(subscriptions.id, subscriptionId));
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
      }

      return {
        success: true,
        paymentId: payment.id,
        paymentUrl: paymentResponse.payment_url,
        status: 'pending',
        amount,
        currency: 'OUV', // ✅ Matches .env DEFAULT_CURRENCY and API test
        orderId,
        _rawResponse: paymentResponse
      };
    } catch (error: any) {
      console.error('Error in initiatePayment:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        userId,
        orderId: orderId || 'N/A'
      });

      if (paymentAttempt?.id) {
        await db
          .update(paymentAttempts)
          .set({
            status: 'failed',
            updatedAt: new Date(),
            metadata: {
              ...(paymentAttempt.metadata as Record<string, unknown> || {}),
              error: error.message,
              errorDetails: error.response?.data || error.stack
            }
          })
          .where(eq(paymentAttempts.id, paymentAttempt.id));
      }

      throw error;
    }
  }

  async verifyPayment(paymentId: string): Promise<{ status: string; reference: string; verified: boolean }> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'X-Merchant-Key': this.merchantKey
        },
      });

      const paymentStatus = response.data.status?.toLowerCase();
      const isVerified = paymentStatus === 'completed' || paymentStatus === 'success';

      return {
        status: paymentStatus,
        reference: response.data.reference || paymentId,
        verified: isVerified
      };
    } catch (error: any) {
      console.error('Error verifying payment:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }
}

export const orangeMoneyService = new OrangeMoneyService();