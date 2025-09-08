
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CreditCard, Users, Copy, ExternalLink, Gift, Percent, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
import { Check } from '@/components/ui/check';
import { toast } from '@/hooks/use-toast';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import WithdrawalRequest from '@/components/affiliates/WithdrawalRequest';
import MembershipGuard from '@/components/membership/MembershipGuard';

const AffiliateDashboard = () => {
  const [copied, setCopied] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const { affiliateData, loading, error, refreshData } = useAffiliateData();

  const handleCopyReferralLink = () => {
    if (!affiliateData) return;
    
    navigator.clipboard.writeText(`https://elverraglobalml.com/register?ref=${affiliateData.referralCode}`);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard."
    });
    
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading affiliate data...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => refreshData()}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!affiliateData) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Affiliate Data</h2>
            <p className="text-gray-600">Unable to load affiliate information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <MembershipGuard requiredFeature="canAccessAffiliates" requiredTier="premium">
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-4">
          {/* Demo Data Notice */}
          <div className="mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                <p className="text-yellow-800 font-medium">
                  Demo Dashboard: This affiliate data is for demonstration purposes and not connected to live transactions
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
              <p className="text-gray-600">Refer friends and earn rewards with Elverra Global</p>
            </div>
            <div className="mt-4 lg:mt-0 space-x-2">
              <Button variant="outline">
                View Withdrawals
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                onClick={() => setShowWithdrawalModal(true)}
                disabled={affiliateData.pendingEarnings === 0}
              >
                Request Withdrawal
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Total Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{affiliateData.totalReferrals}</span>
                    <span className="text-sm ml-2 text-gray-500">/ {affiliateData.referralTarget} target</span>
                  </div>
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                
                {/* Progress bar */}
                <div className="mt-4">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
                      style={{ width: `${affiliateData.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.max(0, affiliateData.referralTarget - affiliateData.totalReferrals)} more referrals to waive your registration fee
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-3xl font-bold">CFA {affiliateData.totalEarnings.toLocaleString()}</span>
                  </div>
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500">Pending: </span>
                  <span className="font-medium ml-1">CFA {affiliateData.pendingEarnings.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-500">Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-600 mr-3" />
                  <div className="text-sm">
                    <p>
                      {affiliateData.totalReferrals >= affiliateData.referralTarget 
                        ? "✓ Registration fee waived" 
                        : `${Math.max(0, affiliateData.referralTarget - affiliateData.totalReferrals)} more referrals to waive fee`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-green-500 mr-3" />
                  <div className="text-sm">
                    <p>10% commission on all referral fees</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Gift className="h-5 w-5 text-amber-500 mr-3" />
                  <div className="text-sm">
                    <p>Special rewards at 10+ referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Referral Link */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
                <CardDescription>Share this link with friends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex">
                  <Input
                    readOnly
                    value={`https://elverra-global.com/register?ref=${affiliateData.referralCode}`}
                    className="rounded-r-none"
                  />
                  <Button
                    onClick={handleCopyReferralLink}
                    variant="outline" 
                    className="rounded-l-none"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium">Referral Code:</p>
                  <div className="flex items-center mt-1">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded font-mono text-sm">
                      {affiliateData.referralCode}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start">
                <p className="text-sm text-gray-500 mb-3">Share your link via:</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardFooter>
            </Card>
            
            {/* Referral History */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Referral History</CardTitle>
                <CardDescription>Track your referrals and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="h-12 px-4 text-left align-middle font-medium">Member</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {affiliateData.referralHistory.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                  No referrals yet. Start sharing your referral link to earn commissions!
                                </td>
                              </tr>
                            ) : (
                              affiliateData.referralHistory.map((referral) => (
                                <tr key={referral.id} className="border-b">
                                  <td className="p-4 align-middle">{referral.name}</td>
                                  <td className="p-4 align-middle text-gray-600">{referral.date}</td>
                                  <td className="p-4 align-middle">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      referral.status === 'Active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {referral.status}
                                    </span>
                                  </td>
                                  <td className="p-4 align-middle text-right font-medium">
                                    CFA {referral.earnings.toLocaleString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="h-12 px-4 text-left align-middle font-medium">Member</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {affiliateData.referralHistory
                              .filter(ref => ref.status === 'Active')
                              .map((referral) => (
                                <tr key={referral.id} className="border-b">
                                  <td className="p-4 align-middle">{referral.name}</td>
                                  <td className="p-4 align-middle text-gray-600">{referral.date}</td>
                                  <td className="p-4 align-middle">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      {referral.status}
                                    </span>
                                  </td>
                                  <td className="p-4 align-middle text-right font-medium">
                                    CFA {referral.earnings.toLocaleString()}
                                  </td>
                                </tr>
                            ))}
                            {affiliateData.referralHistory.filter(ref => ref.status === 'Active').length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                  No active referrals yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    <div className="rounded-md border">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="h-12 px-4 text-left align-middle font-medium">Member</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                              <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                              <th className="h-12 px-4 text-right align-middle font-medium">Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {affiliateData.referralHistory
                              .filter(ref => ref.status === 'Pending')
                              .map((referral) => (
                                <tr key={referral.id} className="border-b">
                                  <td className="p-4 align-middle">{referral.name}</td>
                                  <td className="p-4 align-middle text-gray-600">{referral.date}</td>
                                  <td className="p-4 align-middle">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      {referral.status}
                                    </span>
                                  </td>
                                  <td className="p-4 align-middle text-right font-medium">
                                    CFA {referral.earnings.toLocaleString()}
                                  </td>
                                </tr>
                            ))}
                            {affiliateData.referralHistory.filter(ref => ref.status === 'Pending').length === 0 && (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                  No pending referrals.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" className="flex items-center">
                  View All Transactions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Additional Demo Info Section */}
          <div className="mt-8 bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Affiliate Program Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-2">10%</div>
                <p className="text-sm text-gray-600">Commission Rate</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">3 Days</div>
                <p className="text-sm text-gray-600">Processing Time</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">CFA 250K</div>
                <p className="text-sm text-gray-600">Max Monthly Earnings</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        <WithdrawalRequest
          open={showWithdrawalModal}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => {
            setShowWithdrawalModal(false);
            refreshData();
          }}
          availableAmount={affiliateData.pendingEarnings}
        />
      </Layout>
    </MembershipGuard>
  );
};

export default AffiliateDashboard;
