
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CreditCard, Users, Copy, ExternalLink, Gift, Percent, DollarSign, ArrowRight, Loader2, User, CheckCircle, Clock, Calendar, Mail, Award } from 'lucide-react';
import { Check } from '@/components/ui/check';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import WithdrawalRequest from '@/components/affiliates/WithdrawalRequest';
import OnboardingFlow from '@/components/affiliates/OnboardingFlow';
import MembershipGuard from '@/components/membership/MembershipGuard';
import { toast } from 'sonner';
import { useAffiliateData, type ReferralData } from '@/hooks/useAffiliateData';

const AffiliateDashboard = () => {
  const [copied, setCopied] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const { affiliateData, loading, error, refreshData } = useAffiliateData();

  const handleCopyReferralLink = () => {
    if (!affiliateData) return;

    navigator.clipboard.writeText(`https://elverraglobalml.com/register?ref=${affiliateData.referralCode}`);
    setCopied(true);
    toast("Referral link copied to clipboard.");

    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => refreshData()}>Try Again</Button>
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

  // Si l'utilisateur n'a pas terminé l'onboarding, afficher l'écran d'onboarding
  if (!affiliateData.onboardingStatus?.approved) {
    return (
      <MembershipGuard requiredFeature="canAccessAffiliates" requiredTier="premium">
        <Layout>
          <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)]">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue dans le programme d'affiliation Elverra Global</h1>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Pour devenir affilié, veuillez suivre cette courte formation qui vous expliquera comment fonctionne notre programme et comment maximiser vos gains.
                  </p>
                </div>

                <OnboardingFlow
                  onComplete={() => {
                    // Mettre à jour l'état d'approbation après avoir terminé l'onboarding
                    // Cette logique sera gérée par le hook useAffiliateData
                    toast.success('Félicitations ! Vous avez terminé la formation d\'affiliation.');
                    refreshData();
                  }}
                />

                <div className="mt-10 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-3">Ce que vous allez apprendre :</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Comment fonctionne le programme d'affiliation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Comment générer votre lien de parrainage</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Comment gagner des commissions sur les inscriptions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Les règles et bonnes pratiques à suivre</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </MembershipGuard>
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
                <h1 className="text-3xl font-bold">Tableau de bord d'affiliation</h1>
                <p className="text-gray-600">Parrainez des amis et gagnez des récompenses avec Elverra Global</p>

                {/* Section Référent */}
                {affiliateData.referrer && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Votre Référent</h3>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {affiliateData.referrer.full_name?.charAt(0).toUpperCase() || 'R'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {affiliateData.referrer.full_name || 'Utilisateur anonyme'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {affiliateData.referrer.email}
                        </p>
                        {affiliateData.referrer.phone && (
                          <p className="text-xs text-gray-500">
                            {affiliateData.referrer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 lg:mt-0 space-x-2">
                <Button variant="outline">
                  Voir les retraits
                </Button>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() => setShowWithdrawalModal(true)}
                  disabled={affiliateData.pendingEarnings === 0}
                >
                  Demander un retrait
                </Button>
              </div>
            </div>

            {/* Cartes de statistiques */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Parrainages
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{affiliateData?.totalReferrals ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {(affiliateData?.referralTarget ?? 0) - (affiliateData?.totalReferrals ?? 0)} avant la récompense
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-500">Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold">CFA {(affiliateData?.totalEarnings ?? 0).toLocaleString()}</span>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>

                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500">Pending: </span>
                    <span className="font-medium ml-1">CFA {(affiliateData?.pendingEarnings ?? 0).toLocaleString()}</span>
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
                        {affiliateData?.totalReferrals! >= (affiliateData?.referralTarget || 0)
                          ? "✓ Registration fee waived"
                          : `${Math.max(0, (affiliateData?.referralTarget || 0) - (affiliateData?.totalReferrals || 0))} more referrals to waive fee`}
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

            {/* Liste des personnes parrainées */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Personnes que vous avez parrainées</CardTitle>
                <CardDescription>
                  {(affiliateData?.referralHistory?.length ?? 0) > 0
                    ? `Vous avez parrainé ${affiliateData?.referralHistory?.length ?? 0} personne(s)`
                    : 'Aucune personne parrainée pour le moment'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(affiliateData?.referralHistory?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm text-gray-500">
                      <div className="col-span-4">Personne</div>
                      <div className="col-span-3">Email</div>
                      <div className="col-span-2">Date d'inscription</div>
                      <div className="col-span-2">Statut</div>
                      <div className="col-span-1 text-right">Gains</div>
                    </div>

                    {(affiliateData?.referralHistory || []).map((referral) => (
                      <div key={referral.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="col-span-4 flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {referral.name ? referral.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {referral.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {referral.userDetails?.membership_tier ?
                                `Niveau ${referral.userDetails.membership_tier}` :
                                'Non membre'}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center text-sm text-gray-500">
                          <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                          <span className="truncate">{referral.email}</span>
                        </div>

                        <div className="col-span-2 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                          {referral.date}
                        </div>

                        <div className="col-span-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {referral.status === 'Active' ? (
                              <>
                                <CheckCircle className="-ml-0.5 mr-1.5 h-3 w-3 text-green-500" />
                                Actif
                              </>
                            ) : (
                              <>
                                <Clock className="-ml-0.5 mr-1.5 h-3 w-3 text-yellow-500" />
                                En attente
                              </>
                            )}
                          </span>
                        </div>

                        <div className="col-span-1 text-right font-medium">
                          {referral.earnings > 0 ? (
                            <span className="text-green-600">+{referral.earnings} FCFA</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune personne parrainée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Partagez votre lien de parrainage pour inviter des amis à rejoindre Elverra Global.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                              {affiliateData?.referralHistory?.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-8 text-center text-gray-500">
                                    No referrals yet. Start sharing your referral link to earn commissions!
                                  </td>
                                </tr>
                              ) : (
                                affiliateData?.referralHistory?.map((referral) => (
                                  <tr key={referral.id} className="border-b">
                                    <td className="p-4 align-middle">{referral.name}</td>
                                    <td className="p-4 align-middle text-gray-600">{referral.date}</td>
                                    <td className="p-4 align-middle">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${referral.status === 'Active'
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
                              {affiliateData.referralHistory!
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
                              {affiliateData.referralHistory!.filter(ref => ref.status === 'Active').length === 0 && (
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
                              {affiliateData?.referralHistory
                                ?.filter((ref) => ref.status === 'Pending')
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
                              {affiliateData?.referralHistory?.filter((ref) => ref.status === 'Pending').length === 0 && (
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
          availableAmount={affiliateData.pendingEarnings ?? 0} // Add nullish coalescing operator
        />
      </Layout>
    </MembershipGuard>
  );
};

export default AffiliateDashboard;
