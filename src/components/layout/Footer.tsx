import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { TikTokFilled, TikTokOutlined } from "@ant-design/icons";

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState<string>(
    "/lovable-uploads/logo.png",
  );

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Try to get the uploaded logo from club66 storage bucket
        const mockResult = { data: [], error: null }; // TODO: Replace with API call
        const { data: logoData, error: listError } = mockResult;

        if (listError) {
          console.log("Storage bucket not accessible, using default logo");
          return;
        }

        // Look for logo files (png, jpg, jpeg)
        const logoFile = logoData?.find(
          (file: any) =>
            file.name.toLowerCase().startsWith("logo.") &&
            ["png", "jpg", "jpeg", "webp"].includes(
              file.name.toLowerCase().split(".").pop() || "",
            ),
        );

        if (logoFile) {
          const mockUrlResult = {
            data: { publicUrl: "/lovable-uploads/logo.png" },
          }; // TODO: Replace with API call
          const { data: urlData } = mockUrlResult;

          if (urlData?.publicUrl) {
            setLogoUrl(urlData.publicUrl);
          }
        }
      } catch (error) {
        console.log("Error fetching logo, using default:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img
                src={logoUrl}
                alt="Elverra Global"
                className="h-8 w-auto object-contain"
                onError={() =>
                  setLogoUrl("/lovable-uploads/logo.png")
                }
              />
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              Empowering communities across our client network with exclusive
              client benefits, discounts, and opportunities for growth and
              prosperity.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300"> 
                <Phone className="h-4 w-4" />
                <span>+223 44 94 38 44</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span>info@elverraglobalml.com </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>Faladiè-Sema, Carrefour IJA, Rue 801, Bamako, MALI</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Home
                </Link>
              </li>
             
              <li>
                <Link
                  to="/services"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Products & Services
                </Link>
              </li>
              <li>
                <Link
                  to="/discounts"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Discounts
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/job-center"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Job Center
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Competitions
                </Link>
              </li>
              <li>
                <Link
                  to="/affiliate-program"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  Affiliates
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-club66-gold text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/about/contact"
                  className="text-gray-300 hover:text-elverra-gold text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-300 hover:text-elverra-gold text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-300 hover:text-elverra-gold text-sm"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/access-lawyer"
                  className="text-gray-300 hover:text-elverra-gold text-sm"
                  data-testid="link-access-lawyer"
                >
                  Access a Lawyer
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Subscribe to our newsletter for the latest offers and updates.
            </p>
            <form className="mb-4">
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="rounded-l-md px-4 py-2 w-full focus:outline-none text-gray-900 text-sm"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-club66-darkpurple text-white rounded-r-md px-4 py-2 text-sm"
                >
                  Subscribe
                </button>
              </div>
            </form>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.facebook.com/share/14NL12waTbr/" className="text-gray-300 hover:text-club66-gold">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/in/elverra-global-ml-sas-b85894382?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="text-gray-300 hover:text-club66-gold">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/elverrag/?utm_source=qr&r=nametag" className="text-gray-300 hover:text-club66-gold">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@zenika902?_t=ZM-8zzpIUDCbNr&_r=1" className="text-gray-300 hover:text-club66-gold">
                <TikTokOutlined className="h-5 w-8" />
              </a>
            
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Elverra Global. All rights
              reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6">
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Terms
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
