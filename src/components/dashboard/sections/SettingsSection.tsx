import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Moon,
  Sun,
  Monitor,
  Globe,
  Shield,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  AlertTriangle,
  Save
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsSection = () => {
  const { user } = useAuth();
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  // Theme and appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: currentLanguage,
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    colorScheme: 'default'
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowSearch: true,
    dataCollection: true,
    marketing: false,
    analytics: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    doNotDisturb: false,
    quietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    autoLogout: 30,
    sessionTimeout: 120,
    rememberDevice: true,
    requirePasswordForSensitive: true,
    enableApiAccess: false,
    backupFrequency: 'weekly'
  });

  const handleThemeChange = (theme: string) => {
    setAppearanceSettings({ ...appearanceSettings, theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    alert(`Theme changed to ${theme} mode!`);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setAppearanceSettings({ ...appearanceSettings, language: newLanguage });
    setLanguage(newLanguage as 'en' | 'fr');
    alert('Language updated successfully!');
  };

  const exportData = () => {
    alert('Data export initiated. You will receive a download link via email shortly.');
  };

  const deleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
        alert('Account deletion request submitted. You will receive a confirmation email.');
      }
    }
  };

  const resetSettings = () => {
    if (window.confirm('Reset all settings to default values?')) {
      setAppearanceSettings({
        theme: 'light',
        language: 'en',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        colorScheme: 'default'
      });
      setPrivacySettings({
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowSearch: true,
        dataCollection: true,
        marketing: false,
        analytics: true
      });
      alert('Settings reset to default values!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <Button onClick={resetSettings} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      appearanceSettings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Light</span>
                    </div>
                    <div className="bg-white border rounded p-2">
                      <div className="h-2 bg-gray-100 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      appearanceSettings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Dark</span>
                    </div>
                    <div className="bg-gray-800 border rounded p-2">
                      <div className="h-2 bg-gray-600 rounded mb-1"></div>
                      <div className="h-2 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      appearanceSettings.theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleThemeChange('system')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">System</span>
                    </div>
                    <div className="bg-gradient-to-r from-white to-gray-800 border rounded p-2">
                      <div className="h-2 bg-gray-300 rounded mb-1"></div>
                      <div className="h-2 bg-gray-400 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Language
                </label>
                <Select value={appearanceSettings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Font Size
                </label>
                <Select 
                  value={appearanceSettings.fontSize} 
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, fontSize: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-gray-600">Use a more condensed interface</p>
                  </div>
                  <Switch
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) => 
                      setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Animations</p>
                    <p className="text-sm text-gray-600">Enable smooth transitions and animations</p>
                  </div>
                  <Switch
                    checked={appearanceSettings.animations}
                    onCheckedChange={(checked) => 
                      setAppearanceSettings({ ...appearanceSettings, animations: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Visibility */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Profile Visibility
                </label>
                <Select 
                  value={privacySettings.profileVisibility} 
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium">Contact Information Visibility</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Email Address</p>
                    <p className="text-sm text-gray-600">Allow other users to see your email</p>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, showEmail: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show Phone Number</p>
                    <p className="text-sm text-gray-600">Allow other users to see your phone number</p>
                  </div>
                  <Switch
                    checked={privacySettings.showPhone}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, showPhone: checked })
                    }
                  />
                </div>
              </div>

              {/* Search and Discovery */}
              <div className="space-y-4">
                <h4 className="font-medium">Search & Discovery</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Profile Search</p>
                    <p className="text-sm text-gray-600">Let other users find your profile in search</p>
                  </div>
                  <Switch
                    checked={privacySettings.allowSearch}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, allowSearch: checked })
                    }
                  />
                </div>
              </div>

              {/* Data Usage */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Usage</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Collection</p>
                    <p className="text-sm text-gray-600">Allow collection of usage data to improve services</p>
                  </div>
                  <Switch
                    checked={privacySettings.dataCollection}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, dataCollection: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-gray-600">Receive personalized marketing content</p>
                  </div>
                  <Switch
                    checked={privacySettings.marketing}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, marketing: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-gray-600">Help improve our services with anonymous analytics</p>
                  </div>
                  <Switch
                    checked={privacySettings.analytics}
                    onCheckedChange={(checked) => 
                      setPrivacySettings({ ...privacySettings, analytics: checked })
                    }
                  />
                </div>
              </div>
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
              {/* Notification Channels */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive important notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                    }
                  />
                </div>
              </div>

              {/* Sound and Vibration */}
              <div className="space-y-4">
                <h4 className="font-medium">Sound & Vibration</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound Enabled</p>
                    <p className="text-sm text-gray-600">Play notification sounds</p>
                  </div>
                  <Switch
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, soundEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vibration Enabled</p>
                    <p className="text-sm text-gray-600">Vibrate for notifications (mobile devices)</p>
                  </div>
                  <Switch
                    checked={notificationSettings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, vibrationEnabled: checked })
                    }
                  />
                </div>
              </div>

              {/* Do Not Disturb */}
              <div className="space-y-4">
                <h4 className="font-medium">Do Not Disturb</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Do Not Disturb Mode</p>
                    <p className="text-sm text-gray-600">Temporarily disable all notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.doNotDisturb}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, doNotDisturb: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quiet Hours</p>
                    <p className="text-sm text-gray-600">Automatically enable do not disturb during specified hours</p>
                  </div>
                  <Switch
                    checked={notificationSettings.quietHours}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, quietHours: checked })
                    }
                  />
                </div>

                {notificationSettings.quietHours && (
                  <div className="ml-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Start Time
                      </label>
                      <Select 
                        value={notificationSettings.quietHoursStart}
                        onValueChange={(value) => 
                          setNotificationSettings({ ...notificationSettings, quietHoursStart: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20:00">8:00 PM</SelectItem>
                          <SelectItem value="21:00">9:00 PM</SelectItem>
                          <SelectItem value="22:00">10:00 PM</SelectItem>
                          <SelectItem value="23:00">11:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        End Time
                      </label>
                      <Select 
                        value={notificationSettings.quietHoursEnd}
                        onValueChange={(value) => 
                          setNotificationSettings({ ...notificationSettings, quietHoursEnd: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">6:00 AM</SelectItem>
                          <SelectItem value="07:00">7:00 AM</SelectItem>
                          <SelectItem value="08:00">8:00 AM</SelectItem>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Security & Sessions</h4>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Auto Logout (minutes)
                  </label>
                  <Select 
                    value={accountSettings.autoLogout.toString()}
                    onValueChange={(value) => 
                      setAccountSettings({ ...accountSettings, autoLogout: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Remember This Device</p>
                    <p className="text-sm text-gray-600">Stay logged in on this device</p>
                  </div>
                  <Switch
                    checked={accountSettings.rememberDevice}
                    onCheckedChange={(checked) => 
                      setAccountSettings({ ...accountSettings, rememberDevice: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password for Sensitive Actions</p>
                    <p className="text-sm text-gray-600">Require password for account changes</p>
                  </div>
                  <Switch
                    checked={accountSettings.requirePasswordForSensitive}
                    onCheckedChange={(checked) => 
                      setAccountSettings({ ...accountSettings, requirePasswordForSensitive: checked })
                    }
                  />
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Backup Frequency
                  </label>
                  <Select 
                    value={accountSettings.backupFrequency}
                    onValueChange={(value) => 
                      setAccountSettings({ ...accountSettings, backupFrequency: value })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-4">
                        These actions are irreversible. Please be careful.
                      </p>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          onClick={deleteAccount}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsSection;