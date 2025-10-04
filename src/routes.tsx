

import Home from '@/pages/Index';
import About from '@/pages/About';
import Contact from '@/pages/about/Contact';
import Terms from '@/pages/about/Terms';
import Privacy from '@/pages/about/Privacy';
import Cookies from '@/pages/about/Cookies';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import ThankYou from '@/pages/ThankYou';
import ClientPayment from '@/pages/ClientPayment';
import ClientSubscription from '@/pages/ClientSubscription';
import Dashboard from '@/pages/Dashboard';
import AffiliateDashboard from '@/pages/AffiliateDashboard';
import PostJob from '@/pages/PostJob';
import Debug from '@/pages/Debug';
import Jobs from '@/pages/Jobs';
import JobCenter from '@/pages/JobCenter';
import JobDetail from '@/pages/JobDetail';
import DiscountManagement from '@/pages/admin/DiscountManagement';
import SecoursAdmin from '@/pages/admin/SecoursAdmin';
import AdminDashboard from '@/pages/admin/Dashboard';
import AffiliateManagement from '@/pages/admin/AffiliateManagement';
import JobManagement from '@/pages/admin/JobManagement';
import ProjectsManagement from '@/pages/admin/ProjectsManagement';
import PaymentManagement from '@/pages/admin/PaymentManagement';
import SuperAdminCareerJobsManagement from '@/pages/superadmin/CareerJobsManagement';
import SuperAdminEventsManagement from '@/pages/superadmin/EventsManagement';
import SuperAdminDiscountManagement from '@/pages/superadmin/DiscountManagement';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';
import FAQ from '@/pages/FAQ';
import SecoursMyAccount from '@/pages/SecoursMyAccount';
import Competitions from '@/pages/Competitions';
import Affiliates from '@/pages/Affiliates';
import AffiliateProgram from '@/pages/AffiliateProgram';
import AffiliateMembers from '@/pages/affiliates/Members';
import AffiliateMerchants from '@/pages/affiliates/Merchants';
import AffiliateDistributors from '@/pages/affiliates/Distributors';
import Team from '@/pages/Team';
import MyAccount from '@/pages/MyAccount';
import NewsDetail from '@/pages/NewsDetail';
import ProjectSubmission from '@/pages/ProjectSubmission';

// About pages
import Partners from '@/pages/about/Partners';
import News from '@/pages/about/News'; 
import ChangingLives from '@/pages/about/ChangingLives';
import Projects from '@/pages/about/Projects';
import Mission from '@/pages/about/Mission';
import AssociationMembers from '@/pages/about/AssociationMembers';
import ProjectDetail from '@/pages/projects/ProjectDetail';
import PartnerDetail from '@/pages/partners/PartnerDetail';

import Cards from '@/pages/Cards';
import ActivateCard from '@/pages/ActivateCard';
import Shop from '@/pages/Shop';
import PublicShop from '@/pages/PublicShop';
import PublicJobs from '@/pages/jobs/PublicJobs';
import PublicAffiliates from '@/pages/affiliates/PublicAffiliates';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Wishlist from '@/pages/Wishlist';
import ShopManagement from '@/pages/admin/ShopManagement';
import UserManagementPage from '@/pages/superadmin/user-management';
import ProjectRequests from '@/pages/ProjectRequests';
import MerchantApprovals from '@/pages/admin/MerchantApprovals';
import AccessLawyer from '@/pages/AccessLawyer';
import RegistrationThankYou from '@/pages/RegistrationThankYou';
import EBooks from '@/pages/EBooks';
import EbookManagement from '@/pages/admin/EbookManagement';
import PaymentStatus from './pages/PaymentStatus';
import PaydayAdvance from './pages/services/PaydayAdvance';
import OnlineStore from './pages/services/OnlineStore';
import SchoolFees from './pages/services/secours/SchoolFees';
import MotorbikesSupport from './pages/services/secours/MotorbikesSupport';
import MobilePhones from './pages/services/secours/MobilePhones';
import AutoServices from './pages/services/secours/AutoServices';
import FirstAid from './pages/services/secours/FirstAid';
import CataCatani from './pages/services/secours/CataCatani';
import OSecoursPage from './pages/services/OSecoursPage';
import PaydayAdvancePage from './pages/services/PaydayAdvancePage';
import PaydayLoan from './pages/services/PaydayLoan';
import HirePurchase from './pages/services/HirePurchase';
import CreditSystem from './pages/services/CreditSystem';
import CreditAccount from './pages/services/CreditAccount';
import Services from './pages/services';
import Discounts from './pages/Discounts';
import DiscountDetail from './pages/DiscountDetail';
import TestPage from './pages/TestPage';
import ShopDetail from './pages/ShopDetail';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import PartnersManagement from './pages/superadmin/PartnersManagement';
import PaymentGatewayManagement from './pages/superadmin/PaymentGatewayManagement';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import PartnerDashboard from './pages/partners/Dashboard';
import Career from './pages/Career';
import CareerJobDetail from './pages/CareerJobDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import CareerJobsManagement from './pages/admin/CareerJobsManagement';
import EventsManagement from './pages/admin/EventsManagement';
import PhysicalCardRequests from './pages/admin/PhysicalCardRequests';
import SuperAdminPhysicalCardManagement from './pages/superadmin/PhysicalCardManagement';
import OSecours from './pages/services/OSecours';
import NewsManagement from './pages/superadmin/NewsManagement';
import ContactManagement from './pages/superadmin/ContactManagement';
import ContactDetail from './pages/superadmin/ContactDetail';

// Add the new route to the existing routes array
const routes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/test',
    element: <TestPage />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/about/contact',
    element: <Contact />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/about/partners',
    element: <Partners />,
  },
  {
    path: '/about/news',
    element: <News />,
  },
  {
    path: '/about/changing-lives',
    element: <ChangingLives />,
  },
  {
    path: '/about/projects',
    element: <Projects />,
  },
  {
    path: '/about/mission',
    element: <Mission />,
  },
  {
    path: '/about/association-members',
    element: <AssociationMembers />,
  },
  {
    path: '/projects/:id',
    element: <ProjectDetail />,
  },
  {
    path: '/partners/:id',
    element: <PartnerDetail />,
  },
  {
    path: '/news/:slug',
    element: <NewsDetail />,
  },
  {
    path: '/team',
    element: <Team />,
  },
  {
    path: '/my-account',
    element: <MyAccount />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/services',
    element: <Services />,
  },
  {
    path: '/services/o-secours',
    element: <OSecours />,
  },
  {
    path: '/services/credit-account',
    element: <CreditAccount />,
  },
  {
    path: '/services/credit-system',
    element: <CreditSystem />,
  },
  {
    path: '/services/hire-purchase',
    element: <HirePurchase />,
  },
  {
    path: '/services/payday-loan',
    element: <PaydayLoan />,
  },
  {
    path: '/client-payment',
    element: <ClientPayment />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['USER']}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/affiliate-dashboard',
    element: <AffiliateDashboard />,
  },
  {
    path: '/debug',
    element: <Debug />,
  },
  {
    path: '/cards',
    element: <Cards />,
  },
  {
    path: '/activate-card',
    element: <ActivateCard />,
  },
  {
    path: '/jobs',
    element: <Jobs />,
  },
  {
    path: '/jobs/:id',
    element: <JobDetail />,
  },
  {
    path: '/job-center',
    element: <JobCenter />,
  },
  {
    path: '/post-job',
    element: <PostJob />,
  },
  {
    path: '/discounts',
    element: <Discounts />,
  },
  {
    path: '/discounts/:id',
    element: <DiscountDetail />,
  },
  {
    path: '/competitions',
    element: <Competitions />,
  },
  {
    path: '/affiliates',
    element: <Affiliates />,
  },
  {
    path: '/affiliate-program',
    element: <AffiliateProgram />,
  },
  {
    path: '/affiliates/members',
    element: <AffiliateMembers />,
  },
  {
    path: '/affiliates/merchants',
    element: <AffiliateMerchants />,
  },
  {
    path: '/affiliates/distributors',
    element: <AffiliateDistributors />,
  },
  {
    path: '/services/payday-advance',
    element: <PaydayAdvance />,
  },
  {
    path: '/services/online-store',
    element: <OnlineStore />,
  },
  {
    path: '/shop',
    element: <PublicShop />,
  },
  {
    path: '/shop/:slug',
    element: <ShopDetail />,
  },
  {
    path: '/dashboard/shop',
    element: <Shop />,
  },
  {
    path: '/public/jobs',
    element: <PublicJobs />,
  },
  {
    path: '/public/affiliates',
    element: <PublicAffiliates />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/wishlist',
    element: <Wishlist />,
  },
  {
    path: '/services/secours/school-fees',
    element: <SchoolFees />,
  },
  {
    path: '/services/secours/motorbikes',
    element: <MotorbikesSupport />,
  },
  {
    path: '/services/secours/mobile-phones',
    element: <MobilePhones />,
  },
  {
    path: '/services/secours/auto-services',
    element: <AutoServices />,
  },
  {
    path: '/services/secours/first-aid',
    element: <FirstAid />,
  },
  {
    path: '/services/secours/cata-catani',
    element: <CataCatani />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  
  {
    path: '/admin/discount-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <DiscountManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/secours',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SecoursAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/secours',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <SecoursAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/agent-panel',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <AffiliateManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/jobs',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <JobManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/partners-management',
    element: <PartnersManagement />,
  },
  {
    path: '/admin/projects-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT']}>
        <ProjectsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/contact',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN', 'SUPPORT']}>
        <ContactManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/contact/:id',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN', 'SUPPORT']}>
        <ContactDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/dashboard',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/secours/my-account',
    element: <SecoursMyAccount />,
  },
  {
    path: '/services/o-secours-info',
    element: <OSecoursPage />,
  },
  {
    path: '/services/payday-advance-info', 
    element: <PaydayAdvancePage />,
  },
  {
    path: '/project-requests',
    element: <ProjectRequests />,
  },
  {
    path: '/project-submission',
    element: <ProjectSubmission />,
  },
  {
    path: '/faq',
    element: <FAQ />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/client-payment',
    element: <ClientPayment />,
  },
  {
    path: '/thank-you',
    element: <ThankYou />,
  },
  {
    path: '/admin/payments',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <PaymentManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/shop-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <ShopManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/user-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <UserManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cookies',
    element: <Cookies />,
  },
  {
    path: '/superadmin/payment-gateways',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <PaymentGatewayManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/merchant-approvals',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <MerchantApprovals />
      </ProtectedRoute>
    ),
  },
  {
    path: '/partners/dashbord',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['PARTNER']}>
        <PartnerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/access-lawyer',
    element: <AccessLawyer />,
  },
  {
    path: '/registration/thank-you',
    element: <RegistrationThankYou />,
  },
  {
    path: '/ebooks',
    element: <EBooks />,
  },
  {
    path: '/admin/ebook-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <EbookManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client-subscription',
    element: <ClientSubscription />,
  },
  {
    path: '/membership/payment',
    element: <Navigate to="/client-payment" replace />,
  },
  {
    path: '/membership/selection',
    element: <Navigate to="/client-subscription" replace />,
  },
  {
    path: '/payment-status',
    element: <PaymentStatus />,
  },
  {
    path: '/career',
    element: <Career />,
  },
  {
    path: '/career/:id',
    element: <CareerJobDetail />,
  },
  {
    path: '/events',
    element: <Events />,
  },
  {
    path: '/events/:id',
    element: <EventDetail />,
  },
  {
    path: '/admin/career-jobs',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <CareerJobsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/events-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <EventsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/career-jobs',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminCareerJobsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/events-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminEventsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/discount-management',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminDiscountManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/news',
    element: (
      <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN']}>
        <NewsManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/physical-cards',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPPORT', 'SUPERADMIN']}>
        <PhysicalCardRequests />
      </ProtectedRoute>
    ),
  },
  {
    path: '/superadmin/physical-cards',
    element: (
      <ProtectedRoute requireAuth={true} allowedRoles={['SUPERADMIN']}>
        <SuperAdminPhysicalCardManagement />
      </ProtectedRoute>
    ),
  },
  // Payment callback routes
  {
    path: '/payment/success',
    element: <PaymentSuccess />,
  },
  {
    path: '/payment/cancel',
    element: <PaymentCancel />,
  },
];

export default routes;
