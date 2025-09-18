import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Trophy,
  Star,
  Eye,
  ArrowLeft,
  Send,
  DollarSign,
  Award,
  Megaphone,
  BookOpen,
  Monitor,
  Building,
  User,
  Mail,
  Phone,
  Building2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

interface ParticipationForm {
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  motivation: string;
  experience_level: string;
  portfolio_url: string;
  team_members: string;
  additional_info: string;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [participationForm, setParticipationForm] = useState<ParticipationForm>({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    motivation: '',
    experience_level: '',
    portfolio_url: '',
    team_members: '',
    additional_info: ''
  });

  const fetchEvent = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setEvent(data);

      // Increment view count
      await incrementEventViews(id);

      // Check if user has already participated
      if (user) {
        const { data: participationData } = await supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .single();
        
        setHasParticipated(!!participationData);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Erreur lors du chargement de l\'événement');
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

  const handleInputChange = (field: keyof ParticipationForm, value: string) => {
    setParticipationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitParticipation = async () => {
    if (!user || !event) {
      toast.error('Vous devez être connecté pour participer');
      return;
    }

    if (!participationForm.full_name || !participationForm.email || !participationForm.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setParticipating(true);

      const participationData = {
        event_id: event.id,
        user_id: user.id,
        full_name: participationForm.full_name,
        email: participationForm.email,
        phone: participationForm.phone,
        organization: participationForm.organization || null,
        motivation: participationForm.motivation || null,
        experience_level: participationForm.experience_level || null,
        portfolio_url: participationForm.portfolio_url || null,
        team_members: participationForm.team_members || null,
        additional_info: participationForm.additional_info || null,
      };

      const { error } = await supabase
        .from('event_participants')
        .insert([participationData]);

      if (error) throw error;

      toast.success('Participation enregistrée avec succès!');
      setHasParticipated(true);
      
      // Reset form
      setParticipationForm({
        full_name: '',
        email: '',
        phone: '',
        organization: '',
        motivation: '',
        experience_level: '',
        portfolio_url: '',
        team_members: '',
        additional_info: ''
      });

    } catch (error) {
      console.error('Error submitting participation:', error);
      toast.error('Erreur lors de l\'enregistrement de la participation');
    } finally {
      setParticipating(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

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

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isRegistrationOpen = (registrationDeadline?: string) => {
    if (!registrationDeadline) return true;
    return new Date(registrationDeadline) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'événement...</p>
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
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  const EventIcon = getEventTypeIcon(event.event_type);
  const isUpcoming = isEventUpcoming(event.start_date);
  const canRegister = isRegistrationOpen(event.registration_deadline);

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

                  <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Cet événement n'a pas encore été lancé.
                  </p>
                  <p className="text-sm text-gray-500">
                    Veuillez revenir plus tard.
                  </p>
                </div>
                  // <Dialog>
                  //   <DialogTrigger asChild>
                  //     <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  //       <Send className="h-4 w-4 mr-2" />
                  //       {event.event_type === 'competition' ? 'Participer' : 'S\'inscrire'}
                  //     </Button>
                  //   </DialogTrigger>
                  //   <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  //     <DialogHeader>
                  //       <DialogTitle>
                  //         {event.event_type === 'competition' ? 'Participer à' : 'S\'inscrire à'} {event.title}
                  //       </DialogTitle>
                  //     </DialogHeader>
                      
                  //     <div className="space-y-4">
                  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  //         <div>
                  //           <Label htmlFor="full_name">Nom complet *</Label>
                  //           <Input
                  //             id="full_name"
                  //             value={participationForm.full_name}
                  //             onChange={(e) => handleInputChange('full_name', e.target.value)}
                  //             placeholder="Votre nom complet"
                  //           />
                  //         </div>
                  //         <div>
                  //           <Label htmlFor="email">Email *</Label>
                  //           <Input
                  //             id="email"
                  //             type="email"
                  //             value={participationForm.email}
                  //             onChange={(e) => handleInputChange('email', e.target.value)}
                  //             placeholder="votre@email.com"
                  //           />
                  //         </div>
                  //       </div>

                  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  //         <div>
                  //           <Label htmlFor="phone">Téléphone *</Label>
                  //           <Input
                  //             id="phone"
                  //             value={participationForm.phone}
                  //             onChange={(e) => handleInputChange('phone', e.target.value)}
                  //             placeholder="+223 XX XX XX XX"
                  //           />
                  //         </div>
                  //         <div>
                  //           <Label htmlFor="organization">Organisation/Entreprise</Label>
                  //           <Input
                  //             id="organization"
                  //             value={participationForm.organization}
                  //             onChange={(e) => handleInputChange('organization', e.target.value)}
                  //             placeholder="Votre entreprise ou école"
                  //           />
                  //         </div>
                  //       </div>

                  //       <div>
                  //         <Label htmlFor="motivation">Motivation</Label>
                  //         <Textarea
                  //           id="motivation"
                  //           value={participationForm.motivation}
                  //           onChange={(e) => handleInputChange('motivation', e.target.value)}
                  //           placeholder="Pourquoi souhaitez-vous participer à cet événement ?"
                  //           rows={3}
                  //         />
                  //       </div>

                  //       <div>
                  //         <Label htmlFor="experience_level">Niveau d'expérience</Label>
                  //         <Select value={participationForm.experience_level} onValueChange={(value) => handleInputChange('experience_level', value)}>
                  //           <SelectTrigger>
                  //             <SelectValue placeholder="Sélectionnez votre niveau" />
                  //           </SelectTrigger>
                  //           <SelectContent>
                  //             <SelectItem value="beginner">Débutant</SelectItem>
                  //             <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  //             <SelectItem value="advanced">Avancé</SelectItem>
                  //           </SelectContent>
                  //         </Select>
                  //       </div>

                  //       <div>
                  //         <Label htmlFor="portfolio_url">Portfolio (URL)</Label>
                  //         <Input
                  //           id="portfolio_url"
                  //           type="url"
                  //           value={participationForm.portfolio_url}
                  //           onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  //           placeholder="https://monportfolio.com"
                  //         />
                  //       </div>

                  //       {event.event_type === 'competition' && (
                  //         <div>
                  //           <Label htmlFor="team_members">Membres de l'équipe (si applicable)</Label>
                  //           <Textarea
                  //             id="team_members"
                  //             value={participationForm.team_members}
                  //             onChange={(e) => handleInputChange('team_members', e.target.value)}
                  //             placeholder="Noms et rôles des membres de votre équipe..."
                  //             rows={2}
                  //           />
                  //         </div>
                  //       )}

                  //       <div>
                  //         <Label htmlFor="additional_info">Informations supplémentaires</Label>
                  //         <Textarea
                  //           id="additional_info"
                  //           value={participationForm.additional_info}
                  //           onChange={(e) => handleInputChange('additional_info', e.target.value)}
                  //           placeholder="Toute information supplémentaire que vous souhaitez partager..."
                  //           rows={2}
                  //         />
                  //       </div>

                  //       <Button 
                  //         onClick={handleSubmitParticipation}
                  //         disabled={participating}
                  //         className="w-full bg-purple-600 hover:bg-purple-700"
                  //       >
                  //         {participating ? (
                  //           <>
                  //             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  //             Envoi en cours...
                  //           </>
                  //         ) : (
                  //           <>
                  //             <Send className="h-4 w-4 mr-2" />
                  //             {event.event_type === 'competition' ? 'Confirmer ma participation' : 'Confirmer mon inscription'}
                  //           </>
                  //         )}
                  //       </Button>
                  //     </div>
                  //   </DialogContent>
                  // </Dialog>
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
