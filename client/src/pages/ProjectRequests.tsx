import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import ProjectCard from '@/components/projects/ProjectCard';
import { PlusCircle } from 'lucide-react';

const ProjectRequests = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch real project data from API
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
      // Set mock projects data on error for demo purposes
      const mockProjects = [
        {
          id: '1',
          title: 'Community Water Well Project',
          description: 'Building a clean water well for the community of 500 families in rural areas',
          category: 'Infrastructure',
          goal: 5000000,
          raised: 3200000,
          backers: 45,
          timeLeft: '15 days',
          featured: true,
          image: 'https://images.unsplash.com/photo-1581351123004-757df051db8e?w=400'
        },
        {
          id: '2', 
          title: 'Solar Panel School Initiative',
          description: 'Installing solar panels to provide reliable electricity to local schools',
          category: 'Education',
          goal: 3000000,
          raised: 1800000,
          backers: 28,
          timeLeft: '8 days',
          featured: false,
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'
        },
        {
          id: '3',
          title: 'Mobile Health Clinic',
          description: 'Equipping a mobile clinic to serve remote communities with basic healthcare',
          category: 'Healthcare',
          goal: 7500000,
          raised: 4200000,
          backers: 67,
          timeLeft: '22 days',
          featured: true,
          image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
        }
      ];
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (projectId: string) => {
    toast({
      title: "Contribution",
      description: "Contribution feature coming soon!",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Project Funding</h1>
                <p className="text-muted-foreground mt-2">
                  Support community projects and make a difference across our client network
                </p>
              </div>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => window.open('#/project-submission', '_blank')}
                data-testid="button-submit-project"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Project</span>
              </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {projects.length}
                  </div>
                  <p className="text-muted-foreground">Active Projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    CFA {projects.reduce((sum: number, p: any) => sum + (p.current_amount || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">Total Raised</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {projects.filter((p: any) => p.status === 'active').length}
                  </div>
                  <p className="text-muted-foreground">Currently Funding</p>
                </CardContent>
              </Card>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading projects...</p>
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onContribute={handleContribute}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PlusCircle className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to submit a project for community funding.
                </p>
                <Button 
                  onClick={() => window.open('#/project-submission', '_blank')}
                  data-testid="button-submit-your-project"
                >
                  Submit Your Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectRequests;