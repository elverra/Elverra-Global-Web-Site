import React from 'react';
import { Receipt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Payment {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Upcoming' | 'Failed';
  description: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  nextPaymentDate?: string;
  nextPaymentAmount?: string;
}

const PaymentHistory = ({ payments, nextPaymentDate, nextPaymentAmount }: PaymentHistoryProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Payment History
          </CardTitle>
          <CardDescription>View your membership payment history</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Invoice</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Description</th>
                    <th className="text-left py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b">
                      <td className="py-3 px-2">{payment.id}</td>
                      <td className="py-3 px-2">{payment.date}</td>
                      <td className="py-3 px-2">{payment.description}</td>
                      <td className="py-3 px-2">{payment.amount}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          payment.status === 'Paid' 
                            ? 'bg-green-100 text-green-700' 
                            : payment.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No payment history found.
            </div>
          )}
        </CardContent>
      </Card>
      
      {nextPaymentDate && nextPaymentAmount && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Upcoming Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Monthly Subscription</h4>
                  <p className="text-sm text-gray-600">Due on {nextPaymentDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{nextPaymentAmount}</p>
                  <Button size="sm" className="mt-1">Pay Now</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PaymentHistory;