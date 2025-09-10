import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { db } from '../../db';

interface SamaMoneyConfig {
  baseUrl: string;
  merchantId: string;
  publicKey: string;
  transacHeader: string;
  authUrl: string;
  payUrl: string;
  callbackUrl: string;
}

interface TokenResponse {
  status: number;
  resultat: {
    cmd: string;
    token: string;
    dStart: string;
    dFin: string;
  };
}

interface PaymentResponse {
  status: number;
  msg: string;
  idCommande?: string;
  transNumber?: string;
}

interface TransactionInfo {
  status: number;
  idCommande: string;
  numTransacSAMA: string;
  montant: string;
  date: string;
}

class SamaMoneyService {
  private config: SamaMoneyConfig;
  private http: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.config = {
      baseUrl: process.env.SAMA_MONEY_BASE_URL || 'https://smarchandamatest.sama.money/V1',
      merchantId: process.env.SAMA_MONEY_MERCHANT_ID || '',
      publicKey: process.env.SAMA_MONEY_PUBLIC_KEY || '',
      transacHeader: process.env.SAMA_MONEY_TRANSAC_HEADER || '',
      authUrl: '/marchand/auth',
      payUrl: '/marchand/pay',
      callbackUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/payments/sama/callback`
    };

    this.http = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'TRANSAC': this.config.transacHeader
      }
    });

    // Log configuration (without sensitive data)
    console.log('SamaMoney Config:', {
      hasMerchantId: !!this.config.merchantId,
      hasPublicKey: !!this.config.publicKey,
      hasTransacHeader: !!this.config.transacHeader,
      baseUrl: this.config.baseUrl,
      callbackUrl: this.config.callbackUrl
    });
  }

  private async getToken(): Promise<string> {
    // Return existing token if valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const params = new URLSearchParams();
      params.append('cmd', this.config.merchantId);
      params.append('cle_publique', this.config.publicKey);

      const response = await this.http.post<TokenResponse>(
        this.config.authUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'TRANSAC': this.config.transacHeader
          }
        }
      );

      if (response.data.status === 1 && response.data.resultat?.token) {
        this.token = response.data.resultat.token;
        this.tokenExpiry = new Date(response.data.resultat.dFin);
        console.log('SamaMoney: New token generated, valid until', this.tokenExpiry);
        return this.token;
      }

      throw new Error('Failed to generate Sama Money token');
    } catch (error) {
      console.error('SamaMoney token generation error:', error);
      throw new Error('Failed to authenticate with Sama Money');
    }
  }

  async initiatePayment(params: {
    amount: number;
    phoneNumber: string;
    description: string;
    orderId: string;
  }): Promise<PaymentResponse> {
    try {
      const token = await this.getToken();
      
      const paymentParams = new URLSearchParams();
      paymentParams.append('cmd', this.config.merchantId);
      paymentParams.append('idCommande', params.orderId);
      paymentParams.append('phoneClient', params.phoneNumber);
      paymentParams.append('montant', params.amount.toString());
      paymentParams.append('description', params.description);
      paymentParams.append('tokenMarchand', token);
      paymentParams.append('url', this.config.callbackUrl);

      const response = await this.http.post<PaymentResponse>(
        this.config.payUrl,
        paymentParams,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'TRANSAC': this.config.transacHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('SamaMoney payment initiation error:', error);
      throw new Error('Failed to initiate Sama Money payment');
    }
  }

  async checkTransactionStatus(orderId: string): Promise<TransactionInfo> {
    try {
      const token = await this.getToken();
      
      const params = new URLSearchParams();
      params.append('cmd', this.config.merchantId);
      params.append('idCommande', orderId);

      const response = await this.http.get<TransactionInfo>(
        '/marchand/transaction/infos',
        {
          params: {
            cmd: this.config.merchantId,
            idCommande: orderId
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'TRANSAC': this.config.transacHeader
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('SamaMoney transaction status error:', error);
      throw new Error('Failed to check transaction status');
    }
  }
}

// Create and export a singleton instance
const samaMoneyService = new SamaMoneyService();
export { samaMoneyService };
