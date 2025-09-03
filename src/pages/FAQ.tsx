
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle, Phone, Mail, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: "Client Services",
      questions: [
        {
          question: "How do I become an Elverra client?",
          answer: "You can become a client by registering on our website. Simply provide your basic information, choose a client tier, and complete the verification process. Client activation takes 24-48 hours."
        },
        {
          question: "What are the different client tiers?",
          answer: "We offer three client tiers: Essential (basic benefits), Premium (enhanced features), and VIP (premium benefits). Each tier offers different benefits including discounts, access to services, and networking opportunities."
        },
        {
          question: "Can I upgrade or downgrade my client tier?",
          answer: "Yes, you can change your client tier at any time through your dashboard. Upgrades take effect immediately, while downgrades take effect at the next billing cycle."
        },
        {
          question: "Is there a minimum commitment period?",
          answer: "No, there's no minimum commitment period. You can cancel your client services at any time. For paid services, you'll continue to have access until the end of your billing period."
        }
      ]
    },
    {
      category: "Card Services",
      questions: [
        {
          question: "How do I activate my Elverra card?",
          answer: "You can activate your card through our mobile app, website, or by calling our customer service. You'll need your card number and the activation code sent to your registered phone number."
        },
        {
          question: "Where can I use my Elverra card?",
          answer: "Your Elverra card can be used at all partner merchants, online stores that accept our payment network, and for various services within the Elverra ecosystem."
        },
        {
          question: "What should I do if my card is lost or stolen?",
          answer: "Immediately contact our customer service or use the app to block your card. We'll issue a replacement card within 3-5 business days at no additional cost."
        },
        {
          question: "Are there any transaction fees?",
          answer: "Basic transactions are free for all members. Some premium services may have minimal fees, which are clearly disclosed before any transaction."
        }
      ]
    },
    {
      category: "Services",
      questions: [
        {
          question: "How does the credit account work?",
          answer: "Our credit account allows you to make purchases and pay later. Credit limits are determined based on your membership tier and credit assessment. Interest rates start from 2.5% per month."
        },
        {
          question: "What is hire purchase and how does it work?",
          answer: "Hire purchase allows you to buy items and pay in installments over time. You can choose payment periods from 3 to 24 months with competitive interest rates."
        },
        {
          question: "How quickly can I get a payday advance?",
          answer: "Payday advances are processed within 30 minutes for eligible members. The amount depends on your membership tier and payment history with us."
        },
        {
          question: "What documents do I need for services?",
          answer: "You'll need valid ID, proof of income, and bank statements. Additional documents may be required based on the specific service and amount requested."
        }
      ]
    },
    {
      category: "Discounts & Benefits",
      questions: [
        {
          question: "How do I access discounts at partner merchants?",
          answer: "Simply show your Club66 card or app at participating merchants. Discounts are automatically applied when you use your card for payment."
        },
        {
          question: "Do discounts have expiration dates?",
          answer: "Most discounts are ongoing benefits of membership. Special promotional discounts may have expiration dates, which are clearly communicated in the app."
        },
        {
          question: "Can I combine discounts with other offers?",
          answer: "This depends on the merchant's policy. Some allow combining offers while others don't. Check the terms and conditions for each discount."
        },
        {
          question: "How do I find new partner merchants?",
          answer: "New partners are regularly added and announced through our app, website, and email newsletters. Check the 'Discounts' section in your app for the latest additions."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "I can't log into my account. What should I do?",
          answer: "Try resetting your password using the 'Forgot Password' option. If that doesn't work, clear your browser cache or update the app. Contact support if the issue persists."
        },
        {
          question: "The app isn't working properly on my phone.",
          answer: "Ensure you have the latest version of the app installed. Restart your phone and check your internet connection. If problems continue, contact our technical support team."
        },
        {
          question: "How do I update my personal information?",
          answer: "Log into your account and go to 'Profile Settings'. You can update most information there. Some changes may require verification and take 24-48 hours to process."
        },
        {
          question: "Is my personal data secure?",
          answer: "Yes, we use bank-level encryption and security measures to protect your data. We comply with international data protection standards and never share your information without consent."
        }
      ]
    }
  ];

  const filteredFAQs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <PremiumBanner
        title="Frequently Asked Questions"
        description="Find answers to common questions about Elverra services and client benefits."
      >
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input 
            type="text" 
            placeholder="Search FAQs..." 
            className="pl-10 h-12 text-black bg-white/95 border-0 shadow-lg focus-visible:ring-2 focus-visible:ring-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </PremiumBanner>

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.map((category, index) => (
              <Card key={index} className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <HelpCircle className="h-6 w-6 mr-3 text-purple-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-gray-700">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {filteredFAQs.length === 0 && searchTerm && (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                  <p className="text-gray-500 mb-4">
                    Sorry, we couldn't find any FAQs matching "{searchTerm}". 
                    Try different keywords or contact our support team.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Contact Support Section */}
            <Card className="mt-12">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Still Need Help?</CardTitle>
                <p className="text-center text-gray-600">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Live Chat</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Chat with our support team in real-time
                    </p>
                    <Button variant="outline" size="sm">Start Chat</Button>
                  </div>

                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Phone className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Phone Support</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Call us Monday to Friday, 8AM - 6PM
                    </p>
                    <Button variant="outline" size="sm">+221 77 123 4567</Button>
                  </div>

                  <div className="text-center">
                    <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Send us an email and we'll respond within 24 hours
                    </p>
                    <Link to="/about/contact">
                      <Button variant="outline" size="sm">Contact Us</Button>
                    </Link>
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

export default FAQ;
