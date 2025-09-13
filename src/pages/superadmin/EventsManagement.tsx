import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Calendar,
  MapPin,
  Trophy,
  Star,
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
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
  is_active: boolean;
  is_featured: boolean;
  requires_application: boolean;
  views: number;
  participant_count: number;
  created_at: string;
}

interface EventForm {
  title: string;
  description: string;
  event_type: string;
  category: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  max_participants: string;
  entry_fee: string;
  currency: string;
  prize_description: string;
  requirements: string;
  rules: string;
  contact_info: string;
  image_url: string;
  is_featured: boolean;
  requires_application: boolean;
}

const EventsManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewingParticipants, setViewingParticipants] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm>({
    title: '',
    description: '',
    event_type: '',
    category: '',
    location: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: '',
    entry_fee: '0',
    currency: 'FCFA',
    prize_description: '',
    requirements: '',
    rules: '',
    contact_info: '',
    image_url: '',
    is_featured: false,
    requires_application: true
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventForm, value: string | boolean) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: '',
      category: '',
      location: '',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      max_participants: '',
      entry_fee: '0',
      currency: 'FCFA',
      prize_description: '',
      requirements: '',
      rules: '',
      contact_info: '',
      image_url: '',
      is_featured: false,
      requires_application: true
    });
    setEditingEvent(null);
  };

  const handleCreateEvent = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      category: event.category || '',
      location: event.location,
      start_date: new Date(event.start_date).toISOString().split('T')[0],
      end_date: event.end_date ? new Date(event.end_date).toISOString().split('T')[0] : '',
      registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().split('T')[0] : '',
      max_participants: event.max_participants?.toString() || '',
      entry_fee: event.entry_fee.toString(),
      currency: event.currency,
      prize_description: event.prize_description || '',
      requirements: event.requirements || '',
      rules: event.rules || '',
      contact_info: event.contact_info || '',
      image_url: event.image_url || '',
      is_featured: event.is_featured,
      requires_application: event.requires_application
    });
    setIsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.event_type || !eventForm.location || !eventForm.start_date) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSaving(true);

      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        event_type: eventForm.event_type,
        category: eventForm.category || null,
        location: eventForm.location,
        start_date: eventForm.start_date,
        end_date: eventForm.end_date || null,
        registration_deadline: eventForm.registration_deadline || null,
        max_participants: eventForm.max_participants ? parseInt(eventForm.max_participants) : null,
        entry_fee: parseInt(eventForm.entry_fee),
        currency: eventForm.currency,
        prize_description: eventForm.prize_description || null,
        requirements: eventForm.requirements || null,
        rules: eventForm.rules || null,
        contact_info: eventForm.contact_info || null,
        image_url: eventForm.image_url || null,
        is_featured: eventForm.is_featured,
        requires_application: eventForm.requires_application,
        is_active: true
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Événement mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Événement créé avec succès');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !event.is_active })
        .eq('id', event.id);

      if (error) throw error;
      
      toast.success(`Événement ${!event.is_active ? 'activé' : 'désactivé'} avec succès`);
      fetchEvents();
    } catch (error) {
      console.error('Error toggling event status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      
      toast.success('Événement supprimé avec succès');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const fetchParticipants = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Erreur lors du chargement des participants');
    }
  };

  const updateParticipantStatus = async (participantId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .update({ status })
        .eq('id', participantId);

      if (error) throw error;
      
      toast.success('Statut mis à jour avec succès');
      if (viewingParticipants) {
        fetchParticipants(viewingParticipants.id);
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Événements</h1>
          <p className="text-gray-600">Gérez les concours, ateliers et événements Elverra Global</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Événement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(event => event.event_type === 'competition').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, event) => sum + event.views, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, event) => sum + event.participant_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des événements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Événements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun événement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Titre</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Localisation</th>
                    <th className="text-left p-2">Frais</th>
                    <th className="text-left p-2">Vues</th>
                    <th className="text-left p-2">Participants</th>
                    <th className="text-left p-2">Statut</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const EventIcon = getEventTypeIcon(event.event_type);
                    return (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            {event.is_featured && (
                              <Badge className="mt-1 bg-purple-100 text-purple-800">
                                <Star className="h-3 w-3 mr-1" />
                                Mis en avant
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getEventTypeColor(event.event_type)}>
                            <EventIcon className="h-3 w-3 mr-1" />
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(event.start_date).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {event.location}
                          </div>
                        </td>
                        <td className="p-2">
                          {event.entry_fee > 0 ? (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                              {event.entry_fee.toLocaleString()} {event.currency}
                            </div>
                          ) : (
                            <div className="flex items-center text-green-600">
                              <Award className="h-4 w-4 mr-1" />
                              Gratuit
                            </div>
                          )}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            {event.views}
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {event.participant_count}
                            {event.max_participants && `/${event.max_participants}`}
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant={event.is_active ? "default" : "secondary"}>
                            {event.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setViewingParticipants(event);
                                fetchParticipants(event.id);
                              }}
                              disabled={event.participant_count === 0}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(event)}
                            >
                              {event.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEvent(event)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Modifier l\'Événement' : 'Créer un Nouvel Événement'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Concours de développement web"
                />
              </div>
              <div>
                <Label htmlFor="event_type">Type d'événement *</Label>
                <Select value={eventForm.event_type} onValueChange={(value) => handleInputChange('event_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="competition">Concours</SelectItem>
                    <SelectItem value="announcement">Annonce</SelectItem>
                    <SelectItem value="workshop">Atelier</SelectItem>
                    <SelectItem value="webinar">Webinaire</SelectItem>
                    <SelectItem value="conference">Conférence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={eventForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Technologie, Business, Design..."
                />
              </div>
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={eventForm.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Bamako, Mali ou En ligne"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée de l'événement..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={eventForm.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={eventForm.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="registration_deadline">Date limite d'inscription</Label>
                <Input
                  id="registration_deadline"
                  type="date"
                  value={eventForm.registration_deadline}
                  onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_participants">Nombre max de participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={eventForm.max_participants}
                  onChange={(e) => handleInputChange('max_participants', e.target.value)}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="entry_fee">Frais d'inscription</Label>
                <Input
                  id="entry_fee"
                  type="number"
                  value={eventForm.entry_fee}
                  onChange={(e) => handleInputChange('entry_fee', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select value={eventForm.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFA">FCFA</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="prize_description">Description des prix (pour les concours)</Label>
              <Textarea
                id="prize_description"
                value={eventForm.prize_description}
                onChange={(e) => handleInputChange('prize_description', e.target.value)}
                placeholder="1er prix: 500,000 FCFA, 2ème prix: 300,000 FCFA..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="requirements">Prérequis</Label>
              <Textarea
                id="requirements"
                value={eventForm.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Conditions requises pour participer..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="rules">Règlement</Label>
              <Textarea
                id="rules"
                value={eventForm.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Règles de participation..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_info">Informations de contact</Label>
                <Textarea
                  id="contact_info"
                  value={eventForm.contact_info}
                  onChange={(e) => handleInputChange('contact_info', e.target.value)}
                  placeholder="Email: events@elverra.com, Tél: +223..."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={eventForm.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={eventForm.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
                <Label htmlFor="is_featured">Mettre en avant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_application"
                  checked={eventForm.requires_application}
                  onCheckedChange={(checked) => handleInputChange('requires_application', checked)}
                />
                <Label htmlFor="requires_application">Nécessite une inscription</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                onClick={handleSaveEvent}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  editingEvent ? 'Mettre à jour' : 'Créer'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={!!viewingParticipants} onOpenChange={() => setViewingParticipants(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Participants pour: {viewingParticipants?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun participant pour cet événement</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Participant</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Téléphone</th>
                      <th className="text-left p-2">Motivation</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Date d'inscription</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{participant.full_name}</p>
                            {participant.organization && (
                              <p className="text-sm text-gray-600">{participant.organization}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-2">{participant.email}</td>
                        <td className="p-2">{participant.phone}</td>
                        <td className="p-2">
                          {participant.motivation && (
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {participant.motivation}
                            </p>
                          )}
                        </td>
                        <td className="p-2">
                          <Select
                            value={participant.status}
                            onValueChange={(value) => updateParticipantStatus(participant.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="registered">Inscrit</SelectItem>
                              <SelectItem value="confirmed">Confirmé</SelectItem>
                              <SelectItem value="attended">Présent</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {new Date(participant.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {participant.additional_info && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => alert(participant.additional_info)}
                              >
                                Info
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement;
