import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User,
  Shield,
  Bell,
  Globe,
  Camera,
  Lock,
  Mail,
  Phone,
  MapPin,
  Save,
  AlertTriangle,
  Check,
  Crown,
  CreditCard,
  CheckCircle,
  Star,
  Gift
} from 'lucide-react';
import MemberDigitalCard from '@/components/dashboard/MemberDigitalCard';

const AccountSection = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { membership } = useMembership();
  const { t, language, setLanguage } = useLanguage();
  
  // Mock profile data state
  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    country: profile?.country || 'Mali',
    bio: '',
    dateOfBirth: '',
    gender: '',
    occupation: ''
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: true,
    loginAlerts: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    jobAlerts: true,
    paymentNotifications: true,
    marketingEmails: false,
    weeklyNewsletter: true,
    discountAlerts: true,
    affiliateUpdates: true,
    systemUpdates: true
  });

  // Language and region settings
  const [regionSettings, setRegionSettings] = useState({
    language: language,
    timezone: 'GMT',
    currency: 'CFA',
    dateFormat: 'DD/MM/YYYY'
  });

  const handleProfileUpdate = () => {
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    alert('Password change request sent to your email.');
  };

  const handleSecurityUpdate = () => {
    alert('Security settings updated successfully!');
  };

  const handleNotificationUpdate = () => {
    alert('Notification preferences updated successfully!');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setRegionSettings({ ...regionSettings, language: newLanguage });
    setLanguage(newLanguage);
    alert('Language updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <Badge className="bg-blue-100 text-blue-800">
          <User className="h-3 w-3 mr-1" />
          Profile Management
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="language">Language & Region</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'User')}&background=3b82f6&color=ffffff&size=128`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Profile Photo</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload a photo to personalize your account
                  </p>
                  <Button size="sm" variant="outline">
                    Change Photo
                  </Button>
                </div>
              </div>

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Full Name
                  </label>
                  <Input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Gender
                  </label>
                  <Select value={profileData.gender} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Occupation
                  </label>
                  <Input
                    value={profileData.occupation}
                    onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                    placeholder="Enter your occupation"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    City
                  </label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Country
                  </label>
                  <Select value={profileData.country} onValueChange={(value) => setProfileData({ ...profileData, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Senegal">Senegal</SelectItem>
                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                      <SelectItem value="Guinea">Guinea</SelectItem>
                      <SelectItem value="Ivory Coast">Ivory Coast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Enter your full address"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bio
                </label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Password</h4>
                    <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                  </div>
                  <Button onClick={handlePasswordChange}>
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => 
                      setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                    }
                  />
                </div>
                {securitySettings.twoFactorEnabled && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Two-factor authentication is enabled
                    </p>
                  </div>
                )}
              </div>

              {/* Security Notifications */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-4">Security Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Get notified about account activity via email</p>
                    </div>
                    <Switch
                      checked={securitySettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Get notified about account activity via SMS</p>
                    </div>
                    <Switch
                      checked={securitySettings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, smsNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Alerts</p>
                      <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) => 
                        setSecuritySettings({ ...securitySettings, loginAlerts: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSecurityUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Job & Career Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Job Alerts</p>
                        <p className="text-sm text-gray-600">Get notified about new job opportunities</p>
                      </div>
                      <Switch
                        checked={notificationSettings.jobAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, jobAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Financial Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Payment Notifications</p>
                        <p className="text-sm text-gray-600">Get notified about payments and transactions</p>
                      </div>
                      <Switch
                        checked={notificationSettings.paymentNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, paymentNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Discount Alerts</p>
                        <p className="text-sm text-gray-600">Get notified about new discounts and offers</p>
                      </div>
                      <Switch
                        checked={notificationSettings.discountAlerts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, discountAlerts: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Affiliate Program</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Affiliate Updates</p>
                        <p className="text-sm text-gray-600">Get notified about referrals and earnings</p>
                      </div>
                      <Switch
                        checked={notificationSettings.affiliateUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, affiliateUpdates: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Marketing & Updates</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600">Receive promotional emails and special offers</p>
                      </div>
                      <Switch
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Newsletter</p>
                        <p className="text-sm text-gray-600">Stay updated with our weekly newsletter</p>
                      </div>
                      <Switch
                        checked={notificationSettings.weeklyNewsletter}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, weeklyNewsletter: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">System Updates</p>
                        <p className="text-sm text-gray-600">Get notified about platform updates and maintenance</p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationUpdate} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Membership & Digital Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Digital Card Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Digital Membership Card</h3>
                <MemberDigitalCard
                  memberName={profile?.full_name || user?.email?.split('@')[0] || 'Member'}
                  memberID={user?.id?.slice(-8) || 'N/A'}
                  expiryDate={membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString() : 'N/A'}
                  membershipTier={membership?.tier ? (membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)) as 'Essential' | 'Premium' | 'Elite' : 'Essential'}
                  profileImage={profile?.profile_image_url}
                  address={profile?.address}
                  isPaymentComplete={membership?.is_active || false}
                />
              </div>

              {/* Subscription Plans Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subscription Plans</h3>
                
                {/* Current Plan Display */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Current Plan</h4>
                    <Badge className="bg-blue-100 text-blue-800 capitalize">
                      {membership?.tier || 'Essential'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {membership?.is_active ? 'Your membership is active' : 'Complete payment to activate your membership'}
                  </p>
                </div>

                {/* Available Plan Changes */}
                <div className="space-y-4">
                  <h4 className="font-medium">Available Plan Changes</h4>
                  
                  {/* Essential Plan Logic */}
                  {(!membership?.tier || membership?.tier === 'essential') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                              <h5 className="font-semibold">Premium</h5>
                              <p className="text-sm text-gray-600">CFA 2,000/month</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• Unlimited job applications</li>
                            <li>• Priority support</li>
                            <li>• Affiliate program access</li>
                            <li>• Enhanced features</li>
                          </ul>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Upgrade to Premium
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Crown className="h-8 w-8 text-purple-600" />
                            <div>
                              <h5 className="font-semibold">Elite</h5>
                              <p className="text-sm text-gray-600">CFA 5,000/month</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• All Premium features</li>
                            <li>• VIP support</li>
                            <li>• Advanced analytics</li>
                            <li>• Exclusive benefits</li>
                          </ul>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            Upgrade to Elite
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Premium Plan Logic */}
                  {membership?.tier === 'premium' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <CreditCard className="h-8 w-8 text-gray-600" />
                            <div>
                              <h5 className="font-semibold">Essential</h5>
                              <p className="text-sm text-gray-600">Free</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• Basic features</li>
                            <li>• Limited job applications</li>
                            <li>• Standard support</li>
                            <li>• Basic access</li>
                          </ul>
                          <Button variant="outline" className="w-full">
                            Downgrade to Essential
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Crown className="h-8 w-8 text-purple-600" />
                            <div>
                              <h5 className="font-semibold">Elite</h5>
                              <p className="text-sm text-gray-600">CFA 5,000/month</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• All Premium features</li>
                            <li>• VIP support</li>
                            <li>• Advanced analytics</li>
                            <li>• Exclusive benefits</li>
                          </ul>
                          <Button className="w-full bg-purple-600 hover:bg-purple-700">
                            Upgrade to Elite
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Elite Plan Logic */}
                  {membership?.tier === 'elite' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <CreditCard className="h-8 w-8 text-gray-600" />
                            <div>
                              <h5 className="font-semibold">Essential</h5>
                              <p className="text-sm text-gray-600">Free</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• Basic features</li>
                            <li>• Limited job applications</li>
                            <li>• Standard support</li>
                            <li>• Basic access</li>
                          </ul>
                          <Button variant="outline" className="w-full">
                            Downgrade to Essential
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                              <h5 className="font-semibold">Premium</h5>
                              <p className="text-sm text-gray-600">CFA 2,000/month</p>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1 mb-4">
                            <li>• Unlimited job applications</li>
                            <li>• Priority support</li>
                            <li>• Affiliate program access</li>
                            <li>• Enhanced features</li>
                          </ul>
                          <Button variant="outline" className="w-full">
                            Downgrade to Premium
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Payment Status Notice */}
                {!membership?.is_active && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Payment Required</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      Complete your payment to activate your membership and access your digital card.
                    </p>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      Complete Payment
                    </Button>
                  </div>
                )}

                {/* Plan Benefits Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Plan Benefits Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Feature</th>
                            <th className="text-center py-2">Essential</th>
                            <th className="text-center py-2">Premium</th>
                            <th className="text-center py-2">Elite</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Job Applications</td>
                            <td className="text-center py-2">5/month</td>
                            <td className="text-center py-2">Unlimited</td>
                            <td className="text-center py-2">Unlimited</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Support Level</td>
                            <td className="text-center py-2">Standard</td>
                            <td className="text-center py-2">Priority</td>
                            <td className="text-center py-2">24/7 VIP</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Affiliate Program</td>
                            <td className="text-center py-2">❌</td>
                            <td className="text-center py-2">✅</td>
                            <td className="text-center py-2">✅ Advanced</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Digital Card</td>
                            <td className="text-center py-2">Basic</td>
                            <td className="text-center py-2">Enhanced</td>
                            <td className="text-center py-2">Premium</td>
                          </tr>
                          <tr>
                            <td className="py-2">Monthly Price</td>
                            <td className="text-center py-2 font-semibold">Free</td>
                            <td className="text-center py-2 font-semibold">CFA 2,000</td>
                            <td className="text-center py-2 font-semibold">CFA 5,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Language
                  </label>
                  <Select value={regionSettings.language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Timezone
                  </label>
                  <Select value={regionSettings.timezone} onValueChange={(value) => setRegionSettings({ ...regionSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMT">GMT (Bamako)</SelectItem>
                      <SelectItem value="GMT+1">GMT+1 (Casablanca)</SelectItem>
                      <SelectItem value="GMT-5">GMT-5 (New York)</SelectItem>
                      <SelectItem value="GMT+1">GMT+1 (Paris)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Currency
                  </label>
                  <Select value={regionSettings.currency} onValueChange={(value) => setRegionSettings({ ...regionSettings, currency: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CFA">CFA Franc (OUV)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date Format
                  </label>
                  <Select value={regionSettings.dateFormat} onValueChange={(value) => setRegionSettings({ ...regionSettings, dateFormat: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Settings Preview</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Language:</strong> {regionSettings.language === 'en' ? 'English' : 'Français'}</p>
                  <p><strong>Timezone:</strong> {regionSettings.timezone}</p>
                  <p><strong>Currency:</strong> {regionSettings.currency}</p>
                  <p><strong>Date Format:</strong> {regionSettings.dateFormat}</p>
                  <p><strong>Sample Date:</strong> {new Date().toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}</p>
                </div>
              </div>

              <Button className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Language & Region Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSection;