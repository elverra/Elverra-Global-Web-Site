import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar } from "../ui/calendar";
import { 
  Check, 
  X, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  Search,
  CalendarIcon,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface Agent {
  id: string;
  user_id: string;
  referral_code: string;
  approval_status: string;
  application_notes?: string;
  rejection_reason?: string;
  created_at: string;
  joinies: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

const AffiliateApprovalPanel = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'month' | 'year'>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  useEffect(() => {
    if (filterType === 'all' || !filterValue) {
      setFilteredAgents(agents);
      return;
    }
  
    const date = new Date(filterValue);
    if (isNaN(date.getTime())) {
      setFilteredAgents(agents);
      return;
    }
  
    const filtered = agents.filter(agent => {
      const agentDate = new Date(agent.created_at);
      
      switch (filterType) {
        case 'day':
          return (
            agentDate.getDate() === date.getDate() &&
            agentDate.getMonth() === date.getMonth() &&
            agentDate.getFullYear() === date.getFullYear()
          );
        case 'month':
          return (
            agentDate.getMonth() === date.getMonth() &&
            agentDate.getFullYear() === date.getFullYear()
          );
        case 'year':
          return agentDate.getFullYear() === date.getFullYear();
        default:
          return true;
      }
    });
  
    setFilteredAgents(filtered);
  }, [filterValue, filterType, agents]);
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAgents(agents);
      return;
    }

    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = agents.filter(agent => {
      const searchDate = new Date(agent.created_at);
      const dateStr = searchDate.toLocaleDateString();
      const month = (searchDate.getMonth() + 1).toString();
      const year = searchDate.getFullYear().toString();

      return (
        agent.joinies.full_name?.toLowerCase().includes(lowercasedSearch) ||
        agent.joinies.email?.toLowerCase().includes(lowercasedSearch) ||
        agent.joinies.phone?.includes(searchTerm) ||
        agent.referral_code?.toLowerCase().includes(lowercasedSearch) ||
        dateStr.includes(searchTerm) ||
        month.includes(searchTerm) ||
        year.includes(searchTerm)
      );
    });

    setFilteredAgents(filtered);
  }, [searchTerm, agents]);
  useEffect(() => {
    if (initialLoad) {
      fetchPendingAgents();
      setInitialLoad(false);
    }
  }, [initialLoad]);

  const handleDateFilter = (date: Date | undefined) => {
    if (!date) {
      setFilteredAgents(agents);
      return;
    }

    const filtered = agents.filter(agent => {
      const agentDate = new Date(agent.created_at);
      
      switch (filterType) {
        case 'day':
          return (
            agentDate.getDate() === date.getDate() &&
            agentDate.getMonth() === date.getMonth() &&
            agentDate.getFullYear() === date.getFullYear()
          );
        case 'month':
          return (
            agentDate.getMonth() === date.getMonth() &&
            agentDate.getFullYear() === date.getFullYear()
          );
        case 'year':
          return agentDate.getFullYear() === date.getFullYear();
        default:
          return true;
      }
    });

    setFilteredAgents(filtered);
  };
  const fetchPendingAgents = async () => {
    try {
      setLoading(true);
      
      // 1. Récupérer les affiliés en attente
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: true });
  
      if (affiliatesError) throw affiliatesError;
  
      // Si pas d'affiliés, on arrête là
      if (!affiliates || affiliates.length === 0) {
        setAgents([]);
        setFilteredAgents([]);
        return;
      }
  
      // 2. Récupérer les profils correspondants
      const userIds = affiliates.map(a => a.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
  
      if (profilesError) throw profilesError;
  
      // 3. Combiner les données
      const formattedAgents = affiliates.map(affiliate => {
        const profile = profiles.find(p => p.id === affiliate.user_id) || {};
        return {
          ...affiliate,
          joinies: {
            full_name: profile.full_name || 'Inconnu',
            email: profile.email || 'Aucun email',
            phone: profile.phone || 'Aucun téléphone'
          }
        };
      });
  
      setAgents(formattedAgents);
      setFilteredAgents(formattedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Échec du chargement des demandes d\'affiliation');
      setAgents([]);
      setFilteredAgents([]);
    } finally {
      setLoading(false);
    }
  };
  const approveAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', agentId);
  
      if (error) throw error;
      
      toast.success('Affilié approuvé avec succès');
      fetchPendingAgents();
    } catch (error) {
      console.error('Error approving agent:', error);
      toast.error('Échec de l\'approbation de l\'affilié');
    }
  };
  const rejectAgent = async (agentId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Veuillez indiquer une raison de refus');
      return;
    }
  
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ 
          approved: false,
          rejection_reason: reason
        })
        .eq('id', agentId);
  
      if (error) throw error;
      
      toast.success('Affilié refusé avec succès');
      setSelectedAgent(null);
      setNotes('');
      fetchPendingAgents();
    } catch (error) {
      console.error('Error rejecting agent:', error);
      toast.error('Échec du refus de l\'affilié');
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Refusé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">Chargement en cours...</div>;
  }

  return (
    <div className="space-y-6">
     <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Gestion des Affiliés</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, email, téléphone..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select 
              value={filterType} 
              onValueChange={(value: 'all' | 'day' | 'month' | 'year') => {
                setFilterType(value);
                setFilterValue('');
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="day">Jour</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="year">Année</SelectItem>
              </SelectContent>
            </Select>

            {filterType !== 'all' && (
             <Popover>
             <PopoverTrigger asChild>
               <Button
                 variant="outline"
                 className="w-full justify-start text-left font-normal"
               >
                 <CalendarIcon className="mr-2 h-4 w-4" />
                 {filterValue ? format(new Date(filterValue), 'PPP', { locale: fr }) : "Filtrer par date"}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-auto p-0" align="start">
               <Calendar
                 mode="single"
                 selected={filterValue ? new Date(filterValue) : undefined}
                 onSelect={(date) => setFilterValue(date?.toISOString() || '')}
                 initialFocus
                 locale={fr}
               />
             </PopoverContent>
           </Popover>
            )}
          </div>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Demandes d'affiliation en attente</CardTitle>
            <Badge className="bg-yellow-500">
              {filteredAgents.length} demande{filteredAgents.length > 1 ? 's' : ''} en attente
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAgents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Aucun résultat trouvé' : 'Aucune demande en attente'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {agent.joinies.full_name}
                          </h3>
                          {getStatusBadge(agent.approval_status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{agent.joinies.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span>{agent.joinies.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span>
                              Inscrit le {new Date(agent.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            Code de parrainage: <span className="font-mono">{agent.referral_code}</span>
                          </p>
                          {agent.application_notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Notes:</strong> {agent.application_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                        <Button
                          size="sm"
                          onClick={() => approveAgent(agent.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSelectedAgent(agent)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    </div>

                    {selectedAgent?.id === agent.id && (
                      <div className="mt-4 pt-4 border-t">
                        <Textarea
                          placeholder="Raison du refus (obligatoire)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mb-3"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectAgent(agent.id, notes)}
                            disabled={!notes.trim()}
                          >
                            Confirmer le refus
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAgent(null);
                              setNotes('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateApprovalPanel;