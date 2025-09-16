import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
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
                  <div className="p-4 h-full">
                    <div className=" h-full">
                      <div className=" rounded-xl overflow-hidden shadow-lg  mt-8">
                        <center>
                          <div
                            className="relative overflow-hidden  transform  z-10 transition-all duration-500 "
                            style={{
                              backgroundImage: `url('/lovable-uploads/essential-card.png')`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              height: "120px",
                              width: "200px",
                            }}
                          ></div>
                        </center>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-6">Your Digital Value Card</h2>
            <p className="text-gray-600 mb-6">
              Access your Elverra Global client benefits instantly with our
              digital card. Available right on your phone, ready whenever you
              need it.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div
                  className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5"
                  style={{ backgroundColor: "#8b5cf6" }}
                >
                  1
                </div>
                <div>
                  <h3 className="font-medium mb-1">Instant Activation</h3>
                  <p className="text-sm text-gray-600">
                    Your digital card is activated immediately after
                    registration and payment.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div
                  className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5"
                  style={{ backgroundColor: "#8b5cf6" }}
                >
                  2
                </div>
                <div>
                  <h3 className="font-medium mb-1">Secure QR Verification</h3>
                  <p className="text-sm text-gray-600">
                    Partners scan your unique QR code to verify your card
                    validity and apply discounts.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div
                  className="h-6 w-6 rounded-full text-white flex items-center justify-center font-bold text-sm mr-3 mt-0.5"
                  style={{ backgroundColor: "#8b5cf6" }}
                >
                  3
                </div>
                <div>
                  <h3 className="font-medium mb-1">Request Physical Card</h3>
                  <p className="text-sm text-gray-600">
                    You can request a physical card through your Clients
                    dashboard if desired.
                  </p>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="text-white transition-colors"
              style={{ backgroundColor: "#8b5cf6" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#7c3aed")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#8b5cf6")
              }
            >
              <Link to="/selectCountry">Get Your Digital Card</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalCard;
