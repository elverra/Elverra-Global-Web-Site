import { Router } from 'express';

const router = Router();

// Mock projects data for now - replace with real database later
const mockProjects = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    description: 'Providing clean water access to rural communities',
    category: 'Community Development',
    targetAmount: 50000,
    currentAmount: 12500,
    location: 'Bamako, Mali',
    status: 'active',
    submitterId: 'user1',
    submitterName: 'Community Leader',
    createdAt: new Date('2024-01-15').toISOString(),
    supporters: 25,
    beneficiaries: 'Rural families in Bamako outskirts',
    expectedImpact: 'Improved health and quality of life for 500+ families',
    projectPlan: 'Install 5 water wells with filtration systems over 6 months'
  },
  {
    id: '2', 
    title: 'School Library Project',
    description: 'Building a digital library for primary schools',
    category: 'Education',
    targetAmount: 30000,
    currentAmount: 8500,
    location: 'Dakar, Senegal',
    status: 'active',
    submitterId: 'user2',
    submitterName: 'Teacher Association',
    createdAt: new Date('2024-02-01').toISOString(),
    supporters: 18,
    beneficiaries: 'Students and teachers in rural schools',
    expectedImpact: 'Enhanced learning opportunities for 800+ students',
    projectPlan: 'Setup digital library with tablets and educational content'
  }
];

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
  try {
    res.json(mockProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get specific project
router.get('/:id', (req, res) => {
  try {
    const project = mockProjects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Submit new project
router.post('/', (req, res) => {
  try {
    const newProject = {
      id: `project_${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      supporters: 0,
      status: 'pending_review'
    };
    
    mockProjects.push(newProject);
    
    console.log('New project submitted:', newProject.title);
    res.status(201).json({ 
      success: true, 
      message: 'Project submitted successfully',
      project: newProject 
    });
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Failed to submit project' });
  }
});

export default router;