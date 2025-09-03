
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  DollarSign, 
  ShoppingCart, 
  PiggyBank,
  Shield,
  AlertTriangle,
  Store
} from 'lucide-react';

const Services = () => {
  const products = [
    {
      title: 'ZENIKA Card',
      description: 'Premium value card with exclusive benefits and discounts',
      icon: CreditCard,
      path: '/cards',
      color: 'bg-gold-500'
    }
  ];

  const services = [
    {
      title: 'Online Store',
      description: 'Buy and sell products directly with other members. Post your items for sale or browse available products.',
      icon: Store,
      path: '/services/online-store',
      color: 'bg-green-500'
    },
    {
      title: 'Ô Secours',
      description: 'Emergency assistance through token-based subscriptions',
      icon: AlertTriangle,
      path: '/services/o-secours',
      color: 'bg-red-500'
    },
    {
      title: 'Hire Purchase',
      description: 'We facilitate your hire purchase request for you through our various partners for electronics, furniture, and more',
      icon: ShoppingCart,
      path: '/services/hire-purchase',
      color: 'bg-purple-500'
    },
    {
      title: 'Payday Advance',
      description: 'Quick cash advances for your immediate needs',
      icon: PiggyBank,
      path: '/services/payday-advance',
      color: 'bg-orange-500'
    }
  ];

  return (
    <Layout>
      <PremiumBanner
        title="Elverra Products and Services"
        description="Comprehensive solutions designed to meet your diverse needs"
        backgroundImage="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Products and Services</h2>
              <p className="text-lg text-gray-600">
                Explore our range of products and services designed to support your goals
              </p>
            </div>

            {/* Products Section */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg ${product.color} flex items-center justify-center mb-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{product.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
                          <Link to={product.path}>
                            Learn More
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Services Section */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild className="w-full">
                          <Link to={service.path}>
                            Learn More
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="mt-16 text-center">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Why Choose Our Services?</CardTitle>
                  <CardDescription>
                    Our expert team is here to help you choose the right product or service for your needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="lg">
                    <Link to="/about/contact">
                      Contact Our Team
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
