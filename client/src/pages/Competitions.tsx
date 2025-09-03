
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Trophy, Users, Heart } from 'lucide-react';
import { toast } from 'sonner';
import CompetitionParticipationForm from '@/components/competitions/CompetitionParticipationForm';
import { useAuth } from '@/hooks/useAuth';
import { useMembership } from '@/hooks/useMembership';

interface Competition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  prize: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  current_entries: number;
  max_entries: number;
}

interface Participant {
  id: string;
  participant_name: string;
  participant_phone: string;
  profile_picture_url: string;
  vote_count: number;
  user_id: string;
}

const Competitions = () => {
  const { user } = useAuth();
  const { getMembershipAccess } = useMembership();
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [showParticipationForm, setShowParticipationForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      // Mock competitions data for now
      const mockCompetitions: Competition[] = [
        {
          id: '1',
          title: 'Photography Contest 2025',
          description: 'Capture the beauty of our client network through your lens',
          start_date: '2025-02-01T00:00:00Z',
          end_date: '2025-02-28T23:59:59Z',
          location: 'Online',
          prize: 'CFA 500,000 + Professional Camera',
          status: 'upcoming',
          current_entries: 45,
          max_entries: 200
        },
        {
          id: '2', 
          title: 'Innovation Challenge',
          description: 'Present innovative solutions for community development',
          start_date: '2025-01-15T00:00:00Z',
          end_date: '2025-03-15T23:59:59Z',
          location: 'Hybrid (Online & Regional Centers)',
          prize: 'CFA 1,000,000 + Mentorship Program',
          status: 'active',
          current_entries: 67,
          max_entries: 100
        },
        {
          id: '3',
          title: 'Cultural Heritage Festival',
          description: 'Showcase the rich cultural heritage of our markets',
          start_date: '2025-03-01T00:00:00Z',
          end_date: '2025-03-31T23:59:59Z',
          location: 'Regional Centers',
          prize: 'CFA 750,000 + Cultural Exchange Trip',
          status: 'upcoming',
          current_entries: 23,
          max_entries: 150
        }
      ];
      return mockCompetitions;
    }
  });

  const { data: participants } = useQuery({
    queryKey: ['competition-participants', selectedCompetition],
    queryFn: async () => {
      if (!selectedCompetition) return [];
      
      const mockResult = { data: [], error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;
      
      if (error) throw error;
      return data as Participant[];
    },
    enabled: !!selectedCompetition
  });

  const voteMutation = useMutation({
    mutationFn: async ({ participantId, competitionId }: { participantId: string; competitionId: string }) => {
      if (!user) throw new Error('Please login to vote');

      const mockResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;

      if (error) throw error;

      // TODO: Replace with API call to update participant vote count
      const updateError = null;

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Vote submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['competition-participants'] });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('You have already voted today for this competition');
      } else {
        toast.error('Failed to submit vote. Please try again.');
      }
    }
  });

  const handleVote = (participantId: string, competitionId: string) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }
    voteMutation.mutate({ participantId, competitionId });
  };

  const handleParticipate = (competitionId: string) => {
    if (!user) {
      toast.error('Please login to participate in competitions');
      return;
    }
    
    const access = getMembershipAccess();
    if (!access.hasActiveMembership) {
      toast.error('Membership required to participate in competitions');
      return;
    }
    setSelectedCompetition(competitionId);
    setShowParticipationForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
        <PremiumBanner
          title="Events & Awards"
          description="Participate in exciting events and vote for your favorite participants. Win amazing prizes and recognition!"
          backgroundImage="https://images.unsplash.com/photo-1567034298638-1c2cdb3d1a65?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
        />

        <div className="py-16 bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Competitions List */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Active & Upcoming Events</h2>
              <div className="space-y-6">
                {competitions?.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          <CardDescription className="mt-2">{event.description}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(event.status)} text-white`}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">
                            {new Date(event.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{event.prize}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{event.current_entries} entries</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {event.status === 'active' && (
                          <>
                            <Button 
                              onClick={() => handleParticipate(event.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Participate
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedCompetition(
                                selectedCompetition === event.id ? null : event.id
                              )}
                            >
                              {selectedCompetition === event.id ? 'Hide' : 'View'} Participants
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Participants Section */}
            <div className="lg:col-span-1">
              {selectedCompetition && participants && (
                <Card>
                  <CardHeader>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>Vote for your favorite participant (1 vote per day)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={participant.profile_picture_url || 'https://placehold.co/40x40/e9d5ff/7c3aed?text=' + participant.participant_name.charAt(0)}
                              alt={participant.participant_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{participant.participant_name}</p>
                              <p className="text-sm text-gray-500">{participant.vote_count} votes</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(participant.id, selectedCompetition)}
                            disabled={voteMutation.isPending}
                            className="hover:bg-red-50 hover:border-red-300"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Vote
                          </Button>
                        </div>
                      ))}
                      
                      {participants.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No participants yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showParticipationForm && selectedCompetition && (
        <CompetitionParticipationForm
          competitionId={selectedCompetition}
          onClose={() => {
            setShowParticipationForm(false);
            setSelectedCompetition(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['competitions'] });
            queryClient.invalidateQueries({ queryKey: ['competition-participants'] });
          }}
        />
      )}
      </Layout>
  );
};

export default Competitions;
