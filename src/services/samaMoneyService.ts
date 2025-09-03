/**
 * SAMA Money Payment Service
 * Handles integration with SAMA Money payment gateway
 */

interface SamaMoneyConfig {
  baseUrl: string;
  merchantCode: string;
  merchantName: string;
  userId: string;
  publicKey: string;
  transactionKey: string;
  environment: 'test' | 'production';
}

interface SamaMoneyPaymentRequest {
  amount: number;
  currency: string;
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  transactionReference: string;
  callbackUrl?: string;
  returnUrl?: string;
}

interface SamaMoneyPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  status?: string;
  message?: string;
  error?: string;
}

export class SamaMoneyService {
  private config: SamaMoneyConfig;

  constructor(config: SamaMoneyConfig) {
    this.config = config;
  }

  /**
   * Initiate payment with SAMA Money
   */
  async initiatePayment(request: SamaMoneyPaymentRequest): Promise<SamaMoneyPaymentResponse> {
    try {
      // Validate input parameters
      if (!request.amount || request.amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      if (!request.customerPhone || !request.transactionReference) {
        throw new Error('Missing required payment parameters');
      }

      const paymentData = {
        merchant_code: this.config.merchantCode,
        merchant_name: this.config.merchantName,
        user_id: this.config.userId,
        amount: request.amount,
        currency: request.currency,
        customer_phone: this.formatPhoneNumber(request.customerPhone),
        customer_name: request.customerName,
        customer_email: request.customerEmail,
        transaction_reference: request.transactionReference,
        callback_url: request.callbackUrl,
        return_url: request.returnUrl,
        public_key: this.config.publicKey,
        timestamp: new Date().toISOString()
      };

      // For demo/test environment, simulate successful response
      if (this.config.environment === 'test') {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          transactionId: `SAMA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentUrl: `${this.config.baseUrl}payment/redirect/${paymentData.transaction_reference}`,
          status: 'initiated',
          message: 'Payment request sent to your SAMA Money account'
        };
      }

      // Production API call
      const response = await fetch(`${this.config.baseUrl}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${this.config.publicKey}`,
          'Accept': 'application/json',
          'X-Merchant-Code': this.config.merchantCode,
          'X-User-Id': this.config.userId
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SAMA Money API error response:', errorText);
        throw new Error(`SAMA Money API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response from SAMA Money:', responseText.substring(0, 500));
        throw new Error(`Invalid response format - expected JSON but got ${contentType}. Response: ${responseText.substring(0, 100)}...`);
      }

      const result = await response.json();
      
      return {
        success: result.status === 'success' || result.status === 'pending',
        transactionId: result.transaction_id || result.txnid,
        paymentUrl: result.payment_url || result.redirect_url,
        status: result.status,
        message: result.message || result.description
      };

    } catch (error) {
      console.error('SAMA Money payment error:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error - please check your internet connection'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<SamaMoneyPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}payment/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.transactionKey}`,
          'X-Merchant-Code': this.config.merchantCode
        }
      });

      if (!response.ok) {
        throw new Error(`SAMA Money status check failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.status === 'completed',
        transactionId: result.transaction_id,
        status: result.status,
        message: result.message
      };

    } catch (error) {
      console.error('SAMA Money status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Format phone number for SAMA Money (ensure proper format)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 223 (Mali country code), keep as is
    if (cleaned.startsWith('223')) {
      return `+${cleaned}`;
    }
    
    // If it's a local number, add Mali country code
    if (cleaned.length === 8) {
      return `+223${cleaned}`;
    }
    
    // Return as is with + prefix
    return `+${cleaned}`;
  }

  /**
   * Generate signature for API authentication
   */
  private generateSignature(data: any): string {
    // In a real implementation, you would use the proper signing algorithm
    // For now, return a mock signature
    const dataString = JSON.stringify(data);
    return btoa(dataString + this.config.transactionKey).substring(0, 32);
  }

  /**
   * Validate webhook callback from SAMA Money
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature validation
    const expectedSignature = this.generateSignature(payload);
    return expectedSignature === signature;
  }
}

// Export singleton instance
export const samaMoneyService = new SamaMoneyService({
  baseUrl: 'https://smarchandamatest.sama.money/V1/',
  merchantCode: 'b109',
  merchantName: 'CLUB 66 GLOBAL',
  userId: '-486247242941374572',
  publicKey: '@Ub1#2HVZjQIKYOMP4t@yFAez5X9AhCz9',
  transactionKey: 'cU+ZJ69Si8wkW2x59:VktuDM7@k~PaJ;d{S]F!R5gd4,5G(7%a2_785K#}kC3*[e',
  environment: 'test'
});