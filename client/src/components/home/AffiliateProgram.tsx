import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
  status: string;
  page_type: string;
  is_featured?: boolean;
}

interface AffiliateProgramProps {
  cmsContent?: CMSPage;
}

const AffiliateProgram = ({ cmsContent }: AffiliateProgramProps) => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 md:mr-12">
              <div className="inline-flex items-center bg-white/10 rounded-full px-4 py-1.5 mb-6">
                <Users className="h-4 w-4 mr-2 text-club66-gold" />
                <span className="text-sm font-medium">Affiliate Program</span>
              </div>

              <h2 className="text-3xl font-bold mb-6">Earn While You Share</h2>

              <p className="text-gray-300 mb-6">
                Join our affiliate program and earn 10% commission on card
                purchase price paid by clients you refer to Elverra Global. It's
                simple, transparent, and rewarding.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-club66-purple/20 flex items-center justify-center mr-4">
                    <span className="font-bold">1</span>
                  </div>
                  <p className="text-gray-300">
                    Share your unique affiliate code with friends and family
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-club66-purple/20 flex items-center justify-center mr-4">
                    <span className="font-bold">2</span>
                  </div>
                  <p className="text-gray-300">
                    When they sign up using your code, they become your
                    referrals
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-club66-purple/20 flex items-center justify-center mr-4">
                    <span className="font-bold">3</span>
                  </div>
                  <p className="text-gray-300">
                    Earn 10% of their card purchase price as commission
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="secondary"
                className="bg-club66-gold hover:bg-club66-gold/90 text-gray-900"
              >
                <Link
                  to="/affiliate-program"
                  className="inline-flex items-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="md:w-1/2">
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
                <h3 className="text-xl font-bold mb-6">
                  Affiliate Earnings Example
                </h3>

                <div className="space-y-6">
                  <div className="bg-gray-700/50 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Essential Client</span>
                      <div className="text-club66-gold font-semibold">
                        CFA 1,000/yearly
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Your commission (10%)
                      </span>
                      <div className="text-club66-gold font-bold">
                        CFA 100/yearly
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Premium Client</span>
                      <div className="text-club66-gold font-semibold">
                        CFA 2,000/yearly
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Your commission (10%)
                      </span>
                      <div className="text-club66-gold font-bold">
                        CFA 200/yearly
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Elite Client</span>
                      <div className="text-club66-gold font-semibold">
                        CFA 5,000/yearly
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">
                        Your commission (10%)
                      </span>
                      <div className="text-club66-gold font-bold">
                        CFA 500/yearly
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">10 Elite Referrals</span>
                      <div className="text-club66-gold font-bold">
                        CFA 5,000/yearly
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Commissions are paid monthly for as long as your referrals
                    remain active clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AffiliateProgram;
