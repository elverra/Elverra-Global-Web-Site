import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HeartHandshake,
  GraduationCap,
  Bike,
  Smartphone,
  Car,
  Cross,
  Bus,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

const OSecoursSection = () => {
  const { user } = useAuth();
  const { membership } = useMembership();
  const { t } = useLanguage();
  
  const isEligible = membership?.tier === 'premium' || membership?.tier === 'elite';

  // Mock services data
  const services = [
    {
      id: 'school-fees',
      icon: GraduationCap,
      title: 'School Fees Assistance',
      description: 'Emergency funding for education expenses',
      maxAmount: 500000,
      processingTime: '24-48 hours',
      requirements: ['Student ID', 'Fee invoice', 'Parent/guardian consent'],
      available: true
    },
    {
      id: 'bike-repair',
      icon: Bike,
      title: 'Bike Repair Service',
      description: 'Emergency bike repairs and maintenance',
      maxAmount: 50000,
      processingTime: '2-4 hours',
      requirements: ['Bike registration', 'Damage photos', 'Location details'],
      available: true
    },
    {
      id: 'mobile-repair',
      icon: Smartphone,
      title: 'Mobile Phone Repair',
      description: 'Urgent mobile phone repair services',
      maxAmount: 75000,
      processingTime: '1-3 hours',
      requirements: ['Device IMEI', 'Purchase receipt', 'Problem description'],
      available: true
    },
    {
      id: 'auto-repair',
      icon: Car,
      title: 'Auto Repair Emergency',
      description: 'Emergency vehicle repairs and towing',
      maxAmount: 200000,
      processingTime: '1-2 hours',
      requirements: ['Vehicle registration', 'Driver license', 'Location'],
      available: true
    },
    {
      id: 'first-aid',
      icon: Cross,
      title: 'First Aid & Medical',
      description: 'Emergency medical assistance and ambulance',
      maxAmount: 300000,
      processingTime: '15-30 minutes',
      requirements: ['Medical emergency details', 'Location', 'Contact person'],
      available: true
    },
    {
      id: 'transport',
      icon: Bus,
      title: 'Emergency Transport',
      description: 'Emergency transportation services',
      maxAmount: 25000,
      processingTime: '30-60 minutes',
      requirements: ['Current location', 'Destination', 'Reason for emergency'],
      available: true
    }
  ];

  // Mock service requests
  const [serviceRequests] = useState([
    {
      id: 'REQ001',
      service: 'Mobile Phone Repair',
      requestDate: '2024-01-20',
      status: 'completed',
      amount: 45000,
      description: 'Screen replacement for smartphone',
      provider: 'TechFix Bamako',
      completedDate: '2024-01-20'
    },
    {
      id: 'REQ002',
      service: 'First Aid & Medical',
      requestDate: '2024-01-15',
      status: 'completed',
      amount: 125000,
      description: 'Emergency medical consultation',
      provider: 'Bamako Medical Center',
      completedDate: '2024-01-15'
    },
    {
      id: 'REQ003',
      service: 'Auto Repair Emergency',
      requestDate: '2024-01-22',
      status: 'in-progress',
      amount: 85000,
      description: 'Engine diagnostic and repair',
      provider: 'Mali Auto Service',
      estimatedCompletion: '2024-01-23'
    }
  ]);

  // Mock eligibility info
  const eligibilityInfo = {
    monthlyLimit: 800000,
    usedThisMonth: 255000,
    remainingBalance: 545000,
    renewalDate: '2024-02-01',
    consecutiveMonths: 8
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const requestService = (serviceId: string) => {
    if (!isEligible) {
      alert('Ô Secours services are available for Premium and Elite members only. Please upgrade your membership to access these services.');
      return;
    }
    alert(`Service request initiated for ${services.find(s => s.id === serviceId)?.title}. You will be contacted shortly.`);
  };

  if (!isEligible) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Ô Secours Services</h2>
          <Badge className="bg-orange-100 text-orange-800">Premium Feature</Badge>
        </div>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-8 text-center">
            <HeartHandshake className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Upgrade to Access Ô Secours</h3>
            <p className="text-gray-600 mb-6">
              Ô Secours emergency services are available for Premium and Elite members. 
              Upgrade your membership to access emergency assistance for school fees, 
              vehicle repairs, medical emergencies, and more.
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Upgrade Membership
            </Button>
          </CardContent>
        </Card>

        {/* Preview of Available Services */}
        <Card>
          <CardHeader>
            <CardTitle>Available Services (Preview)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service) => (
                <div key={service.id} className="border rounded-lg p-4 opacity-60">
                  <service.icon className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <p className="text-xs text-gray-500">Max: CFA {service.maxAmount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ô Secours Services</h2>
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active Subscriber
        </Badge>
      </div>

      {/* Eligibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="h-5 w-5" />
            Your Eligibility Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Limit</p>
              <p className="text-2xl font-bold text-blue-600">
                CFA {eligibilityInfo.monthlyLimit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Used This Month</p>
              <p className="text-2xl font-bold text-orange-600">
                CFA {eligibilityInfo.usedThisMonth.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
              <p className="text-2xl font-bold text-green-600">
                CFA {eligibilityInfo.remainingBalance.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Usage</span>
              <span>{Math.round((eligibilityInfo.usedThisMonth / eligibilityInfo.monthlyLimit) * 100)}%</span>
            </div>
            <Progress 
              value={(eligibilityInfo.usedThisMonth / eligibilityInfo.monthlyLimit) * 100} 
              className="h-2"
            />
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="h-4 w-4 inline mr-1" />
              Membership renewed for {eligibilityInfo.consecutiveMonths} consecutive months. 
              Next renewal: {eligibilityInfo.renewalDate}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Available Services</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <service.icon className="h-10 w-10 text-blue-600" />
                    <Badge variant={service.available ? "default" : "secondary"}>
                      {service.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">{service.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <p><strong>Max Amount:</strong> CFA {service.maxAmount.toLocaleString()}</p>
                    <p><strong>Processing Time:</strong> {service.processingTime}</p>
                    <p><strong>Requirements:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {service.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!service.available}
                    onClick={() => requestService(service.id)}
                  >
                    Request Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.filter(req => req.status === 'in-progress' || req.status === 'pending').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{request.service}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Request ID:</span>
                        <span className="font-medium ml-2">{request.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium ml-2">CFA {request.amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Provider:</span>
                        <span className="font-medium ml-2">{request.provider}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Est. Completion:</span>
                        <span className="font-medium ml-2">{request.estimatedCompletion || 'TBD'}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">Track Request</Button>
                      <Button size="sm" variant="outline">Contact Provider</Button>
                    </div>
                  </div>
                ))}
                {serviceRequests.filter(req => req.status === 'in-progress' || req.status === 'pending').length === 0 && (
                  <p className="text-center text-gray-500 py-8">No active service requests</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Request ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Service</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Provider</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{request.id}</td>
                        <td className="py-4 px-4">{request.service}</td>
                        <td className="py-4 px-4">{new Date(request.requestDate).toLocaleDateString()}</td>
                        <td className="py-4 px-4 font-semibold">CFA {request.amount.toLocaleString()}</td>
                        <td className="py-4 px-4">{request.provider}</td>
                        <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSecoursSection;