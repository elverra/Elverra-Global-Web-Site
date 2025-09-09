import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMembership } from '@/hooks/useMembership';
import { useLanguage } from '@/contexts/LanguageContext';
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
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'payments', label: 'Payments History', icon: CreditCard },
    { id: 'job-center', label: t('nav.services.jobs'), icon: Briefcase },
    { id: 'affiliate', label: t('affiliate.program'), icon: Users },
    { id: 'o-secours', label: t('nav.services.osecours'), icon: HeartHandshake },
    { id: 'online-store', label: t('nav.services.shop'), icon: Store },
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
  const memberName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    await signOut();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'payments':
        return <PaymentsSection />;
      case 'job-center':
        return <JobCenterSection />;
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.dashboard')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Transactions */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg font-bold">{t('dashboard.transactions')}</CardTitle>
                        <p className="text-sm text-gray-600">Sort by Recently ↓</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                          <Printer className="h-4 w-4 mr-2" />
                          {t('dashboard.print')}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-2" />
                          {t('dashboard.share')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-blue-500 text-white">
                          <tr>
                            <th className="text-left py-3 px-4 rounded-l-lg">Purpose</th>
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4 rounded-r-lg">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-100">
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium">{transaction.purpose}</div>
                                  <div className="text-sm text-gray-500">{transaction.category}</div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium">{transaction.date}</div>
                                  <div className="text-sm text-gray-500">{transaction.time}</div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <div className="font-medium">{transaction.amount}</div>
                                  <div className="text-sm text-gray-500">{transaction.type}</div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  ✓ {transaction.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 text-center">
                      <Button variant="ghost" className="text-blue-600">
                        Show All My Transactions
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Spending Limits */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Spending Limits</h3>
                      <span className="text-sm text-gray-500">Daily Transaction Limit</span>
                    </div>
                    <div className="mb-2">
                      <Progress value={spendingLimit.percentage} className="h-3" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{spendingLimit.percentage}%</span>
                      <span>
                        CFA {spendingLimit.current.toLocaleString()} spent of CFA {spendingLimit.limit.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Active Card Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Card Details</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-5 w-5 text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Card</DropdownMenuItem>
                          <DropdownMenuItem>Freeze Card</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm">Elite Card</span>
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-white bg-opacity-40 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold">{memberName}</h3>
                        <p className="text-blue-100">{cardInfo.number}</p>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="block text-blue-100">****</span>
                          <span>{cardInfo.number.slice(-4)}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-blue-100">April 2028</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        History
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Top-Up
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Card Info</CardTitle>
                      <Button variant="ghost" size="sm">
                        See Details ▼
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Card Number:</span>
                        <span className="font-medium">{cardInfo.number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">{cardInfo.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank:</span>
                        <span className="font-medium">{cardInfo.bank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-medium">{cardInfo.balance}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Card Info</span>
                        <Badge className="bg-orange-100 text-orange-800">🏆 Premium Gold Card</Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          CFA 10000
                        </div>
                        <div className="text-sm text-gray-500 mb-3">Premium</div>
                        <div className="text-sm text-gray-500 mb-3">Gold Card</div>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          Upgrade Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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