import { useState, useEffect } from 'react';
import { PaymentGateway } from '@/types/payment';
import { toast } from 'sonner';

// Default payment gateways configuration
const DEFAULT_GATEWAYS: PaymentGateway[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    type: 'mobile_money',
    isActive: true,
    config: {
      baseUrl: 'https://api.orange.com/orange-money-webpay/v1', // Production URL
      merchantName: 'ELVERRA GLOBAL',
      environment: 'production',
      supportedCurrencies: ['XOF', 'CFA']
    },
    fees: { percentage: 1.5, fixed: 0 },
    icon: '🍊',
    description: 'Pay with Orange Money mobile wallet'
  },
  {
    id: 'sama_money',
    name: 'SAMA Money',
    type: 'mobile_money',
    isActive: true,
    config: {
      baseUrl: 'https://smarchand.sama.money/V1/', // Production URL
      merchantName: 'CLUB 66 GLOBAL',
      environment: 'production',
      supportedCurrencies: ['XOF', 'CFA']
    },
    fees: { percentage: 1.2, fixed: 0 },
    icon: '💰',
    description: 'Pay with SAMA Money digital wallet'
  }
];

export const usePaymentGateways = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGateways(DEFAULT_GATEWAYS);
    setLoading(false);
  }, []);

  const getActiveGateways = () => {
    return gateways.filter(gateway => gateway.isActive);
  };

  const getGatewayById = (id: string) => {
    return gateways.find(gateway => gateway.id === id);
  };

  const updateGateway = async (id: string, updates: Partial<PaymentGateway>) => {
    try {
      // Update local state only (since we're using default gateways)
      setGateways(prev => prev.map(gateway => 
        gateway.id === id ? { ...gateway, ...updates } : gateway
      ));
      
      // Show success message
      toast.success('Payment gateway updated successfully');
    } catch (error) {
      console.error('Error updating payment gateway:', error);
      throw error;
    }
  };

  const fetchGateways = async () => {
    // Refresh with default gateways
    setGateways(DEFAULT_GATEWAYS);
    setLoading(false);
  };

  return {
    gateways,
    loading,
    updateGateway,
    getActiveGateways,
    getGatewayById,
    refetch: fetchGateways
  };
};