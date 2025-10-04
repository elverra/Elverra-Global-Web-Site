import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield,  AlertTriangle, CheckCircle, Clock,  Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useEffect } from 'react';

interface TokenAttempt {
  id: string;
  user_id: string;
  service_id: string;
  requested_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    phone: string | null;
    country: string | null;
    profile_image_url: string | null;
  };
  service?: {
    id: string;
    name: string;
  };
}
// ...dans le même fichier...
interface RescueRequest {
  id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  justification_url?: string;

  profile?: {
    id: string;
    full_name: string | null;
    phone: string | null;
    country: string | null;
    profile_image_url: string | null;
  };
}


const SecoursAdmin = () => {
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<RescueRequest['status']>('pending');
  const queryClient = useQueryClient();
 const [tab, setTab] = useState<'requests' | 'deposits'>('requests');
  const [attempts, setAttempts] = useState<TokenAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Fetch rescue requests
 const { data: rescueRequests = [], isLoading: requestsLoading } = useQuery({
  queryKey: ['osecours_requests'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('osecours_requests')
      .select('*,profile:profiles(id,full_name,phone,country,profile_image_url)')
      .order('created_at', { ascending: false });

    if (error){ console.log(error)
       throw error};

    return data as (RescueRequest & {
      profile?: {
        id: string;
        full_name: string | null;
        phone: string | null;
        country: string | null;
        profile_image_url: string | null;

      }
    })[];
  }
});



  // Update request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      const { error } = await supabase
        .from('osecours_requests')
        .update({ 
          status, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-requests'] });
      toast.success('Demande mise à jour avec succès');
      setIsEditDialogOpen(false);
      setSelectedRequest(null);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  // Delete request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('osecours_requests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rescue-requests'] });
      toast.success('Demande supprimée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });
  async function fetchAttempts() {
    setLoadingAttempts(true);
    const { data, error } = await supabase
      .from('osecours_token_balances_attempts')
      .select('*, profile:profiles(id,full_name,phone,country,profile_image_url), service:osecours_services(id,name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Erreur lors du chargement des dépôts');
    } else {
      setAttempts(data || []);
    }
    setLoadingAttempts(false);
  }

  // Approuver une tentative
  async function handleApprove(id: string) {
    const { error } = await supabase.rpc('osecours_approve_token_attempt', {
      p_attempt_id: id,
    });
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Tentative approuvée ✅');
      setAttempts((prev) => prev.filter((a) => a.id !== id));
    }
  }

  // Rejeter une tentative
  async function handleReject(id: string) {
    const { error } = await supabase.rpc('osecours_reject_token_attempt', {
      p_attempt_id: id,
    });
    if (error) {
      toast.error('Erreur: ' + error.message);
    } else {
      toast.success('Tentative rejetée ❌');
      setAttempts((prev) => prev.filter((a) => a.id !== id));
    }
  }

  useEffect(() => {
    if (tab === 'deposits') fetchAttempts();
  }, [tab]);


  const handleUpdateRequest = () => {
    if (!selectedRequest) return;
    
    updateRequestMutation.mutate({
      id: selectedRequest.id,
      status: newStatus,
      adminNotes
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  // const getPriorityBadgeVariant = (priority: string) => {
  //   switch (priority) {
  //     case 'urgent': return 'destructive';
  //     case 'high': return 'destructive';
  //     case 'medium': return 'default';
  //     case 'low': return 'secondary';
  //     default: return 'secondary';
  //   }
  // };

  // Calculate statistics
  const stats = {
    totalRequests: rescueRequests.length,
    pendingRequests: rescueRequests.filter(r => r.status === 'pending').length,
    inProgressRequests: rescueRequests.filter(r => r.status === 'in_progress').length,
    completedRequests: rescueRequests.filter(r => r.status === 'completed').length
  };

  return (
    <ProtectedRoute requireAdmin={true} >
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ô Secours Administration</h1>
            <p className="text-gray-600">Gérer les demandes de secours et les abonnements</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Attente</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Cours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgressRequests}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terminées</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedRequests}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

          
          </div>
<Tabs
  value={tab}
  onValueChange={(value) => setTab(value as 'requests' | 'deposits')}
  className="mb-8"
>            <TabsList>
              <TabsTrigger value="requests">Demandes de secours</TabsTrigger>
              <TabsTrigger value="deposits">Dépôts de tokens</TabsTrigger>
            </TabsList>

           
            {/* Onglet dépôts de tokens */}
            <TabsContent value="deposits">
              <Card>
                <CardHeader>
                  <CardTitle>Demandes de dépôt de tokens</CardTitle>
                  <CardDescription>
                    Gérer les demandes de dépôt de tokens en attente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAttempts ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Chargement...</p>
                    </div>
                  ) : attempts.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucune demande de dépôt en attente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {attempts.map((attempt) => (
                        <div key={attempt.id} className="border rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={attempt.profile?.profile_image_url || '/default-avatar.png'}
                              alt="avatar"
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                            <div>
                              <div className="font-semibold">{attempt.profile?.full_name || 'Utilisateur inconnu'}</div>
                              <div className="text-xs text-gray-500">
                                {attempt.profile?.phone || 'N° inconnu'} • {attempt.profile?.country || ''}
                              </div>
                              <div className="text-xs mt-1">
                                <span className="font-medium">Service :</span> {attempt.service?.name || attempt.service_id}
                              </div>
                              <div className="text-xs mt-1">
                                <span className="font-medium">Montant demandé :</span> {attempt.requested_amount}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(attempt.id)}
                            >
                              Accepter
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(attempt.id)}
                            >
                              Refuser
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="requests">
          
          {/* Rescue Requests */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Demandes de Secours</CardTitle>
              <CardDescription>
                Gérer toutes les demandes de secours reçues
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chargement des demandes...</p>
                </div>
              ) : rescueRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune demande de secours pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rescueRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center space-x-3">
      <img
        src={request.profile?.profile_image_url || '/default-avatar.png'}
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover border"
      />
      <div>
  <div className="font-semibold">{request.profile?.full_name || 'Utilisateur inconnu'}</div>
  <div className="text-xs text-gray-500">
    {request.profile?.phone || 'N° inconnu'} • {request.profile?.country || ''}
  </div>
  {request.justification_url && (
    <div className="text-xs mt-1">
      <span className="font-medium">Justification :</span>{" "}
      {request.justification_url.endsWith('.pdf') ? 'PDF' : 'Image'}
    </div>
  )}
</div>
      <Badge variant={getStatusBadgeVariant(request.status)}>
        {request.status.replace('_', ' ').toUpperCase()}
      </Badge>
    </div>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
<DialogContent>
  <DialogHeader>
    <DialogTitle>Détails de la Demande</DialogTitle>
  </DialogHeader>
  <div className="space-y-4">
    <div className="flex items-center space-x-4">
      <img
        src={request.profile?.profile_image_url || '/default-avatar.png'}
        alt="avatar"
        className="w-16 h-16 rounded-full object-cover border"
      />
      <div>
        <div className="font-semibold text-lg">{request.profile?.full_name || 'Utilisateur inconnu'}</div>
        <div className="text-sm text-gray-500">
          {request.profile?.phone || 'N° inconnu'}<br />
          {request.profile?.country || ''}
        </div>
      </div>
    </div>
    <div>
      <Label>Description</Label>
      <p className="text-sm">{request.description}</p>
    </div>
    <div>
      <Label>Notes Admin</Label>
      <p className="text-sm">{request.admin_notes || 'Aucune note'}</p>
    </div>
    {request.justification_url && (
      <div>
        <Label>Justification</Label>
        {request.justification_url.endsWith('.pdf') ? (
          <iframe
            src={request.justification_url}
            title="Justification PDF"
            className="w-full h-64 border rounded"
          />
        ) : (
          <img
            src={request.justification_url}
            alt="Justification"
            className="max-w-full max-h-64 rounded border"
          />
        )}
        <div className="text-xs text-gray-500 mt-1">
          Type : {request.justification_url.endsWith('.pdf') ? 'PDF' : 'Image'}
        </div>
      </div>
    )}
    <div>
      <Label>Description</Label>
      <p className="text-sm">{request.description}</p>
    </div>
    <div>
      <Label>Notes Admin</Label>
      <p className="text-sm">{request.admin_notes || 'Aucune note'}</p>
    </div>
  </div>
</DialogContent>                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setNewStatus(request.status);
                              setAdminNotes(request.admin_notes || '');
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRequestMutation.mutate(request.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                      {/* <div className="text-xs text-gray-500">
                        <span>Localisation: {request.location}</span> • 
                        <span> Tel: {request.phone}</span> • 
                        <span> {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div> */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Request Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier la Demande</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={newStatus} onValueChange={(value: RescueRequest['status']) => setNewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En Attente</SelectItem>
                      <SelectItem value="in_progress">En Cours</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="admin_notes">Notes Admin</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ajouter des notes administratives..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUpdateRequest} disabled={updateRequestMutation.isPending}>
                    {updateRequestMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Subscriptions */}
          </TabsContent>

          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SecoursAdmin;