import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, BookOpen, Monitor, Building, Megaphone, Send, ArrowLeft, MapPin, Users, Eye, Calendar, Star, Award, DollarSign } from 'lucide-react';
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
  const [participating, setParticipating] = useState(false);
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
      toast.error('Veuillez vous connecter pour participer à cet événement');
      return;
    }

    // Vérifier si l'utilisateur a déjà participé
    if (hasParticipated) {
      toast.info('Vous avez déjà participé à cet événement');
      return;
    }

    // Vérifier si la date limite d'inscription est dépassée
    if (event?.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      toast.error('La date limite d\'inscription est dépassée');
      return;
    }

    // Vérifier si le nombre maximum de participants est atteint
    if (event?.max_participants && event.participant_count >= event.max_participants) {
      toast.error('Le nombre maximum de participants a été atteint');
      return;
    }

    try {
      setParticipating(true);
      
      // Afficher une notification de chargement
      const toastId = toast.loading('Traitement de votre participation...');
      
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
            toast.warning(`Impossible de téléverser le fichier: ${file.name}`, { id: `file-upload-error-${file.name}` });
          }
        }
        
        if (fileUrls.length > 0) {
          participationData.metadata.files = fileUrls;
        }
      }

      // Enregistrer la participation dans la base de données
      const { data, error } = await supabase
        .from('event_participants')
        .insert([participationData])
        .select()
        .single();

      if (error) throw error;
      
      // Mettre à jour le compteur de participants
      if (event) {
        await supabase.rpc('increment_event_participants', { event_id: id });
      }
      
      // Afficher un message de succès
      toast.success('Votre participation a été enregistrée avec succès !', { id: toastId });
      
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
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'enregistrement de votre participation';
      toast.error(errorMessage, { id: 'participation-error' });
    } finally {
      setParticipating(false);
    }
  };

  // Gérer la sélection de fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Filtrer les fichiers pour ne garder que les images et vidéos (max 10MB par fichier)
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
        return isValidType && isValidSize;
      });
      
      if (validFiles.length < newFiles.length) {
        toast.warning('Certains fichiers ne sont pas des images/vidéos ou dépassent 10MB et ont été ignorés');
      }
      
      if (validFiles.length > 0) {
        setParticipationForm(prev => ({
          ...prev,
          files: [...prev.files, ...validFiles]
        }));
      }
      
      // Réinitialiser l'input pour permettre la sélection des mêmes fichiers
      e.target.value = '';
    }
  };
  
  // Supprimer un fichier de la sélection
  const removeFile = (index: number) => {
    setParticipationForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Charger les données de l'événement
  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Récupérer les données de l'événement
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (eventError) throw eventError;

        if (eventData) {
          setEvent(eventData as Event);

          // Vérifier si l'utilisateur a déjà participé
          if (user?.id) {
            const { data: participationData, error: participationError } = await supabase
              .from('event_participants')
              .select('id')
              .eq('event_id', id)
              .eq('user_id', user.id)
              .single();

            if (participationError && participationError.code !== 'PGRST116') {
              console.error('Erreur lors de la vérification de la participation:', participationError);
            }
            
            setHasParticipated(!!participationData);
          }
          
          // Incrémenter le compteur de vues
          await incrementEventViews(id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'événement:', error);
        toast.error('Erreur lors du chargement de l\'événement');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

  // Function to increment event views
  const incrementEventViews = useCallback(async (eventId: string) => {
    if (!eventId) return;
    
    try {
      const { error } = await supabase.rpc('increment_views', {
        event_id: eventId
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
      return 'Date invalide';
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
      'competition': 'Concours',
      'announcement': 'Annonce',
      'workshop': 'Atelier',
      'webinar': 'Webinaire',
      'conference': 'Conférence'
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
      // Si l'événement a une date de fin, on vérifie par rapport à elle
      if (endDate) {
        return new Date(endDate) > now;
      }
      // Sinon, on vérifie par rapport à la date de début
      return new Date(startDate) > now;
    } catch (error) {
      console.error('Format de date invalide:', startDate, endDate);
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
          <p className="mt-4 text-gray-600">Chargement de l&apos;événement...</p>
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
            Événement introuvable
          </h2>
          <p className="text-gray-500 mb-4">
            Cet événement n'existe pas ou n'est plus disponible.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux événements
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
          Retour aux événements
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
                          Mis en avant
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
                <CardTitle>Informations sur l'événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de début</Label>
                  <p className="text-gray-900">{new Date(event.start_date).toLocaleDateString('fr-FR')}</p>
                </div>
                
                {event.end_date && event.end_date !== event.start_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date de fin</Label>
                    <p className="text-gray-900">{new Date(event.end_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}

                {event.registration_deadline && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date limite d'inscription</Label>
                    <p className="text-gray-900">{new Date(event.registration_deadline).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}

                {event.max_participants && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Places disponibles</Label>
                    <p className="text-gray-900">illimité</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-600">Date de publication</Label>
                  <p className="text-gray-900">{new Date(event.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Participation Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {event.event_type === 'competition' ? 'Participer au concours' : 'S\'inscrire à l\'événement'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Vous devez être connecté pour participer.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/login">Se connecter</a>
                    </Button>
                  </div>
                ) : !isUpcoming ? (
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-4">Événement terminé</Badge>
                    <p className="text-gray-600">
                      Cet événement est terminé.
                    </p>
                  </div>
                ) : !canRegister ? (
                  <div className="text-center">
                    <Badge variant="destructive" className="mb-4">Inscriptions fermées</Badge>
                    <p className="text-gray-600">
                      La période d'inscription est terminée.
                    </p>
                  </div>
                ) : hasParticipated ? (
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-800 font-medium">
                        ✓ Participation enregistrée
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        Nous vous contacterons avec plus d'informations bientôt.
                      </p>
                    </div>
                  </div>
                ) : !event.requires_application ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Cet événement ne nécessite pas d'inscription préalable.
                    </p>
                    <p className="text-sm text-gray-500">
                      Consultez les détails ci-dessus pour plus d'informations.
                    </p>
                  </div>
                ) : (

                //   <div className="text-center">
                //   <p className="text-gray-600 mb-4">
                //     Cet événement n'a pas encore été lancé.
                //   </p>
                //   <p className="text-sm text-gray-500">
                //     Veuillez revenir plus tard.
                //   </p>
                // </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <Send className="h-4 w-4 mr-2" />
                        {event.event_type === 'competition' ? 'Participer' : 'S\'inscrire'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {event.event_type === 'competition' ? 'Participer à' : 'S\'inscrire à'} {event.title}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="full_name">Nom complet *</Label>
                            <Input
                              id="full_name"
                              value={participationForm.full_name}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              placeholder="Votre nom complet"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Téléphone *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={participationForm.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+223 XX XX XX XX"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email (optionnel)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={participationForm.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="votre@email.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="motivation">Message *</Label>
                          <Textarea
                            id="motivation"
                            value={participationForm.motivation}
                            onChange={(e) => handleInputChange('motivation', e.target.value)}
                            placeholder="Dites-nous pourquoi vous souhaitez participer..."
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="file">Joindre des fichiers (images ou vidéos)</Label>
                          <div className="mt-1">
                            <div className="flex items-center">
                              <label
                                htmlFor="file-upload"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                              >
                                <span>Ajouter des fichiers</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                  accept="image/*,video/*"
                                  multiple
                                />
                              </label>
                              <span className="ml-3 text-sm text-gray-500">
                                {participationForm.files.length > 0 
                                  ? `${participationForm.files.length} fichier(s) sélectionné(s)` 
                                  : 'Aucun fichier sélectionné'}
                              </span>
                            </div>
                            
                            {/* Liste des fichiers sélectionnés */}
                            {participationForm.files.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {participationForm.files.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center space-x-2 truncate">
                                      {file.type.startsWith('image/') ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                      ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                        </svg>
                                      )}
                                      <span className="truncate text-sm">{file.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Formats acceptés : JPG, PNG, GIF, MP4, MOV (max 10MB par fichier)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="additional_info">Informations complémentaires (optionnel)</Label>
                          <Textarea
                            id="additional_info"
                            value={participationForm.additional_info}
                            onChange={(e) => handleInputChange('additional_info', e.target.value)}
                            placeholder="Toute information supplémentaire que vous souhaitez partager..."
                            rows={2}
                          />
                        </div>

                        <Button 
                          type="submit"
                          disabled={participating}
                          className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                          {participating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              {event.event_type === 'competition' ? 'Confirmer ma participation' : 'Confirmer mon inscription'}
                            </>
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
