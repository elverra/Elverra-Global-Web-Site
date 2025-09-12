import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
// Using local any-typed placeholders to avoid missing shared schema in frontend
type SecoursSubscription = any;
type SecoursRescueRequest = any;

const RescueRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [description, setDescription] = useState('');

  // Check if user has child membership - restrict access to rescue requests
  const { data: membership } = useQuery({
    queryKey: ['user-membership'],
    queryFn: async () => {
      return { tier: 'essential' } as any;
    },
    enabled: !!user
  });

  // Fetch user's subscriptions
  const { data: subscriptions, isLoading } = useQuery<SecoursSubscription[]>({
    queryKey: ['secours-subscriptions'],
    queryFn: async () => {
      return [] as any[];
    },
    enabled: !!user
  });

  // Fetch rescue requests
  const { data: rescueRequests } = useQuery<(SecoursRescueRequest & { secours_subscriptions?: SecoursSubscription })[]>({
    queryKey: ['rescue-requests'],
    queryFn: async () => {
      return [] as any[];
    },
    enabled: !!user
  });

  const createRescueRequestMutation = useMutation({
    mutationFn: async (requestData: {
      subscriptionId: string;
      description: string;
    }) => {
      // Get subscription details
      const mockResult = { data: { subscription_date: new Date().toISOString(), subscriptionType: 'basic', token_balance: 100, lastRescueClaimDate: null }, error: null }; // TODO: Replace with API call
      const { data: subscription, error: subError } = mockResult;

      if (subError) throw subError;

      // Check eligibility - subscription must be at least 30 days old
      const subscriptionDate = new Date(subscription.subscription_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (subscriptionDate > thirtyDaysAgo) {
        throw new Error('Rescue requests can only be made 30 days after subscription. Please wait for your subscription to mature.');
      }

      // Get minimum token requirements using database function
      const mockLimitsResult = { data: [{ min_tokens: 30 }], error: null }; // TODO: Replace with API call
      const { data: limits, error: limitsError } = mockLimitsResult;

      if (limitsError) throw limitsError;

      const minTokens = limits[0]?.min_tokens || 30;
      if (subscription.token_balance < minTokens) {
        throw new Error(`Insufficient token balance for rescue eligibility. Minimum ${minTokens} tokens (30 days value) required. Your current balance: ${subscription.token_balance} tokens.`);
      }

      // Get token value using database function
      const mockTokenValueResult = { data: 1000, error: null }; // TODO: Replace with API call
      const { data: tokenValue, error: tokenValueError } = mockTokenValueResult;

      if (tokenValueError) throw tokenValueError;

      // Calculate rescue value - 150% standard, 200% if no claims in past year
      let rescueMultiplier = 1.5; // 150% default
      
      // Check if no rescue claims in the last year for 200% bonus
      if (subscription.lastRescueClaimDate) {
        const lastClaim = new Date(subscription.lastRescueClaimDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        if (lastClaim <= oneYearAgo) {
          rescueMultiplier = 2.0; // 200% bonus for no claims in past year
        }
      } else {
        rescueMultiplier = 2.0; // 200% for first-time users (no previous claims)
      }
      
      const rescueValue = Math.floor(subscription.token_balance * tokenValue * rescueMultiplier);

      // Create rescue request
      const response = await fetch('/api/secours/rescue-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: requestData.subscriptionId,
          description: requestData.description,
          rescue_value: rescueValue,
          rescue_multiplier: rescueMultiplier
        })
      });

      if (!response.ok) throw new Error('Failed to create rescue request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-requests'] });
      toast.success('Rescue request submitted successfully!');
      setDescription('');
      setSelectedSubscription('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit rescue request');
    }
  });

  const handleSubmitRequest = () => {
    if (!selectedSubscription || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    createRescueRequestMutation.mutate({
      subscriptionId: selectedSubscription,
      description: description.trim()
    });
  };

  const getEligibilityStatus = (subscription: any) => {
    const subscriptionDate = new Date(subscription.subscription_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const isDateEligible = subscriptionDate <= thirtyDaysAgo;
    const minTokens = 30; // Simplified, should use the database function
    const isBalanceEligible = subscription.token_balance >= minTokens;

    return {
      eligible: isDateEligible && isBalanceEligible,
      dateEligible: isDateEligible,
      balanceEligible: isBalanceEligible,
      daysRemaining: isDateEligible ? 0 : Math.ceil((subscriptionDate.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading subscriptions...</div>;
  }

  // Check if user has child membership - restrict access to rescue requests
  if (membership?.tier === 'child') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Service Non Disponible</h3>
            <p className="text-gray-600">
              Les demandes de secours Ô Secours ne sont pas disponibles pour les détenteurs de carte enfant. 
              Ce service est réservé aux cartes adultes (Essential, Premium, Elite).
            </p>
            <p className="text-sm text-gray-500">
              Pour accéder à ce service, vous devez avoir une carte adulte Elverra.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">No Subscriptions Found</h3>
            <p className="text-gray-600">
              You need to subscribe to at least one Ô Secours service before you can request rescue assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Request Emergency Rescue</h2>
        <p className="text-gray-600">
          Submit a rescue request for immediate assistance in covered situations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              New Rescue Request
            </CardTitle>
            <CardDescription>
              Describe your emergency situation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subscription">Select Subscription</Label>
              <Select value={selectedSubscription} onValueChange={setSelectedSubscription}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the service you need" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((sub: SecoursSubscription) => {
                    const eligibility = getEligibilityStatus(sub);
                    return (
                      <SelectItem 
                        key={sub.id} 
                        value={sub.id}
                        disabled={!eligibility.eligible}
                      >
                        {sub.subscriptionType.replace('_', ' ').toUpperCase()}
                        {!eligibility.eligible && ' (Not Eligible)'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedSubscription && (
              <div className="space-y-3">
                {(() => {
                  const selectedSub = subscriptions.find(s => s.id === selectedSubscription);
                  const eligibility = selectedSub ? getEligibilityStatus(selectedSub) : null;
                  
                  if (!eligibility?.eligible) {
                    return (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {!eligibility?.dateEligible && 
                            `Wait ${eligibility?.daysRemaining} more days before requesting rescue. `}
                          {!eligibility?.balanceEligible && 
                            'Insufficient token balance. Minimum 30 days worth of tokens required.'}
                        </AlertDescription>
                      </Alert>
                    );
                  }

                  const tokenValue = selectedSub?.subscriptionType === 'auto' ? 750 : 
                                  selectedSub?.subscriptionType === 'cata_catanis' || selectedSub?.subscriptionType === 'school_fees' ? 500 : 250;
                  const rescueValue = selectedSub ? Math.floor((selectedSub.tokenBalance || 0) * tokenValue * 1.5) : 0;

                  return (
                    <div className="p-3 bg-green-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Balance:</span>
                        <span className="font-medium">{selectedSub?.tokenBalance} tokens</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Estimated Rescue Value:</span>
                        <span className="font-medium text-green-600">{rescueValue.toLocaleString()} FCFA</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        * 200% value if no claims in the past year
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div>
              <Label htmlFor="description">Emergency Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your emergency situation in detail..."
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSubmitRequest}
              disabled={createRescueRequestMutation.isPending || !selectedSubscription || !description.trim()}
              className="w-full"
            >
              {createRescueRequestMutation.isPending ? 'Submitting...' : 'Submit Rescue Request'}
            </Button>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rescue Requests</CardTitle>
            <CardDescription>
              Track the status of your requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rescueRequests && rescueRequests.length > 0 ? (
              <div className="space-y-3">
                {rescueRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {request.secours_subscriptions?.subscriptionType?.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status || 'pending')}
                        <Badge variant={
                          request.status === 'completed' ? 'default' :
                          request.status === 'approved' ? 'secondary' :
                          request.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.requestDescription}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rescue Value:</span>
                      <span className="font-medium">{Number(request.rescueValueFcfa).toLocaleString()} FCFA</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                    </div>
                    {request.adminNotes && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Admin Note: {request.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No rescue requests yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RescueRequest;
