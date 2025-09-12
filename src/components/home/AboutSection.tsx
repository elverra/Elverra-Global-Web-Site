import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

interface AboutSectionProps {
  cmsContent?: CMSPage;
}

const AboutSection = ({ cmsContent }: AboutSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 md:p-12">
              {cmsContent ? (
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: cmsContent.content }}
                />
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      About <span className="text-elverra-gold">Elverra</span>
                      <span className="text-elverra-purple"> Global</span>
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-elverra-gold to-elverra-purple mx-auto mb-6"></div>
                  </div>

                  <p className="text-lg leading-relaxed text-gray-700 text-justify mb-8">
                    Elverra Global is a company that offers a diverse range of
                    services and platforms through our unique all-in-one
                    astonishing product called ZENIKA. Our Zenika Card enables
                    our clients to access discounts and special privileges on
                    purchases of goods and services across our network of
                    partners. Our service basket includes a Job Centre, Payday
                    Loans, an Online Store with low hosting fees, a Free Online
                    Library, and our most passionate "Ô Secours" services. Our
                    mission is to provide valuable resources and opportunities
                    for our clients. Through our TikTok campaign, "What
                    Empowerment and Progress really means to me," we're
                    gathering feedback and stories to improve our services and
                    better serve our community. With exciting initiatives and
                    benefits, Elverra Global aims to make a positive impact and
                    support the growth and well-being of our clients worldwide.
                  </p>
                </>
              )}

              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/about")}
                  className=" text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-purple-600 hover:bg-purple-700"
                >
                  Know More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
