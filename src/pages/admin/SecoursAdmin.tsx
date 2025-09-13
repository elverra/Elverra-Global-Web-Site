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
import { Shield, Users, AlertTriangle, CheckCircle, Clock, Coins, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface RescueRequest {
  id: string;
  user_id: string;
  type: 'medical' | 'fire' | 'police' | 'other';
  description: string;
  location: string;
  phone: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'premium' | 'family';
  status: 'active' | 'inactive' | 'cancelled';
  start_date: string;
  end_date: string;
  amount: number;
  created_at: string;
}

const SecoursAdmin = () => {
  const [selectedRequest, setSelectedRequest] = useState<RescueRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState<RescueRequest['status']>('pending');
  const queryClient = useQueryClient();

  // Fetch rescue requests
  const { data: rescueRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['rescue-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rescue_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RescueRequest[];
    }
  });

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['rescue-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rescue_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Subscription[];
    }
  });

  // Update request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes: string }) => {
      const { error } = await supabase
        .from('rescue_requests')
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
        .from('rescue_requests')
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

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Calculate statistics
  const stats = {
    totalRequests: rescueRequests.length,
    pendingRequests: rescueRequests.filter(r => r.status === 'pending').length,
    inProgressRequests: rescueRequests.filter(r => r.status === 'in_progress').length,
    completedRequests: rescueRequests.filter(r => r.status === 'completed').length,
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'active').length
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ô Secours Administration</h1>
            <p className="text-gray-600">Gérer les demandes de secours et les abonnements</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Abonnements</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actifs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                  </div>
                  <Coins className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityBadgeVariant(request.priority)}>
                            {request.priority.toUpperCase()}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {request.type.toUpperCase()}
                          </span>
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
                                <div>
                                  <Label>Type</Label>
                                  <p className="text-sm">{request.type}</p>
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <p className="text-sm">{request.description}</p>
                                </div>
                                <div>
                                  <Label>Localisation</Label>
                                  <p className="text-sm">{request.location}</p>
                                </div>
                                <div>
                                  <Label>Téléphone</Label>
                                  <p className="text-sm">{request.phone}</p>
                                </div>
                                <div>
                                  <Label>Notes Admin</Label>
                                  <p className="text-sm">{request.admin_notes || 'Aucune note'}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
                      <div className="text-xs text-gray-500">
                        <span>Localisation: {request.location}</span> • 
                        <span> Tel: {request.phone}</span> • 
                        <span> {new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
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
          <Card>
            <CardHeader>
              <CardTitle>Abonnements</CardTitle>
              <CardDescription>
                Gérer les abonnements aux services de secours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chargement des abonnements...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun abonnement pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                              {subscription.status.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{subscription.plan_type.toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {subscription.amount} FCFA • 
                            Du {new Date(subscription.start_date).toLocaleDateString('fr-FR')} au {new Date(subscription.end_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Créé le {new Date(subscription.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SecoursAdmin;