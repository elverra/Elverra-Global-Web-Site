import { TOKEN_TYPES, TokenBalance, TokenPurchase, WithdrawalRequest, OSecoursToken } from '../../../shared/types/secours';

const API_BASE_URL = '/api/secours';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string | undefined;
  status?: number;
  paymentUrl?: string;
  amount?: number;
}

export const TokenService = {
  // Get token balances for the current user
  async getTokenBalances(userId?: string): Promise<ApiResponse<TokenBalance[]>> {
    try {
      // Get userId from localStorage if not provided
      const currentUser = localStorage.getItem('currentUser');
      const userIdToUse = userId || (currentUser ? JSON.parse(currentUser).id : null);
      
      if (!userIdToUse) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const url = `${API_BASE_URL}/balances?userId=${userIdToUse}`;
      console.log('Fetching token balances from:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Token balances response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response data:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { message: await response.text() };
        }
        
        return { 
          success: false, 
          error: errorData?.message || `HTTP error! status: ${response.status}`,
          details: `HTTP status: ${response.status}`
        };
      }
      
      const data = await response.json();
      console.log('Token balances data:', data);
      return data;
    } catch (error) {
      console.error('Error in getTokenBalances:', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch token balances',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  },

  // Purchase tokens
  async purchaseTokens(
    tokenId: string, 
    amount: number,
    paymentMethod: 'orange_money' | 'sama_money' | 'credit_card' = 'orange_money'
  ): Promise<ApiResponse<TokenPurchase>> {
    try {
      // Get current user
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const user = JSON.parse(currentUser);
      
      // First, ensure user has a subscription for this token type
      const subscriptionResponse = await this.ensureSubscription(user.id, tokenId);
      if (!subscriptionResponse.success) {
        return subscriptionResponse;
      }

      const subscriptionId = subscriptionResponse.data.id;

      // Initiate token purchase with payment
      const response = await fetch(`${API_BASE_URL}/purchase-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          subscriptionId,
          tokenAmount: amount,
          phoneNumber: user.phone || '22670000000', // Default phone if not set
          subscriptionType: tokenId,
          paymentMethod
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || 'Failed to initiate token purchase' 
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return { success: false, error: 'Failed to process token purchase' };
    }
  },

  // Ensure user has a subscription for the token type
  async ensureSubscription(userId: string, tokenType: string): Promise<ApiResponse<any>> {
    try {
      // Check if subscription exists
      const response = await fetch(`${API_BASE_URL}/subscriptions?userId=${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const subscriptions = await response.json();
        const existingSubscription = subscriptions.find((sub: any) => 
          sub.subscription_type === tokenType
        );
        
        if (existingSubscription) {
          return { success: true, data: existingSubscription };
        }
      }

      // Create new subscription
      const createResponse = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscriptionType: tokenType,
          tokenBalance: 0,
          isActive: true
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        return { 
          success: false, 
          error: errorData.error || 'Failed to create subscription' 
        };
      }

      return { success: true, data: await createResponse.json() };
    } catch (error) {
      console.error('Error ensuring subscription:', error);
      return { success: false, error: 'Failed to ensure subscription' };
    }
  },

  // Get purchase history
  async getPurchaseHistory(): Promise<ApiResponse<TokenPurchase[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: error.message || 'Failed to fetch purchase history' 
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch purchase history' 
      };
    }
  },

  // Request withdrawal
  async requestWithdrawal(
    tokenId: string, 
    amount: number
  ): Promise<ApiResponse<WithdrawalRequest>> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, amount }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return { success: false, error: 'Failed to process withdrawal request' };
    }
  },

  // Get withdrawal history
  async getWithdrawalHistory(): Promise<ApiResponse<WithdrawalRequest[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/withdrawals`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      return { success: false, error: 'Failed to fetch withdrawal history' };
    }
  },

  // Get token by ID
  getTokenById(tokenId: string): OSecoursToken | undefined {
    return TOKEN_TYPES.find((token: OSecoursToken) => token.id === tokenId);
  },

  // Get transaction history for a user
  async getTransactions(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: error.message || 'Failed to fetch transactions' 
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      };
    }
  }
};

export default TokenService;
