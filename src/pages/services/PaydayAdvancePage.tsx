import { DollarSign, Clock, Calculator, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const PaydayAdvancePage = () => {
  const loanTypes = [
    {
      name: 'Emergency Cash',
      amount: 'CFA 10,000 - 50,000',
      term: '7-14 days',
      rate: '2% daily',
      description: 'Quick cash for urgent situations'
    },
    {
      name: 'Short-term Advance',
      amount: 'CFA 25,000 - 100,000',
      term: '15-30 days',
      rate: '1.5% daily',
      description: 'Flexible short-term financing'
    },
    {
      name: 'Extended Advance',
      amount: 'CFA 50,000 - 200,000',
      term: '30-60 days',
      rate: '1% daily',
      description: 'Longer-term advance with better rates'
    }
  ];

  const membershipRates = [
    {
      tier: 'Essential',
      rate: '2.0% daily',
      maxAmount: 'CFA 75,000',
      processingTime: '2-4 hours'
    },
    {
      tier: 'Premium',
      rate: '1.5% daily',
      maxAmount: 'CFA 150,000',
      processingTime: '1-2 hours'
    },
    {
      tier: 'VIP',
      rate: '1.0% daily',
      maxAmount: 'CFA 250,000',
      processingTime: '30-60 minutes'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Get approved and funded within hours, not days'
    },
    {
      icon: Calculator,
      title: 'Transparent Fees',
      description: 'Clear pricing with no hidden charges or surprises'
    },
    {
      icon: TrendingUp,
      title: 'Flexible Terms',
      description: 'Choose repayment terms that fit your situation'
    },
    {
      icon: CheckCircle,
      title: 'Member Benefits',
      description: 'Better rates and higher limits for loyal members'
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Payday Advance"
        description="Quick cash advances for your immediate financial needs with transparent terms and fast approval"
        backgroundImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-orange-50 to-yellow-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Quick Cash When You Need It Most</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Get fast access to cash advances with transparent terms, competitive rates, and quick approval. 
                Perfect for covering unexpected expenses or bridging short-term cash flow gaps.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Card>
              ))}
            </div>

            {/* Loan Types */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Available Advance Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loanTypes.map((loan, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <DollarSign className="h-6 w-6 text-orange-600" />
                      </div>
                      <CardTitle className="text-xl">{loan.name}</CardTitle>
                      <CardDescription>{loan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="font-medium">{loan.amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Term:</span>
                          <span className="font-medium">{loan.term}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Interest Rate:</span>
                          <Badge variant="outline">{loan.rate}</Badge>
                        </div>
                      </div>
                   
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Membership Benefits */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Membership Tier Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {membershipRates.map((tier, index) => (
                  <Card key={index} className={`border-2 ${tier.tier === 'VIP' ? 'border-purple-300 bg-purple-50' : tier.tier === 'Premium' ? 'border-orange-300 bg-orange-50' : 'border-gray-300'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl">{tier.tier}</CardTitle>
                        {tier.tier === 'VIP' && (
                          <Badge className="bg-purple-600">Best Value</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Interest Rate:</span>
                          <span className="font-bold text-lg text-orange-600">{tier.rate}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Max Amount:</span>
                          <span className="font-medium">{tier.maxAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Processing:</span>
                          <span className="font-medium">{tier.processingTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <Tabs defaultValue="process" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="process">Application Process</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="repayment">Repayment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="process" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Simple Application Process</CardTitle>
                      <CardDescription>
                        Get your cash advance in just a few easy steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="bg-orange-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-orange-600">1</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Submit Application</h3>
                            <p className="text-gray-600">
                              Complete our simple online application with your employment and financial information.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-orange-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-orange-600">2</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Quick Review</h3>
                            <p className="text-gray-600">
                              Our team reviews your application and membership status for instant pre-approval.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-orange-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-orange-600">3</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Document Verification</h3>
                            <p className="text-gray-600">
                              Upload required documents for final verification and approval.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-orange-100 h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0">
                            <span className="font-bold text-orange-600">4</span>
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">Receive Funds</h3>
                            <p className="text-gray-600">
                              Get your cash advance transferred directly to your mobile money account or bank.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="requirements" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Eligibility Requirements</CardTitle>
                      <CardDescription>
                        Check if you qualify for our payday advance service
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="font-bold mb-4">Basic Requirements</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Elverra Global client subscription</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Steady monthly income (minimum CFA 50,000)</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Valid government-issued ID</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Active mobile money or bank account</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="font-bold mb-4">Required Documents</h3>
                          <ul className="space-y-2">
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Recent pay slips (last 3 months)</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Bank statements or mobile money records</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Proof of residence</span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              <span>Emergency contact information</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="repayment" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Repayment Information</CardTitle>
                      <CardDescription>
                        Understand your repayment options and terms
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-yellow-800">Important Repayment Terms</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                Repayment is due on your next payday or within the agreed term. Late payments incur additional fees.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-3">Repayment Methods</h4>
                            <ul className="space-y-2 text-sm">
                              <li>• Automatic deduction from salary</li>
                              <li>• Mobile money payment</li>
                              <li>• Bank transfer</li>
                              <li>• Cash payment at our offices</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-3">Late Payment Policy</h4>
                            <ul className="space-y-2 text-sm">
                              <li>• Grace period: 3 days</li>
                              <li>• Late fee: CFA 2,000 per day</li>
                              <li>• Maximum late fee: 20% of loan amount</li>
                              <li>• Restructuring options available</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Card className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
                <CardContent className="p-12">
                  <DollarSign className="h-16 w-16 mx-auto mb-6 text-white" />
                  <h2 className="text-3xl font-bold mb-4">Need Cash Today?</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Apply for your payday advance now and get the funds you need within hours
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="outline" className="bg-white text-orange-600 hover:bg-gray-100">
                      <Link to="/services/payday-advance" className="flex items-center">
                        Apply for Advance
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600">
                      <Link to="/about/contact">
                        Calculate Repayment
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaydayAdvancePage;