import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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

interface DigitalCardProps {
  cmsContent?: CMSPage;
}

const DigitalCard = ({ cmsContent }: DigitalCardProps) => {
  const { user } = useAuth();
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="relative">
              {/* Phone mockup */}
              <div className="rounded-[2.5rem] bg-gray-900 border-8 border-gray-900 shadow-xl w-64 mx-auto">
                <div className="h-96 rounded-3xl bg-white overflow-hidden">
                  <div className="h-12 bg-gray-100 flex justify-center items-center">
                    <div className="w-1/2 h-6 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 h-full">
                    <div className="card-gradient rounded-xl overflow-hidden shadow-lg p-4 mt-8">
                      <div className="flex justify-between items-center">
                        <div className="text-white">
                          <div className="text-xs font-medium">Elverra Global</div>
                          <div className="text-lg font-bold">Client Card</div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="font-bold text-white">EG</span>
                        </div>
                      </div>
                      <div className="mt-8 mb-2">
                        <div className="text-white/80 text-xs">Client Name</div>
                        <div className="text-white font-medium">Ahmed Traore</div>
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <div>
                          <div className="text-white/80 text-xs">Client ID</div>
                          <div className="text-white text-sm">EG-ML-21058</div>
                        </div>
                        <div>
                          <div className="text-white/80 text-xs">Expires</div>
                          <div className="text-white text-sm">01/28</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 mt-4 flex flex-col items-center justify-center">
                      <div className="bg-gray-200 w-32 h-32 flex items-center justify-center">
                        {/* Placeholder for QR code */}
                        <div className="w-24 h-24 border-2 border-gray-400 grid grid-cols-3 grid-rows-3">
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                          <div className="border-2 border-gray-400 col-span-1 row-span-1"></div>
                        </div>
                      </div>
                      <div className="text-sm font-medium mt-2">Scan to verify membership</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6">Your Digital Value Card</h2>
            <p className="text-gray-600 mb-6">
              Access your Elverra Global client benefits instantly with our digital card. Available right on your phone, ready whenever you need it.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5" style={{backgroundColor: '#8b5cf6'}}>1</div>
                <div>
                  <h3 className="font-medium mb-1">Instant Activation</h3>
                  <p className="text-sm text-gray-600">Your digital card is activated immediately after registration and payment.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5" style={{backgroundColor: '#8b5cf6'}}>2</div>
                <div>
                  <h3 className="font-medium mb-1">Secure QR Verification</h3>
                  <p className="text-sm text-gray-600">Partners scan your unique QR code to verify your card validity and apply discounts.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5" style={{backgroundColor: '#8b5cf6'}}>3</div>
                <div>
                  <h3 className="font-medium mb-1">Request Physical Card</h3>
                  <p className="text-sm text-gray-600">You can request a physical card through your Clients dashboard if desired.</p>
                </div>
              </div>
            </div>
            
            <Button asChild className="text-white transition-colors" style={{backgroundColor: '#8b5cf6'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}>
              <Link to={user ? "/dashboard" : "/register"}>
                {user ? "View Your Digital Card" : "Get Your Digital Card"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalCard;