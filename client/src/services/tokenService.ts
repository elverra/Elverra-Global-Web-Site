import { TOKEN_TYPES, TokenBalance, TokenPurchase, WithdrawalRequest, OSecoursToken } from '../../../shared/types/secours';

const API_BASE_URL = '/api/secours';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string | undefined;
  status?: number;
}

export const TokenService = {
  // Get token balances for the current user
  async getTokenBalances(): Promise<ApiResponse<TokenBalance[]>> {
    try {
      console.log('Fetching token balances from:', `${API_BASE_URL}/balances`);
      const response = await fetch(`${API_BASE_URL}/balances`, {
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
    amount: number
  ): Promise<ApiResponse<TokenPurchase>> {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, amount }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return { success: false, error: 'Failed to process token purchase' };
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
