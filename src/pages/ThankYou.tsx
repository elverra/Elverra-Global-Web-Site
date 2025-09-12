import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-xl border-0">
              <CardContent className="p-12">
                <div className="mb-8">
                  <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    ✅ Thank you for signing up!
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Please check your email to verify your account and continue.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
                      <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Check your email inbox for a verification link</li>
                        <li>2. Click the verification link to activate your account</li>
                        <li>3. Log in and choose your membership plan</li>
                        <li>4. Complete payment to access all benefits</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button asChild size="lg" className="w-full bg-purple-600 hover:bg-purple-700">
                    <Link to="/login">
                      Continue to Login
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/">
                      Return to Home
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button className="text-purple-600 hover:underline">
                      resend verification email
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThankYou;