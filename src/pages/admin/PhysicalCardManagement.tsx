import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface PhysicalCardRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  affiliate_code?: string;
  membership_tier: string;
  delivery_address: string;
  delivery_city: string;
  delivery_country: string;
  status: 'pending_payment' | 'payment_confirmed' | 'card_ordered' | 'card_shipped' | 'delivered' | 'cancelled';
  payment_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const PhysicalCardManagement = () => {
  const [requests, setRequests] = useState<PhysicalCardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PhysicalCardRequest | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch physical card requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('physical_card_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('does not exist')) {
          console.error('Table physical_card_requests does not exist');
          toast.error("Table physical_card_requests n'existe pas. Veuillez exécuter le script SQL de création.");
          setRequests([]);
          return;
        }
        if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied')) {
          console.error('Permission denied for physical_card_requests table');
          toast.error('Accès refusé à la table physical_card_requests. Vérifiez les politiques RLS.');
          setRequests([]);
          return;
        }
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching physical card requests:', error);
      toast.error('Erreur lors du chargement des demandes de cartes physiques');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.affiliate_code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      request.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update request status
  const updateRequestStatus = async (requestId: string, newStatus: string, trackingNumber?: string, notes?: string) => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) updateData.tracking_number = trackingNumber;
      if (notes) updateData.notes = notes;

      const { error } = await supabase
        .from('physical_card_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied')) {
          toast.error('Accès refusé: vérifiez les politiques RLS pour permettre la mise à jour par les admins.');
          throw error;
        }
        throw error;
      }
      
      toast.success('Statut de la demande mis à jour avec succès');
      fetchRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdating(false);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending_payment': { variant: 'secondary' as const, label: 'Pending Payment', icon: Clock },
      'payment_confirmed': { variant: 'default' as const, label: 'Payment Confirmed', icon: CheckCircle },
      'card_ordered': { variant: 'default' as const, label: 'Card Ordered', icon: Package },
      'card_shipped': { variant: 'default' as const, label: 'Card Shipped', icon: Truck },
      'delivered': { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status, icon: Clock };
  };

  // Statistics
  const stats = {
    total: requests.length,
    pending_payment: requests.filter(r => r.status === 'pending_payment').length,
    payment_confirmed: requests.filter(r => r.status === 'payment_confirmed').length,
    shipped: requests.filter(r => r.status === 'card_shipped').length,
    delivered: requests.filter(r => r.status === 'delivered').length
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Physical Card Management</h1>
            <p className="text-gray-600">Manage physical membership card requests and deliveries</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending_payment}</p>
                  </div>
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.payment_confirmed}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
                  </div>
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.delivered}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Requests</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, affiliate code, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                      <SelectItem value="card_ordered">Card Ordered</SelectItem>
                      <SelectItem value="card_shipped">Card Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Physical Card Requests ({filteredRequests.length})</CardTitle>
              <CardDescription>
                Manage and track physical membership card requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    Aucune demande de carte physique trouvée
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Configuration requise
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            La table <code className="bg-yellow-100 px-1 rounded">physical_card_requests</code> doit être créée dans Supabase.
                            <br />
                            Exécutez le script SQL : <code className="bg-yellow-100 px-1 rounded">fix_physical_card_requests_rls.sql</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Affiliate</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const statusConfig = getStatusBadge(request.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.full_name}</div>
                                <div className="text-sm text-gray-500">{request.phone}</div>
                                {/* email removed per DB change */}
                              </div>
                            </TableCell>
                            <TableCell>
                              {request.affiliate_code ? (
                                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                  {request.affiliate_code}
                                </code>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{request.membership_tier}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="text-green-600 font-medium">Gratuit</div>
                                <Badge 
                                  variant={request.payment_status === 'completed' ? 'default' : 'secondary'}
                                  className="text-xs mt-1"
                                >
                                  {request.payment_status === 'completed' ? 'Adhésion payée' : 'En attente adhésion'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{request.delivery_city}</div>
                                <div className="text-gray-500">{request.delivery_country}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(request.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedRequest(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Physical Card Request Details</DialogTitle>
                                      <DialogDescription>
                                        View and manage card request for {selectedRequest?.full_name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    {selectedRequest && (
                                      <RequestDetailsModal
                                        request={selectedRequest}
                                        onUpdateStatus={updateRequestStatus}
                                        updating={updating}
                                      />
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({ 
  request, 
  onUpdateStatus, 
  updating 
}: { 
  request: PhysicalCardRequest;
  onUpdateStatus: (id: string, status: string, trackingNumber?: string, notes?: string) => void;
  updating: boolean;
}) => {
  const [newStatus, setNewStatus] = useState<string>(request.status);
  const [trackingNumber, setTrackingNumber] = useState(request.tracking_number || '');
  const [notes, setNotes] = useState(request.notes || '');

  const handleUpdate = () => {
    onUpdateStatus(request.id, newStatus, trackingNumber, notes);
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Full Name</Label>
          <p className="mt-1 text-sm text-gray-900">{request.full_name}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Phone</Label>
          <p className="mt-1 text-sm text-gray-900">{request.phone}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Membership Tier</Label>
          <p className="mt-1 text-sm text-gray-900">{request.membership_tier}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Affiliate Code</Label>
          <p className="mt-1 text-sm text-gray-900 font-mono">{request.affiliate_code || 'None'}</p>
        </div>
      </div>

      {/* Delivery Information */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
        <p className="mt-1 text-sm text-gray-900">
          {request.delivery_address}<br />
          {request.delivery_city}, {request.delivery_country}
        </p>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Payment Amount</Label>
          <p className="mt-1 text-sm text-gray-900">{request.payment_amount} FCFA</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
          <Badge variant={request.payment_status === 'completed' ? 'default' : 'secondary'}>
            {request.payment_status}
          </Badge>
        </div>
      </div>

      {/* Status Update Section */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">Update Request Status</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                <SelectItem value="card_ordered">Card Ordered</SelectItem>
                <SelectItem value="card_shipped">Card Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(newStatus === 'card_shipped' || newStatus === 'delivered') && (
            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number..."
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            disabled={updating}
            className="w-full"
          >
            {updating ? 'Updating...' : 'Update Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhysicalCardManagement;
