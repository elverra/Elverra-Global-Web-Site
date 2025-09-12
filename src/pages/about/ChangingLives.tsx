import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Quote, Star, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const impactStories = [
  {
    id: 1,
    name: 'Aminata Diallo',
    age: 28,
    location: 'Bamako',
    story: 'Through Elverra Global\'s job training program, I learned digital marketing skills and landed my dream job at a tech company. The ZENIKA card helped me save on daily expenses while building my career.',
    category: 'Career Development',
    impact: 'Increased income by 300%',
    date: '2024',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Job Training', 'ZENIKA Card', 'Career Placement'],
    rating: 5
  },
  {
    id: 2,
    name: 'Ibrahim Kone',
    age: 35,
    location: 'Ouagadougou',
    story: 'The microloan from Elverra Global helped me expand my small restaurant business. With the additional income, I was able to employ 8 local youth and support my family better.',
    category: 'Business Growth',
    impact: 'Created 8 jobs',
    date: '2023',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Microloans', 'Business Support', 'ZENIKA Card'],
    rating: 5
  },
  {
    id: 3,
    name: 'Fatou Traore',
    age: 22,
    location: 'Abidjan',
    story: 'The scholarship program allowed me to complete my computer science degree. Now I work as a software developer and volunteer to teach coding to other young women in my community.',
    category: 'Education',
    impact: 'Graduated with honors',
    date: '2024',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Scholarship Program', 'Digital Library', 'Mentorship'],
    rating: 5
  },
  {
    id: 4,
    name: 'Moussa Ouattara',
    age: 42,
    location: 'Cotonou',
    story: 'When my family faced a medical emergency, the Ô Secours program provided immediate financial assistance. We received help within 24 hours, which made all the difference.',
    category: 'Emergency Relief',
    impact: 'Family crisis resolved',
    date: '2024',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Ô Secours', 'Emergency Loans', 'Family Support'],
    rating: 5
  },
  {
    id: 5,
    name: 'Aisha Sidibe',
    age: 31,
    location: 'Dakar',
    story: 'As a single mother, the payday loan service helped me bridge financial gaps while I built my tailoring business. The flexible repayment terms made it manageable for my situation.',
    category: 'Financial Support',
    impact: 'Business stabilized',
    date: '2023',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b242?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Payday Loans', 'Business Coaching', 'ZENIKA Card'],
    rating: 5
  },
  {
    id: 6,
    name: 'Bouba Cisse',
    age: 26,
    location: 'Lomé',
    story: 'The digital library gave me access to thousands of books and courses that weren\'t available locally. I completed online certifications that helped me advance in my IT career.',
    category: 'Education',
    impact: 'Career advancement',
    date: '2024',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Digital Library', 'Online Courses', 'Certification Support'],
    rating: 5
  },
  {
    id: 7,
    name: 'Mariam Coulibaly',
    age: 29,
    location: 'Niamey',
    story: 'Through the agricultural support program, I modernized my farm operations and increased crop yields by 40%. The technical training and equipment loans were game-changers.',
    category: 'Agriculture',
    impact: '40% yield increase',
    date: '2023',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Agricultural Loans', 'Technical Training', 'Equipment Support'],
    rating: 5
  },
  {
    id: 8,
    name: 'Sekou Bamba',
    age: 38,
    location: 'Conakry',
    story: 'The online store platform helped me reach customers beyond my local market. My handcrafted goods now sell internationally, increasing my income significantly.',
    category: 'E-commerce',
    impact: 'International market access',
    date: '2024',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    services: ['Online Store', 'Digital Marketing', 'Export Support'],
    rating: 5
  }
];

const impactStats = [
  { label: 'Lives Transformed', value: '125,000+', icon: '👥' },
  { label: 'Jobs Created', value: '45,000+', icon: '💼' },
  { label: 'Businesses Supported', value: '15,000+', icon: '🏪' },
  { label: 'Students Educated', value: '35,000+', icon: '🎓' },
  { label: 'Emergency Assistance', value: '12,000+', icon: '🆘' },
  { label: 'Countries Served', value: '12', icon: '🌍' }
];

const ChangingLives = () => {
  const { user } = useAuth();
  return (
    <Layout>
      <PremiumBanner
        title="Impact Stories"
        description="Discover how Elverra Global is transforming lives and creating opportunities across our client network."
        backgroundImage="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
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
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Lives We've Changed</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from real people whose lives have been transformed through our services. 
                These are the stories that inspire us to do more every day.
              </p>
            </div>

            {/* Impact Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
              {impactStats.map((stat, index) => (
                <Card key={index} className="text-center p-4">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {impactStories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={story.image} 
                        alt={story.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-lg text-gray-900">{story.name}</CardTitle>
                          <Badge variant="secondary">{story.category}</Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {story.location}
                          <span className="mx-2">•</span>
                          <Calendar className="h-3 w-3 mr-1" />
                          {story.date}
                        </div>
                        <div className="flex items-center">
                          {[...Array(story.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Quote */}
                    <div className="relative">
                      <Quote className="h-8 w-8 text-purple-200 absolute -top-2 -left-2" />
                      <p className="text-gray-700 italic leading-relaxed pl-6 pr-2">
                        "{story.story}"
                      </p>
                    </div>

                    {/* Impact Highlight */}
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm font-semibold text-purple-900">Impact:</div>
                      <div className="text-purple-700">{story.impact}</div>
                    </div>

                    {/* Services Used */}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2">Services Used:</div>
                      <div className="flex flex-wrap gap-1">
                        {story.services.map((service, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Share Your Story CTA */}
            <div className="mt-16 text-center">
              <Card className="bg-purple-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Share Your Story</h3>
                  <p className="text-purple-100 mb-6 text-lg">
                    Have you been impacted by our services? We'd love to hear your story and 
                    share it to inspire others in our client network.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/about/contact">Share Your Story</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-purple-600">
                      <Link to={user ? "/dashboard" : "/register"}>
                        {user ? "Go to Dashboard" : "Become a Client"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChangingLives;