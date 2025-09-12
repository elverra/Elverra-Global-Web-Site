
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Calendar, Users } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    // API format
    project_name?: string;
    goal_amount?: number;
    current_amount?: number;
    image_url?: string;
    end_date?: string;
    // Mock/alternative formats
    title?: string;
    goal?: number;
    raised?: number;
    image?: string;
    timeLeft?: string;
    // API specific fields
    targetAmount?: number;
    currentAmount?: number;
    // Common fields
    description: string;
    category: string;
    location?: string;
    currency?: string;
    backers?: number;
    supporters?: number;
    featured?: boolean;
    status?: string;
    submitterName?: string;
    beneficiaries?: string;
    expectedImpact?: string;
    projectPlan?: string;
  };
  onContribute: (projectId: string) => void;
}

const ProjectCard = ({ project, onContribute }: ProjectCardProps) => {
  // Handle multiple data formats: API, mock data, and actual backend data
  const projectName = project.project_name || project.title || 'Untitled Project';
  const goalAmount = project.goal_amount || project.goal || project.targetAmount || 0;
  const currentAmount = project.current_amount || project.raised || project.currentAmount || 0;
  const currency = project.currency || 'CFA';
  const imageUrl = project.image_url || project.image;
  const backersCount = project.backers || project.supporters || 0;
  
  const progressPercentage = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  
  // Handle different date formats
  let daysLeft = 0;
  if (project.end_date) {
    daysLeft = Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  } else if (project.timeLeft) {
    // Extract number from timeLeft string like "15 days"
    const match = project.timeLeft.match(/(\d+)/);
    daysLeft = match ? parseInt(match[1]) : 0;
  }

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <img 
          src={imageUrl} 
          alt={projectName}
          className="w-full h-48 object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="text-lg">{projectName}</CardTitle>
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {project.location || 'Mali'}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        <div className="space-y-3">
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              {currency} {currentAmount?.toLocaleString() || '0'}
            </span>
            <span className="text-gray-500">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            Goal: {currency} {goalAmount?.toLocaleString() || '0'}
          </div>
          
          {backersCount > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {backersCount} {backersCount === 1 ? 'backer' : 'backers'}
            </div>
          )}
          
          {daysLeft > 0 && (
            <Button 
              onClick={() => onContribute(project.id)}
              className="w-full bg-elverra-purple hover:bg-elverra-darkpurple"
            >
              Contribute Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
