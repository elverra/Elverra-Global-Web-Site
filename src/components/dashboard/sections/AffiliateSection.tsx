import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Link as LinkIcon,
  Wallet,
  ArrowDownToLine,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpToLine
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AffiliateSection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [affiliateData, setAffiliateData] = useState<{
    id?: string;
    user_id?: string;
    referral_code?: string;
    approved?: boolean;
    created_at?: string;
    totalEarnings?: number;
    totalReferrals?: number;
    monthlyEarnings?: number;
  }>({});
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Vérifier l'inscription au programme d'affiliation
  useEffect(() => {
    if (user?.id) {
      checkAffiliateStatus();
    }
  }, [user]);
  if (!user) {
    toast({
      title: 'Error',
      description: 'You must be logged in to enroll in the affiliate program',
      variant: 'destructive'
    });
    return;
  }
  const checkAffiliateStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        // Si l'utilisateur est déjà affilié, charger les données
        await fetchAffiliateData(data);
      }
    } catch (error) {
      console.error('Error checking affiliate status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check affiliate status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer un code de parrainage unique
  const generateReferralCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `ELV-${randomNum}`;
  };

  // S'inscrire au programme d'affiliation
  const enrollInAffiliateProgram = async () => {
    try {
      // 1. Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in to join the affiliate program',
          variant: 'destructive'
        });
        return;
      }
  
      setIsEnrolling(true);
      
      // 2. Generate referral code
      const referralCode = generateReferralCode();
      
      // 3. Insert the affiliate record with explicit user_id
      const { data, error } = await supabase
        .from('affiliates')
        .insert([{
          user_id: user.id,  // Make sure this is set
          referral_code: referralCode,
          approved: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
  
      if (error) {
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }
  
      // Refresh affiliate data
      await checkAffiliateStatus();
      
      toast({
        title: 'Success',
        description: 'Your affiliate application has been submitted for review.',
        variant: 'default'
      });
  
    } catch (error) {
      console.error('Failed to enroll in affiliate program:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in affiliate program';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Récupérer les données d'affiliation
  const fetchAffiliateData = async (affiliate: any) => {
    try {
      // Ici, vous pouvez ajouter des appels pour récupérer les statistiques
      // Par exemple, le nombre de parrainages, les gains, etc.
      
      setAffiliateData({
        ...affiliate,
        totalEarnings: 0, // Remplacer par les données réelles
        totalReferrals: 0, // Remplacer par les données réelles
        monthlyEarnings: 0 // Remplacer par les données réelles
      });
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      throw error;
    }
  };

  // Copier le code de parrainage
  const copyReferralCode = () => {
    if (affiliateData?.referral_code) {
      navigator.clipboard.writeText(affiliateData.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    }
  };

  // Partager le lien de parrainage
  const shareReferralLink = () => {
    if (!affiliateData?.referral_code) return;
    
    const referralLink = `https://elverraglobalml.com/register?ref=${affiliateData.referral_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Elverra Global',
        text: 'Join me on Elverra Global and get exclusive benefits!',
        url: referralLink
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Link Copied!',
        description: 'Referral link copied to clipboard',
      });
    }
  };

  // Si l'utilisateur n'est pas encore inscrit au programme d'affiliation
  if (!affiliateData?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Join Our Affiliate Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Program Benefits:</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Earn 10% commission on all referred clients</li>
              <li>• Get paid for every renewal and every card payement</li>
              <li>• Real-time tracking of your referrals</li>
              <li>• Easy withdrawal process</li>
            </ul>
          </div>
          <Button 
            onClick={enrollInAffiliateProgram} 
            disabled={isEnrolling}
            className="w-full"
          >
            {isEnrolling ? 'Processing...' : 'Join Affiliate Program'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si l'utilisateur est en attente d'approbation
  if (!affiliateData.approved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              Your affiliate application is under review. You'll receive a notification once approved.
            </p>
          </div>
        
        </CardContent>
      </Card>
    );
  }

  // Si l'utilisateur est approuvé, afficher le tableau de bord d'affiliation
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  {affiliateData.totalEarnings?.toLocaleString() || '0'} FCFA
                </p>
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
                  {affiliateData.totalReferrals || '0'}
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
                <p className="text-2xl font-bold text-purple-600">
                  {affiliateData.monthlyEarnings?.toLocaleString() || '0'} FCFA
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code and Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Your Referral Code & Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={affiliateData.referral_code || 'Loading...'}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={
                    affiliateData.referral_code 
                      ? `https://elverraglobalml.com/register?ref=${affiliateData.referral_code}`
                      : 'Loading...'
                  }
                  readOnly
                  className="text-sm"
                />
                <Button 
                  onClick={shareReferralLink} 
                  variant="outline" 
                  disabled={!affiliateData.referral_code}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Earn:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Share your referral code with friends</li>
                <li>• Earn 10% commission on card purchase & renewals</li>
                <li>• Get paid for every successful referral</li>
                <li>• Withdraw your earnings at any time</li>
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
                  <span>At any time</span>
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => alert('Withdraw functionality coming soon!')}>
              <Wallet className="h-4 w-4 mr-2" />
              Request Withdrawal
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
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{referral.name}</td>
                      <td className="py-4 px-4">{referral.email}</td>
                      <td className="py-4 px-4">{new Date(referral.joinDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={referral.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {referral.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-semibold text-green-600">
                        {referral.earnings?.toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No referrals yet. Share your referral link to start earning!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;