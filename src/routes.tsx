

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
import MembershipPayment from '@/pages/MembershipPayment';
import Dashboard from '@/pages/Dashboard';
import JobDashboardEmployee from '@/pages/job-dashboard/EmployeeDashboard';
import JobDashboardEmployer from '@/pages/job-dashboard/EmployerDashboard';
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
import CmsManagement from '@/pages/admin/CmsManagement';
import JobManagement from '@/pages/admin/JobManagement';
import PartnersManagement from '@/pages/admin/PartnersManagement';
import ProjectsManagement from '@/pages/admin/ProjectsManagement';
import PaymentManagement from '@/pages/admin/PaymentManagement';
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
import UserManagement from '@/pages/admin/UserManagement';
import ProjectRequests from '@/pages/ProjectRequests';
import PaymentGatewayManagement from '@/pages/admin/PaymentGatewayManagement';
import MerchantApprovals from '@/pages/admin/MerchantApprovals';
import AccessLawyer from '@/pages/AccessLawyer';
import RegistrationThankYou from '@/pages/RegistrationThankYou';
import EBooks from '@/pages/EBooks';
import MembershipSelection from '@/pages/MembershipSelection';
import PaymentStatus from '@/pages/PaymentStatus';
import OSecours from './components/tokens/OSecours';
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
import TestPage from './pages/TestPage';

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
    path: '/news/:id',
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
    path: '/membership-payment',
    element: <MembershipPayment />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/job-dashboard/employee',
    element: <JobDashboardEmployee />,
  },
  {
    path: '/job-dashboard/employer',
    element: <JobDashboardEmployer />,
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
    path: '/services/o-secours',
    element: <OSecours />,
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
    element: <AdminDashboard />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/discount-management',
    element: <DiscountManagement />,
  },
  {
    path: '/admin/secours',
    element: <SecoursAdmin />,
  },
  {
    path: '/admin/agent-panel',
    element: <AffiliateManagement />,
  },
  {
    path: '/admin/cms',
    element: <CmsManagement />,
  },
  {
    path: '/admin/jobs',
    element: <JobManagement />,
  },
  {
    path: '/admin/partners-management',
    element: <PartnersManagement />,
  },
  {
    path: '/admin/projects-management',
    element: <ProjectsManagement />,
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
    path: '/membership/payment',
    element: <MembershipPayment />,
  },
  {
    path: '/thank-you',
    element: <ThankYou />,
  },
  {
    path: '/admin/payments',
    element: <PaymentManagement />,
  },
  {
    path: '/admin/shop-management',
    element: <ShopManagement />,
  },
  {
    path: '/admin/user-management',
    element: <UserManagement />,
  },
  {
    path: '/cookies',
    element: <Cookies />,
  },
  {
    path: '/admin/payment-gateways',
    element: <PaymentGatewayManagement />,
  },
  {
    path: '/admin/merchant-approvals',
    element: <MerchantApprovals />,
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
    path: '/membership/selection',
    element: <MembershipSelection />,
  },
  {
    path: '/payment-status',
    element: <PaymentStatus />,
  },
];

export default routes;
