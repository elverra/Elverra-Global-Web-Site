import { useState, useEffect, useCallback } from 'react';
import { TokenBalance } from '@/shared/types/secours';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  PlusCircle,
  Zap,
  HelpCircle,
  ShieldCheck,
  Star,
  Calendar,
  AlertTriangle,
  Shield,
  Phone,
  Car,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import TokenPurchase from '@/components/tokens/TokenPurchase';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Types
type TokenType = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
};

// Removed the TokenBalance type definition

type Transaction = {
  id: string;
  date: string;
  type: 'purchase' | 'usage';
  tokenId: string;
  amount: number;
  totalPrice: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'in-progress';
};

export type ServiceRequest = {
  id: string;
  service: string;
  description: string;
  amount: number;
  provider: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  requestDate: string;
  estimatedCompletion?: string;
};

// Constants
const TOKEN_TYPES: TokenType[] = [
  {
    id: 'auto',
    name: 'Auto',
    description: 'Assistance véhicule',
    price: 750,
    icon: '🚗',
    color: '#dbeafe',
  },
  {
    id: 'cata_catanis',
    name: 'Cata Catanis',
    description: 'Catastrophes naturelles',
    price: 500,
    icon: '🌪️',
    color: '#fee2e2',
  },
  {
    id: 'school_fees',
    name: 'Frais Scolaires',
    description: 'Paiement des frais scolaires',
    price: 500,
    icon: '🎓',
    color: '#d1fae5',
  },
  {
    id: 'motors',
    name: 'Motos',
    description: 'Assistance moto',
    price: 250,
    icon: '🏍️',
    color: '#fef9c3',
  },
  {
    id: 'telephone',
    name: 'Téléphone',
    description: 'Assistance téléphonique',
    price: 250,
    icon: '📱',
    color: '#f3e8ff',
  },
  {
    id: 'first_aid',
    name: 'Premiers secours',
    description: 'Assistance premiers secours',
    price: 250,
    icon: '🩺',
    color: '#f3e8ff',
  },
];

export const MIN_PURCHASE_PER_SERVICE = 10;
export const MAX_MONTHLY_PURCHASE_PER_SERVICE = 60;

const OSecoursSection = () => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedToken, setSelectedToken] = useState<string>(TOKEN_TYPES[0]?.id || '');
  const [purchaseAmount, setPurchaseAmount] = useState(MIN_PURCHASE_PER_SERVICE.toString());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestServiceId, setRequestServiceId] = useState<string>('');
  const [requestTokens, setRequestTokens] = useState<string>('1');
  const [requestDescription, setRequestDescription] = useState<string>('');
  const [requestFile, setRequestFile] = useState<File | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();
  // No navigation needed in this section for now

  // Backend API base URL
  const getBackendUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      // In development, use localhost backend
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3001';
      }
      // In production, use Vercel backend API routes
      return window.location.origin;
    }
    return 'http://localhost:3001';
  }, []);
  
  const withBase = useCallback((path: string) => {
    const baseUrl = getBackendUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }, [getBackendUrl]);
  // Debug: verify backend URL resolution
  console.log('[DEBUG] Backend URL =', getBackendUrl());

  // Temporarily allow all users to access Ô Secours without requiring a specific card tier
  const isEligible = true;
  const selectedTokenData = TOKEN_TYPES.find(t => t.id === selectedToken);
  const totalPrice = selectedTokenData ? parseInt(purchaseAmount || '0') * selectedTokenData.price : 0;

  const getTokenUsage = useCallback((tokenId: string): number => {
    const balance = tokenBalances.find(b => b.tokenId === tokenId);
    return balance ? balance.usedThisMonth : 0;
  }, [tokenBalances]);

  const getRemainingTokens = useCallback(
    (tokenId: string) => {
      const used = getTokenUsage(tokenId);
      return Math.max(0, MAX_MONTHLY_PURCHASE_PER_SERVICE - used);
    },
    [getTokenUsage]
  );

  const getTokenBalance = useCallback((tokenId: string): number => {
    const balance = tokenBalances.find(b => b.tokenId === tokenId);
    return balance ? balance.balance : 0;
  }, [tokenBalances]);

  const getStatusBadge = useCallback(
    (status: string) => {
      switch (status) {
        case 'completed':
          return (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('completed')}
            </Badge>
          );
        case 'in-progress':
          return (
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              {t('in_progress')}
            </Badge>
          );
        case 'pending':
          return (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t('pending')}
            </Badge>
          );
        case 'cancelled':
          return (
            <Badge className="bg-red-100 text-red-800">
              {t('cancelled')}
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
    [t]
  );

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);

      // 1) Subscriptions (balances)
      const subsUrl = withBase(`/api/secours/subscriptions?userId=${encodeURIComponent(user.id)}`);
      console.log('[DEBUG] Fetch subscriptions URL:', subsUrl);
      const subsRes = await fetch(subsUrl);
      if (!subsRes.ok) throw new Error(await subsRes.text());
      const subsJson = await subsRes.json();
      const subs: Array<{ id: string; user_id: string; service_type: string; token_balance: number; }> = subsJson?.data || [];

      // 2) Transactions for usage calculations
      const txUrl = withBase(`/api/secours/transactions?userId=${encodeURIComponent(user.id)}`);
      console.log('[DEBUG] Fetch transactions URL:', txUrl);
      const txRes = await fetch(txUrl);
      const txJson = txRes.ok ? await txRes.json() : { data: [] };
      const txs: Array<{ id: string; subscription_id: string; transaction_type: string; token_amount: number; created_at: string; secours_subscriptions?: { service_type?: string } }>= txJson?.data || [];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
      const usedByType: Record<string, number> = {};
      txs.forEach(tx => {
        const tstamp = new Date(tx.created_at).getTime();
        const type = tx.secours_subscriptions?.service_type || '';
        if (tstamp >= startOfMonth && tx.transaction_type === 'rescue_claim' && type) {
          usedByType[type] = (usedByType[type] || 0) + (tx.token_amount || 0);
        }
      });

      const balances: TokenBalance[] = subs.map(s => {
        const tokenId = s.service_type;
        const used = usedByType[tokenId] || 0;
        const monthlyLimit = (MAX_MONTHLY_PURCHASE_PER_SERVICE as any)[tokenId] || 100;
        return {
          tokenId,
          balance: s.token_balance || 0,
          usedThisMonth: used,
          monthlyLimit,
          remainingBalance: (s.token_balance || 0) - used,
        };
      });

      // 3) Requests
      const reqUrl = withBase(`/api/secours/requests?userId=${encodeURIComponent(user.id)}`);
      console.log('[DEBUG] Fetch requests URL:', reqUrl);
      const reqRes = await fetch(reqUrl);
      const reqJson = reqRes.ok ? await reqRes.json() : { data: [] };
      const reqs: Array<{ id: string; service_type: string; request_description: string; rescue_value_fcfa: number; status: string; request_date: string; }>= reqJson?.data || [];
      const svcRequests: ServiceRequest[] = reqs.map(r => ({
        id: r.id,
        service: r.service_type,
        description: r.request_description,
        amount: r.rescue_value_fcfa || 0,
        provider: 'Elverra Global',
        status: (r.status as any) || 'pending',
        requestDate: r.request_date,
        estimatedCompletion: undefined,
      }));

      setTokenBalances(balances);
      setTransactions((txs || []).map(tx => ({
        id: tx.id,
        date: tx.created_at,
        type: (tx.transaction_type === 'purchase' ? 'purchase' : 'usage') as any,
        tokenId: tx.secours_subscriptions?.service_type || 'auto',
        amount: tx.token_amount || 0,
        totalPrice: 0,
        status: 'completed',
      })) as Transaction[]);
      setServiceRequests(svcRequests);

      if (TOKEN_TYPES.length > 0 && !selectedToken) {
        setSelectedToken(TOKEN_TYPES[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t('error_fetch_data'));
      toast.error(t('error_fetch_data'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedToken, t]);

  useEffect(() => {
    if (isEligible && user?.id) {
      fetchData();
    }
  }, [isEligible, user?.id, fetchData]);

  const handlePurchase = useCallback(async () => {
    if (!selectedToken || !purchaseAmount || !phoneNumber) {
      toast.error(t('error_select_token_amount_phone'));
      return;
    }

    const amount = parseInt(purchaseAmount, 10);
    if (isNaN(amount) || amount < MIN_PURCHASE_PER_SERVICE || amount > MAX_MONTHLY_PURCHASE_PER_SERVICE) {
      toast.error(t('error_invalid_amount', { min: MIN_PURCHASE_PER_SERVICE, max: MAX_MONTHLY_PURCHASE_PER_SERVICE }));
      return;
    }

    try {
      setIsPurchasing(true);

      const subscription = tokenBalances.find(b => b.tokenId === selectedToken);
      if (!subscription) {
        throw new Error('No subscription found for this token type');
      }

      // Mock purchase response
      const response = {
        success: true,
        data: {
          id: 'purchase-' + Date.now(),
          paymentUrl: null
        }
      };

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      setTokenBalances(prev => {
        const updated = [...prev];
        const index = updated.findIndex(b => b.tokenId === selectedToken);
        if (index >= 0) {
          updated[index] = { 
            ...updated[index], 
            balance: updated[index].balance + amount,
            usedThisMonth: updated[index].usedThisMonth || 0,
            monthlyLimit: updated[index].monthlyLimit || MAX_MONTHLY_PURCHASE_PER_SERVICE,
            remainingBalance: (updated[index].balance || 0) + amount - (updated[index].usedThisMonth || 0)
          };
        } else {
          updated.push({
            tokenId: selectedToken,
            balance: amount,
            usedThisMonth: 0,
            monthlyLimit: MAX_MONTHLY_PURCHASE_PER_SERVICE,
            remainingBalance: amount
          });
        }
        return updated;
      });

      setTransactions(prev => [
        {
          id: response.data!.id,
          date: new Date().toISOString(),
          type: 'purchase' as const,
          tokenId: selectedToken,
          amount,
          totalPrice: amount * (selectedTokenData?.price || 0),
          status: 'completed' as const,
        },
        ...prev,
      ]);

      toast.success(t('purchase_success_message', { amount }));

      setPurchaseAmount(MIN_PURCHASE_PER_SERVICE.toString());
      setPhoneNumber('');

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error(t('error_purchase'));
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedToken, purchaseAmount, phoneNumber, selectedTokenData, t]);

  const requestService = useCallback(
    async (serviceId: string) => {
      if (!isEligible || !user?.id) {
        toast.error(t('error_unauthorized'));
        return;
      }

      const service = TOKEN_TYPES.find(s => s.id === serviceId);
      if (!service) {
        toast.error(t('error_service_not_found'));
        return;
      }

      // Open dialog to collect request details
      setRequestServiceId(serviceId);
      setRequestTokens('1');
      setRequestDescription('');
      setRequestFile(null);
      setRequestDialogOpen(true);
    },
    [
      isEligible, 
      user?.id, 
      t, 
      tokenBalances, 
      TOKEN_TYPES, 
      setSelectedToken, 
      setActiveTab, 
      setServiceRequests, 
      setTokenBalances
    ]
  );

  const submitServiceRequest = async () => {
    try {
      if (!user?.id) {
        toast.error(t('error_unauthorized'));
        return;
      }
      const service = TOKEN_TYPES.find(s => s.id === requestServiceId);
      if (!service) {
        toast.error(t('error_service_not_found'));
        return;
      }
      const tokensNum = Math.max(1, parseInt(requestTokens || '1', 10));
      const balance = tokenBalances.find(b => b.tokenId === requestServiceId)?.balance || 0;
      if (tokensNum > balance) {
        toast.error(t('error_insufficient_balance'));
        return;
      }
      setSubmittingRequest(true);

      // Optional: upload justification to storage later; for now send metadata only
      const payload = {
        service_id: requestServiceId,
        tokens_requested: tokensNum,
        description: requestDescription || `Service request for ${service.name}`,
      };

      const res = await fetch(withBase('/api/secours/requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, userId: user.id }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create request');
      }
      const data = await res.json();

      // Update UI state
      setServiceRequests(prev => [{
        id: data?.data?.id || data?.id || ('req-' + Date.now()),
        service: service.name,
        description: payload.description,
        amount: tokensNum,
        provider: 'Elverra Global',
        status: 'pending',
        requestDate: new Date().toISOString(),
        estimatedCompletion: undefined,
      }, ...prev]);

      // Deduct tokens from local balance and add to usedThisMonth
      setTokenBalances(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(b => b.tokenId === requestServiceId);
        if (idx >= 0) {
          const newBalance = updated[idx].balance - tokensNum;
          const newUsed = (updated[idx].usedThisMonth || 0) + tokensNum;
          updated[idx] = {
            ...updated[idx],
            balance: newBalance,
            usedThisMonth: newUsed,
            remainingBalance: newBalance - newUsed,
          };
        }
        return updated;
      });

      toast.success(t('service_request_success_message', { service: service.name }));
      setRequestDialogOpen(false);
    } catch (e: any) {
      console.error('submitServiceRequest error', e);
      toast.error(e?.message || t('error_service_request'));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateMonthlyUsage = (tokenId: string) => {
    const balance = tokenBalances.find(b => b.tokenId === tokenId);
    if (!balance) return { used: 0, total: MAX_MONTHLY_PURCHASE_PER_SERVICE, percentage: 0 };
    const used = balance.usedThisMonth || 0;
    const total = balance.monthlyLimit || MAX_MONTHLY_PURCHASE_PER_SERVICE;
    return {
      used,
      total,
      percentage: Math.min(Math.round((used / total) * 100), 100),
    };
  };

  // Eligibility gate temporarily disabled; show full section for all users

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('osecours_services')}</h2>
        <div className="flex items-center space-x-2">
          <Badge className={isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isEligible ? t('active') : t('inactive')}
          </Badge>
          <Button variant="outline" size="sm" aria-label="Help">
            <HelpCircle className="h-4 w-4 mr-1" />
            {t('help')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('your_subscription')}</CardTitle>
          <CardDescription>{t('subscription_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('status')}</p>
                <p className="text-lg font-semibold">{isEligible ? t('active') : t('inactive')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('available_services')}</p>
                <p className="text-lg font-semibold">{TOKEN_TYPES.length}/{TOKEN_TYPES.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('avg_response_time')}</p>
                <p className="text-lg font-semibold">{t('15_min')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('satisfaction')}</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold">4.8</span>
                  <span className="text-xs text-gray-500 ml-1">{t('128_reviews')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="h-4 w-4 inline mr-1" />
              {t('renewal_date', {
                date: new Date(membership?.expiry_date || Date.now()).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }),
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>{t('monthly_usage')}</span>
            <span>{calculateMonthlyUsage(selectedToken).percentage}%</span>
          </div>
          <Progress value={calculateMonthlyUsage(selectedToken).percentage} className="h-2" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="services">{t('services')}</TabsTrigger>
          <TabsTrigger value="requests">{t('my_requests')}</TabsTrigger>
          <TabsTrigger value="history">{t('history')}</TabsTrigger>
          <TabsTrigger value="tokens">{t('my_tokens')}</TabsTrigger>
          <TabsTrigger value="purchase">{t('purchase')}</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOKEN_TYPES.map(service => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{service.icon}</span>
                    <Badge variant="default">{service.name}</Badge>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{service.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="space-y-2 text-sm text-gray-700 mb-4">
                    <p>
                      <strong>{t('price_per_token')}:</strong> CFA {service.price.toLocaleString()}
                    </p>
                    <p>
                      <strong>{t('current_balance')}:</strong> {getTokenBalance(service.id)}
                    </p>
                    <p>
                      <strong>{t('usage_this_month')}:</strong> {getTokenUsage(service.id)}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => requestService(service.id)}
                    disabled={getTokenBalance(service.id) < 1}
                    aria-label={`Request ${service.name} service`}
                  >
                    {t('request_service')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('current_requests')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : serviceRequests.filter(req => req.status === 'in-progress' || req.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests
                    .filter(req => req.status === 'in-progress' || req.status === 'pending')
                    .map(request => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{request.service}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">{t('request_id')}:</span>
                            <span className="font-medium ml-2">{request.id}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('amount')}:</span>
                            <span className="font-medium ml-2">CFA {request.amount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('provider')}:</span>
                            <span className="font-medium ml-2">{request.provider}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t('estimated_completion')}:</span>
                            <span className="font-medium ml-2">{request.estimatedCompletion || 'TBD'}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" aria-label={`Track request ${request.id}`}>
                            {t('track_request')}
                          </Button>
                          <Button size="sm" variant="outline" aria-label={`Contact provider for request ${request.id}`}>
                            {t('contact_provider')}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">{t('no_active_requests')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('service_history')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : serviceRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">{t('request_id')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('service')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('date')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('amount')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('provider')}</th>
                        <th className="text-left py-3 px-4 font-semibold">{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRequests.map(request => (
                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{request.id}</td>
                          <td className="py-4 px-4">{request.service}</td>
                          <td className="py-4 px-4">{formatDate(request.requestDate)}</td>
                          <td className="py-4 px-4 font-semibold">CFA {request.amount.toLocaleString()}</td>
                          <td className="py-4 px-4">{request.provider}</td>
                          <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">{t('no_service_history')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('your_token_balances')}</CardTitle>
              <CardDescription>{t('manage_tokens')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : tokenBalances.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tokenBalances.map(balance => {
                    const token = TOKEN_TYPES.find(t => t.id === balance.tokenId);
                    if (!token) return null;
                    const usage = getTokenUsage(balance.tokenId);
                    const remaining = getRemainingTokens(balance.tokenId);
                    return (
                      <Card key={balance.tokenId} className="overflow-hidden">
                        <div className="h-2" style={{ backgroundColor: token.color }} />
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="text-2xl">{token.icon}</div>
                              <h3 className="font-semibold">{token.name}</h3>
                            </div>
                            <div className="text-2xl font-bold">{balance.balance}</div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t('usage_this_month')}</span>
                              <span>
                                {usage} / {balance.monthlyLimit || MAX_MONTHLY_PURCHASE_PER_SERVICE}
                              </span>
                            </div>
                            <Progress
                              value={(usage / (balance.monthlyLimit || MAX_MONTHLY_PURCHASE_PER_SERVICE)) * 100}
                              className="h-2"
                            />
                            <div className="text-sm text-muted-foreground">
                              {t('remaining_tokens', { count: remaining })}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => {
                              setSelectedToken(balance.tokenId);
                              setActiveTab('purchase');
                            }}
                            aria-label={`Buy more ${token.name} tokens`}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {t('buy_more')}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{t('no_tokens')}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('transaction_history')}</CardTitle>
              <CardDescription>{t('track_transactions')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map(tx => {
                    const token = TOKEN_TYPES.find(t => t.id === tx.tokenId);
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-muted">{token?.icon || '💳'}</div>
                          <div>
                            <p className="font-medium">
                              {tx.amount} {token?.name || 'Token'}
                            </p>
                            <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">CFA {tx.totalPrice.toLocaleString()}</p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">{t('no_transactions')}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('buy_tokens')}</CardTitle>
              <CardDescription>{t('buy_tokens_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('error')}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {/* Embedded TokenPurchase component handles payment method selection and flow */}
              <TokenPurchase 
                onPurchaseSuccess={fetchData}
                userBalances={tokenBalances.map(b => ({ serviceType: b.tokenId as any, usedThisMonth: b.usedThisMonth || 0 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Service Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('request_service')}</DialogTitle>
            <DialogDescription>{t('describe_service_request') || 'Provide details for your assistance request.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('service')}</Label>
              <Select value={requestServiceId} onValueChange={setRequestServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('select_service') || 'Select service'} />
                </SelectTrigger>
                <SelectContent>
                  {TOKEN_TYPES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('tokens_to_use') || 'Tokens to use'}</Label>
              <Input type="number" min={1} value={requestTokens} onChange={(e) => setRequestTokens(e.target.value)} />
              <div className="text-xs text-muted-foreground mt-1">
                {t('available')}: {getTokenBalance(requestServiceId)}
              </div>
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Textarea rows={4} value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} placeholder={t('describe_need') || 'Describe your need...'} />
            </div>
            <div>
              <Label>{t('justification_attachment') || 'Justification (optional)'}</Label>
              <Input type="file" accept="image/*,application/pdf" onChange={(e) => setRequestFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>{t('cancel') || 'Cancel'}</Button>
            <Button onClick={submitServiceRequest} disabled={submittingRequest}>
              {submittingRequest ? t('submitting') || 'Submitting...' : t('submit_request') || 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OSecoursSection;