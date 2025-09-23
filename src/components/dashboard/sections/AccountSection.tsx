import { useState, useEffect } from 'react';
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
  Gift,
  Edit,
  X,
  Loader2
} from 'lucide-react';
import MemberDigitalCard from '@/components/dashboard/MemberDigitalCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const AccountSection = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { membership } = useMembership();
  const { t, language, setLanguage } = useLanguage();

  // Local profile state as fallback
  const [localProfile, setLocalProfile] = useState<any>(null);

  // Fetch profile directly if useUserProfile fails
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Direct profile fetch result:', { profileData, error });

        if (!error && profileData) {
          setLocalProfile(profileData);
        }
      } catch (error) {
        console.error('Error fetching profile directly:', error);
      }
    };

    if (!profile) {
      fetchProfile();
    }
  }, [user?.id, profile]);

  // Use profile from hook or local fallback
  const currentProfile = profile || localProfile;

  // Get member name using the same logic as in ModernDashboard
  const memberName = (currentProfile?.full_name && currentProfile.full_name.trim())
    || (user?.fullName && user.fullName.trim())
    || (user?.email ? user.email.split('@')[0] : '')
    || 'User';

  // State for all user cards
  const [userCards, setUserCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Get current card or fallback
  const currentCard = userCards.length > 0 ? userCards[currentCardIndex] : null;
  const cardIdentifier = currentCard?.card_identifier || 'N/A';

  // Fetch all user cards from membership_cards table
  useEffect(() => {
    const fetchUserCards = async () => {
      if (!user?.id) {
        console.log('No user ID available for cards fetch');
        return;
      }

      try {
        console.log('Fetching all cards for user:', user.id);

        // Récupération des cartes depuis la table membership_cards
        const { data: membershipCards, error: cardsError } = await supabase
          .from('membership_cards')
          .select('card_identifier, owner_user_id, created_at, qr_data')
          .eq('owner_user_id', user.id)  // Utilisez user.id au lieu de userId
          .order('created_at', { ascending: false });
        console.log('Résultat de la requête des cartes:', { membershipCards, cardsError });

        // Après avoir reçu les données de la requête
        const processedCards = membershipCards?.map(card => {
          let cardType = 'essential'; // Valeur par défaut
          try {
            // Si qr_data est une chaîne, essayez de la parser
            const qrData = typeof card.qr_data === 'string'
              ? JSON.parse(card.qr_data)
              : card.qr_data;
            cardType = qrData?.type || 'essential';
          } catch (e) {
            console.error('Error parsing qr_data:', e);
          }

          return {
            ...card,
            card_type: cardType
          };
        });

        setUserCards(processedCards || []);

        if (cardsError) {
          console.error('❌ Erreur de récupération des cartes:', {
            code: cardsError.code,
            message: cardsError.message,
            details: cardsError.details,
            hint: cardsError.hint
          });
          toast.error('Impossible de charger vos cartes. Veuillez contacter le support.');
          return;
        }

        if (!membershipCards || membershipCards.length === 0) {
          console.log('ℹ️ Aucune carte trouvée pour cet utilisateur');
          toast.info('Aucune carte trouvée pour votre compte.');
          return;
        }

        console.log(`✅ ${membershipCards.length} carte(s) trouvée(s):`,
          membershipCards.map(c => `${c.card_identifier} (${c.card_identifier})`));
        setUserCards(membershipCards);

      } catch (error) {
        console.error('❌ Erreur lors de la récupération des cartes:', error);
        toast.error('Une erreur est survenue lors du chargement de vos cartes.');
      }
    };

    fetchUserCards();
  }, [user?.id, membership?.id, membership?.tier]);

  // État du mode édition
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // État local du profil
  const [profileData, setProfileData] = useState({
    fullName: memberName,
    email: user?.email || '',
    phone: currentProfile?.phone || '',
    address: currentProfile?.address || '',
    city: currentProfile?.city || '',
    country: currentProfile?.country || 'Mali',
    profileImage: currentProfile?.profile_image_url || ''
  });
  const parseQRData = (qrData: any) => {
    if (!qrData) return { tier: 'essential', type: 'adult' };

    try {
      if (typeof qrData === 'string') {
        return JSON.parse(qrData);
      }
      return qrData;
    } catch (e) {
      console.error('Error parsing qr_data:', e);
      return { tier: 'essential', type: 'adult' };
    }
  };

  // Mettre à jour les données du profil lorsque les données changent
  useEffect(() => {
    setProfileData({
      fullName: memberName,
      email: user?.email || '',
      phone: currentProfile?.phone || '',
      address: currentProfile?.address || '',
      city: currentProfile?.city || '',
      country: currentProfile?.country || 'Mali',
      profileImage: currentProfile?.profile_image_url || ''
    });
    setPreviewUrl(currentProfile?.profile_image_url || null);
  }, [memberName, user?.email, currentProfile]);

  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Télécharger l'image de profil
  const uploadProfileImage = async () => {
    if (!selectedFile || !user?.id) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type,
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL d'image
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setProfileData(prev => ({
        ...prev,
        profileImage: publicUrl
      }));

      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      toast.error('Erreur lors de la mise à jour de la photo de profil');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  // Enregistrer les modifications du profil
  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Télécharger d'abord la nouvelle image si nécessaire
      if (selectedFile) {
        await uploadProfileImage();
      }

      // Mettre à jour les autres informations du profil
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          country: profileData.country,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la mise à niveau de l'abonnement
  const handleUpgradePlan = async (newTier: 'premium' | 'elite' | 'essential') => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Ici, vous devez intégrer votre logique de paiement
      // Ceci est un exemple simplifié
      const { error } = await supabase
        .from('subscriptions')
        .update({ tier: newTier })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(`Félicitations ! Vous avez été mis à niveau vers le plan ${newTier}`);
      // Recharger les données du membre
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à niveau du plan:', error);
      toast.error('Erreur lors de la mise à niveau du plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions for cards
  const nextCard = () => {
    if (userCards.length > 1) {
      setCurrentCardIndex((prev) => (prev + 1) % userCards.length);
    }
  };

  const prevCard = () => {
    if (userCards.length > 1) {
      setCurrentCardIndex((prev) => (prev - 1 + userCards.length) % userCards.length);
    }
  };

  // Get membership tier for current card
  const getCurrentCardTier = () => {
    if (!currentCard) return 'Essential';

    // Parse qr_data safely
    const qrData = parseQRData(currentCard.qr_data);

    // Try to get tier from qr_data first, then from card_type, then from card_identifier
    let cardTier = qrData?.tier || currentCard.card_type;

    // If we still don't have a tier, try to infer it from the card_identifier
    if (!cardTier && currentCard.card_identifier) {
      if (currentCard.card_identifier.startsWith('KID-')) {
        cardTier = 'child';
      } else if (currentCard.card_identifier.startsWith('PRM-')) {
        cardTier = 'premium';
      } else if (currentCard.card_identifier.startsWith('ELT-')) {
        cardTier = 'elite';
      }
    }

    // Normalize the tier
    const normalizedTier = cardTier?.toLowerCase().trim() || 'essential';

    // Map to proper case for display
    const tierMap: Record<string, string> = {
      'child': 'Child',
      'premium': 'Premium',
      'elite': 'Elite',
      'essential': 'Essential'
    };

    return tierMap[normalizedTier] || 'Essential';
  };
  // Debug effect to log member data
  useEffect(() => {
    console.log('=== DEBUG - Member data ===');
    console.log('memberName:', memberName);
    console.log('cardIdentifier:', cardIdentifier);
    console.log('profile object (hook):', profile);
    console.log('localProfile object:', localProfile);
    console.log('currentProfile object:', currentProfile);
    console.log('user object:', user);
    console.log('membership object:', membership);
    console.log('profileData state:', profileData);
    console.log('========================');
  }, [memberName, cardIdentifier, profile, localProfile, currentProfile, user, membership, profileData]);

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

  const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
    setRegionSettings({ ...regionSettings, language: newLanguage });
    setLanguage(newLanguage);
    alert('Language updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <Badge className="bg-blue-100 text-blue-800">
          <User className="h-3 w-3 mr-1" />
          Profile Management
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="relative">
          <TabsList className="w-full grid-cols-5 overflow-x-auto pb-2 md:pb-0 hide-scrollbar ">
            <TabsTrigger
              value="profile"
              className=""
            >
              <User className="h-3.5 w-3.5 mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="sm:hidden">Prof</span>
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className=""
            >
              <Shield className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:inline sm:md:hidden">Sec</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className=""
            >
              <Bell className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:inline sm:md:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className=""
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="hidden md:inline">Subscriptions</span>
              <span className="md:inline md:lg:hidden">Subs</span>
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className=""
            >
              <Globe className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="hidden md:inline">Language</span>
              <span className="md:inline md:lg:hidden">Lang</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo de profil */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative group">
                  <img
                    src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=3b82f6&color=ffffff&size=128`}
                    alt= {t('dashboard.profileTitle')}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                  {isEditing && (
                    <label
                      htmlFor="profile-upload"
                      className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 bg-white rounded-full p-1.5 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                      title="Changer la photo"
                    >
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="text-white text-xs">{uploadProgress}%</div>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-sm sm:text-base mb-1">{t('dashboard.profileTitle')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  {t('dashboard.profilesubtitle')}
                  </p>
                  {isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={uploadProfileImage}
                      disabled={!selectedFile || isLoading}
                    >
                      {isLoading ? 'Téléchargement...' : 'Enregistrer la photo'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Modifier le profil
                    </Button>
                  )}
                </div>
              </div>

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nom complet
                  </label>
                  <Input
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder="Votre nom complet"
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Adresse email
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Votre adresse email"
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contactez le support pour modifier votre email</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Numéro de téléphone
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Votre numéro de téléphone"
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>


                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ville
                  </label>
                  <Input
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="Votre ville"
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Pays
                  </label>
                  <Select
                    value={profileData.country}
                    onValueChange={(value) => setProfileData({ ...profileData, country: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? 'bg-gray-50' : ''}>
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mali">Mali</SelectItem>
                      <SelectItem value="Sénégal">Sénégal</SelectItem>
                      <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                      <SelectItem value="Niger">Niger</SelectItem>
                      <SelectItem value="Guinée">Guinée</SelectItem>
                      <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                      <SelectItem value="Bénin">Bénin</SelectItem>
                      <SelectItem value="Togo">Togo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Adresse
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="Votre adresse complète"
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>


              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        // Réinitialiser les modifications
                        setProfileData({
                          ...profileData,
                          fullName: memberName,
                          phone: currentProfile?.phone || '',
                          address: currentProfile?.address || '',
                          city: currentProfile?.city || '',
                          country: currentProfile?.country || 'Mali'
                        });
                        setPreviewUrl(currentProfile?.profile_image_url || null);
                        setSelectedFile(null);
                      }}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier le profil
                  </Button>
                )}
              </div>
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
                Subsciption & Digital Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Digital Card Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Your Digital Client Cards</h3>
                  {userCards.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {currentCardIndex + 1} of {userCards.length}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevCard}
                          className="h-8 w-8 p-0"
                        >
                          ←
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextCard}
                          className="h-8 w-8 p-0"
                        >
                          →
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {userCards.map((card, index) => {
                  // Parse qr_data safely
                  const qrData = parseQRData(card.qr_data);

                  // Debug log pour voir les données brutes
                  console.log('Card data:', {
                    cardIdentifier: card.card_identifier,
                    qrData,
                    card_type: card.card_type
                  });

                  // Essayer de déterminer le tier en priorisant qr_data.tier, puis card_type, puis l'identifiant de la carte
                  let cardTier = qrData?.tier || card.card_type;

                  // Si on n'a toujours pas de tier, essayons de l'inférer depuis l'identifiant de la carte
                  if (!cardTier && card.card_identifier) {
                    if (card.card_identifier.startsWith('KID-')) {
                      cardTier = 'child';
                    } else if (card.card_identifier.startsWith('PRM-')) {
                      cardTier = 'premium';
                    } else if (card.card_identifier.startsWith('ELT-')) {
                      cardTier = 'elite';
                    }
                  }

                  // Si on n'a toujours pas de tier, on saute cette carte
                  if (!cardTier) {
                    console.warn('Card missing tier information, skipping:', card);
                    return null;
                  }

                  // Normalisation du tier pour la comparaison
                  const normalizedTier = cardTier.toLowerCase().trim();
                  console.log(`Card ${index} (${card.card_identifier}):`, { normalizedTier, isSelected: index === currentCardIndex });

                  return (
                    <button
                      key={card.card_identifier}
                      onClick={() => {
                        console.log('Card selected:', { index, card_identifier: card.card_identifier, normalizedTier });
                        setCurrentCardIndex(index);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors mr-2 ${index === currentCardIndex
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                      {normalizedTier === 'child' ? 'Child Card' :
                        normalizedTier === 'premium' ? 'Premium Card' :
                          normalizedTier === 'elite' ? 'Elite Card' : cardTier + ' Card'}
                    </button>
                  );
                })}

                <MemberDigitalCard
                  memberName={memberName}
                  memberID={currentCard?.card_identifier || cardIdentifier}
                  userID={user?.id || ''}
                  expiryDate={membership?.expiry_date ? new Date(membership.expiry_date).toLocaleDateString() : 'N/A'}
                  membershipTier={getCurrentCardTier() as 'Essential' | 'Premium' | 'Elite' | 'Child'}
                  profileImage={currentProfile?.profile_image_url}
                  address={currentProfile?.address}
                  city={currentProfile?.city}
                  serialNumber={currentCard?.card_identifier || membership?.member_id}
                  isPaymentComplete={membership?.is_active || false}
                  subscriptionStatus={membership?.is_active ? 'active' : 'expired'}
                  qrData={currentCard?.qr_data} // Passer les données brutes du QR code
                />
              </div>

              {/* Subscription Plans Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Subscription Plans</h3>

                {/* Current Plan Display */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    {/* Affichage des cartes actives */}
                    {userCards.length > 0 ? (
                      userCards.map((card, index) => {
                        // Déterminer le type de carte à partir des champs fiables
                        const qrData = parseQRData(card.qr_data);
                        // On utilise d'abord le type de carte défini, puis les données QR si disponibles
                        let cardType = card.card_type || qrData?.tier;
                        
                        // Si on n'a toujours pas de type, on utilise une valeur par défaut
                        if (!cardType) {
                          console.warn('Type de carte non défini pour la carte:', card);
                          cardType = 'unknown';
                        }

                        // Mapper les types de cartes aux libellés en français
                        const cardLabels: Record<string, { label: string; color: string }> = {
                          'child': { label: 'Carte Enfant', color: 'pink' },
                          'kids': { label: 'Carte Enfant', color: 'pink' },
                          'premium': { label: 'Abonnement Premium', color: 'blue' },
                          'elite': { label: 'Abonnement Elite', color: 'purple' },
                          'essential': { label: 'Abonnement Essentiel', color: 'gray' },
                          'standard': { label: 'Abonnement Standard', color: 'gray' },
                          'basic': { label: 'Abonnement Basique', color: 'gray' }
                        };

                        // Normaliser le type de carte en minuscules pour la correspondance
                        const normalizedCardType = cardType.toLowerCase().trim();
                        const cardInfo = cardLabels[normalizedCardType] || 
                                      { label: `Carte (${cardType})`, color: 'gray' };

                        return (
                          <div 
                            key={card.card_identifier} 
                            className={`flex items-center justify-between ${index > 0 ? 'pt-2 border-t border-blue-100' : ''}`}
                          >
                            <h4 className="font-medium">{cardInfo.label}</h4>
                            <div className="flex items-center gap-2">
                              <Badge className={`bg-${cardInfo.color}-100 text-${cardInfo.color}-800 capitalize`}>
                                {cardInfo.label}
                              </Badge>
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Aucune carte trouvée
                      <div className="text-center py-2 text-gray-500">
                        Aucune carte active trouvée
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 pt-2">
                      {membership?.is_active 
                        ? 'Votre abonnement est actif' 
                        : 'Complétez le paiement pour activer votre abonnement'}
                    </p>
                  </div>
                </div>

                {/* Available Plan Changes */}


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