import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Types
type Status = 'pending' | 'approved' | 'rejected';

interface MerchantApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

const MerchantApprovals = () => {
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Load merchant applications
  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      try {
        // Mock merchant applications data
        const mockApplications: MerchantApplication[] = [
          {
            id: '1',
            fullName: 'Amadou Diallo',
            email: 'amadou.diallo@example.com',
            phone: '+223 70 12 34 56',
            address: '123 Rue de la Paix',
            city: 'Bamako',
            country: 'Mali',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            fullName: 'Fatou Keita',
            email: 'fatou.keita@example.com',
            phone: '+223 76 98 76 54',
            address: '456 Avenue du Mali',
            city: 'Sikasso',
            country: 'Mali',
            status: 'approved',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setApplications(mockApplications);
      } catch (error) {
        toast.error('Failed to load merchant applications');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, []);

  const handleApprove = async (id: string) => {
    setUpdateLoading(true);
    try {
      // Mock approval - in real app this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, status: 'approved' as Status, updatedAt: new Date().toISOString() }
            : app
        )
      );
      
      toast.success('Application approved successfully');
    } catch (error) {
      toast.error('Failed to approve application');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setUpdateLoading(true);
    try {
      // Mock rejection - in real app this would call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplications(prev => 
        prev.map(app => 
          app.id === id 
            ? { ...app, status: 'rejected' as Status, updatedAt: new Date().toISOString() }
            : app
        )
      );
      
      toast.success('Application rejected successfully');
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status: Status) => {
    const statusMap = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800' },
    };
    
    const { label, className } = statusMap[status];
    return <Badge className={className}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Demandes de vendeur</h1>
            <Badge variant="outline" className="px-4 py-2">
              {applications.length} demande(s)
            </Badge>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approuvés</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter(app => app.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejetés</p>
                    <p className="text-2xl font-bold text-red-600">
                      {applications.filter(app => app.status === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-500" />
                        {application.fullName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {application.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        {application.phone}
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>
                          {application.address}, {application.city}, {application.country}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Demandé le: {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                      {application.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(application.id)}
                            disabled={updateLoading}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {updateLoading ? 'En cours...' : 'Approuver'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(application.id)}
                            disabled={updateLoading}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" />
                            {updateLoading ? 'En cours...' : 'Rejeter'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {applications.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune demande</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Il n'y a actuellement aucune demande de vendeur.
                </p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default MerchantApprovals;