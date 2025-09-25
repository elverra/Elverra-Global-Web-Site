import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  project_name: string;
  description: string;
  category: string;
  goal_amount: number;
  current_amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: string;
  location: string | null;
  image_url: string | null;
  created_at: string;
}

const ProjectsManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    category: '',
    goal_amount: 0,
    currency: 'CFA',
    start_date: '',
    end_date: '',
    status: 'active',
    location: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const mockResult = { data: [], error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const mockResult = { data: null, error: null }; // TODO: Replace with API call
        const { data, error } = mockResult;
        
        if (error) throw error;
        toast({ title: "Success", description: "Project updated successfully" });
      } else {
        const mockResult = { data: null, error: null }; // TODO: Replace with API call
        const { data, error } = mockResult;
        
        if (error) throw error;
        toast({ title: "Success", description: "Project created successfully" });
      }
      
      resetForm();
      fetchProjects();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;
      
      if (error) throw error;
      toast({ title: "Success", description: "Project deleted successfully" });
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      project_name: '',
      description: '',
      category: '',
      goal_amount: 0,
      currency: 'CFA',
      start_date: '',
      end_date: '',
      status: 'active',
      location: '',
      image_url: ''
    });
    setEditingProject(null);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      project_name: project.project_name,
      description: project.description,
      category: project.category,
      goal_amount: project.goal_amount,
      currency: project.currency,
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      status: project.status,
      location: project.location || '',
      image_url: project.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading projects...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects Management</h1>
            <p className="text-gray-600 mt-2">Manage funding projects and community initiatives</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="project_name">Project Name *</Label>
                  <Input
                    id="project_name"
                    value={formData.project_name}
                    onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="community">Community Development</SelectItem>
                        <SelectItem value="agriculture">Agriculture</SelectItem>
                        <SelectItem value="environment">Environment</SelectItem>
                        <SelectItem value="youth">Youth Programs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal_amount">Goal Amount *</Label>
                    <Input
                      id="goal_amount"
                      type="number"
                      value={formData.goal_amount}
                      onChange={(e) => setFormData({...formData, goal_amount: parseInt(e.target.value) || 0})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CFA">CFA</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image_url">Project Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No projects found</p>
                <Button onClick={openAddDialog}>Add your first project</Button>
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      {project.image_url && (
                        <img 
                          src={project.image_url} 
                          alt={project.project_name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {project.project_name}
                          <Badge variant={project.status === 'active' ? 'default' : project.status === 'completed' ? 'secondary' : 'destructive'}>
                            {project.status}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 capitalize">{project.category}</p>
                        {project.location && (
                          <p className="text-sm text-gray-500">{project.location}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Funding Progress</span>
                      <span className="text-sm text-gray-600">
                        {project.current_amount.toLocaleString()} / {project.goal_amount.toLocaleString()} {project.currency}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(project.current_amount, project.goal_amount)} className="w-full" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{getProgressPercentage(project.current_amount, project.goal_amount).toFixed(1)}% funded</span>
                      <span>Goal: {project.goal_amount.toLocaleString()} {project.currency}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-sm text-gray-600">
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsManagement;