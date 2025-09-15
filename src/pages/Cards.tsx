import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Star, Shield, Globe, Gift, Users, Percent, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Cards = () => {
  const { user } = useAuth();
  
  const getCardActionText = (tierName: string) => {
    if (user) {
      return `Upgrade to ${tierName}`;
    }
    return `Choose ${tierName}`;
  };

  const getCardActionUrl = (tierName: string) => {
    if (user) {
      return `/client-subscription?tier=${tierName.toLowerCase()}`;
    }
    return '/register';
  };

  const getMainCTAText = () => {
    if (user) {
      return 'Upgrade your ZENIKA';
    }
    return 'Apply for your ZENIKA';
  };

  const getMainCTAUrl = () => {
    if (user) {
      return '/membership-payment';
    }
    return '/register';
  };
  const cardFeatures = [
    {
      icon: Percent,
      title: 'Exclusive Discounts',
      description: 'Up to 50% off at partner merchants across various sectors'
    },
    {
      icon: Globe,
      title: 'Network-Wide Access',
      description: 'Use your card across our entire client network'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Advanced security features and fraud protection'
    },
    {
      icon: Gift,
      title: 'Reward Points',
      description: 'Earn points on every transaction and redeem for prizes'
    },
    {
      icon: Users,
      title: 'VIP Status',
      description: 'Priority access to events and exclusive client services'
    },
    {
      icon: Award,
      title: 'Lifestyle Benefits',
      description: 'Access to premium lifestyle experiences and services'
    }
  ];

  const membershipTiers = [
    {
      name: 'Essential',
      color: 'bg-blue-500',
      price: '10,000 CFA',      
      features: ['Basic discounts', 'Standard support', 'Mobile app access']
    },
    {
      name: 'Premium',
      color: 'bg-purple-500',
      price: '10,000 CFA',
      features: ['Enhanced discounts', 'Priority support', 'Exclusive events', 'Travel benefits']
    },
    {
      name: 'Elite',
      color: 'bg-gold-500',
      price: '10,000 CFA',
      features: ['Maximum discounts', 'Concierge service', 'VIP events', 'Premium travel', 'Personal advisor']
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="ZENIKA Card"
        description="Your gateway to exclusive benefits, discounts, and premium lifestyle experiences across our client network"
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-8 rounded-2xl w-32 h-32 mx-auto mb-8 flex items-center justify-center">
                <CreditCard className="h-16 w-16 text-blue-600" />
              </div>
              <h2 className="text-4xl font-bold mb-6">What is the ZENIKA Card?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                The ZENIKA Card is more than just a Loyalty card—it's your key to unlocking a world of 
                exclusive benefits, substantial discounts, and premium experiences across our clients network. 
                Designed for the modern professional, it connects you to a network of opportunities 
                and privileges that enhance your lifestyle and business ventures.
              </p>
            </div>

            {/* Card Features */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-center mb-12">What It Means to Hold a ZENIKA Card</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cardFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-full w-16 h-16 mb-4 flex items-center justify-center">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{feature.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Membership Tiers */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-center mb-12">Choose Your Client Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {membershipTiers.map((tier, index) => (
                  <Card key={index} className={`relative overflow-hidden ${index === 1 ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
                    {index === 1 && (
                      <Badge className="absolute top-4 right-4 bg-purple-500">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 ${tier.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      <CardDescription className="text-3xl font-bold text-gray-900">
                        {tier.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <Badge variant="outline" className="mr-3 bg-green-50 text-green-700">
                              ✓
                            </Badge>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={index === 1 ? 'default' : 'outline'}
                        asChild
                      >
                        <Link to={getCardActionUrl(tier.name)}>
                          {getCardActionText(tier.name)}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Benefits Summary */}
            <Card className="mb-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-6">The ZENIKA Advantage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">500+</div>
                      <div className="text-sm opacity-90">Partner Merchants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">15+</div>
                      <div className="text-sm opacity-90">African Countries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">50%</div>
                      <div className="text-sm opacity-90">Max Discount</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">24/7</div>
                      <div className="text-sm opacity-90">Support Access</div>
                    </div>
                  </div>
                  <p className="text-xl mb-6 opacity-90">
                    Join the exclusive community of successful Africans who have discovered the power of the ZENIKA Card
                  </p>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                    <Link to={getMainCTAUrl()}>
                      {user ? 'Upgrade Your ZENIKA Card' : 'Get Your ZENIKA Card Today'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Lifestyle?</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Don't just be a client - be part of an exclusive community that opens doors to opportunities, 
                savings, and experiences you never thought possible.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to={getMainCTAUrl()}>
                    {getMainCTAText()}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cards;