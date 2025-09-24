import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Trophy,
  Star,
  Eye,
  Filter,
  Search,
  DollarSign,
  Award,
  Megaphone,
  BookOpen,
  Monitor,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  category?: string;
  location: string;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  max_participants?: number;
  entry_fee: number;
  currency: string;
  prize_description?: string;
  requirements?: string;
  rules?: string;
  contact_info?: string;
  image_url?: string;
  is_featured: boolean;
  requires_application: boolean;
  views: number;
  participant_count: number;
  created_at: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }
      
      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('event_type', typeFilter);
      }
      
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      if (locationFilter && locationFilter !== 'all') {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      const { data, error } = await query.order('is_featured', { ascending: false })
                                        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error loading events');
    } finally {
      setLoading(false);
    }
  };

  const incrementEventViews = async (eventId: string) => {
    try {
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('views')
        .eq('id', eventId)
        .single();

      if (fetchError) return;

      const newViews = (currentEvent?.views || 0) + 1;
      
      await supabase
        .from('events')
        .update({ views: newViews })
        .eq('id', eventId);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, typeFilter, categoryFilter, locationFilter]);

  const getEventTypeIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'competition': Trophy,
      'announcement': Megaphone,
      'workshop': BookOpen,
      'webinar': Monitor,
      'conference': Building
    };
    return icons[type] || Calendar;
  };

  const getEventTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'competition': 'Competition',
      'announcement': 'Announcement',
      'workshop': 'Workshop',
      'webinar': 'Webinar',
      'conference': 'Conference'
    };
    return types[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'competition': 'bg-yellow-100 text-yellow-800',
      'announcement': 'bg-blue-100 text-blue-800',
      'workshop': 'bg-green-100 text-green-800',
      'webinar': 'bg-purple-100 text-purple-800',
      'conference': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const isEventUpcoming = (startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    // Si l'événement a une date de fin, on vérifie par rapport à elle
    if (end) {
      return end > now;
    }
    // Sinon, on vérifie par rapport à la date de début
    return start > now;
  };

  const isRegistrationOpen = (registrationDeadline?: string) => {
    if (!registrationDeadline) return true;
    return new Date(registrationDeadline) > new Date();
  };

  const uniqueCategories = [...new Set(events.map(event => event.category).filter(Boolean))];
  const uniqueLocations = [...new Set(events.map(event => event.location))];

  return (
     <Layout>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Events Elverra Global
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Participate in our competitions, workshops, and events to develop your skills and win prizes
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {events.length} events
              </div>
              <div className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Contests and prizes
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active community
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for an event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Type of event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category!}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

          
            
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No events found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => {
              const EventIcon = getEventTypeIcon(event.event_type);
              const isUpcoming = isEventUpcoming(event.start_date, event.end_date);
              const canRegister = isRegistrationOpen(event.registration_deadline);
              
              return (
                <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.is_featured ? 'border-purple-200 bg-purple-50' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      {event.image_url && (
                        <div className="lg:w-48 h-32 lg:h-auto">
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Event Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {event.title}
                              {event.is_featured && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getEventTypeColor(event.event_type)}>
                                <EventIcon className="h-3 w-3 mr-1" />
                                {getEventTypeLabel(event.event_type)}
                              </Badge>
                              {event.category && (
                                <Badge variant="outline">{event.category}</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(event.start_date).toLocaleDateString('fr-FR')}
                            {event.end_date && event.end_date !== event.start_date && (
                              <span> - {new Date(event.end_date).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                          {event.entry_fee > 0 && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {event.entry_fee.toLocaleString()} {event.currency}
                            </div>
                          )}
                          {event.entry_fee === 0 && (
                            <div className="flex items-center text-green-600">
                              <Award className="h-4 w-4 mr-1" />
                              Free
                            </div>
                          )}
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {event.views} views
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.participant_count} participants
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        {event.prize_description && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 text-yellow-600 mr-2" />
                              <span className="font-medium text-yellow-800">Prize:</span>
                            </div>
                            <p className="text-yellow-700 text-sm mt-1">{event.prize_description}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {event.registration_deadline && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Register until {new Date(event.registration_deadline).toLocaleDateString('en-US')}
                              </div>
                            )}
                            {event.max_participants && (
                              <div className="flex items-center mt-1">
                                <Users className="h-4 w-4 mr-1" />
                                Limited spots: unlimited
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {!isUpcoming ? (
                              <Badge variant="secondary">Ended</Badge>
                            ) : !canRegister ? (
                              <Badge variant="destructive">Registration closed</Badge>
                            ) : event.requires_application ? (
                              <Button 
                                asChild
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => incrementEventViews(event.id)}
                              >
                                <Link to={`/events/${event.id}`}>
                                  See More
                                </Link>
                              </Button>
                            ) : (
                              <Button 
                                asChild
                                variant="outline"
                                onClick={() => incrementEventViews(event.id)}
                              >
                                <Link to={`/events/${event.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default Events;
