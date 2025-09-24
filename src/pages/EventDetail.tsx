import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, BookOpen, Monitor, Building, Megaphone, Send, ArrowLeft, MapPin, Users, Eye, Calendar, Star, Award, DollarSign, Upload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  category?: string;
  location: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  views: number;
  max_participants?: number;
  is_active: boolean;
  registration_deadline?: string;
  entry_fee: number;
  currency: string;
  prize_description?: string;
  requirements?: string;
  rules?: string;
  contact_info?: string;
  image_url?: string;
  is_featured: boolean;
  requires_application: boolean;
  participant_count: number;
}

interface ParticipationForm {
  full_name: string;
  email?: string;
  phone: string;
  motivation: string;
  additional_info: string;
  files: File[];
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [participationForm, setParticipationForm] = useState<ParticipationForm>({
    full_name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    motivation: '',
    additional_info: '',
    files: []
  });

  // Handle form input changes
  const handleInputChange = (name: keyof ParticipationForm, value: string) => {
    setParticipationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitParticipation(e);
  };

  const handleSubmitParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Please log in to participate in this event');
      return;
    }

    // Vérifier si l'utilisateur a déjà participé
    if (hasParticipated) {
      toast.info('You have already participated in this event');
      return;
    }

    // Vérifier si la date limite d'inscription est dépassée
    if (event?.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      toast.error('The registration deadline has passed');
      return;
    }

    // Vérifier si le nombre maximum de participants est atteint
    if (event?.max_participants && event.participant_count >= event.max_participants) {
      toast.error('The maximum number of participants has been reached');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Afficher une notification de chargement
      const toastId = toast.loading('Processing your participation...');
      
      // Préparer les données de base de la participation
      const participationData: any = {
        event_id: id,
        user_id: user.id,
        full_name: participationForm.full_name.trim(),
        phone: participationForm.phone.trim(),
        motivation: participationForm.motivation.trim(),
        additional_info: participationForm.additional_info?.trim() || null,
        status: 'pending',
        metadata: {}
      };

      // Ajouter l'email s'il est fourni
      if (participationForm.email?.trim()) {
        participationData.email = participationForm.email.trim();
      }

      // Téléverser les fichiers s'il y en a
      if (participationForm.files.length > 0) {
        const fileUrls = [];
        let uploadCount = 0;
        const totalFiles = participationForm.files.length;
        
        // Mettre à jour la notification pour afficher la progression
        toast.loading(`Téléversement des fichiers (0/${totalFiles})...`, { id: toastId });
        
        for (const file of participationForm.files) {
          try {
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const filePath = `event_participations/${id}/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
              .from('event-files')
              .upload(filePath, file);
            
            if (uploadError) throw uploadError;
            
            // Obtenir l'URL publique du fichier
            const { data: { publicUrl } } = supabase.storage
              .from('event-files')
              .getPublicUrl(filePath);
            
            fileUrls.push({
              name: file.name,
              type: file.type,
              size: file.size,
              path: filePath,
              url: publicUrl,
              uploaded_at: new Date().toISOString()
            });
            
            uploadCount++;
            toast.loading(`Téléversement des fichiers (${uploadCount}/${totalFiles})...`, { id: toastId });
            
          } catch (uploadError) {
            console.error('Erreur lors du téléversement du fichier:', uploadError);
            // Continuer avec les autres fichiers même en cas d'échec d'un seul
            toast.warning(`Unable to upload file: ${file.name}`, { id: `file-upload-error-${file.name}` });
          }
        }
        
        if (fileUrls.length > 0) {
          participationData.metadata.files = fileUrls;
        }
      }

      // Enregistrer la participation via la fonction RPC
      if (!user?.id) {
        throw new Error('You must be logged in to register for an event');
      }

      console.log('Tentative d\'inscription avec les données:', {
        p_event_id: id,
        p_user_id: user.id,
        p_full_name: participationData.full_name,
        p_email: participationData.email || null,
        p_phone: participationData.phone,
        p_motivation: participationData.motivation || null,
        p_additional_info: participationData.additional_info || null,
        p_metadata: participationData.metadata || {}
      });

      const { data: rpcData, error: rpcError } = await supabase
        .rpc('create_event_participation', {
          p_event_id: id,
          p_user_id: user.id,
          p_full_name: participationData.full_name,
          p_email: participationData.email || null,
          p_phone: participationData.phone,
          p_motivation: participationData.motivation || null,
          p_additional_info: participationData.additional_info || null,
          p_metadata: participationData.metadata || {}
        });
        
      if (rpcError) {
        console.error('Erreur lors de l\'inscription:', rpcError);
        throw new Error(rpcError.message || 'An error occurred during registration');
      }
      
      if (!rpcData?.success) {
        throw new Error(rpcData?.error || 'Registration failed');
      }
      
      // Mettre à jour le compteur de participants côté client
      if (event) {
        setEvent(prev => ({
          ...prev!,
          participant_count: (prev?.participant_count || 0) + 1
        }));
      }
      
      // Afficher un message de succès
      toast.success('Your participation has been successfully recorded!', { id: toastId });
      
      // Mettre à jour l'état local
      setHasParticipated(true);
      
      // Réinitialiser le formulaire
      setParticipationForm({
        full_name: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        motivation: '',
        additional_info: '',
        files: []
      });
      
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la participation:', error);
      
      // Afficher un message d'erreur plus détaillé si possible
      const errorMessage = error.message || 'An error occurred while recording your participation';
      toast.error(errorMessage, { id: 'participation-error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Filter files to keep only images and videos (max 10MB per file)
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
        return isValidType && isValidSize;
      });
      
      if (validFiles.length < newFiles.length) {
        toast.warning('Some files are not images/videos or exceed 10MB and have been ignored');
      }
      
      if (validFiles.length > 0) {
        setParticipationForm(prev => ({
          ...prev,
          files: [...prev.files, ...validFiles]
        }));
      }
      
      // Reset input to allow selecting the same files again
      e.target.value = '';
    }
  };
  

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      let eventData: any = null;
      
      try {
        // First try with authentication
        try {
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          eventData = data;
        } catch (authError) {
          console.log('Trying to load without authentication...', authError);
          // If failed, try without authentication (only active events)
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
            
          if (error) throw error;
          eventData = data;
        }

        if (eventData) {
          setEvent(eventData as Event);

          // Vérifier si l'utilisateur a déjà participé (uniquement si connecté)
          if (user?.id) {
            try {
              const hasParticipated = await checkUserParticipation(id, user.id);
              setHasParticipated(hasParticipated);
            } catch (participationError) {
              console.error('Error checking participation:', participationError);
              // Don't block event display for this error
            }
          }
          
          // Increment view counter
          try {
            await incrementEventViews(id);
          } catch (viewError) {
            console.error('Error incrementing views:', viewError);
            // Don't block display for this error
          }
        } else {
          throw new Error('Event not found');
        }
      } catch (error) {
        console.error('Error loading event:', error);
        toast.error(error instanceof Error ? error.message : 'Error loading event');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, user?.id]); // Ajout de user?.id comme dépendance

  // Check if user has already participated in the event
  const checkUserParticipation = useCallback(async (eventId: string, userId: string) => {
    if (!eventId || !userId) return false;
    
    try {
      // First attempt with standard query
      const { data, error } = await supabase
        .from('event_participants')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('First attempt failed, retrying with explicit headers...', error);
        // Retry with explicit headers if first attempt fails
        const retryResponse = await supabase
          .from('event_participants')
          .select('id, status')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (retryResponse.error && retryResponse.error.code !== 'PGRST116') {
          console.error('Error checking participation after retry:', retryResponse.error);
          return false;
        }
        return !!retryResponse.data;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error in participation check:', error);
      return false;
    }
  }, []);

  // Increment event views
  const incrementEventViews = useCallback(async (eventId: string) => {
    if (!eventId) return;
    
    try {
      const { error } = await supabase.rpc('increment_views', {
        event_id_param: eventId
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  }, []);



  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Événement non trouvé</p>
      </div>
    );
  }

  // Format date with proper null check
  const formatEventDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

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

  // Helper functions
  const isEventUpcoming = (startDate: string, endDate?: string) => {
    try {
      const now = new Date();
      // If the event has an end date, check against it
      if (endDate) {
        return new Date(endDate) > now;
      }
      // Otherwise, check against the start date
      return new Date(startDate) > now;
    } catch (error) {
      console.error('Invalid date format:', startDate, endDate);
      return false;
    }
  };

  const isRegistrationOpen = (registrationDeadline?: string) => {
    if (!registrationDeadline) return true;
    try {
      return new Date(registrationDeadline) > new Date();
    } catch (error) {
      console.error('Invalid registration deadline format:', registrationDeadline);
      return false;
    }
  };




  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Event not found
          </h2>
          <p className="text-gray-500 mb-4">
            This event does not exist or is no longer available.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Button>
        </div>
      </div>
    );
  }

  const EventIcon = getEventTypeIcon(event.event_type);
  const isUpcoming = isEventUpcoming(event.start_date, event.end_date);
  const canRegister = isRegistrationOpen(event.registration_deadline) && isUpcoming;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/events')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              {event.image_url && (
                <div className="w-full h-64 overflow-hidden rounded-t-lg">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {event.title}
                      {event.is_featured && (
                        <Badge className="ml-2 bg-purple-100 text-purple-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardTitle>
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

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(event.start_date).toLocaleDateString('en-US')}
                    {event.end_date && event.end_date !== event.start_date && (
                      <span> - {new Date(event.end_date).toLocaleDateString('en-US')}</span>
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
                      Gratuit
                    </div>
                  )}
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {event.views} vues
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {event.participant_count} participants
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                  </div>
                </div>

                {/* Prize Description */}
                {event.prize_description && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-yellow-800">
                      <Trophy className="h-5 w-5 mr-2" />
                      Prix et récompenses
                    </h3>
                    <div className="prose max-w-none">
                      <p className="text-yellow-700 whitespace-pre-line">{event.prize_description}</p>
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {event.requirements && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Prérequis</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{event.requirements}</p>
                    </div>
                  </div>
                )}

                {/* Rules */}
                {event.rules && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Règlement</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{event.rules}</p>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {event.contact_info && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contact</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{event.contact_info}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                  <p className="text-gray-900">{new Date(event.start_date).toLocaleDateString('en-US')}</p>
                </div>
                
                {event.end_date && event.end_date !== event.start_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">End Date</Label>
                    <p className="text-gray-900">{new Date(event.end_date).toLocaleDateString('en-US')}</p>
                  </div>
                )}

                {event.registration_deadline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Registration Deadline</Label>
                    <p className="text-gray-900">{new Date(event.registration_deadline).toLocaleDateString('en-US')}</p>
                  </div>
                )}

                {event.max_participants && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Available Seats</Label>
                    <p className="text-gray-900">unlimited</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-600">Publication Date</Label>
                  <p className="text-gray-900">{new Date(event.created_at).toLocaleDateString('en-US')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Participation Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {event.event_type === 'competition' ? 'Participate in the competition' : 'Register for the event'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      You need to be logged in to participate.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/login">Log in</a>
                    </Button>
                  </div>
                ) : !isUpcoming ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Event ended</Badge>
                    <p className="text-gray-600">
                      This event has ended.
                    </p>
                  </div>
                ) : !canRegister ? (
                  <div className="text-center">
                    <Badge variant="destructive" className="mb-4">Registration closed</Badge>
                    <p className="text-gray-600">
                      The registration period has ended.
                    </p>
                  </div>
                ) : hasParticipated ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium">
                        ✓ Registration confirmed
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        We will contact you with more information soon.
                      </p>
                    </div>
                  </div>
                ) : !event.requires_application ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      This event does not require prior registration.
                    </p>
                    <p className="text-sm text-gray-500">
                      Check the details above for more information.
                    </p>
                  </div>
                ) : (

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        aria-label={event.event_type === 'competition' ? 'Participate in this event' : 'Register for this event'}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {event.event_type === 'competition' ? 'Participate' : 'Register'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="participation-dialog-description">
                      <DialogDescription id="participation-dialog-description" className="sr-only">
                        Event participation form
                      </DialogDescription>
                      <DialogHeader>
                        <DialogTitle>
                          {event.event_type === 'competition' ? 'Participate in' : 'Register for'} {event.title}
                        </DialogTitle>
                        <DialogDescription id="event-dialog-description">
                          {event.event_type === 'competition' 
                            ? 'Fill out the form to participate in this competition.' 
                            : 'Fill out the form to register for this event.'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                              id="full_name"
                              value={participationForm.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              placeholder="Your full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={participationForm.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+223 XX XX XX XX"
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="email">Email (optional)</Label>
                            <Input
                              id="email"
                              type="email"
                              value={participationForm.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="your@email.com"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="motivation">Why do you want to participate? *</Label>
                            <Textarea
                              id="motivation"
                              value={participationForm.motivation}
                              onChange={(e) => handleInputChange('motivation', e.target.value)}
                              placeholder="Tell us why you want to participate..."
                              rows={3}
                              required
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Attachments (optional)</Label>
                            <div className="mt-1">
                              <div className="flex items-center justify-center w-full">
                                <label
                                  htmlFor="file-upload"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Supported files: PDF, JPG, PNG, DOCX, XLSX (max 10MB)
                                    </p>
                                  </div>
                                  <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                  />
                                </label>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {participationForm.files.length > 0 
                                  ? `${participationForm.files.length} file(s) selected` 
                                  : 'No file selected'}
                              </p>
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor="additional_info">Additional Information (optional)</Label>
                            <Textarea
                              id="additional_info"
                              value={participationForm.additional_info}
                              onChange={(e) => handleInputChange('additional_info', e.target.value)}
                              placeholder="Add any additional information you'd like to share..."
                              rows={3}
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            event.event_type === 'competition' ? 'Submit my participation' : 'Register for this event'
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
