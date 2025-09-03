import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bike, Car, Phone, GraduationCap, Truck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const SecoursSubscriptions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const subscriptionTypes = [
    {
      type: 'motors',
      name: 'Ô Secours Motors',
      description: 'Motorcycle breakdown assistance',
      icon: Bike,
      tokenValue: 250,
      minTokens: 30,
      maxTokens: 60,
      minValue: 7500,
      maxValue: 15000
    },
    {
      type: 'cata_catanis',
      name: 'Ô Secours Cata Catanis',
      description: 'Three-wheeler breakdown assistance',
      icon: Truck,
      tokenValue: 500,
      minTokens: 30,
      maxTokens: 60,
      minValue: 15000,
      maxValue: 30000
    },
    {
      type: 'auto',
      name: 'Ô Secours Auto',
      description: 'Automobile breakdown assistance',
      icon: Car,
      tokenValue: 750,
      minTokens: 30,
      maxTokens: 60,
      minValue: 22500,
      maxValue: 45000
    },
    {
      type: 'telephone',
      name: 'Ô Secours Telephone',
      description: 'Emergency phone purchase assistance',
      icon: Phone,
      tokenValue: 250,
      minTokens: 30,
      maxTokens: 60,
      minValue: 7500,
      maxValue: 15000
    },
    {
      type: 'school_fees',
      name: 'Ô Secours Frais Scolaires',
      description: 'School fees emergency assistance',
      icon: GraduationCap,
      tokenValue: 500,
      minTokens: 30,
      maxTokens: 60,
      minValue: 15000,
      maxValue: 30000
    }
  ];

  // Fetch user's existing subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['secours-subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/secours/user-subscriptions');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      return response.json();
    },
    enabled: !!user
  });

  // Check if user has membership (Club66 card holder requirement)
  const { data: membership } = useQuery({
    queryKey: ['user-membership'],
    queryFn: async () => {
      const response = await fetch('/api/membership/user');
      if (!response.ok) throw new Error('Failed to fetch membership');
      return response.json();
    },
    enabled: !!user
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionType: 'motors' | 'cata_catanis' | 'auto' | 'telephone' | 'school_fees') => {
      if (!user) throw new Error('User not authenticated');
      
      const mockCreateResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockCreateResult;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secours-subscriptions'] });
      toast.success('Subscription created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create subscription');
    }
  });

  const getSubscriptionStatus = (type: string) => {
    return subscriptions?.find((sub: any) => sub.subscription_type === type);
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Authentication Required</h3>
            <p className="text-gray-600">
              Please log in to access Ô Secours services.
            </p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Elverra Client Status Required</h3>
            <p className="text-gray-600">
              Only Elverra card holders can subscribe to Ô Secours services. 
              Please become a client first to access these emergency assistance services.
            </p>
            <Button asChild>
              <Link to="/register">Become a Client</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Ô Secours Subscriptions</h2>
        <p className="text-gray-600">
          Choose your emergency assistance plans. Each subscription provides token-based rescue services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionTypes.map((subType) => {
          const subscription = getSubscriptionStatus(subType.type);
          const Icon = subType.icon;

          return (
            <Card key={subType.type} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-blue-600" />
                  {subscription ? (
                    <Badge variant={subscription.is_active ? "default" : "secondary"}>
                      {subscription.is_active ? "Active" : "Inactive"}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not Subscribed</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{subType.name}</CardTitle>
                <CardDescription>{subType.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Token Value:</span>
                    <span className="font-medium">{subType.tokenValue} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Monthly:</span>
                    <span className="font-medium">{subType.minValue.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Monthly:</span>
                    <span className="font-medium">{subType.maxValue.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rescue Value:</span>
                    <span className="font-medium text-green-600">150%-200%</span>
                  </div>
                </div>

                {subscription && (
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Token Balance:</span>
                      <Badge variant="outline" className="bg-green-50">
                        {subscription.token_balance} tokens
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Subscribed: {new Date(subscription.subscription_date).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {!subscription ? (
                  <Button 
                    onClick={() => createSubscriptionMutation.mutate(subType.type as 'motors' | 'cata_catanis' | 'auto' | 'telephone' | 'school_fees')}
                    disabled={createSubscriptionMutation.isPending}
                    className="w-full"
                  >
                    {createSubscriptionMutation.isPending ? 'Creating...' : 'Subscribe'}
                  </Button>
                ) : (
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                      Subscription Active
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• Rescue requests can only be made 30 days after subscription.</p>
          <p>• Rescue value is 150% of token balance, or 200% if no claims in the previous year.</p>
          <p>• Minimum token balance of 30 days value is required for rescue eligibility.</p>
          <p>• Tokens can be purchased and accumulated in real-time through the website.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecoursSubscriptions;