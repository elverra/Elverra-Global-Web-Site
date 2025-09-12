import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle,
  Search,
  BookOpen,
  MessageCircle,
  Video,
  Download,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

const HelpSection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock FAQ data
  const [faqs] = useState([
    {
      id: 1,
      category: 'Account',
      question: 'How do I upgrade my membership?',
      answer: 'You can upgrade your membership by going to Subscriptions > Available Plans and selecting your preferred plan. Payment can be made via Orange Money, SAMA Money, or bank transfer.',
      helpful: true,
      views: 245
    },
    {
      id: 2,
      category: 'Jobs',
      question: 'How do I apply for jobs?',
      answer: 'Navigate to the Job Center section, browse available positions, and click "Apply Now" on any job that interests you. Make sure your profile is complete for better chances.',
      helpful: true,
      views: 189
    },
    {
      id: 3,
      category: 'Payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept Orange Money, SAMA Money, bank transfers, and major credit cards. All payments are processed securely.',
      helpful: true,
      views: 156
    },
    {
      id: 4,
      category: 'Affiliate',
      question: 'How does the affiliate program work?',
      answer: 'Share your referral code with friends. When they sign up and upgrade to a paid plan, you earn a commission. Your earnings are paid out monthly.',
      helpful: true,
      views: 134
    },
    {
      id: 5,
      category: 'Technical',
      question: 'Why is the website loading slowly?',
      answer: 'Slow loading can be due to internet connection or browser cache. Try clearing your browser cache or using a different browser. Contact support if the issue persists.',
      helpful: false,
      views: 98
    }
  ]);

  // Mock tutorials
  const [tutorials] = useState([
    {
      id: 1,
      title: 'Getting Started with Elverra Global',
      description: 'Learn the basics of our platform and how to set up your account',
      duration: '5 minutes',
      type: 'video',
      category: 'Beginner',
      views: 1250,
      rating: 4.8
    },
    {
      id: 2,
      title: 'How to Create an Effective Job Profile',
      description: 'Tips and tricks for creating a profile that attracts employers',
      duration: '8 minutes',
      type: 'video',
      category: 'Jobs',
      views: 890,
      rating: 4.7
    },
    {
      id: 3,
      title: 'Maximizing Your Affiliate Earnings',
      description: 'Strategies to increase your referral income',
      duration: '6 minutes',
      type: 'guide',
      category: 'Affiliate',
      views: 567,
      rating: 4.9
    },
    {
      id: 4,
      title: 'Using Ô Secours Emergency Services',
      description: 'Step-by-step guide to accessing emergency assistance',
      duration: '4 minutes',
      type: 'guide',
      category: 'Services',
      views: 423,
      rating: 4.6
    }
  ]);

  // Mock support tickets
  const [supportTickets] = useState([
    {
      id: 'TICK001',
      subject: 'Payment not processed',
      status: 'open',
      priority: 'high',
      created: '2024-01-20',
      lastUpdate: '2024-01-21',
      category: 'Payment'
    },
    {
      id: 'TICK002',
      subject: 'Job application issues',
      status: 'resolved',
      priority: 'medium',
      created: '2024-01-18',
      lastUpdate: '2024-01-19',
      category: 'Jobs'
    }
  ]);

  const categories = ['all', 'Account', 'Jobs', 'Payments', 'Affiliate', 'Technical', 'Services'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const submitTicket = () => {
    alert('Support ticket submitted successfully! You will receive a confirmation email shortly.');
  };

  const markHelpful = (faqId: number, helpful: boolean) => {
    alert(`Thank you for your feedback! This ${helpful ? 'helps' : 'helps'} us improve our documentation.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Support
        </Button>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{faq.category}</Badge>
                      <span className="text-sm text-gray-500">{faq.views} views</span>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    {faq.question}
                  </h4>
                  
                  <p className="text-gray-700 mb-4">{faq.answer}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Was this helpful?
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markHelpful(faq.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => markHelpful(faq.id, false)}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No FAQs found matching your search</p>
              <p className="text-sm text-gray-400">Try different keywords or contact support</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {tutorial.type === 'video' ? (
                      <Video className="h-5 w-5 text-blue-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-green-600" />
                    )}
                    <Badge variant="outline">{tutorial.category}</Badge>
                    <span className="text-sm text-gray-500">{tutorial.duration}</span>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">{tutorial.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{tutorial.views} views</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{tutorial.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    {tutorial.type === 'video' ? (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Watch Video
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read Guide
                      </>
                    )}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download User Manual
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  API Documentation
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Community Forum
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@elverra-global.com</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+223 XX XX XX XX</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM GMT</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-600">Available on website</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM GMT</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <p className="font-medium text-blue-800">Business Hours</p>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                    <p className="text-xs mt-2">All times in GMT (Bamako time)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Subject
                  </label>
                  <Input placeholder="Brief description of your issue" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Payments</SelectItem>
                      <SelectItem value="account">Account Issues</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Describe your issue in detail..."
                    rows={6}
                  />
                </div>

                <Button className="w-full" onClick={submitTicket}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{ticket.subject}</h4>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Ticket ID:</span>
                        <span className="ml-1">{ticket.id}</span>
                      </div>
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-1">{ticket.category}</span>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{new Date(ticket.created).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Last Update:</span>
                        <span className="ml-1">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {ticket.status === 'open' && (
                        <Button size="sm" variant="outline">
                          Add Reply
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {supportTickets.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No support tickets yet</p>
                  <p className="text-sm text-gray-400">Create a new ticket if you need help</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSection;