import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Scale, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Shield, 
  FileText,
  CheckCircle,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const AccessLawyer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    caseType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Your request has been submitted! A legal expert will contact you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      caseType: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  const legalServices = [
    {
      title: "Business Law",
      description: "Company registration, contracts, and commercial disputes",
      icon: FileText,
      popular: true
    },
    {
      title: "Family Law",
      description: "Marriage, divorce, child custody, and inheritance matters",
      icon: Shield,
      popular: false
    },
    {
      title: "Property Law",
      description: "Real estate transactions, land disputes, and property rights",
      icon: Scale,
      popular: true
    },
    {
      title: "Employment Law",
      description: "Workplace disputes, contracts, and labor rights",
      icon: MessageCircle,
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How quickly can I connect with a lawyer?",
      answer: "Most legal consultations are scheduled within 24-48 hours. For urgent matters, same-day consultations may be available."
    },
    {
      question: "What are the consultation fees?",
      answer: "Initial consultations start from CFA 25,000. Complex cases may require different fee structures which will be discussed upfront."
    },
    {
      question: "Do you handle cases outside Mali?",
      answer: "Our network includes legal experts across West Africa. We can assist with cross-border legal matters and international business law."
    },
    {
      question: "Can I get legal advice remotely?",
      answer: "Yes, we offer video consultations and phone-based legal advice for many types of cases. Physical meetings can be arranged when necessary."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Access Legal Experts</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with qualified lawyers and legal professionals across West Africa
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Expert Consultations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Request Legal Consultation</CardTitle>
                  <CardDescription>
                    Fill out the form below and our legal experts will contact you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                          placeholder="Enter your full name"
                          data-testid="input-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="your.email@example.com"
                          data-testid="input-email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          placeholder="+223 XX XX XX XX"
                          data-testid="input-phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="caseType">Case Type *</Label>
                        <Input
                          id="caseType"
                          value={formData.caseType}
                          onChange={(e) => setFormData(prev => ({ ...prev, caseType: e.target.value }))}
                          required
                          placeholder="e.g., Business Law, Family Law"
                          data-testid="input-case-type"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Describe Your Legal Issue *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        required
                        placeholder="Please provide details about your legal matter..."
                        rows={5}
                        data-testid="textarea-message"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isSubmitting}
                      data-testid="button-submit-consultation"
                    >
                      {isSubmitting ? 'Submitting Request...' : 'Request Consultation'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+223 20 XX XX XX</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">legal@elverra.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-gray-600">Mon-Fri: 8AM-6PM</p>
                      <p className="text-gray-600">Emergency: 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our Legal Services?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Licensed and experienced lawyers</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Affordable legal consultations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Multiple language support</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Remote and in-person consultations</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Services */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Legal Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {legalServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="relative">
                    {service.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <Icon className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessLawyer;