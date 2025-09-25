import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { submitContactForm } from '@/services/contactService';
import type { InquiryType } from '@/types/contact';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+223 44 94 38 44'],
    description: 'Call us during business hours'
  },
  {
    icon: Mail,
    title: 'Email',
    details: ['info@elverraglobalml.com'],
    description: 'We respond within 24 hours'
  },
  {
    icon: MapPin,
    title: 'Address',
    details: ['Faladiè-Sema, Carrefour IJA, Rue 801', 'Bamako, MALI'],
    description: 'Visit our office'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: ['Monday - Friday: 8:00 - 17:00', 'Saturday: 9:00 - 13:00'],
    description: 'We are closed on Sundays and public holidays'
  }
];

const offices = [
  {
    city: 'Bamako, Mali',
    address: 'Faladiè-Sema, Carrefour IJA, Rue 801, Bamako, MALI',
    phone: '+223 44 94 38 44',
    email: 'info@elverraglobalml.com',
    type: 'Headquarters'
  }
];

const Contact = () => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    inquiryType: InquiryType;
  }>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general' as InquiryType
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        inquiryType: formData.inquiryType
      });

      if (error) {
        throw new Error(error);
      }
      
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les 24 heures.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire :', error);
      toast.error(error instanceof Error ? error.message : 'Échec de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Layout>
      <PremiumBanner
        title="Contact Us"
        description="Get in touch with Elverra Global team. We're here to help you with any questions about our services."
        backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
                <Link to="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to About
                </Link>
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Have questions about our services or want to learn more? We'd love to hear from you. 
                Choose the best way to reach us below.
              </p>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex justify-center mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <info.icon className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 mb-3">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-700 text-sm">{detail}</p>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+223 XX XX XX XX"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inquiryType">Inquiry Type *</Label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="general">General Inquiry</option>
                          <option value="membership">Membership Questions</option>
                          <option value="technical">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="complaint">Complaint/Issue</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="Please describe your inquiry in detail..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Office Locations */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Offices</h2>
                  <p className="text-gray-600 mb-6">
                    Visit us at any of our office locations across our client network. 
                    We're here to serve you better.
                  </p>
                </div>

                <div className="space-y-4">
                  {offices.map((office, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{office.city}</h3>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {office.type}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                            {office.address}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-purple-600" />
                            {office.phone}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-purple-600" />
                            <a href={`mailto:${office.email}`} className="hover:text-purple-600">
                              {office.email}
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Emergency Contact */}
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;