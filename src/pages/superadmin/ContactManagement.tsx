import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, RefreshCw, Filter, Mail, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getContactSubmissions, getContactStats, updateContactStatus } from '@/services/contactService';
import { ContactSubmission, ContactStatus, InquiryType, ContactFilterOptions } from '@/types/contact';

export default function ContactManagement() {
  const { toast } = useToast();
  
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState<ContactFilterOptions>({
    status: 'new',
    search: undefined,
    inquiryType: undefined
  });

  const statusIcons = {
    new: <AlertCircle className="h-4 w-4 mr-1" />,
    in_progress: <Clock className="h-4 w-4 mr-1" />,
    resolved: <CheckCircle className="h-4 w-4 mr-1" />,
    closed: <CheckCircle className="h-4 w-4 mr-1" />,
    spam: <XCircle className="h-4 w-4 mr-1" />
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-green-100 text-green-800',
    spam: 'bg-gray-100 text-gray-800'
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Créer un objet de filtre propre sans les valeurs vides
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
      );
      
      const [submissionsRes, statsRes] = await Promise.all([
        getContactSubmissions(cleanFilters as ContactFilterOptions),
        getContactStats()
      ]);

      if (submissionsRes.data) setSubmissions(submissionsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    try {
      if (!newStatus || newStatus.trim() === '') {
        throw new Error('Status cannot be empty');
      }
      const { error } = await updateContactStatus(id, { status: newStatus });
      if (error) throw error;
      
      setSubmissions(submissions.map(sub => 
        sub.id === id ? { ...sub, status: newStatus } : sub
      ));
      
      toast({
        title: 'Success',
        description: 'Status updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    const statusText = status ? status.replace('_', ' ') : 'unknown';
    const colorClass = status ? statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${colorClass} capitalize`}>
        {status && statusIcons[status as keyof typeof statusIcons]}
        {statusText}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contact Submissions</h1>
          <p className="text-gray-500">Manage and respond to contact form submissions</p>
        </div>
        <Button onClick={fetchData} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by name, email, or subject..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value: string) => {
                  const statusValue = value === 'all' ? undefined : value as ContactStatus;
                  setFilters(prev => ({ ...prev, status: statusValue }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Inquiry Type</label>
              <Select
                value={filters.inquiryType || 'all'}
                onValueChange={(value: string) => {
                  const typeValue = value === 'all' ? undefined : value as InquiryType;
                  setFilters(prev => ({ ...prev, inquiryType: typeValue }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="membership">Membership</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{submission.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{submission.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{submission.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {submission.inquiry_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={submission.status}
                      onValueChange={(value) => handleStatusChange(submission.id, value as ContactStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/superadmin/contact/${submission.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
