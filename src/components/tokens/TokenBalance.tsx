import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TokenBalance as TokenBalanceType, TOKEN_TYPES, ServiceType } from '@/shared/types/secours';

interface TokenBalanceProps {
  balance: TokenBalanceType;
  onTokenClick?: (serviceType: ServiceType) => void;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  balance,
  onTokenClick 
}) => {
  const token = TOKEN_TYPES[balance.tokenId as ServiceType];
  
  if (!token) return null;

  const usagePercentage = Math.min(
    Math.round((balance.usedThisMonth / balance.monthlyLimit) * 100),
    100
  );

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onTokenClick?.(balance.tokenId as ServiceType)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {token.name}
          </CardTitle>
          <div className="text-2xl font-bold text-primary">
            {balance.balance}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Used this month</span>
            <span>{balance.usedThisMonth} / {balance.monthlyLimit}</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="text-sm text-muted-foreground">
            {balance.remainingBalance} remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
