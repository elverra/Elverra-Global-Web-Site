import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Users, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const projectsData = [
  {
    id: 1,
    title: 'Digital Financial Inclusion Initiative',
    description: 'Expanding access to financial services through our ZENIKA card program, reaching underserved communities across our client network.',
    longDescription: 'This comprehensive initiative aims to bridge the financial inclusion gap by providing digital financial services to previously unbanked populations. Through our innovative ZENIKA card system, participants gain access to mobile banking, digital payments, savings accounts, and microloans. The program focuses on rural and underserved urban communities, providing financial literacy training alongside service access.',
    status: 'Active',
    location: 'Multiple Locations',
    startDate: '2024',
    endDate: 'Ongoing',
    beneficiaries: '50,000+',
    budget: '$2.5M',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    impact: [
      'Provided financial services to 50,000+ previously unbanked individuals',
      'Established 200+ service points across our client network',
      'Reduced transaction costs by 40% for participants',
      'Increased savings rates by 60% among program participants'
    ],
    objectives: [
      'Expand financial access to underserved communities',
      'Reduce transaction costs through digital solutions',
      'Improve financial literacy and inclusion',
      'Create sustainable economic opportunities'
    ],
    milestones: [
      { date: '2024-01', description: 'Program launch in pilot regions', completed: true },
      { date: '2024-06', description: '25,000 participants enrolled', completed: true },
      { date: '2024-12', description: '50,000 participants target', completed: false },
      { date: '2025-06', description: 'Full network expansion', completed: false }
    ],
    category: 'Financial Services',
    partners: ['Orange Money', 'SAMA Money', 'Regional Development Bank'],
    teamSize: 45,
    regions: ['Bamako', 'Kayes', 'Sikasso', 'Ségou']
  },
  {
    id: 2,
    title: 'Community Job Training Program',
    description: 'Skills development and job placement program helping young professionals find employment opportunities.',
    longDescription: 'A comprehensive workforce development initiative designed to equip young adults with market-relevant skills. The program combines technical training, soft skills development, and direct job placement services. Participants receive training in high-demand sectors including technology, healthcare, agriculture, and business services.',
    status: 'Active',
    location: 'Regional Centers',
    startDate: '2023',
    endDate: '2025',
    beneficiaries: '15,000+',
    budget: '$1.8M',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    impact: [
      'Trained over 15,000 individuals in digital and technical skills',
      '75% job placement rate within 6 months of completion',
      'Partnered with 500+ local businesses for job opportunities',
      'Average income increase of 180% for participants'
    ],
    objectives: [
      'Reduce youth unemployment through skills training',
      'Bridge the skills gap in key economic sectors',
      'Create pathways to sustainable employment',
      'Support economic growth through human capital development'
    ],
    milestones: [
      { date: '2023-03', description: 'Program design and curriculum development', completed: true },
      { date: '2023-08', description: 'First cohort graduation', completed: true },
      { date: '2024-06', description: '10,000 participants milestone', completed: true },
      { date: '2025-03', description: 'Program completion and evaluation', completed: false }
    ],
    category: 'Education & Employment',
    partners: ['TechHub Innovation Center', 'Education Alliance', 'Local Merchants Network'],
    teamSize: 32,
    regions: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou']
  },
  {
    id: 3,
    title: 'Small Business Support Network',
    description: 'Providing microloans, business training, and market access to small entrepreneurs through our platform.',
    longDescription: 'This initiative creates a comprehensive ecosystem supporting small and medium enterprises through financial services, business development training, and market linkage programs. Entrepreneurs receive not only capital through microloans but also ongoing mentorship, business planning support, and access to wider markets through our platform.',
    status: 'Active',
    location: 'Urban & Rural Areas',
    startDate: '2023',
    endDate: 'Ongoing',
    beneficiaries: '8,500+',
    budget: '$3.2M',
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    impact: [
      'Disbursed over $2M in microloans to small businesses',
      'Created an estimated 25,000 jobs across our client network',
      'Improved average business revenue by 60%',
      'Supported 1,200+ women-owned businesses'
    ],
    objectives: [
      'Increase access to business financing',
      'Provide comprehensive business development support',
      'Create sustainable employment opportunities',
      'Promote entrepreneurship and innovation'
    ],
    milestones: [
      { date: '2023-05', description: 'First microloan disbursements', completed: true },
      { date: '2023-12', description: '$1M in loans disbursed', completed: true },
      { date: '2024-08', description: '5,000 businesses supported', completed: true },
      { date: '2025-12', description: 'Program sustainability achieved', completed: false }
    ],
    category: 'Economic Development',
    partners: ['Regional Development Bank', 'Local Merchants Network', 'Agricultural Cooperative Union'],
    teamSize: 28,
    regions: ['Multiple Locations', 'Rural Areas', 'Urban Centers']
  }
];

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundProject = projectsData.find(p => p.id === parseInt(id || '0'));
      setProject(foundProject);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/about/projects">Back to Projects</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PremiumBanner
        title={project.title}
        description={project.description}
        backgroundImage={project.image}
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
                <Link to="/about/projects" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Project Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <CardTitle className="text-2xl text-gray-900">{project.title}</CardTitle>
                      <Badge 
                        variant={project.status === 'Active' ? 'default' : 'secondary'}
                        className="bg-purple-600 text-white"
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">{project.longDescription}</p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
                      <div className="text-center">
                        <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{project.beneficiaries}</div>
                        <div className="text-sm text-gray-600">Beneficiaries</div>
                      </div>
                      <div className="text-center">
                        <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{project.budget}</div>
                        <div className="text-sm text-gray-600">Budget</div>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{project.startDate}</div>
                        <div className="text-sm text-gray-600">Start Year</div>
                      </div>
                      <div className="text-center">
                        <MapPin className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-purple-600">{project.teamSize}</div>
                        <div className="text-sm text-gray-600">Team Size</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Objectives */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-600" />
                      Project Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {project.objectives.map((objective: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Impact Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                      Key Impact Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {project.impact.map((impact: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-3 font-bold">•</span>
                          <span className="text-gray-700">{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Project Milestones */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.milestones.map((milestone: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-4 flex-shrink-0 ${
                            milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{milestone.description}</div>
                            <div className="text-sm text-gray-600">{milestone.date}</div>
                          </div>
                          {milestone.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Category</div>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Duration</div>
                      <div className="text-sm text-gray-600">{project.startDate} - {project.endDate}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Regions</div>
                      <div className="flex flex-wrap gap-1">
                        {project.regions.map((region: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Partners */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Partners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.partners.map((partner: string, index: number) => (
                        <div key={index} className="text-sm text-gray-700 flex items-center">
                          <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                          {partner}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Get Involved */}
                <Card className="bg-purple-600 text-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Get Involved</h3>
                    <p className="text-purple-100 text-sm mb-4">
                      Interested in supporting this project? Contact us to learn about partnership opportunities.
                    </p>
                    <Button asChild size="sm" variant="secondary" className="w-full">
                      <Link to="/about/contact">Contact Us</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;