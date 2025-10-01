import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Calendar, ExternalLink, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 1,
    title: "Digital Financial Inclusion Initiative",
    description:
      "Expanding access to financial services through our ZENIKA card program, reaching underserved communities across our client network.",
    status: "Active",
    location: "Multiple Locations",
    startDate: "2024",
    beneficiaries: "50,000+",
    image:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Provided financial services to 50,000+ previously unbanked individuals",
      "Established 200+ service points across our client network",
      "Reduced transaction costs by 40% for participants",
    ],
    category: "Financial Services",
  },
  {
    id: 2,
    title: "Community Job Training Program",
    description:
      "Skills development and job placement program helping young professionals find employment opportunities.",
    status: "Active",
    location: "Regional Centers",
    startDate: "2023",
    beneficiaries: "15,000+",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Trained over 15,000 individuals in digital and technical skills",
      "75% job placement rate within 6 months of completion",
      "Partnered with 500+ local businesses for job opportunities",
    ],
    category: "Education & Employment",
  },
  {
    id: 3,
    title: "Small Business Support Network",
    description:
      "Providing microloans, business training, and market access to small entrepreneurs through our platform.",
    status: "Active",
    location: "Urban & Rural Areas",
    startDate: "2023",
    beneficiaries: "8,500+",
    image:
      "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Disbursed over $2M in microloans to small businesses",
      "Created an estimated 25,000 jobs across our client network",
      "Improved average business revenue by 60%",
    ],
    category: "Economic Development",
  },
  {
    id: 4,
    title: "Educational Scholarship Program",
    description:
      "Supporting academic excellence by providing scholarships and educational resources to deserving students.",
    status: "Active",
    location: "Educational Institutions",
    startDate: "2022",
    beneficiaries: "2,000+",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Awarded scholarships to 2,000+ students",
      "95% scholarship recipient graduation rate",
      "Established partnerships with 50+ educational institutions",
    ],
    category: "Education",
  },
  {
    id: 5,
    title: "Digital Library Access Project",
    description:
      "Creating free digital libraries and learning centers to improve access to educational resources.",
    status: "Expanding",
    location: "Community Centers",
    startDate: "2024",
    beneficiaries: "30,000+",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Established 100+ digital learning centers",
      "Provided access to 10,000+ digital books and resources",
      "Served over 30,000 community members",
    ],
    category: "Education & Technology",
  },
  {
    id: 6,
    title: "Emergency Financial Assistance (Ô Secours)",
    description:
      "Rapid response financial assistance program for individuals facing emergencies and urgent needs.",
    status: "Active",
    location: "Emergency Response Network",
    startDate: "2023",
    beneficiaries: "12,000+",
    image:
      "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    impact: [
      "Provided emergency assistance to 12,000+ individuals",
      "Average response time reduced to 24 hours",
      "Prevented financial crises for thousands of families",
    ],
    category: "Emergency Relief",
  },
];

const Projects = () => {
  const { user } = useAuth();
  return (
    <Layout>
      <PremiumBanner
        title="Our Projects"
        description="Discover how Elverra Global is making a positive impact through community-focused initiatives across our client network."
        backgroundImage="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                asChild
                variant="ghost"
                className="text-purple-600 hover:text-purple-700"
              >
                <Link to="/about" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to About
                </Link>
              </Button>
            </div>

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Community Impact Projects
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Through strategic partnerships and innovative solutions, we're
                creating positive change across our client network. Here are
                some of our key initiatives.
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge
                          variant={
                            project.status === "Active"
                              ? "default"
                              : "secondary"
                          }
                          className="bg-purple-600 text-white"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl text-gray-900 hover:text-purple-600 transition-colors">
                          {project.title}
                        </CardTitle>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {project.description}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Project Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                          {project.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                          Since {project.startDate}
                        </div>
                        <div className="flex items-center text-gray-600 col-span-2">
                          <Users className="h-4 w-4 mr-2 text-purple-600" />
                          {project.beneficiaries} Beneficiaries
                        </div>
                      </div>

                      {/* Impact Metrics */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Key Impact:
                        </h4>
                        <ul className="space-y-1">
                          {project.impact.slice(0, 2).map((impact, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-start"
                            >
                              <span className="text-purple-600 mr-2">•</span>
                              {impact}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          className="w-full group pointer-events-none"
                        >
                          Learn More
                          <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Get Involved CTA */}
            <div className="mt-16 text-center">
              <Card className="bg-purple-600 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Get Involved</h3>
                  <p className="text-purple-100 mb-6 text-lg">
                    Want to be part of our mission? Join us in creating positive
                    change across our client network.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/about/contact">Contact Partnership Team</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white text-black hover:bg-white hover:text-purple-600"
                    >
                      <Link to="/dashboard">Join Our Network</Link>
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

export default Projects;
