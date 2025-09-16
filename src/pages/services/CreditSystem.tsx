import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  BriefcaseBusiness,
  Calculator,
  Calendar,
  Check,
  CreditCard,
  Shield,
} from "lucide-react";
import { useState } from "react";

const CreditSystem = () => {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock user data - in a real app, this would come from authentication context
  const userData = {
    membershipTier: "Elite",
    employmentStatus: "Employed",
    employer: "Mali Tech Corp",
    monthlySalary: 250000,
    accountActive: true,
    creditScore: 85,
  };

  // Calculate interest rate based on client tier
  const getInterestRate = () => {
    switch (userData.membershipTier) {
      case "Elite":
        return 0.05;
      case "Premium":
        return 0.075;
      case "Essential":
        return 0.095;
      default:
        return 0.1;
    }
  };

  // Calculate monthly payment and total interest
  const calculateLoanDetails = () => {
    const rate = getInterestRate();
    const interestAmount = loanAmount * rate;
    const totalAmount = loanAmount + interestAmount;

    return {
      interestRate: rate * 100,
      interestAmount,
      totalAmount,
      dailyPayment: totalAmount / loanTerm,
    };
  };

  const loanDetails = calculateLoanDetails();

  const handleApplyForLoan = () => {
    setIsSubmitting(true);

    // In a real app, this would make an API call
    setTimeout(() => {
      toast({
        title: "Loan Application Submitted",
        description:
          "Your application is being reviewed. You'll receive a notification within 24 hours.",
      });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Credit System</h1>
            <p className="text-gray-600">
              Access loans and manage your credit with Elverra
            </p>
          </div>

          <Tabs defaultValue="payday-loans" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="payday-loans">Payday Loans</TabsTrigger>
              <TabsTrigger value="credit-score">Credit Score</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="payday-loans" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Loan Calculator */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calculator className="mr-2 h-5 w-5 text-club66-purple" />
                        Payday Loan Calculator
                      </CardTitle>
                      <CardDescription>
                        Calculate your loan amount and repayment terms
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Loan Amount (CFA)</Label>
                          <span className="font-medium">
                            {loanAmount.toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          value={[loanAmount]}
                          min={10000}
                          max={500000}
                          step={10000}
                          onValueChange={(values) => setLoanAmount(values[0])}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>10,000</span>
                          <span>500,000</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Loan Term (Days)</Label>
                          <span className="font-medium">{loanTerm} days</span>
                        </div>
                        <Slider
                          value={[loanTerm]}
                          min={7}
                          max={30}
                          step={1}
                          onValueChange={(values) => setLoanTerm(values[0])}
                          className="py-4"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>7 days</span>
                          <span>30 days</span>
                        </div>
                      </div>

                      <div className="rounded-lg border bg-gray-50 p-4">
                        <h4 className="font-medium mb-3">Loan Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Interest Rate:
                            </span>
                            <span className="font-medium">
                              {loanDetails.interestRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Interest Amount:
                            </span>
                            <span className="font-medium">
                              CFA {loanDetails.interestAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Total Repayment:
                            </span>
                            <span className="font-medium">
                              CFA {loanDetails.totalAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="text-gray-600">
                              Daily Payment:
                            </span>
                            <span className="font-medium text-club66-purple">
                              CFA{" "}
                              {Math.round(
                                loanDetails.dailyPayment
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                        onClick={handleApplyForLoan}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Apply for Loan"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>

                {/* Eligibility & Requirements */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Check className="mr-2 h-5 w-5 text-green-600" />
                        Your Eligibility
                      </CardTitle>
                      <CardDescription>
                        Based on your Elverra Global client and profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <BriefcaseBusiness className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="text-gray-600">
                              Employment Status
                            </span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="font-medium mr-2">
                              {userData.employmentStatus}
                            </span>
                            <Check className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="text-gray-600">Client Tier</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="font-medium mr-2">
                              {userData.membershipTier}
                            </span>
                            <Check className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                            <span className="text-gray-600">Account Age</span>
                          </div>
                          <div className="flex items-center text-green-600">
                            <span className="font-medium mr-2">6+ Months</span>
                            <Check className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">
                              You qualify for a payday loan!
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              Based on your Elite client status, you're eligible
                              for our lowest interest rate of 5%. Apply now to
                              get funds within 24 hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Loan Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-club66-purple text-white flex items-center justify-center font-bold text-xs">
                          1
                        </div>
                        <div>
                          <p className="font-medium">
                            Valid Elverra Global Client
                          </p>
                          <p className="text-sm text-gray-600">
                            Active client for at least 3 months
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-club66-purple text-white flex items-center justify-center font-bold text-xs">
                          2
                        </div>
                        <div>
                          <p className="font-medium">Proof of Income</p>
                          <p className="text-sm text-gray-600">
                            Regular salary or business income
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-club66-purple text-white flex items-center justify-center font-bold text-xs">
                          3
                        </div>
                        <div>
                          <p className="font-medium">Identification</p>
                          <p className="text-sm text-gray-600">
                            Government-issued ID card
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-club66-purple text-white flex items-center justify-center font-bold text-xs">
                          4
                        </div>
                        <div>
                          <p className="font-medium">Mobile Money Account</p>
                          <p className="text-sm text-gray-600">
                            For disbursement and repayment
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credit-score" className="space-y-6">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-club66-purple" />
                      Your Credit Score
                    </CardTitle>
                    <CardDescription>
                      Based on your payment history and client activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-48 h-48 rounded-full border-8 border-club66-purple flex items-center justify-center bg-white">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-club66-purple">
                            {userData.creditScore}
                          </div>
                          <div className="text-sm text-gray-500">
                            out of 100
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-3">
                          Score Breakdown
                        </h3>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                Payment History
                              </span>
                              <span className="text-sm font-medium">
                                Excellent
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: "90%" }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                Client Tenure
                              </span>
                              <span className="text-sm font-medium">Good</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: "75%" }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                Credit Utilization
                              </span>
                              <span className="text-sm font-medium">
                                Very Good
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-club66-purple"
                                style={{ width: "85%" }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">
                                Documentation
                              </span>
                              <span className="text-sm font-medium">
                                Excellent
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: "95%" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 rounded-md bg-blue-50 border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-1">
                        How to improve your score
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Continue making timely payments on all loans</li>
                        <li>
                          • Keep your Elverra Global client active and in good
                          standing
                        </li>
                        <li>
                          • Provide additional documentation for employment
                          verification
                        </li>
                        <li>
                          • Consider upgrading your client tier for better rates
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-club66-purple hover:bg-club66-darkpurple"
                      onClick={() => {
                        toast({
                          title: "Credit Report Generated",
                          description:
                            "Your full credit report has been sent to your email",
                        });
                      }}
                    >
                      Download Full Credit Report
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Loan History</CardTitle>
                    <CardDescription>
                      Your past and current loans with Elverra Global Credit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md divide-y">
                      {[
                        {
                          amount: 80000,
                          term: 30,
                          date: "Jan 15, 2024",
                          status: "Completed",
                          interest: 4000,
                        },
                        {
                          amount: 150000,
                          term: 45,
                          date: "Mar 10, 2024",
                          status: "Completed",
                          interest: 7500,
                        },
                        {
                          amount: 200000,
                          term: 60,
                          date: "Apr 22, 2024",
                          status: "Active",
                          interest: 10000,
                          remaining: 12,
                        },
                      ].map((loan, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                CFA {loan.amount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {loan.term} days • {loan.date}
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    loan.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : loan.status === "Active"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {loan.status}
                                </span>
                                {loan.status === "Active" && (
                                  <span className="text-xs text-gray-500">
                                    {loan.remaining} days remaining
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-500 text-sm">
                                Interest: CFA {loan.interest.toLocaleString()}
                              </div>
                              <div className="text-sm font-medium mt-3">
                                Total: CFA{" "}
                                {(loan.amount + loan.interest).toLocaleString()}
                              </div>
                              {loan.status === "Active" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty state
                      <div className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <h4 className="font-medium text-gray-600">No loan history</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          You haven't taken any loans with Elverra Global Credit yet
                        </p>
                      </div>
                      */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CreditSystem;
