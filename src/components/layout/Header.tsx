import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  Users,
  Briefcase,
  Heart,
  Globe,
  Shield,
  CreditCard,
  BookOpen,
  Zap,
  ShoppingCart,
  Home,
  Phone,
  Info,
  FileText,
  HelpCircle,
  Star,
  Target,
  TrendingUp,
  Award,
  Handshake,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  SortAsc,
  Eye,
  Download,
  Share2,
  Bookmark,
  MessageCircle,
  ThumbsUp,
  Flag,
  Edit,
  Trash2,
  Send,
  Upload,
  Image,
  Video,
  Music,
  File,
  Code,
  Database,
  Server,
  Cloud,
  Lock,
  Unlock,
  Key,
  Wifi,
  Battery,
  Signal,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Speaker,
  Printer,
  Keyboard,
  Mouse,
  Gamepad2,
  Joystick,
  Cpu,
  HardDrive,
  MemoryStick,
  Usb,
  Bluetooth,
  Wifi as WifiIcon,
  Radio,
  Tv,
  Film,
  Camera as CameraIcon,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Volume2 as VolumeIcon,
  VolumeX as VolumeOffIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  SkipBack as PreviousIcon,
  SkipForward as NextIcon,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountrySelector from "./CountrySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

// Global logo caching variables were removed as they were unused

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoUrl] = useState<string>("/lovable-uploads/logo.png");
  const { user, signOut, userRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  // Role flags (no membership/card verification here for now)
  const isSuperAdmin = userRole === 'SUPERADMIN';
  const isSupport = userRole === 'SUPPORT';
  const isPartner = userRole === 'PARTNER';
  // Treat a user as a regular user only when the role is explicitly 'USER'.
  // This avoids showing regular-user items while the role is still loading (userRole === null).
  const isRegularUser = !!user && userRole === 'USER';

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logoUrl}
              alt="Elverra Global"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/lovable-uploads/logo.png";
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              {t("nav.home")}
            </Link>

            {/* About Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                  style={{ fontSize: "15px" }}
                >
                  {t("nav.about")}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white border shadow-lg"
              >
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center">
                    {t("nav.about.us")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/about/contact">{t("nav.about.contact")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about/projects">{t("nav.about.projects")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about/partners">{t("nav.about.partners")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about/news">{t("nav.about.news")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/team">{t("nav.about.team")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about/changing-lives">
                    {t("nav.about.empowerment")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/terms">{t("nav.terms")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/privacy">Privacy Policy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                  style={{ fontSize: "15px" }}
                >
                  Services
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 bg-white border shadow-lg"
              >
                <DropdownMenuItem asChild>
                  <Link to="/services">All Services</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/services/o-secours">Ô Secours</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/services/credit-system">Credit System</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/services/hire-purchase">Hire Purchase</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/services/payday-advance">Payday Advance</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop">Online Store</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ebooks" className="flex items-center">
                    {t("nav.services.ebooks")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/job-center" className="flex items-center">
                    Jobs Center
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Shop Menu Item */}
            <Link
              to="/shop"
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              {/* Shop */}
            </Link>

            {/* Career Link */}
            <Link
              to="/career"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              Career
            </Link>

            {/* Our Affiliates Dropdown */}
            <Link
              to="/affiliate-program"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Affiliate Program
            </Link>

            <Link
              to="/discounts"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              Discounts
            </Link>

            <Link
              to="/project-requests"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              Projects
            </Link>

            <Link
              to="/events"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
              style={{ fontSize: "15px" }}
            >
              Events
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            <CountrySelector />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {isSuperAdmin ? 'Super Admin' : isSupport ? 'Support' : isPartner ? 'Partner' : t("nav.account")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border shadow-lg"
                >
                  {/* Super Admin */}
                  {isSuperAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/superadmin" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Super Administration
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Support */}
                  {isSupport && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Partner */}
                  {isPartner && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          {t("nav.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/partner" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Partner
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Regular user */}
                  {isRegularUser && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          {t("nav.dashboard")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.signout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Link to="/register">{t("nav.register")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={toggleMenu}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                onClick={toggleMenu}
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/about/contact"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                {t("nav.about.contact")}
              </Link>
              <Link
                to="/about/projects"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                {t("nav.about.projects")}
              </Link>
              <Link
                to="/about/partners"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                {t("nav.about.partners")}
              </Link>
              <Link
                to="/about/news"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                {t("nav.about.news")}
              </Link>
              <Link
                to="/services"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                {t("nav.services")}
              </Link>
              <Link
                to="/services/o-secours"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                Ô Secours
              </Link>
              <Link
                to="/shop"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                Shop
              </Link>
              <Link
                to="/ebooks"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2 pl-6"
                onClick={toggleMenu}
              >
                E-Books
              </Link>
              <Link
                to="/career"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                Career 
              </Link>
            
           
              <Link
                to="/affiliate-program"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                Affiliate
              </Link>
          
              <Link
                to="/discounts"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                Discounts
              </Link>
              <Link
                to="/events"
                className="text-gray-600 hover:text-purple-600 transition-colors font-medium px-2"
                style={{ fontSize: "15px" }}
                onClick={toggleMenu}
              >
                Events
              </Link>

              {!user && (
                <div className="flex flex-col space-y-2 px-2 pt-4 border-t">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login" onClick={toggleMenu}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Link to="/register" onClick={toggleMenu}>
                      Join Now
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
