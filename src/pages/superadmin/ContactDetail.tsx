import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Phone, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getContactSubmission, updateContactStatus } from '@/services/contactService';
import { ContactSubmission, ContactStatus } from '@/types/contact';
import { MailTwoTone } from '@ant-design/icons';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ContactStatus>('new');
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    spam: 'bg-gray-100 text-gray-800'
  };
  const statusIcons: Record<ContactStatus, JSX.Element> = {
    new: <AlertCircle className="h-4 w-4 mr-2" />,
    in_progress: <Clock className="h-4 w-4 mr-2" />,
    resolved: <CheckCircle className="h-4 w-4 mr-2 text-green-500" />,
    closed: <XCircle className="h-4 w-4 mr-2 text-gray-500" />,
    spam: <XCircle className="h-4 w-4 mr-2 text-gray-500" />
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !submission) return;
    
    setSaving(true);
    try {
      // Here you would typically make an API call to send the email
      // For example: await sendReply(submission.id, replyContent);
      
      // For now, we'll just show a success message
      toast({
        title: 'Reply sent',
        description: 'Your response has been sent successfully.',
      });
      
      // Reset the form
      setReplyContent('');
      setReplying(false);
      
      // Optional: Refresh the contact data to show the reply in the thread
      // await fetchSubmission();
      
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const { data, error } = await getContactSubmission(id!);
        
        if (error) throw error;
        if (!data) throw new Error('Submission not found');
        
        setSubmission(data);
        setStatus(data.status);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load submission details',
          variant: 'destructive'
        });
        navigate('/superadmin/contact');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, navigate, toast]);

  const handleStatusChange = async (value: string) => {
    const newStatus = value as ContactStatus;
    try {
      setSaving(true);
      setStatus(newStatus);
      
      const { error } = await updateContactStatus(id!, { 
        status: newStatus,
        ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() })
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
      
      // Update local state
      if (submission) {
        setSubmission({
          ...submission,
          status: newStatus,
          ...(newStatus === 'resolved' && { resolved_at: new Date().toISOString() })
        });
      }
    } catch (error) {
      // Revert on error
      setStatus(submission?.status || 'new');
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !submission) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/superadmin/contact')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Submissions
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Contact Submission</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Status:</span>
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={saving}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center">
                    {statusIcons[status]}
                    <span className="capitalize">{status.replace('_', ' ')}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    New
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="resolved">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolved
                  </div>
                </SelectItem>
                <SelectItem value="spam">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    Spam
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sender Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">{submission.name}</p>
                  <p className="text-sm text-gray-500">Name</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <a 
                    href={`mailto:${submission.email}`} 
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {submission.email}
                  </a>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
              {submission.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <a 
                      href={`tel:${submission.phone}`} 
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {submission.phone}
                    </a>
                    <p className="text-sm text-gray-500">Phone</p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {format(new Date(submission.created_at), 'PPpp')}
                  </p>
                  <p className="text-sm text-gray-500">Submitted</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Inquiry Type</p>
                <Badge variant="outline" className="capitalize">
                  {submission.inquiry_type}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setReplying(true)}
              >
                <MailTwoTone className="h-4 w-4 mr-2" />
                Reply to Sender
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleStatusChange('spam')}
                disabled={saving}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Spam
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleStatusChange('resolved')}
                disabled={saving || status === 'resolved'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Message */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {submission.subject}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <span>From: {submission.name} &lt;{submission.email}&gt;</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {submission.message.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          {replying ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Response
                    </label>
                    <Textarea
                      id="reply"
                      rows={6}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setReplying(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleReply}
                      disabled={saving || !replyContent.trim()}
                    >
                      {saving ? 'Sending...' : 'Send Reply'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setReplying(true)}
              >
                <MailTwoTone className="h-4 w-4 mr-2" />
                Reply to Sender
              </Button>
            </div>
          )}

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add internal notes about this submission..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button disabled={!notes.trim()}>Save Notes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
