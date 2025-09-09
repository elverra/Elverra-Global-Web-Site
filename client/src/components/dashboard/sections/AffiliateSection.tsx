import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share2, 
  Award,
  Gift,
  Calendar,
  Eye,
  Link,
  Wallet,
  ArrowDownToLine
} from 'lucide-react';

const AffiliateSection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [affiliateData, setAffiliateData] = useState<any>({});
  const [referrals, setReferrals] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAffiliateData();
      fetchReferrals();
      fetchLeaderboard();
    }
  }, [user]);

  const fetchAffiliateData = async () => {
    setLoading(true);
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/affiliates/${user.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        setAffiliateData(data);
      } else {
        throw new Error('Failed to fetch affiliate data');
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: "Error",
        description: "Failed to load affiliate data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/affiliates/${user.id}/referrals`);
      if (response.ok) {
        const data = await response.json();
        setReferrals(data);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/affiliates/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (affiliateData?.referralCode) {
      navigator.clipboard.writeText(affiliateData.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleWithdraw = () => {
    // Handle withdraw functionality
    alert('Withdrawal request submitted! Your funds will be processed within 1-3 business days.');
  };

  const shareReferralLink = () => {
    if (!affiliateData?.referralCode) return;
    const referralLink = `https://elverra-global.com/register?ref=${affiliateData.referralCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Elverra Global',
        text: 'Join me on Elverra Global and get exclusive benefits!',
        url: referralLink
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      alert('Referral link copied to clipboard!');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      Bronze: 'bg-orange-100 text-orange-800',
      Silver: 'bg-gray-100 text-gray-800',
      Gold: 'bg-yellow-100 text-yellow-800',
      Platinum: 'bg-purple-100 text-purple-800'
    };
    return <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{tier}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Affiliate Program</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Performance:</span>
          <Badge className="bg-blue-100 text-blue-800">
            {affiliateData?.totalReferrals || 0} Referrals
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    CFA {(affiliateData.totalEarnings || 0).toLocaleString()}
                  </p>
                )}
                <Button
                  onClick={handleWithdraw}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    affiliateData?.totalReferrals || 0
                  )}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                {loading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-purple-600">
                    CFA {(affiliateData.monthlyEarnings || 0).toLocaleString()}
                  </p>
                )}
                <Button
                  onClick={handleWithdraw}
                  variant="outline"
                  className="mt-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                  size="sm"
                >
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `10%`
                  )}
                </p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code and Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Your Referral Code & Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={affiliateData?.referralCode || 'Loading...'}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  <Copy className="h-4 w-4" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={affiliateData?.referralCode ? `https://elverra-global.com/register?ref=${affiliateData.referralCode}` : 'Loading...'}
                  readOnly
                  className="text-sm"
                />
                <Button onClick={shareReferralLink} variant="outline" disabled={!affiliateData?.referralCode}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Earn:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Share your referral code with friends</li>
                <li>• Earn {affiliateData?.commissionRate || 0}% commission on their payments</li>
                <li>• Get bonuses for active referrals</li>
                <li>• Monthly payouts on the 15th</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Payout Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pending Payout</p>
                <p className="text-lg font-bold text-orange-600">
                  {loading ? (
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse inline-block"></div>
                  ) : (
                    `CFA ${(affiliateData?.pendingPayouts || 0).toLocaleString()}`
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Payout</p>
                <p className="text-lg font-bold text-blue-600">
                  {loading ? (
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    affiliateData?.nextPayoutDate || 'N/A'
                  )}
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Commission Info:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Commission Rate:</span>
                  <span className="font-semibold">10% on all payments</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Types:</span>
                  <span>Card purchase & renewals</span>
                </div>
                <div className="flex justify-between">
                  <span>Payout Schedule:</span>
                  <span>Monthly on 15th</span>
                </div>
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Calendar className="h-4 w-4 mr-2" />
              Request Early Payout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{referral.name}</td>
                    <td className="py-4 px-4">{referral.email}</td>
                    <td className="py-4 px-4">{new Date(referral.joinDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Badge variant="outline">{referral.plan}</Badge>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(referral.status)}</td>
                    <td className="py-4 px-4 font-semibold text-green-600">
                      CFA {referral.earnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Affiliate Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((leader) => (
              <div
                key={leader.rank}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  leader.name === 'You' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    leader.rank === 1 ? 'bg-yellow-400 text-white' :
                    leader.rank === 2 ? 'bg-gray-400 text-white' :
                    leader.rank === 3 ? 'bg-orange-400 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {leader.rank}
                  </div>
                  <div>
                    <p className="font-semibold">{leader.name}</p>
                    <p className="text-sm text-gray-600">{leader.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">CFA {leader.earnings.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;