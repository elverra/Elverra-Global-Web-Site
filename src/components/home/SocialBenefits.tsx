
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SocialBenefits = () => {
  const benefits = [
    {
      id: 'startup',
      name: 'Startup Capital',
      description: 'Access to funds for starting or expanding your business ventures.',
      features: [
        'Business plan assessment',
        'Mentor matching',
        'Growth-focused funding',
        'Business development training',
        'Network of entrepreneurs'
      ],
      cta: 'Apply for Startup Capital'
    },
    {
      id: 'land',
      name: 'Residential Land Plot',
      description: 'Opportunity to own land plots in developing areas with special member pricing.',
      features: [
        'Discounted land purchases',
        'Legal documentation assistance',
        'Property verification',
        'Community development projects',
        'Construction guidance'
      ],
      cta: 'Explore Land Options'
    },
    {
      id: 'loans',
      name: 'Payday Loans',
      description: 'Quick access to short-term loans with favorable interest rates for members.',
      features: [
        '8% flat interest for Essential/Premium',
        '5% flat interest for Elite members',
        'Fast approval process',
        'Flexible repayment options',
        'No hidden fees'
      ],
      cta: 'Apply for Payday Loan'
    },
    {
      id: 'education',
      name: 'Scholarship & Training',
      description: 'Educational opportunities through scholarships and professional training programs.',
      features: [
        'Academic scholarships',
        'Vocational training',
        'Professional certification courses',
        'Educational workshops',
        'Career development resources'
      ],
      cta: 'View Education Opportunities'
    },
    {
      id: 'pilgrimage',
      name: 'Pilgrimage Package',
      description: 'Support for religious pilgrimage journeys for both Muslim and Christian members.',
      features: [
        'Hajj/Umrah packages',
        'Christian pilgrimage support',
        'Travel arrangements',
        'Group pilgrimages',
        'Guidance and preparation'
      ],
      cta: 'Learn About Pilgrimage Support'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Optional Social Benefits</h2>
          <p className="text-gray-600">
            As an Elverra global  client, you can choose from these additional social benefits to enhance your client experience
            and achieve your personal goals. Each benefit comes with standard charges and eligibility requirements.
          </p>
        </div>

        <Tabs defaultValue="startup" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            {benefits.map((benefit) => (
              <TabsTrigger key={benefit.id} value={benefit.id} className="text-sm">
                {benefit.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {benefits.map((benefit) => (
            <TabsContent key={benefit.id} value={benefit.id} className="animate-fade-in">
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-2xl font-bold mb-2">{benefit.name}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold mb-4 text-gray-700">Benefits Include:</h4>
                  <ul className="space-y-3">
                    {benefit.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Button className="bg-club66-purple hover:bg-club66-darkpurple">
                      {benefit.cta}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            All social benefits are optional and can be selected during or after registration.
          </p>
          <Button variant="link" className="text-club66-purple">
            View complete benefits terms and conditions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialBenefits;
