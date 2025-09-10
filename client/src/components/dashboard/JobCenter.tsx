
import React from 'react';
import { Briefcase, Search, Building, TrendingUp, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface JobCenterProps {
  applications: any[]; // Consider replacing 'any' with a proper type definition for your application objects
}

const JobCenter: React.FC<JobCenterProps> = ({ applications = [] }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Job Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {applications.length > 0 
              ? `You have ${applications.length} active job applications`
              : 'You have no active job applications'}
          </p>
          <Button asChild className="w-full">
            <Link to="/jobs">
              <Search className="mr-2 h-4 w-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCenter;
