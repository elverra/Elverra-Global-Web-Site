import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, User, ArrowRight } from 'lucide-react';

const RegistrationThankYou = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl text-center">
              <CardHeader className="pb-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Thank You for Registering!
                </CardTitle>
                <CardDescription className="text-xl text-gray-600">
                  Welcome to Elverra Global!
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-0">
                <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center justify-center">
                      <User className="w-5 h-5 mr-2" />
                      Your Account is Ready!
                    </h3>
                    <p className="text-purple-700 mb-4">
                      Your Elverra Global account has been successfully created. You can now access exclusive discounts, 
                      services, and opportunities across our client network.
                    </p>
                    <div className="flex items-center justify-center text-sm text-purple-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>A welcome email has been sent to your registered email address</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Access to ZENIKA card benefits</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Exclusive discounts and offers</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Job center access</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>Online store with low fees</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-gray-600 mb-6">
                      Ready to explore all the benefits Elverra Global has to offer? 
                      Sign in to your account to get started.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link to="/login">
                        <Button 
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                          data-testid="button-go-to-login"
                        >
                          Go to Login Page
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      
                      <Link to="/">
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto px-8 py-3"
                          data-testid="button-back-home"
                        >
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegistrationThankYou;