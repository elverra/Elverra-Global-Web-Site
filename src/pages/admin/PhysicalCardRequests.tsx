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
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface PhysicalCardRequest {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  city: string;
  country: string;
  address: string;
  membership_tier: string;
  affiliate_code?: string;
  physical_card_requested: boolean;
  has_physical_card: boolean;
  physical_card_status: 'not_requested' | 'requested' | 'approved' | 'printing' | 'shipped' | 'delivered';
  physical_card_request_date?: string;
  physical_card_delivery_date?: string;
  physical_card_tracking_number?: string;
  physical_card_notes?: string;
  created_at: string;
}

const PhysicalCardRequests = () => {
  const [requests, setRequests] = useState<PhysicalCardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PhysicalCardRequest | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch physical card requests from profiles
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('physical_card_requested', true)
        .order('physical_card_request_date', { ascending: false });

      if (error) {
        console.error('Error fetching physical card requests:', error);
        toast.error('Erreur lors du chargement des demandes de cartes physiques');
        setRequests([]);
        return;
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
    
    const matchesStatus = statusFilter === 'all' || request.physical_card_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update request status
  const updateRequestStatus = async (
    requestId: string, 
    newStatus: string, 
    trackingNumber?: string, 
    notes?: string,
    hasPhysicalCard?: boolean
  ) => {
    try {
      setUpdating(true);
      
      const updateData: any = {
        physical_card_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) updateData.physical_card_tracking_number = trackingNumber;
      if (notes) updateData.physical_card_notes = notes;
      if (hasPhysicalCard !== undefined) {
        updateData.has_physical_card = hasPhysicalCard;
        if (hasPhysicalCard) {
          updateData.physical_card_delivery_date = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
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
      'not_requested': { variant: 'secondary' as const, label: 'Not Requested', icon: XCircle },
      'requested': { variant: 'secondary' as const, label: 'Requested', icon: Clock },
      'approved': { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      'printing': { variant: 'default' as const, label: 'Printing', icon: Package },
      'shipped': { variant: 'default' as const, label: 'Shipped', icon: Truck },
      'delivered': { variant: 'default' as const, label: 'Delivered', icon: CheckCircle }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status, icon: Clock };
  };

  // Statistics
  const stats = {
    total: requests.length,
    requested: requests.filter(r => r.physical_card_status === 'requested').length,
    approved: requests.filter(r => r.physical_card_status === 'approved').length,
    printing: requests.filter(r => r.physical_card_status === 'printing').length,
    shipped: requests.filter(r => r.physical_card_status === 'shipped').length,
    delivered: requests.filter(r => r.physical_card_status === 'delivered').length
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Physical Card Requests</h1>
            <p className="text-gray-600">Manage physical membership card requests from user profiles</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
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
                    <p className="text-sm font-medium text-gray-600">Requested</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.requested}</p>
                  </div>
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Printing</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
                  </div>
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shipped</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  </div>
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
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
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="printing">Printing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
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
                Manage physical membership card requests from user profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 mb-4">
                    Aucune demande de carte physique trouvée
                  </div>
                  <p className="text-sm text-gray-400">
                    Les demandes apparaîtront ici quand les utilisateurs cocheront "Request Physical Card" lors de l'inscription
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Membership</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const statusConfig = getStatusBadge(request.physical_card_status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.full_name}</div>
                                <div className="text-sm text-gray-500">{request.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline">{request.membership_tier}</Badge>
                                {request.affiliate_code && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Ref: {request.affiliate_code}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {request.physical_card_request_date 
                                ? new Date(request.physical_card_request_date).toLocaleDateString()
                                : '—'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{request.city}</div>
                                <div className="text-gray-500">{request.country}</div>
                              </div>
                            </TableCell>
                            <TableCell>
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
                                      Manage card request for {selectedRequest?.full_name}
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
  onUpdateStatus: (id: string, status: string, trackingNumber?: string, notes?: string, hasPhysicalCard?: boolean) => void;
  updating: boolean;
}) => {
  const [newStatus, setNewStatus] = useState<string>(request.physical_card_status);
  const [trackingNumber, setTrackingNumber] = useState(request.physical_card_tracking_number || '');
  const [notes, setNotes] = useState(request.physical_card_notes || '');

  const handleUpdate = () => {
    const hasPhysicalCard = newStatus === 'delivered';
    onUpdateStatus(request.id, newStatus, trackingNumber, notes, hasPhysicalCard);
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

      {/* Address Information */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Delivery Address</Label>
        <p className="mt-1 text-sm text-gray-900">
          {request.address}<br />
          {request.city}, {request.country}
        </p>
      </div>

      {/* Request Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Request Date</Label>
          <p className="mt-1 text-sm text-gray-900">
            {request.physical_card_request_date 
              ? new Date(request.physical_card_request_date).toLocaleString()
              : 'Not set'
            }
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">Has Physical Card</Label>
          <Badge variant={request.has_physical_card ? 'default' : 'secondary'}>
            {request.has_physical_card ? 'Yes' : 'No'}
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
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="printing">Printing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(newStatus === 'shipped' || newStatus === 'delivered') && (
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
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              rows={3}
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

export default PhysicalCardRequests;
