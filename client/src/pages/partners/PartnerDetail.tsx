import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Globe, Phone, Mail, Users, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const partnersData = [
  {
    id: 1,
    name: 'Orange Money',
    type: 'Financial Services',
    description: 'Leading mobile money provider enabling secure digital transactions across our client network.',
    longDescription: 'Orange Money is a pioneering mobile financial services provider that has revolutionized digital payments across our client network. With robust infrastructure and innovative solutions, Orange Money enables secure, fast, and affordable financial transactions for millions of users. Their partnership with Elverra Global has significantly enhanced our payment ecosystem.',
    logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    services: ['Mobile Money Transfers', 'Bill Payments', 'Merchant Services', 'International Remittances', 'Savings Accounts'],
    partnership: 'Strategic Payment Partner',
    partnershipStartDate: '2023',
    website: 'https://orangemoney.orange.com',
    phone: '+223 44 94 38 44',
    email: 'partnership@orange.com',
    headquarters: 'Bamako, Mali',
    employees: '2,500+',
    regions: ['Mali', 'Burkina Faso', 'Niger', 'Senegal'],
    achievements: [
      'Processed over $500M in transactions through Elverra platform',
      'Enabled mobile payments for 80% of our client base',
      'Reduced transaction costs by 35% for users',
      'Achieved 99.9% system uptime reliability'
    ],
    keyFeatures: [
      'Instant money transfers across borders',
      'QR code payment solutions',
      'Bill payment integration',
      'Merchant payment gateway',
      'Savings and investment products'
    ],
    partnershipBenefits: [
      'Enhanced payment accessibility for rural communities',
      'Reduced transaction fees for Elverra clients',
      'Integrated financial services ecosystem',
      'Priority customer support for joint clients'
    ]
  },
  {
    id: 2,
    name: 'SAMA Money',
    type: 'Digital Payments',
    description: 'Innovative digital wallet solutions providing fast and reliable payment services to our clients.',
    longDescription: 'SAMA Money is at the forefront of digital financial innovation, offering cutting-edge digital wallet solutions that seamlessly integrate with Elverra Global\'s platform. Their technology-first approach ensures fast, secure, and user-friendly payment experiences for our clients.',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    services: ['Digital Wallet', 'P2P Transfers', 'Merchant Payments', 'Contactless Payments', 'Loyalty Programs'],
    partnership: 'Payment Gateway Partner',
    partnershipStartDate: '2024',
    website: 'https://sama.money',
    phone: '+223 44 94 38 44',
    email: 'partners@sama.money',
    headquarters: 'Abidjan, Côte d\'Ivoire',
    employees: '500+',
    regions: ['Côte d\'Ivoire', 'Ghana', 'Mali', 'Senegal'],
    achievements: [
      'Onboarded 150,000+ users in first year',
      'Processed $200M+ in digital transactions',
      'Achieved average transaction time of 3 seconds',
      'Maintained 98% customer satisfaction rate'
    ],
    keyFeatures: [
      'Biometric authentication for security',
      'Offline transaction capabilities',
      'Multi-currency support',
      'Smart contract integration',
      'Real-time analytics dashboard'
    ],
    partnershipBenefits: [
      'Advanced security features for client protection',
      'Innovative payment technologies',
      'Seamless integration with Elverra services',
      'Comprehensive transaction reporting'
    ]
  },
  {
    id: 3,
    name: 'Regional Development Bank',
    type: 'Banking',
    description: 'Providing microfinance and banking services to support small businesses and individuals.',
    longDescription: 'The Regional Development Bank is a trusted financial institution dedicated to fostering economic growth through accessible banking services. Their partnership with Elverra Global focuses on microfinance, business loans, and financial inclusion initiatives that empower entrepreneurs and small businesses.',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    services: ['Microloans', 'Business Accounts', 'Financial Advisory', 'Investment Services', 'Insurance Products'],
    partnership: 'Financial Services Partner',
    partnershipStartDate: '2022',
    website: 'https://rdb.org',
    phone: '+223 44 94 38 44',
    email: 'partnerships@rdb.org',
    headquarters: 'Ouagadougou, Burkina Faso',
    employees: '1,200+',
    regions: ['Burkina Faso', 'Mali', 'Niger', 'Chad'],
    achievements: [
      'Disbursed $50M+ in microloans to Elverra clients',
      'Supported 8,000+ small businesses',
      'Achieved 95% loan repayment rate',
      'Created estimated 25,000 jobs'
    ],
    keyFeatures: [
      'Flexible loan terms for small businesses',
      'Digital banking platform',
      'Financial literacy programs',
      'Agricultural financing specialists',
      'Women entrepreneur support programs'
    ],
    partnershipBenefits: [
      'Preferential loan rates for Elverra clients',
      'Streamlined loan application process',
      'Integrated financial planning services',
      'Dedicated relationship managers'
    ]
  }
];

const PartnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundPartner = partnersData.find(p => p.id === parseInt(id || '0'));
      setPartner(foundPartner);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!partner) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Partner Not Found</h1>
            <p className="text-gray-600 mb-6">The partner you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/about/partners">Back to Partners</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title={partner.name}
        description={partner.description}
        backgroundImage={partner.logo}
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
                <Link to="/about/partners" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Partners
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Partner Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-16 h-16 rounded-lg mr-4 object-cover border-2 border-purple-100"
                      />
                      <div>
                        <CardTitle className="text-2xl text-gray-900">{partner.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{partner.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">{partner.longDescription}</p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
                      <div className="text-center">
                        <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{partner.employees}</div>
                        <div className="text-sm text-gray-600">Employees</div>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{partner.partnershipStartDate}</div>
                        <div className="text-sm text-gray-600">Partnership</div>
                      </div>
                      <div className="text-center">
                        <MapPin className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{partner.regions.length}</div>
                        <div className="text-sm text-gray-600">Regions</div>
                      </div>
                      <div className="text-center">
                        <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{partner.services.length}</div>
                        <div className="text-sm text-gray-600">Services</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services & Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Services & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Services Offered</h4>
                        <ul className="space-y-2">
                          {partner.services.map((service: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{service}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {partner.keyFeatures.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partnership Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Benefits for Elverra Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {partner.partnershipBenefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-3 font-bold">•</span>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {partner.achievements.map((achievement: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-3 text-purple-600" />
                      <a href={partner.website} className="hover:text-purple-600" target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-purple-600" />
                      <a href={`tel:${partner.phone}`} className="hover:text-purple-600">
                        {partner.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-3 text-purple-600" />
                      <a href={`mailto:${partner.email}`} className="hover:text-purple-600">
                        {partner.email}
                      </a>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-3 text-purple-600 mt-0.5" />
                      <span>{partner.headquarters}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Partnership Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Partnership Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Partnership Type</div>
                      <Badge variant="outline">{partner.partnership}</Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Active Since</div>
                      <div className="text-sm text-gray-600">{partner.partnershipStartDate}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Coverage Areas</div>
                      <div className="flex flex-wrap gap-1">
                        {partner.regions.map((region: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Partner */}
                <Card className="bg-purple-600 text-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Contact Partner</h3>
                    <p className="text-purple-100 text-sm mb-4">
                      Interested in their services? Get in touch directly with {partner.name}.
                    </p>
                    <div className="space-y-2">
                      <Button asChild size="sm" variant="secondary" className="w-full">
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          Visit Website
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="w-full border-white text-white hover:bg-white hover:text-purple-600">
                        <a href={`mailto:${partner.email}`}>
                          Send Email
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PartnerDetail;