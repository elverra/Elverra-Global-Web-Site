import { Banknote, Calendar, Calculator, ShieldCheck, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PaydayLoan = () => {
  const loanFeatures = [
    {
      icon: Banknote,
      title: "Quick Cash Access",
      description: "Get funds before your next paycheck to handle emergencies or urgent expenses."
    },
    {
      icon: Calendar,
      title: "Short-Term Solution",
      description: "Loans designed to be repaid on your next payday, typically within 30 days."
    },
    {
      icon: Calculator,
      title: "Competitive Rates",
      description: "Preferential interest rates based on your Elverra Global client subscription tier."
    },
    {
      icon: ShieldCheck,
      title: "Transparent Terms",
      description: "Clear repayment terms with no hidden fees or charges."
    }
  ];
  
  const membershipTiers = [
    {
      tier: "Essential",
      rate: "8% flat interest",
      maxAmount: "Up to 50% of monthly salary",
      processingTime: "48 hours"
    },
    {
      tier: "Premium",
      rate: "8% flat interest",
      maxAmount: "Up to 60% of monthly salary",
      processingTime: "24 hours"
    },
    {
      tier: "Elite",
      rate: "5% flat interest",
      maxAmount: "Up to 70% of monthly salary",
      processingTime: "12 hours"
    }
  ];
  
  return (
    <Layout>
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Payday Loan</h1>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Quick access to funds before your next paycheck with our competitive Payday Loan service,
            offering preferential rates for Elverra Global clients.
          </p>
          
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-6">Financial Relief When You Need It Most</h2>
                <p className="text-gray-600 mb-6">
                  Our Payday Loan service provides a quick financial solution for unexpected expenses or 
                  emergencies that can't wait until your next salary. With competitive interest rates and 
                  streamlined processing, Elverra Global clients can access funds quickly and conveniently.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {loanFeatures.map((feature, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mb-3">
                        <feature.icon className="h-6 w-6 text-club66-purple" />
                      </div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  ))}
                </div>
                
                <Button className="bg-club66-purple hover:bg-club66-darkpurple">
                  Apply for Payday Loan
                </Button>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Loan Terms by Membership Tier</h3>
                <div className="space-y-6">
                  {membershipTiers.map((tier, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center mb-3">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          tier.tier === "Elite" ? "bg-club66-purple" : 
                          tier.tier === "Premium" ? "bg-amber-500" : "bg-gray-500"
                        }`}></div>
                        <h4 className="font-bold">{tier.tier} Membership</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <span className="text-gray-600">Interest Rate:</span>
                        <span className="font-medium">{tier.rate}</span>
                        <span className="text-gray-600">Maximum Amount:</span>
                        <span className="font-medium">{tier.maxAmount}</span>
                        <span className="text-gray-600">Processing Time:</span>
                        <span className="font-medium">{tier.processingTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t text-sm text-gray-500">
                  <p>Note: Elite members enjoy the lowest interest rate of 5% flat interest compared to 8% for other tiers.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-club66-purple">1</span>
                  </div>
                  <CardTitle>Apply</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Submit your application through your member dashboard or mobile app with your employment details.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-club66-purple">2</span>
                  </div>
                  <CardTitle>Verify</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Provide employment verification and agree to the loan terms and repayment schedule.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-club66-purple">3</span>
                  </div>
                  <CardTitle>Receive</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Get funds disbursed to your mobile money account or bank account quickly.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="bg-club66-purple/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-bold text-club66-purple">4</span>
                  </div>
                  <CardTitle>Repay</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    Repay the loan on your next payday through the same channel you received the funds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-16">
            <Tabs defaultValue="calculator" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="calculator">Loan Calculator</TabsTrigger>
                <TabsTrigger value="requirements">Eligibility</TabsTrigger>
              </TabsList>
              <TabsContent value="calculator" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estimate Your Loan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Salary (CFA)
                          </label>
                          <input 
                            type="number" 
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="e.g., 200,000" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Membership Tier
                          </label>
                          <select className="w-full rounded-md border border-gray-300 px-3 py-2">
                            <option value="essential">Essential</option>
                            <option value="premium">Premium</option>
                            <option value="elite">Elite</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Loan Amount (CFA)
                          </label>
                          <input 
                            type="number" 
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                            placeholder="e.g., 100,000" 
                          />
                        </div>
                        <Button className="w-full bg-club66-purple hover:bg-club66-darkpurple">
                          Calculate
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-bold mb-4">Loan Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Loan Amount:</span>
                            <span className="font-medium">CFA 100,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interest Rate:</span>
                            <span className="font-medium">8% flat</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Interest Amount:</span>
                            <span className="font-medium">CFA 8,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Processing Fee:</span>
                            <span className="font-medium">CFA 1,000</span>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total Repayment:</span>
                              <span>CFA 109,000</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Repayment Date:</span>
                            <span>June 30, 2023</span>
                          </div>
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
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold mb-4">Basic Requirements</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Active Elverra Global membership for at least 1 month</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Formal employment with steady income</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Valid identification (National ID or Passport)</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Recent pay slip or bank statement</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Active mobile money account or bank account</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-bold mb-4">Required Documents</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Copy of employment contract or work ID</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Last 1-3 months' pay slips</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Bank statement (if applicable)</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Proof of residence (utility bill or lease)</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Completed loan application form</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <p className="text-sm text-gray-600">
                      Note: Meeting these requirements doesn't guarantee loan approval. Each application is assessed 
                      individually based on our lending criteria and your financial situation.
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Need a Short-Term Financial Solution?</h2>
            <p className="text-gray-600 mb-8">
              Our Payday Loan service offers quick access to funds with competitive rates for 
              Elverra Global clients. Apply today and receive a decision quickly.
            </p>
           
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaydayLoan;