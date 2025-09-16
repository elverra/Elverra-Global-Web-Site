import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  CreditCard, 
  Tag, 
  Briefcase, 
  Users,
  Store,
  Library,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Printer,
  Share2,
  MoreHorizontal,
  TrendingUp,
  ChevronRight,
  Bell,
  Crown,
  HeartHandshake
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import all section components
import PaymentsSection from './sections/PaymentsSection';
import JobCenterSection from './sections/JobCenterSection';
import AffiliateSection from './sections/AffiliateSection';
import OSecoursSection from './sections/OSecoursSection';
import OnlineStoreSection from './sections/OnlineStoreSection';
import AccountSection from './sections/AccountSection';
import MyCardSection from './sections/MyCardSection';
import SubscriptionsSection from './sections/SubscriptionsSection';
import SettingsSection from './sections/SettingsSection';
import HelpSection from './sections/HelpSection';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';

const ModernDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { membership } = useMembership();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Track card types (essential, premium, elite, child) to support multiple cards display
  const [cardTypes, setCardTypes] = useState<Array<'essential' | 'premium' | 'elite' | 'child'>>([]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        if (!user?.id) return;
        
        // Get subscriptions directly from Supabase
        const { data: subs, error } = await supabase
          .from('subscriptions')
          .select('id, is_child, product_id, status, start_date, end_date, created_at')
          .eq('user_id', user.id);

        if (!error && Array.isArray(subs)) {
          const ACTIVE = (s: any) => s.status === 'active';
          const sortByStartDesc = (a: any, b: any) => new Date(b.start_date || b.created_at || 0).getTime() - new Date(a.start_date || a.created_at || 0).getTime();

          // Determine child subscription: prefer active, else latest
          const childSubs = subs.filter((s: any) => s.is_child === true);
          const childSub = (childSubs.find(ACTIVE) || childSubs.sort(sortByStartDesc)[0]) as any;

          // Determine one adult subscription: prefer active, else latest
          const adultSubs = subs.filter((s: any) => s.is_child !== true);
          const adultSub = (adultSubs.find(ACTIVE) || adultSubs.sort(sortByStartDesc)[0]) as any;

          // Fetch product names only for the chosen adult sub
          let productNameById: Record<string, string> = {};
          if (adultSub?.product_id) {
            const { data: products } = await supabase
              .from('membership_products')
              .select('id, name')
              .in('id', [adultSub.product_id]);
            (products || []).forEach((p: any) => { productNameById[p.id] = (p.name || '').toLowerCase(); });
          }

          const inferred: Array<'essential' | 'premium' | 'elite' | 'child'> = [];
          if (childSub) inferred.push('child');
          if (adultSub) {
            const n = productNameById[adultSub.product_id] || '';
            const tier: 'elite' | 'premium' | 'essential' = n.includes('elite') ? 'elite' : n.includes('premium') ? 'premium' : 'essential';
            inferred.push(tier);
          }

          if (inferred.length > 0) {
            setCardTypes(inferred);
            console.debug('[Dashboard] Inferred card types from subscriptions (strict):', inferred);
          } else if (membership?.tier && ['essential', 'premium', 'elite', 'child'].includes(membership.tier)) {
            setCardTypes([membership.tier as 'essential' | 'premium' | 'elite' | 'child']);
          }
        } else if (membership?.tier && ['essential', 'premium', 'elite', 'child'].includes(membership.tier)) {
          setCardTypes([membership.tier as 'essential' | 'premium' | 'elite' | 'child']);
        }
      } catch (e) {
        // On error, fallback to membership tier if present
        if (membership?.tier && ['essential', 'premium', 'elite', 'child'].includes(membership.tier)) {
          setCardTypes([membership.tier as 'essential' | 'premium' | 'elite' | 'child']);
        }
      }
    };
    fetchCards();
  }, [user?.id, membership?.tier]);

  // Mock data for demonstration
  const [transactions] = useState([
    {
      id: 1,
      purpose: 'Fauget Cafe',
      category: 'Coffee Shop',
      date: 'Today',
      time: '10h ago',
      amount: 'CFA 500',
      type: 'QR Code',
      status: 'Done'
    },
    {
      id: 2,
      purpose: 'Claudia Store',
      category: 'Accessories',
      date: 'Today',
      time: '12h ago',
      amount: 'CFA 1000',
      type: 'Transfer',
      status: 'Done'
    },
    {
      id: 3,
      purpose: 'Chidi Barber',
      category: 'Barber Shop',
      date: 'Today',
      time: '1h ago',
      amount: 'CFA 500',
      type: 'QR Code',
      status: 'Done'
    }
  ]);

  const sidebarItems = [
    { id: 'affiliate', label: t('affiliate.program'), icon: Users },
    { id: 'o-secours', label: t('nav.services.osecours'), icon: HeartHandshake },
    { id: 'online-store', label: t('nav.services.shop'), icon: Store },
    { id: 'job-center', label: t('nav.services.jobs'), icon: Briefcase },
    { id: 'payments', label: 'Payments History', icon: CreditCard },
    { id: 'subscriptions', label: 'Subscriptions', icon: Crown },
    { id: 'settings', label: t('nav.settings') || 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const spendingLimit = {
    current: 2250,
    limit: 4500,
    percentage: 50
  };

  const cardInfo = {
    number: '123-456-7890',
    status: 'Active',
    bank: 'Fauget Bank',
    balance: 'CFA 4,500.00'
  };

  const membershipTier = membership?.tier || 'elite';
  // Determine which types to display: at most 2 (child + one adult with priority elite > premium > essential)
  const displayedTypes: Array<'essential' | 'premium' | 'elite' | 'child'> = (() => {
    if (!cardTypes || cardTypes.length === 0) return [];
    const set = new Set(cardTypes);
    const out: Array<'essential' | 'premium' | 'elite' | 'child'> = [];
    if (set.has('child')) out.push('child');
    const adultPriority: Array<'elite' | 'premium' | 'essential'> = ['elite', 'premium', 'essential'];
    const adult = adultPriority.find((t) => set.has(t));
    if (adult) out.push(adult);
    return out;
  })();

  // Build header label from displayed types or fall back to membership tier
  const headerTierLabel = (displayedTypes.length > 0
    ? displayedTypes
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
        .join(' & ')
    : membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)) + ' Client';

  const badgeStyles: Record<'essential' | 'premium' | 'elite' | 'child', string> = {
    essential: 'bg-gray-100 text-gray-800 border border-gray-200',
    premium: 'bg-blue-100 text-blue-800 border border-blue-200',
    elite: 'bg-purple-100 text-purple-800 border border-purple-200',
    child: 'bg-pink-100 text-pink-800 border border-pink-200',
  };
  // Robust fallback: profile full_name -> auth user fullName -> email username -> 'User'
  const memberName = (profile?.full_name && profile.full_name.trim())
    || (user?.fullName && user.fullName.trim())
    || (user?.email ? user.email.split('@')[0] : '')
    || 'User';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'job-center':
        return <JobCenterSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'affiliate':
        return <AffiliateSection />;
      case 'o-secours':
        return <OSecoursSection />;
      case 'online-store':
        return <OnlineStoreSection />;
      case 'account':
        return <AccountSection />;
      case 'subscriptions':
        return <SubscriptionsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'help':
        return <HelpSection />;
      case 'dashboard':
      default:
        return (
          <>
            <AccountSection />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Link to="/" className="flex items-center">
                  <img
                    src={"/lovable-uploads/logo.png"}
                    alt="Elverra Global"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg">ELVERRA GLOBAL</h2>
              <p className="text-blue-200 text-sm">Client Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="flex gap-3 p-4 border-t border-blue-500">
          <button
            onClick={() => setActiveSection("account")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === "account"
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            }`}
          >
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">{t('nav.account')}</span>
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center px-4 py-3 text-blue-100 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img 
                  src={profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=3b82f6&color=ffffff`}
                  alt={memberName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{memberName}</h1>
                {displayedTypes.length > 1 ? (
                  <div className="flex items-center gap-2 mt-1">
                    {displayedTypes.map((t) => (
                      <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${badgeStyles[t]}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    ))}
                    <span className="text-xs text-gray-500">Client</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{headerTierLabel}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;