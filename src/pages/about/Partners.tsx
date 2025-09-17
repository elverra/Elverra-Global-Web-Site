import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ExternalLink, Globe, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const partners = [
  {
    id: 1,
    name: "Orange Money",
    type: "Financial Services",
    description:
      "Leading mobile money provider enabling secure digital transactions across our client network.",
    logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: ["Mobile Money Transfers", "Bill Payments", "Merchant Services"],
    partnership: "Strategic Payment Partner",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "partnership@orange.com",
  },
  {
    id: 2,
    name: "SAMA Money",
    type: "Digital Payments",
    description:
      "Innovative digital wallet solutions providing fast and reliable payment services to our clients.",
    logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: ["Digital Wallet", "P2P Transfers", "Merchant Payments"],
    partnership: "Payment Gateway Partner",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "partners@sama.money",
  },
  {
    id: 3,
    name: "Regional Development Bank",
    type: "Banking",
    description:
      "Providing microfinance and banking services to support small businesses and individuals.",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: ["Microloans", "Business Accounts", "Financial Advisory"],
    partnership: "Financial Services Partner",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "partnerships@rdb.org",
  },
  {
    id: 4,
    name: "TechHub Innovation Center",
    type: "Technology",
    description:
      "Technology incubator supporting digital innovation and skills development programs.",
    logo: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: ["Skills Training", "Tech Incubation", "Digital Innovation"],
    partnership: "Technology Partner",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "hello@techhub.org",
  },
  {
    id: 5,
    name: "Local Merchants Network",
    type: "Retail",
    description:
      "Network of local businesses offering discounts and special privileges to our clients.",
    logo: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: ["Retail Discounts", "Service Privileges", "Local Commerce"],
    partnership: "Merchant Partner Network",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "merchants@elverra.com",
  },
  {
    id: 6,
    name: "Education Alliance",
    type: "Education",
    description:
      "Consortium of educational institutions providing training and scholarship opportunities.",
    logo: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    services: [
      "Scholarships",
      "Professional Training",
      "Certification Programs",
    ],
    partnership: "Education Partner",
    website: "#",
    phone: "+223 XX XX XX XX",
    email: "info@edualliance.org",
  },
  
];

const partnerCategories = [
  { name: "Financial Services", count: 3, color: "bg-blue-100 text-blue-800" },
  { name: "Technology", count: 1, color: "bg-purple-100 text-purple-800" },
  { name: "Retail", count: 1, color: "bg-green-100 text-green-800" },
  { name: "Education", count: 1, color: "bg-yellow-100 text-yellow-800" },
  { name: "Healthcare", count: 1, color: "bg-red-100 text-red-800" },
  { name: "Agriculture", count: 1, color: "bg-orange-100 text-orange-800" },
];

const Partners = () => {
  const { user } = useAuth();
  return (
    <Layout>
      <PremiumBanner
        title="Our Partners"
        description="Meet our trusted partners who help us deliver exceptional services to our client network."
        backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                className="text-purple-600 hover:text-purple-700"
              >
                <Link to="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to About
                </Link>
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Our Trusted Partners
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Through strategic partnerships, we expand our service offerings
                and create more value for our clients across our network.
              </p>
            </div>

            {/* Partner Categories */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Partner Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {partnerCategories.map((category) => (
                  <div key={category.name} className="text-center">
                    <Badge
                      className={`${category.color} px-3 py-2 text-sm font-medium`}
                    >
                      {category.name}
                    </Badge>
                    <p className="text-gray-600 text-sm mt-1">
                      {category.count} Partner{category.count > 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner) => (
                <Link
                  key={partner.id}
                  to={`/partners/${partner.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                    <CardHeader className="text-center pb-4">
                      <div className="relative">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="w-20 h-20 rounded-lg mx-auto mb-4 object-cover border-2 border-purple-100"
                        />
                        <Badge variant="secondary" className="mb-2">
                          {partner.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-gray-900 hover:text-purple-600 transition-colors">
                        {partner.name}
                      </CardTitle>
                      <p className="text-purple-600 font-semibold text-sm">
                        {partner.partnership}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {partner.description}
                      </p>

                      {/* Services */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                          Services:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {partner.services.map((service, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Globe className="h-3 w-3 mr-2 text-purple-600" />
                          <span className="hover:text-purple-600">
                            Visit Website
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="h-3 w-3 mr-2 text-purple-600" />
                          {partner.phone}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="h-3 w-3 mr-2 text-purple-600" />
                          <span className="hover:text-purple-600">
                            {partner.email}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group pointer-events-none"
                        >
                          Learn More
                          <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Become a Partner CTA */}
            <div className="mt-16 text-center">
              <Card className="bg-purple-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Become Our Partner
                  </h3>
                  <p className="text-purple-100 mb-6 text-lg">
                    Join our network of trusted partners and help us serve our
                    client community better. Together, we can create more
                    opportunities and value.
                  </p>
                
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Partners;
