
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MembershipStatusProps {
  membershipTier: 'Essential' | 'Premium' | 'Elite';
  memberSince: string;
  expiryDate: string;
  nextPayment: string;
}

const MembershipStatus = ({ membershipTier, memberSince, expiryDate, nextPayment }: MembershipStatusProps) => {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Client Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Tier:</span>
            <span className="font-medium">{membershipTier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Client Since:</span>
            <span>{memberSince}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expires:</span>
            <span>{expiryDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Payment:</span>
            <span>{nextPayment}</span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-4">
          Renew Membership
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipStatus;
