import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenBalance, TokenBalance as TokenBalanceType } from '@/shared/types/secours';
import TokenBalanceComponent from './TokenBalance';
import TokenPurchase from './TokenPurchase';
import TransactionHistory from './TransactionHistory';
import WithdrawalRequest from './WithdrawalRequest';
import TokenService from '@/services/tokenService';

const OSecours: React.FC = () => {
  const [tokenBalances, setTokenBalances] = useState<TokenBalanceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('tokens');

  const fetchTokenBalances = async () => {
    try {
      setIsLoading(true);
      const response = await TokenService.getTokenBalances();
      
      if (response.success && response.data) {
        setTokenBalances(response.data);
      } else {
        setError(response.error || 'Failed to load token balances');
      }
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('An error occurred while loading token balances');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenBalances();
  }, []);

  const handlePurchaseSuccess = () => {
    fetchTokenBalances(); // Refresh balances after purchase
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading token information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-destructive">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ô Secours</h1>
          <p className="text-muted-foreground">
            Gestion de vos tokens d'assistance
          </p>
        </div>
      </div>

      <Tabs 
        defaultValue="tokens" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Mes Tokens</TabsTrigger>
          <TabsTrigger value="purchase">Acheter</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tokenBalances.map((balance) => (
              <TokenBalanceComponent 
                key={balance.tokenId} 
                balance={balance}
                onTokenClick={(tokenId) => {
                  setActiveTab('purchase');
                  // You might want to set the selected token in the purchase form here
                }}
              />
            ))}
          </div>
          
          <div className="mt-6
          ">
            <h2 className="text-xl font-semibold mb-4">Demande de Retrait</h2>
            <WithdrawalRequest 
              userBalances={tokenBalances}
              onWithdrawalSuccess={fetchTokenBalances}
            />
          </div>
        </TabsContent>

        <TabsContent value="purchase" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <TokenPurchase 
              onPurchaseSuccess={handlePurchaseSuccess}
              userBalances={tokenBalances}
            />
            <Card>
              <CardHeader>
                <CardTitle>À propos des Tokens Ô Secours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Comment ça marche ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Les tokens Ô Secours vous permettent d'accéder à différents services d'assistance.
                    Chaque type de token a une valeur et une utilisation spécifique.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Valeurs des Tokens</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Frais Scolaires: 250 FCFA/token</li>
                    <li>• Téléphone: 250 FCFA/token</li>
                    <li>• Moto: 250 FCFA/token</li>
                    <li>• Premiers Secours: 500 FCFA/token</li>
                    <li>• Cata Catanis: 500 FCFA/token</li>
                    <li>• Voiture: 750 FCFA/token</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Limites</h3>
                  <p className="text-sm text-muted-foreground">
                    Vous pouvez acheter jusqu'à 60 tokens de chaque type par mois.
                    Les tokens non utilisés sont reportés au mois suivant.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSecours;
