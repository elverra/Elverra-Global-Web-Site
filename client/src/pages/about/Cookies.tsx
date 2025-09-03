import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Cookies = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Cookie Policy"
        description="How we use cookies and similar technologies"
        backgroundImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        variant="compact"
      />

      <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
                    <p className="text-gray-700">
                      Cookies are small text files that are placed on your device when you visit our website. 
                      They help us provide you with a better user experience and allow certain features to work.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
                    <p className="text-gray-700">
                      We use cookies to remember your preferences, keep you logged in, analyze how you use 
                      our website, and provide personalized content and advertisements.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
                    <ul className="text-gray-700 space-y-2">
                      <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                      <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                      <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                      <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
                    <p className="text-gray-700">
                      You can control and manage cookies through your browser settings. However, please note 
                      that disabling cookies may affect the functionality of our website.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                    <p className="text-gray-700">
            Email: legal@elverraglobal.com<br />
            Phone: +223 44 94 38 44<br />
            Address: Faladiè-Sema, Carrefour IJA, Rue 801, Bamako, MALI.
          </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cookies;