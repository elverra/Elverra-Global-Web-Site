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

const ModernDashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { membership } = useMembership();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('dashboard');

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
  // Robust fallback: profile full_name -> auth user fullName -> email username -> 'User'
  const memberName = (profile?.full_name && profile.full_name.trim())
    || (user?.fullName && user.fullName.trim())
    || (user?.email ? user.email.split('@')[0] : '')
    || 'User';

  const handleSignOut = async () => {
    null;
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
                <span className="text-white font-bold text-sm">
                   <Link to="/" className="flex items-center">
                <img
              src={"/lovable-uploads/logo.png"}
              alt="Elverra Global"
              className="h-10 w-auto object-contain"
              
            />
            </Link>
                </span>
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
            className=" flex items-center space-x-3 px-4 py-3 text-blue-100 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
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
                <p className="text-sm text-gray-600">
                  {membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)} Member
                </p>
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