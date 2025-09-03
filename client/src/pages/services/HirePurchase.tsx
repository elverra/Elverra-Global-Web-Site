import { ShoppingBag, Clock, Check, Percent, Smartphone } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const HirePurchase = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: "Wide Range of Products",
      description: "Access everything from electronics and furniture to vehicles and equipment."
    },
    {
      icon: Clock,
      title: "Flexible Payment Plans",
      description: "Choose payment terms ranging from 3 to 24 months based on your needs."
    },
    {
      icon: Percent,
      title: "Competitive Rates",
      description: "Enjoy client tier-based interest rates starting from 5% monthly."
    },
    {
      icon: Check,
      title: "Simple Approval Process",
      description: "Quick decision-making with minimal documentation requirements."
    }
  ];
  
  const categories = [
    {
      name: "Electronics",
      examples: "Smartphones, Laptops, TVs, Appliances",
      terms: "3-12 months",
      downPayment: "20%",
      icon: Smartphone
    },
    {
      name: "Furniture",
      examples: "Sofas, Beds, Dining Sets",
      terms: "6-18 months",
      downPayment: "25%",
      icon: ShoppingBag
    },
    {
      name: "Vehicles",
      examples: "Cars, Motorcycles, Commercial Vehicles",
      terms: "12-24 months",
      downPayment: "30%",
      icon: ShoppingBag
    },
    {
      name: "Equipment",
      examples: "Agricultural, Construction, Business",
      terms: "6-24 months",
      downPayment: "25%",
      icon: ShoppingBag
    }
  ];
  
  const membershipTiers = [
    {
      tier: "Essential",
      rate: "7% monthly",
      maxAmount: "Up to CFA 1,000,000",
      processingTime: "3-5 days"
    },
    {
      tier: "Premium",
      rate: "6% monthly",
      maxAmount: "Up to CFA 3,000,000",
      processingTime: "2-3 days"
    },
    {
      tier: "Elite",
      rate: "5% monthly",
      maxAmount: "Up to CFA 5,000,000",
      processingTime: "1-2 days"
    }
  ];
  
  return (
    <Layout>
      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center">Hire Purchase</h1>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Acquire equipment, electronics, furniture, and vehicles with our flexible Hire Purchase program.
            Pay in installments while enjoying immediate use of your purchases.
          </p>
          
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-6">Own What You Need Today, Pay Over Time</h2>
                <p className="text-gray-600 mb-6">
                  Our Hire Purchase program allows Elverra Global clients to acquire valuable assets without paying 
                  the full amount upfront. Make a down payment, take possession of the item immediately, and pay 
                  the remainder in convenient monthly installments while you use and enjoy your purchase.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-club66-purple/10 p-2 rounded-full mr-4 shrink-0">
                        <feature.icon className="h-5 w-5 text-club66-purple" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => {
                    const hotline = "/dashboard";
                    window.open(hotline);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Apply for Hire Purchase
                </Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Hire Purchase Terms by Client Tier</h3>
                  <div className="space-y-6">
                    {membershipTiers.map((tier, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center mb-3">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            tier.tier === "Elite" ? "bg-club66-purple" : 
                            tier.tier === "Premium" ? "bg-amber-500" : "bg-gray-500"
                          }`}></div>
                          <h4 className="font-bold">{tier.tier} Client</h4>
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
                </div>
                <div className="bg-gray-50 p-6 border-t">
                  <p className="text-sm text-gray-600">
                    Elite clients enjoy the lowest interest rates and highest purchase limits, 
                    along with priority processing of applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Available Product Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 bg-club66-purple/10 rounded-full flex items-center justify-center mb-4">
                      <category.icon className="h-6 w-6 text-club66-purple" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>{category.examples}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Terms:</span>
                        <span className="font-medium">{category.terms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Typical Down Payment:</span>
                        <span className="font-medium">{category.downPayment}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mb-16">
            <Tabs defaultValue="how-it-works" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              <TabsContent value="how-it-works" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>The Hire Purchase Process</CardTitle>
                    <CardDescription>
                      Follow these simple steps to acquire products through our Hire Purchase program.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex">
                        <div className="mr-4">
                          <div className="bg-club66-purple/10 h-10 w-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-club66-purple">1</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Choose Your Product</h3>
                          <p className="text-gray-600">
                            Browse our catalog of partner merchants or bring quotes from preferred vendors for products 
                            you wish to purchase. We work with a wide network of suppliers across our markets.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="bg-club66-purple/10 h-10 w-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-club66-purple">2</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Apply & Get Approved</h3>
                          <p className="text-gray-600">
                            Complete the Hire Purchase application form with your product details and preferred payment term.
                            Our team will review your application and provide a quick decision based on your client tier.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="bg-club66-purple/10 h-10 w-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-club66-purple">3</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Make Down Payment</h3>
                          <p className="text-gray-600">
                            Pay the required down payment (typically 20-30% of the product value) 
                            through mobile money, bank transfer, or at our office locations.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="bg-club66-purple/10 h-10 w-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-club66-purple">4</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Receive Your Product</h3>
                          <p className="text-gray-600">
                            Take immediate possession of your product! We'll handle the purchase and arrange delivery 
                            to your specified address, or you can pick it up from the merchant location.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4">
                          <div className="bg-club66-purple/10 h-10 w-10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-club66-purple">5</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Make Monthly Payments</h3>
                          <p className="text-gray-600">
                            Pay your monthly installments according to your agreement. Once all payments are complete, 
                            the product is fully yours! Payment reminders are sent via SMS and email.
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
                      Check if you meet the criteria for our Hire Purchase program.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold mb-4">Basic Requirements</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Active Club66 Global client status for at least 2 months</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Steady source of income (employment or business)</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Good payment history with Elverra Global</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Ability to make the required down payment</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Valid identification and proof of residence</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-bold mb-4">Required Documents</h3>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Completed Hire Purchase application form</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Product quotation from approved vendor</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Proof of income (pay slips or bank statements)</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>National ID or Passport</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>Recent utility bill or lease agreement</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Hire Purchase FAQs</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">What happens if I miss a payment?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Missed payments incur late fees and may affect your credit history with Elverra Global. If you anticipate 
                      payment difficulties, contact us immediately to discuss restructuring options.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Can I pay off my hire purchase early?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Yes, you can pay off your remaining balance at any time. Early repayment may qualify for an interest reduction, 
                      depending on your client tier and the terms of your agreement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Is there product warranty coverage?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      All products maintain their manufacturer's warranty. For certain products, we offer additional protection plans 
                      that can be added to your hire purchase agreement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Can I get multiple items on hire purchase?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Yes, clients can have multiple hire purchase agreements simultaneously, subject to overall credit limit 
                      based on your client tier and payment capacity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Purchase?</h2>
            <p className="text-gray-600 mb-8">
              Our Hire Purchase program helps you acquire the items you need without the burden of full upfront payment.
              Apply today and start enjoying your purchase while paying over time.
            </p>
            <Button 
              onClick={() => {
                const hotline = "/dashboard";
                window.open(hotline);
              }}
              className="bg-purple-600 hover:bg-purple-700" 
              size="lg"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HirePurchase;