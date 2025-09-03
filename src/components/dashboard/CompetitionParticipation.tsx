
import React from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Competition {
  id: string;
  name: string;
  date: string;
  status: string;
}

interface CompetitionParticipationProps {
  competitions: Competition[];
}

const CompetitionParticipation = ({ competitions }: CompetitionParticipationProps) => {
  return (
    <Card>
      
    </Card>
  );
};

export default CompetitionParticipation;
