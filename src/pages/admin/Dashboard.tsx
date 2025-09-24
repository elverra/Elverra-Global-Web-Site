import React from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ShoppingBag, CreditCard, TrendingUp, Shield, Settings, FileText, UserCheck, Download, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploading(true);
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      
      // TODO: Replace with file storage API check
      const buckets: Array<{name: string}> = []; // Placeholder during migration
      const bucketExists = buckets?.some(bucket => bucket.name === 'club66');
      
      if (!bucketExists) {
        // TODO: Replace with file storage API - create bucket
        console.log('Creating file storage bucket...');
      }
      
      // TODO: Replace with file upload API
      const uploadData = null;
      const uploadError = new Error('File upload temporarily disabled during migration');

      if (uploadError) throw uploadError;

      console.log('Logo uploaded successfully:', uploadData);
      toast.success('Logo uploaded successfully!');
      setLogoFile(null);
      
      // Force refresh the page to update logo everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDatabaseExport = async () => {
    setExporting(true);
    try {
      // Get current user info from localStorage (if available)
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Use admin credentials as fallback
      const requestData = {
        userEmail: currentUser.email || 'admin@elverra.com',
        userId: currentUser.id
      };

      const response = await fetch('/api/export-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Export failed: ${errorData.error || response.statusText}`);
      }

      // Get the JSON data
      const exportData = await response.json();
      
      // Create a downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `elverra-database-export-${timestamp}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Database exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Memberships",
      value: "1,234",
      change: "+8%",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue",
      value: "₣2.4M",
      change: "+23%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Ô Secours Subscriptions",
      value: "567",
      change: "+15%",
      icon: Shield,
      color: "text-orange-600"
    }
  ];

  const adminModules = [
    {
      title: "Ô Secours Management",
      description: "Manage rescue requests, subscriptions, and tokens",
      icon: Shield,
      route: "/admin/secours",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "Affiliate Management",
      description: "Manage affiliate programs, commissions, and payouts",
      icon: Users,
      route: "/admin/agent-panel",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
          title: "Client Accounts",
          description: "Manage rescue requests, subscriptions, and tokens",
          icon: Shield,
          route: "/admin/secours",
          color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
        },
    {
      title: "Discount Management",
      description: "Manage merchants, sectors, and discount offers",
      icon: ShoppingBag,
      route: "/admin/discount-management",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
    },
   
    {
      title: "Career Jobs Management",
      description: "Manage Elverra career job postings and applications",
      icon: CreditCard,
      route: "/admin/career-jobs",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Physical Card Management",
      description: "Manage physical membership card requests and deliveries",
      icon: CreditCard,
      route: "/admin/physical-cards",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Projects Management",
      description: "Manage funding projects and initiatives",
      icon: TrendingUp,
      route: "/admin/projects-management",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "Merchant Approvals",
      description: "Review and approve merchant applications",
      icon: UserCheck,
      route: "/admin/merchant-approvals",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
    },
    {
      title: "News Letters",
      description: "Review and approve merchant applications",
      icon: UserCheck,
      route: "/admin/merchant-approvals",
     color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
    },
    {
      title: "Events Management",
      description: "Manage events, competitions, and workshops",
      icon: UserCheck,
      route: "/admin/events-management",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "E-Book Library",
      description: "Manage digital books and publications",
      icon: Book,
      route: "/admin/ebook-management",
      color: "bg-green-50 hover:bg-green-100 border-green-200"
    },
    {
      title: "Actualité",
      description: "Manage funding projects and initiatives",
      icon: TrendingUp,
      route: "/admin/projects-management",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    {
      title: "Contact",
      description: "Manage funding projects and initiatives",
      icon: TrendingUp,
      route: "/admin/projects-management",
      color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
    },
    
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
    <ProtectedRoute requireAdmin={true}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your Elverra platform from here</p>
          </div>

       

          {/* Database Management Section */}
          

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <Badge variant="secondary" className="mt-1">
                          {stat.change}
                        </Badge>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Admin Modules */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all duration-200 ${module.color}`}
                    onClick={() => navigate(module.route)}
                  >
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6 text-gray-700" />
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Access Module
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Export and manage your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Export Database</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Download a complete backup of your database as a JSON file
                  </p>
                </div>
                <Button 
                  onClick={handleDatabaseExport} 
                  disabled={exporting}
                  className="w-full sm:w-auto"
                  data-testid="button-export-database"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export Database'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
    </ProtectedRoute>
  );
};

export default AdminDashboard;