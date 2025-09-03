import { PaymentGateway, PaymentRequest, PaymentResponse } from '@/types/payment';
import { samaMoneyService } from './samaMoneyService';
import { OrangeMoneyClientService } from './orangeMoneyService';

class PaymentService {
  async processPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      switch (gateway.id) {
        case 'orange_money':
          return await this.processOrangeMoneyPayment(gateway, request);
        case 'sama_money':
          return await this.processSamaMoneyPayment(gateway, request);
        case 'wave_money':
          return await this.processWavePayment(gateway, request);
        case 'moov_money':
          return await this.processMoovPayment(gateway, request);
        case 'stripe':
          return await this.processStripePayment(gateway, request);
        case 'bank_transfer':
          return await this.processBankTransfer(gateway, request);
        default:
          throw new Error(`Unsupported payment gateway: ${gateway.id}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  private async processOrangeMoneyPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Processing Orange Money payment:', { gateway: gateway.name, amount: request.amount });
      
      const paymentData = {
        amount: request.amount,
        currency: request.currency,
        customerPhone: request.customerInfo.phone,
        customerName: request.customerInfo.name,
        customerEmail: request.customerInfo.email,
        transactionReference: `OM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callbackUrl: `${window.location.origin}/api/payment/callback/orange`,
        returnUrl: `${window.location.origin}/payment/success`
      };

      console.log('Orange Money payment data:', paymentData);
      
      const orangeMoneyClient = new OrangeMoneyClientService();
      const response = await orangeMoneyClient.initiatePayment(paymentData);
      
      console.log('Orange Money response:', response);
      
      if (!response.success) {
        console.warn('Orange Money payment failed:', response.error);
        // Don't throw error, return the response as-is for better error handling
        return {
          success: false,
          error: response.error || 'Orange Money payment failed'
        };
      }

      return {
        success: true,
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl,
        gatewayResponse: response
      };
    } catch (error) {
      console.error('Orange Money payment error:', error);
      // Return error response instead of throwing
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Orange Money payment processing failed'
      };
    }
  }

  private async processSamaMoneyPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentData = {
        amount: request.amount,
        currency: request.currency,
        customerPhone: request.customerInfo.phone,
        customerName: request.customerInfo.name,
        customerEmail: request.customerInfo.email,
        transaction_reference: `SAMA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        callbackUrl: `${window.location.origin}/api/payment/callback/sama`,
        returnUrl: `${window.location.origin}/payment/success`
      };

      const response = await samaMoneyService.initiatePayment(paymentData);
      
      if (!response.success) {
        throw new Error(response.error || 'SAMA Money payment failed');
      }

      return {
        success: true,
        transactionId: response.transactionId,
        paymentUrl: response.paymentUrl,
        gatewayResponse: response
      };
    } catch (error) {
      console.error('SAMA Money payment error:', error);
      throw error;
    }
  }

  private async processSamaMoneyPaymentLegacy(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate Sama Money API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResponse = {
      success: Math.random() > 0.1,
      transactionId: `SM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gatewayResponse: {
        status: 'completed',
        reference: `SM${Date.now()}`,
        amount: request.amount,
        currency: request.currency
      }
    };

    if (!mockResponse.success) {
      throw new Error('Sama Money payment failed. Please verify your account details.');
    }

    return mockResponse;
  }

  private async processWavePayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate Wave API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResponse = {
      success: Math.random() > 0.1,
      transactionId: `WV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gatewayResponse: {
        status: 'completed',
        reference: `WV${Date.now()}`,
        amount: request.amount,
        currency: request.currency
      }
    };

    if (!mockResponse.success) {
      throw new Error('Wave payment failed. Please try again.');
    }

    return mockResponse;
  }

  private async processMoovPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate Moov Money API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockResponse = {
      success: Math.random() > 0.1,
      transactionId: `MV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gatewayResponse: {
        status: 'completed',
        reference: `MV${Date.now()}`,
        amount: request.amount,
        currency: request.currency
      }
    };

    if (!mockResponse.success) {
      throw new Error('Moov Money payment failed. Please check your PIN and balance.');
    }

    return mockResponse;
  }

  private async processStripePayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate Stripe API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResponse = {
      success: Math.random() > 0.1,
      transactionId: `ST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gatewayResponse: {
        status: 'completed',
        reference: `ST${Date.now()}`,
        amount: request.amount,
        currency: request.currency
      }
    };

    if (!mockResponse.success) {
      throw new Error('Card payment failed. Please check your card details.');
    }

    return mockResponse;
  }

  private async processBankTransfer(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    // Bank transfers are typically manual, so we return instructions
    return {
      success: true,
      transactionId: `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gatewayResponse: {
        status: 'pending',
        instructions: 'Please transfer the amount to the provided bank account details.',
        bankDetails: {
          accountName: 'Elverra Global',
          accountNumber: '1234567890',
          bankName: 'Bank of Africa',
          swiftCode: 'BMAFMLBA'
        }
      }
    };
  }

  calculateFees(gateway: PaymentGateway, amount: number): number {
    const percentageFee = (amount * gateway.fees.percentage) / 100;
    return percentageFee + gateway.fees.fixed;
  }

  getTotalAmount(gateway: PaymentGateway, amount: number): number {
    return amount + this.calculateFees(gateway, amount);
  }
}

export const paymentService = new PaymentService();