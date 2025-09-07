/**
 * SAMA Money Payment Service
 * Handles integration with SAMA Money payment gateway
 * Official API Documentation Implementation
 */

interface SamaMoneyConfig {
  baseUrl: string;
  merchantCode: string; // cmd
  merchantName: string;
  userId: string; // iduser
  publicKey: string; // cle_publique
  transactionKey: string; // TRANSAC header
  environment: 'test' | 'production';
}

interface SamaTokenResponse {
  status: number;
  resultat?: {
    cmd: string;
    token: string;
    dStart: string;
    dFin: string;
  };
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
  samaReference?: string;
  amount?: string;
  date?: string;
}

export class SamaMoneyService {
  private config: SamaMoneyConfig;

  constructor(config: SamaMoneyConfig) {
    this.config = config;
  }

  /**
   * Generate authentication token (valid for 24 hours)
   */
  private async generateToken(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}marchand/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          cmd: this.config.merchantCode,
          cle_publique: this.config.publicKey
        })
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.status}`);
      }

      const result: SamaTokenResponse = await response.json();
      
      if (result.status !== 1 || !result.resultat?.token) {
        throw new Error('Invalid token response from SAMA Money');
      }

      console.log('🔑 SAMA Money token generated successfully');
      return result.resultat.token;
    } catch (error) {
      console.error('SAMA Money token generation error:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  /**
   * Initiate payment with SAMA Money (Official API)
   */
  async initiatePayment(request: SamaMoneyPaymentRequest): Promise<SamaMoneyPaymentResponse> {
    try {
      // Validate input parameters
      if (!request.amount || request.amount <= 0) {
        throw new Error('Invalid payment amount (code: 1005)');
      }

      if (!request.customerPhone || !this.isValidPhoneNumber(request.customerPhone)) {
        throw new Error('Invalid customer phone number (code: 1006)');
      }

      // Format phone number for SAMA Money (must be 11 digits: 22363445566)
      const formattedPhone = this.formatPhoneNumber(request.customerPhone);

      // Generate authentication token
      const authToken = await this.generateToken();

      // Prepare payment data according to SAMA Money official API
      const paymentData = {
        cmd: this.config.merchantCode,
        idCommande: request.transactionReference,
        phoneClient: formattedPhone,
        montant: request.amount.toString(),
        description: `Payment for ${request.customerName || 'Elverra Global'}`,
        tokenMarchand: this.config.transactionKey,
        url: request.callbackUrl || `${window.location.origin}/api/sama-money/callback`
      };

      console.log('🔄 Initiating SAMA Money payment:', {
        merchantCode: this.config.merchantCode,
        amount: request.amount,
        phone: formattedPhone,
        reference: request.transactionReference
      });

      // Make actual API call to SAMA Money
      const response = await fetch(`${this.config.baseUrl}marchand/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'TRANSAC': this.config.transactionKey,
          'AUTH': authToken
        },
        body: new URLSearchParams(paymentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SAMA Money API error response:', errorText);
        throw new Error(`SAMA Money API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }
      
      const result = await response.json();
      console.log('✅ SAMA Money payment response:', result);

      // Handle SAMA Money response format
      if (result.status === 1) {
        return {
          success: true,
          transactionId: request.transactionReference,
          status: 'initiated',
          message: result.msg || 'Demande de confirmation envoyée au client'
        };
      } else {
        // Map SAMA Money error codes
        const errorMessages: { [key: number]: string } = {
          0: 'Erreur non codifiée',
          1001: 'Vous n\'êtes pas autorisé',
          1002: 'Le code marchand est incorrect',
          1003: 'Les codes fournis sont incorrects',
          1004: 'Le format du token est incorrect',
          1005: 'Le format du montant est incorrect',
          1006: 'Le format du numéro de téléphone du client est incorrect',
          1007: 'La description est incorrecte',
          1008: 'Url Callback est incorrect',
          1009: 'Le token du partenaire a expiré',
          1010: 'Ce numéro n\'est pas celui d\'un client SAMA Money',
          1011: 'Ce numéro de commande existe déjà',
          1012: 'Utilisateur n\'est pas dans le bon groupe',
          1013: 'Solde Insuffisant',
          1014: 'Probleme de lancement USSD',
          1015: 'Demande non envoyé merci de recommencer'
        };

        const errorMessage = errorMessages[result.status] || `Erreur SAMA Money: ${result.status}`;
        return {
          success: false,
          error: errorMessage
        };
      }

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
   * Check payment status (Official SAMA Money API)
   */
  async checkPaymentStatus(transactionId: string): Promise<SamaMoneyPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}marchand/transaction/infos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'TRANSAC': this.config.transactionKey
        },
        body: new URLSearchParams({
          cmd: this.config.merchantCode,
          idCommande: transactionId
        })
      });

      if (!response.ok) {
        throw new Error(`SAMA Money status check failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 1) {
        return {
          success: true,
          transactionId: result.idCommande,
          status: 'completed',
          message: `Transaction completed. SAMA Ref: ${result.numTransacSAMA}`,
          samaReference: result.numTransacSAMA,
          amount: result.montant,
          date: result.date
        };
      } else {
        return {
          success: false,
          error: 'Transaction not found or failed'
        };
      }

    } catch (error) {
      console.error('SAMA Money status check error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Format phone number for SAMA Money (must be 11 digits: 22363445566)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different phone number formats for Mali (+223)
    if (cleaned.startsWith('223')) {
      // Already has country code, ensure it's 11 digits
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code (223)
      return '223' + cleaned.substring(1);
    } else if (cleaned.length === 8) {
      // Add Mali country code (223)
      return '223' + cleaned;
    } else if (cleaned.startsWith('+223')) {
      // Remove + sign
      return cleaned.substring(1);
    }
    
    // If still not in correct format, try to fix it
    if (cleaned.length < 11 && cleaned.length >= 8) {
      return '223' + cleaned.substring(cleaned.length - 8);
    }
    
    return cleaned;
  }

  /**
   * Validate phone number format for SAMA Money
   */
  private isValidPhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // SAMA Money expects 11 digits (223 + 8 digits) or 8 digits (will be prefixed)
    return /^(223)?[0-9]{8}$/.test(cleaned) || /^[0-9]{8}$/.test(cleaned) || /^0[0-9]{7}$/.test(cleaned);
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

// Export singleton instance - production configuration
export const samaMoneyService = new SamaMoneyService({
  baseUrl: 'https://smarchand.sama.money/V1/', // Production URL
  merchantCode: 'ELVERRA_GLOBAL', // Will be replaced with actual production merchant code
  merchantName: 'ELVERRA GLOBAL',
  userId: 'ELVERRA_USER_ID', // Will be replaced with actual production user ID
  publicKey: 'ELVERRA_PUBLIC_KEY', // Will be replaced with actual production public key
  transactionKey: 'ELVERRA_TRANSACTION_KEY', // Will be replaced with actual production transaction key
  environment: 'production'
});