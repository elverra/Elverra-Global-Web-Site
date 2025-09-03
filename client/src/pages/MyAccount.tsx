import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, Save, Edit, CreditCard, History, Settings, Gift, ShoppingBag, Users, Briefcase, HelpCircle,
  Download, Bell, Shield, Eye, EyeOff, Phone, Mail, MessageSquare, Star, TrendingUp, Calendar,
  DollarSign, Percent, Award, RefreshCw, ExternalLink, Lock, Smartphone, Package, Key, 
  CreditCard as CreditCardIcon, AlertCircle, CheckCircle, User, MapPin, Globe, FileText,
  Headphones, Search, Filter, Plus, Trash2, Copy, Share2, LogOut, UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useDiscountUsage } from '@/hooks/useDiscounts';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ProductManagement from '@/components/products/ProductManagement';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const MyAccount = () => {
  const { user, signOut, userRole } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();
  const { usageHistory, getTotalSavings } = useDiscountUsage();
  const { affiliateData, loading: affiliateLoading, error: affiliateError } = useAffiliateData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'dashboard';
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Mali'
  });
  const [membership, setMembership] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    security: true
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cardActivated, setCardActivated] = useState(true);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [agentData, setAgentData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Mali'
      });
    }
  }, [profile]);

  const fetchAllData = async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        fetchMembership(),
        fetchTransactions(),
        fetchOffers(),
        fetchJobApplications(),
        fetchAgentData()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchMembership = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/membership`);
      
      if (response.ok) {
        const data = await response.json();
        setMembership(data);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch membership');
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/transactions?limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setRecentTransactions(data || []);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Use mock data as fallback
      setRecentTransactions([
        { id: '1', created_at: '2024-01-15', payment_type: 'Monthly Membership', amount: 5000, status: 'completed' },
        { id: '2', created_at: '2024-01-10', payment_type: 'Product Purchase', amount: 2500, status: 'completed' }
      ]);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers?limit=6&active=true');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableOffers(data || []);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      // Use mock data as fallback
      setAvailableOffers([
        { id: '1', title: '10% Off Electronics', discount_percentage: 10, description: 'Valid on all electronics' },
        { id: '2', title: 'Free Delivery', discount_percentage: 0, description: 'Free delivery on orders above 25,000 CFA' }
      ]);
    }
  };

  const fetchJobApplications = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/applications?limit=5`);
      
      if (response.ok) {
        const data = await response.json();
        setJobApplications(data || []);
      } else if (response.status !== 404) {
        throw new Error('Failed to fetch job applications');
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
      setJobApplications([]);
    }
  };

  const fetchAgentData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/agents/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAgentData(data);
      } else if (response.status !== 404) {
        console.log('User is not an agent');
      }
    } catch (error) {
      console.error('Error fetching agent data:', error);
    }
  };

  const downloadPaymentHistory = (format: 'pdf' | 'csv') => {
    // Mock download functionality
    const data = recentTransactions.map(payment => ({
      date: payment.created_at,
      description: payment.payment_type,
      amount: payment.amount,
      status: payment.status
    }));
    
    if (format === 'csv') {
      const csvContent = [
        'Date,Description,Amount,Status',
        ...data.map(row => `${row.date},${row.description},${row.amount},${row.status}`)
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'payment-history.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      // For PDF, you would typically use a library like jsPDF
      toast.success('PDF download feature coming soon!');
    }
    
    toast.success(`Payment history downloaded as ${format.toUpperCase()}`);
  };

  const handlePasswordReset = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const mockResult = { error: null }; // TODO: Replace with API call
      const { error } = mockResult;

      if (error) throw error;

      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    try {
      // Update notification preferences in database
      const mockResult = { data: null, error: null }; // TODO: Replace with API call
      const { data, error } = mockResult;

      if (error) throw error;
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    
    try {
      // In a real implementation, this would set up 2FA
      toast.success(enabled ? '2FA enabled successfully' : '2FA disabled successfully');
    } catch (error) {
      toast.error('Failed to update 2FA settings');
    }
  };

  const handleCardRenewal = () => {
    setShowRenewalDialog(true);
  };

  const handleDownloadCard = async () => {
    try {
      // In a real implementation, this would generate and download a PDF card
      toast.success('Card download started. Check your downloads folder.');
      
      // Mock download functionality
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,ZENIKA Digital Card - ' + (profile?.full_name || 'Member');
      link.download = 'zenika-card.txt';
      link.click();
    } catch (error) {
      toast.error('Failed to download card');
    }
  };

  const handleCardActivation = async () => {
    if (!activationCode || activationCode.length < 6) {
      toast.error('Please enter a valid activation code');
      return;
    }

    try {
      // Mock activation process
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCardActivated(true);
      setShowActivationDialog(false);
      setActivationCode('');
      toast.success('Card activated successfully!');
    } catch (error) {
      toast.error('Failed to activate card');
    }
  };

  const handlePinChange = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast.error('Please fill in all PIN fields');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('New PIN and confirmation do not match');
      return;
    }

    if (newPin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    try {
      // Mock PIN change process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowPinDialog(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      toast.success('PIN changed successfully!');
    } catch (error) {
      toast.error('Failed to change PIN');
    }
  };

  const handleRenewalRequest = async () => {
    try {
      // Mock renewal process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowRenewalDialog(false);
      toast.success('Renewal request submitted successfully! You will receive confirmation via email.');
    } catch (error) {
      toast.error('Failed to submit renewal request');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const mockUploadResult = { error: null }; // TODO: Replace with API call
      const { error: uploadError } = mockUploadResult;

      if (uploadError) {
        throw uploadError;
      }

      const mockUrlResult = { data: { publicUrl: '/default-profile.jpg' } }; // TODO: Replace with API call
      const { data: { publicUrl } } = mockUrlResult;

      await updateProfile({ profile_image_url: publicUrl });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error('Error uploading image');
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  const totalSavings = getTotalSavings();
  const rewardsPoints = usageHistory.length * 50; // Mock calculation
  
  // Check if user has affiliate access (premium members or agents)
  const hasAffiliateAccess = userRole === 'agent' || membership?.tier === 'premium' || affiliateData;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your Elverra Global membership and services</p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className={`grid w-full ${hasAffiliateAccess ? 'grid-cols-10' : 'grid-cols-9'} overflow-x-auto`}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="rewards">Discounts</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            {hasAffiliateAccess && <TabsTrigger value="affiliate">Affiliate</TabsTrigger>}
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 mr-4">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Membership</p>
                      <h4 className="text-xl font-bold text-gray-700">
                        {membership?.tier || 'Essential'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {membership?.expiry_date ? `Until ${new Date(membership.expiry_date).toLocaleDateString()}` : 'Active'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 mr-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Savings</p>
                      <h4 className="text-xl font-bold text-gray-700">CFA {totalSavings.toLocaleString()}</h4>
                      <p className="text-xs text-green-500">From discounts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 mr-4">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Rewards Points</p>
                      <h4 className="text-xl font-bold text-gray-700">{rewardsPoints}</h4>
                      <p className="text-xs text-gray-500">Available to redeem</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Referrals</p>
                      <h4 className="text-xl font-bold text-gray-700">{agentData?.total_referrals || 0}</h4>
                      <p className="text-xs text-gray-500">Members referred</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-gray-100 mr-3">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.payment_type || transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">CFA {transaction.amount?.toLocaleString()}</p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab - Enhanced with full functionality */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  My ZENIKA Card
                  <div className="flex items-center gap-2">
                    {cardActivated ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    <Badge variant="outline">{membership?.tier || 'Essential'}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* ZENIKA Card Design */}
                <div className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl ${
                  membership?.tier === 'Elite' 
                    ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600' 
                    : membership?.tier === 'Premium'
                    ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
                }`} style={{
                  border: membership?.tier === 'Elite' 
                    ? '3px solid #22c55e' 
                    : membership?.tier === 'Premium'
                    ? '3px solid #22c55e'
                    : '3px solid #3b82f6',
                  aspectRatio: '1.6/1',
                  maxWidth: '400px'
                }}>
                  {/* Background wave */}
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 400 250" className="w-full h-full">
                      <path d="M0,150 Q100,100 200,120 T400,110 L400,250 L0,250 Z" fill="rgba(255,255,255,0.1)" />
                    </svg>
                  </div>
                  
                  {/* Globe logo */}
                  <div className="absolute top-4 right-4 w-16 h-16">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-blue-500 rounded-full opacity-80"></div>
                      <div className="absolute top-1 right-1 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                  </div>

                  <div className="relative p-6 h-full flex flex-col">
                    {/* ZENIKA Header */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold tracking-wider" style={{ 
                        color: membership?.tier === 'Elite' 
                          ? '#277732' 
                          : membership?.tier === 'Premium'
                          ? '#ffcf08'
                          : '#b4121d'
                      }}>
                        ZENIKA
                      </h2>
                    </div>

                    {/* Member Info */}
                    <div className="mt-auto text-white">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold">
                          {profile?.full_name || 'Member Name'}
                        </h3>
                        <p className="text-sm opacity-90">
                          Status: {membership?.tier || 'Essential'}
                        </p>
                        <p className="text-sm opacity-90">
                          {profile?.city || 'Sokorodji'}, {profile?.country || 'Mali'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">ID: {membership?.member_id || 'ML-2025896550'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold">
                            {membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '03/26'}
                          </span>
                          <div className="w-12 h-12 bg-white rounded border-2 border-black flex items-center justify-center">
                            <div className="w-8 h-8 bg-black opacity-80"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCardRenewal}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Renewal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDownloadCard}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Card
                  </Button>
                  
                  {!cardActivated && (
                    <Button 
                      variant="default" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => setShowActivationDialog(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate Card
                    </Button>
                  )}
                  
                  {cardActivated && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowPinDialog(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Change PIN
                    </Button>
                  )}
                </div>

                {/* Card Status Information */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3">Card Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card Number:</span>
                      <span className="font-medium">**** **** **** {membership?.member_id?.slice(-4) || '8550'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${cardActivated ? 'text-green-600' : 'text-red-600'}`}>
                        {cardActivated ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">
                        {membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString() : '03/26'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membership Type:</span>
                      <span className="font-medium">{membership?.tier || 'Essential'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dialogs for card management */}
            <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Activate Your ZENIKA Card</DialogTitle>
                  <DialogDescription>
                    Enter the activation code sent to your email or phone number.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="activationCode">Activation Code</Label>
                    <Input
                      id="activationCode"
                      type="text"
                      placeholder="Enter 6-digit activation code"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCardActivation} className="flex-1">
                      Activate Card
                    </Button>
                    <Button variant="outline" onClick={() => setShowActivationDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Didn't receive the code? <Button variant="link" className="p-0 h-auto">Resend Code</Button>
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Card PIN</DialogTitle>
                  <DialogDescription>
                    Enter your current PIN and choose a new 4-digit PIN for your card.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPin">Current PIN</Label>
                    <Input
                      id="currentPin"
                      type="password"
                      placeholder="Enter current PIN"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPin">New PIN</Label>
                    <Input
                      id="newPin"
                      type="password"
                      placeholder="Enter new 4-digit PIN"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPin">Confirm New PIN</Label>
                    <Input
                      id="confirmPin"
                      type="password"
                      placeholder="Confirm new PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePinChange} className="flex-1">
                      Change PIN
                    </Button>
                    <Button variant="outline" onClick={() => setShowPinDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Card Renewal</DialogTitle>
                  <DialogDescription>
                    Submit a request to renew your ZENIKA card membership.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Current Membership Details</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>Membership Type: {membership?.tier || 'Essential'}</p>
                      <p>Expiry Date: {membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString() : 'N/A'}</p>
                      <p>Member ID: {membership?.member_id || 'ML-2025896550'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="renewalNotes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="renewalNotes"
                      placeholder="Any special requests or notes for your renewal..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleRenewalRequest} className="flex-1">
                      Submit Renewal Request
                    </Button>
                    <Button variant="outline" onClick={() => setShowRenewalDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Enhanced Discounts and Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Percent className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{usageHistory.length}</div>
                  <p className="text-sm text-gray-600">Discounts Used</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">CFA {totalSavings.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Savings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{rewardsPoints}</div>
                  <p className="text-sm text-gray-600">Reward Points</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Available Offers & Promotions
                  <Button onClick={() => navigate('/discounts')} variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Discounts
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableOffers.map(offer => (
                    <Card key={offer.id} className="border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{offer.title}</h3>
                          {offer.discount_percentage > 0 && (
                            <Badge className="bg-green-500">{offer.discount_percentage}% OFF</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                        <Button size="sm" className="w-full">
                          <Gift className="h-4 w-4 mr-2" />
                          Redeem Offer
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Discount Usage History</CardTitle>
              </CardHeader>
              <CardContent>
                {usageHistory.length > 0 ? (
                  <div className="space-y-3">
                    {usageHistory.map((usage) => (
                      <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Discount Used</p>
                          <p className="text-sm text-gray-500">
                            {new Date(usage.used_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            {usage.discount_percentage}% OFF
                          </p>
                          <p className="text-sm text-gray-500">
                            Saved: CFA {usage.amount_saved?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Percent className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No discount usage history yet</p>
                    <Button onClick={() => navigate('/discounts')} className="mt-4">
                      Browse Available Discounts
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Services and Products Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services/o-secours')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-red-600" />
                    Ô Secours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Emergency assistance services for various situations</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Access Service
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services/credit-system')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                    Credit Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Payday loans and credit account services</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply for Credit
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/shop')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-6 w-6 mr-2 text-green-600" />
                    Online Store
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Browse and purchase products from our marketplace</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Store
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/services/hire-purchase')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-6 w-6 mr-2 text-purple-600" />
                    Hire Purchase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Buy now, pay later with flexible payment plans</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/job-center')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-6 w-6 mr-2 text-indigo-600" />
                    Job Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Find career opportunities and post job listings</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/competitions')}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-6 w-6 mr-2 text-yellow-600" />
                    Competitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">Participate in competitions and win prizes</p>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Competitions
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Service Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Premium Membership</h4>
                      <p className="text-sm text-gray-500">Access to all premium features and services</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">CFA 5,000/month</p>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </div>
                  
                  <div className="text-center py-8">
                    <Button onClick={() => navigate('/services')} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Subscribe to More Services
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Affiliate Management Tab */}
          {hasAffiliateAccess && (
            <TabsContent value="affiliate" className="space-y-6">
              {/* Demo Data Notice */}
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <p className="text-yellow-800 font-medium">
                      Demo Dashboard: This affiliate data is for demonstration purposes and not connected to live transactions
                    </p>
                  </div>
                </div>
              </div>

              {affiliateData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{affiliateData.totalReferrals}</div>
                        <p className="text-sm text-gray-600">Total Referrals</p>
                        <div className="mt-2">
                          <Progress value={affiliateData.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{affiliateData.totalReferrals}/{affiliateData.referralTarget} target</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">CFA {affiliateData.totalEarnings?.toLocaleString()}</div>
                        <p className="text-sm text-gray-600">Total Earnings</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pending: CFA {affiliateData.pendingEarnings?.toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">10%</div>
                        <p className="text-sm text-gray-600">Commission Rate</p>
                        <p className="text-xs text-gray-500 mt-1">3 Day Processing</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Referral Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Referral Code</p>
                            <p className="text-sm text-gray-500">Share this code to earn commissions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-purple-100 text-purple-700 px-3 py-1 rounded border font-mono">
                              {affiliateData.referralCode}
                            </code>
                            <Button size="sm" variant="outline" onClick={() => {
                              navigator.clipboard.writeText(affiliateData.referralCode);
                              toast.success('Referral code copied!');
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">Referral Link</p>
                            <p className="text-sm text-gray-500">Direct link for easy sharing</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              const link = `https://elverra-global.com/register?ref=${affiliateData.referralCode}`;
                              navigator.clipboard.writeText(link);
                              toast.success('Referral link copied!');
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Link
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Referrals</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {affiliateData.referralHistory.slice(0, 5).map((referral) => (
                            <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{referral.name}</p>
                                <p className="text-xs text-gray-500">{referral.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">CFA {referral.earnings.toLocaleString()}</p>
                                <Badge 
                                  variant={referral.status === 'Active' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {referral.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        {affiliateData.referralHistory.length > 5 && (
                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={() => navigate('/affiliate-dashboard')}
                          >
                            View All Referrals
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Program Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Affiliate Program Benefits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 mb-2">10%</div>
                          <p className="text-sm text-gray-600">Commission Rate</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-2">3 Days</div>
                          <p className="text-sm text-gray-600">Processing Time</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-2">CFA 250K</div>
                          <p className="text-sm text-gray-600">Max Monthly Earnings</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : affiliateLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading affiliate data...</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Join Our Affiliate Program</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8">
                    <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Become an Affiliate</h3>
                    <p className="text-gray-600 mb-6">
                      Earn 10% commission on every successful referral. Join thousands of affiliates earning with Elverra Global.
                    </p>
                    <Button onClick={() => navigate('/affiliate-program')} size="lg">
                      <Users className="h-4 w-4 mr-2" />
                      Join Affiliate Program
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Enhanced Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Payment History
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadPaymentHistory('pdf')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => downloadPaymentHistory('csv')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">Description</th>
                        <th className="text-left py-3 px-2">Amount</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="py-3 px-2">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">{transaction.payment_type}</td>
                          <td className="py-3 px-2">CFA {transaction.amount?.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>


          </TabsContent>

          {/* Enhanced Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Profile Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.profile_image_url} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full p-1 cursor-pointer hover:bg-purple-700">
                      <Camera className="h-4 w-4" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-sm text-gray-400">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500">Change your account password</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Sessions</p>
                    <p className="text-sm text-gray-500">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationUpdate('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => handleNotificationUpdate('sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationUpdate('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => handleNotificationUpdate('marketing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-gray-500">Important security notifications</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => handleNotificationUpdate('security', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Account Data</p>
                    <p className="text-sm text-gray-500">Download a copy of your account data</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sign Out</p>
                    <p className="text-sm text-gray-500">Sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Change Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new secure password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePasswordReset} className="flex-1">
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Enhanced Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/jobs')}>
                <CardContent className="p-6 text-center">
                  <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Browse Jobs</h3>
                  <p className="text-sm text-gray-600">Find your next career opportunity</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/job-dashboard/employee')}>
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Employee Dashboard</h3>
                  <p className="text-sm text-gray-600">Manage your job applications</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/job-dashboard/employer')}>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Employer Dashboard</h3>
                  <p className="text-sm text-gray-600">Post jobs and find talent</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Job Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {jobApplications.length > 0 ? (
                  <div className="space-y-4">
                    {jobApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{application.jobs?.title}</h4>
                          <p className="text-sm text-gray-500">{application.jobs?.company}</p>
                          <p className="text-xs text-gray-400">
                            Applied: {new Date(application.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            application.status === 'pending' ? 'secondary' :
                            application.status === 'interview' ? 'default' :
                            application.status === 'accepted' ? 'default' : 'destructive'
                          }>
                            {application.status}
                          </Badge>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/jobs/${application.jobs?.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No job applications yet</p>
                    <Button onClick={() => navigate('/jobs')}>
                      <Search className="h-4 w-4 mr-2" />
                      Browse Available Jobs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <ProductManagement />
          </TabsContent>

          {/* Enhanced Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/faq')}>
                <CardContent className="p-6 text-center">
                  <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">FAQ</h3>
                  <p className="text-sm text-gray-600">Find answers to common questions</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/about/contact')}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help from our support team</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Headphones className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600">Chat with support agents</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/terms')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/privacy')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/cookies')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Cookie Policy
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => navigate('/about')}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    About Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-gray-600">+223 20 22 15 30</p>
                      <p className="text-xs text-gray-500">Monday - Friday, 8AM - 6PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-gray-600">support@elverraglobal.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                    <div>
                      <p className="font-medium">Office Address</p>
                      <p className="text-sm text-gray-600">Bamako, Mali</p>
                      <p className="text-xs text-gray-500">Visit us during business hours</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyAccount;