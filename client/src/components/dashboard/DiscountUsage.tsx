
import React from 'react';
import { Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DiscountUsage {
  id: string;
  date: string;
  merchant: string;
  discount: string;
  saved: string;
}

interface DiscountUsageProps {
  discountUsage: DiscountUsage[];
}

const DiscountUsageComponent = ({ discountUsage }: DiscountUsageProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Percent className="h-5 w-5 mr-2" />
          Recent Discount Usage
        </CardTitle>
        <CardDescription>Track the savings from your Elverra membership</CardDescription>
      </CardHeader>
      <CardContent>
        {discountUsage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Merchant</th>
                  <th className="text-left py-3 px-2">Discount</th>
                  <th className="text-left py-3 px-2">Savings</th>
                </tr>
              </thead>
              <tbody>
                {discountUsage.map((usage) => (
                  <tr key={usage.id} className="border-b">
                    <td className="py-3 px-2">{usage.date}</td>
                    <td className="py-3 px-2">{usage.merchant}</td>
                    <td className="py-3 px-2">{usage.discount}</td>
                    <td className="py-3 px-2 text-green-600">{usage.saved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No discount usage recorded yet.
          </div>
        )}
        
        <div className="mt-4">
          <Button variant="outline" className="w-full">
            View All Discounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountUsageComponent;
