import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
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

  // Mock affiliate data
  const affiliateData = {
    referralCode: 'ELV-' + user?.id?.slice(0, 8)?.toUpperCase() || 'ELV-DEMO123',
    totalEarnings: 175000,
    monthlyEarnings: 45000,
    totalReferrals: 7,
    activeReferrals: 5,
    pendingPayouts: 25000,
    nextPayoutDate: '2024-02-15',
    commissionRate: 15,
    currentTier: 'Gold'
  };

  // Mock referral history
  const [referrals] = useState([
    {
      id: 1,
      name: 'Aminata Diallo',
      email: 'aminata.d@email.com',
      joinDate: '2024-01-15',
      status: 'active',
      earnings: 25000,
      plan: 'Premium'
    },
    {
      id: 2,
      name: 'Ibrahim Traore',
      email: 'ibrahim.t@email.com',
      joinDate: '2024-01-12',
      status: 'active',
      earnings: 30000,
      plan: 'Elite'
    },
    {
      id: 3,
      name: 'Fatoumata Kone',
      email: 'fatoumata.k@email.com',
      joinDate: '2024-01-08',
      status: 'active',
      earnings: 25000,
      plan: 'Premium'
    },
    {
      id: 4,
      name: 'Sekou Camara',
      email: 'sekou.c@email.com',
      joinDate: '2024-01-05',
      status: 'inactive',
      earnings: 15000,
      plan: 'Essential'
    },
    {
      id: 5,
      name: 'Mariam Sidibe',
      email: 'mariam.s@email.com',
      joinDate: '2023-12-28',
      status: 'active',
      earnings: 30000,
      plan: 'Elite'
    },
    {
      id: 6,
      name: 'Moussa Bamba',
      email: 'moussa.b@email.com',
      joinDate: '2023-12-20',
      status: 'active',
      earnings: 25000,
      plan: 'Premium'
    },
    {
      id: 7,
      name: 'Aicha Toure',
      email: 'aicha.t@email.com',
      joinDate: '2023-12-15',
      status: 'inactive',
      earnings: 0,
      plan: 'Essential'
    }
  ]);

  // Mock leaderboard
  const [leaderboard] = useState([
    { rank: 1, name: 'Mamadou Keita', referrals: 25, earnings: 425000 },
    { rank: 2, name: 'Kadiatou Diarra', referrals: 18, earnings: 350000 },
    { rank: 3, name: 'You', referrals: 7, earnings: 175000 },
    { rank: 4, name: 'Ousmane Sanogo', referrals: 12, earnings: 165000 },
    { rank: 5, name: 'Safiatou Cisse', referrals: 9, earnings: 140000 }
  ]);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(affiliateData.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWithdraw = () => {
    // Handle withdraw functionality
    alert('Withdrawal request submitted! Your funds will be processed within 1-3 business days.');
  };

  const shareReferralLink = () => {
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
          <span className="text-sm text-gray-600">Current Tier:</span>
          {getTierBadge(affiliateData.currentTier)}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  CFA {affiliateData.totalEarnings.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-blue-600">{affiliateData.totalReferrals}</p>
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
                <p className="text-2xl font-bold text-purple-600">
                  CFA {affiliateData.monthlyEarnings.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-orange-600">{affiliateData.commissionRate}%</p>
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
                  value={affiliateData.referralCode}
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
                  value={`https://elverra-global.com/register?ref=${affiliateData.referralCode}`}
                  readOnly
                  className="text-sm"
                />
                <Button onClick={shareReferralLink} variant="outline">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Earn:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Share your referral code with friends</li>
                <li>• Earn {affiliateData.commissionRate}% commission on their payments</li>
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
                  CFA {affiliateData.pendingPayouts.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Payout</p>
                <p className="text-lg font-bold text-blue-600">{affiliateData.nextPayoutDate}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Tier Benefits:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bronze (0-5 referrals):</span>
                  <span>10% commission</span>
                </div>
                <div className="flex justify-between">
                  <span>Silver (6-15 referrals):</span>
                  <span>12% commission</span>
                </div>
                <div className="flex justify-between font-semibold text-yellow-700">
                  <span>Gold (16-30 referrals):</span>
                  <span>15% commission</span>
                </div>
                <div className="flex justify-between">
                  <span>Platinum (30+ referrals):</span>
                  <span>20% commission</span>
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