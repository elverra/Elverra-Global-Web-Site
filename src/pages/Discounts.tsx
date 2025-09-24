import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Store, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import MembershipGuard from "@/components/auth/MembershipGuard";

const Discounts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [featuredDiscounts, setFeaturedDiscounts] = useState<any[]>([]);
  const [allDiscounts, setAllDiscounts] = useState<any[]>([]);
  const [discountSectors, setDiscountSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data from Supabase (public)
  useEffect(() => {
    const fetchDiscountData = async () => {
      try {
        setLoading(true);
        // Sectors
        const { data: sectorsData, error: sectorsErr } = await supabase
          .from("discount_sectors")
          .select("id,name,description,is_active")
          .eq("is_active", true)
          .order("name");
        if (sectorsErr) throw sectorsErr;
        const sectors = sectorsData || [];
        setDiscountSectors(sectors);
        const sectorMap = new Map<string, string>(sectors.map((s: any) => [String(s.id), s.name]));

        // Featured merchants
        const { data: featuredData, error: featErr } = await supabase
          .from("discount_merchants")
          .select("id,name,merchant:name,discount_percentage,location,description,website,logo_url,cover_image_url,is_featured,is_active,sector_id")
          .eq("is_featured", true)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (featErr) throw featErr;
        // Normalize for UI where needed
        setFeaturedDiscounts(
          (featuredData || []).map((m: any) => ({
            id: m.id,
            title: m.name,
            merchant: m.name,
            sector_id: m.sector_id,
            sector: sectorMap.get(String(m.sector_id)) || undefined,
            discount_percentage: m.discount_percentage,
            location: m.location,
            description: m.description,
            image_url: m.cover_image_url || m.logo_url,
            rating: m.rating,
          }))
        );

        // All merchants
        const { data: merchantsData, error: merchErr } = await supabase
          .from("discount_merchants")
          .select("id,name,merchant:name,discount_percentage,location,description,website,logo_url,cover_image_url,is_featured,is_active,sector_id")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (merchErr) throw merchErr;
        setAllDiscounts(
          (merchantsData || []).map((m: any) => ({
            id: m.id,
            title: m.name,
            merchant: m.name,
            sector_id: m.sector_id,
            sector: sectorMap.get(String(m.sector_id)) || undefined,
            discount_percentage: m.discount_percentage,
            location: m.location,
            description: m.description,
            image_url: m.cover_image_url || m.logo_url,
            rating: m.rating,
          }))
        );
      } catch (error: any) {
        console.error("Error fetching discount data:", error);
        const raw = (error?.message || "").toString().toLowerCase();
        const friendly = raw.includes("permission denied") || raw.includes("rls") || raw.includes("policy") || raw.includes("403")
          ? "Unable to load discounts at this time"
          : (error.message || "Failed to load discount data");
        toast.error(friendly);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscountData();
  }, []);

  

  const handleSearch = async () => {
    try {
      const base = [...allDiscounts];
      const filtered = base.filter((d) => {
        // Filtre par recherche
        const matchesSearch = !searchTerm ||
          d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.location?.toLowerCase().includes(searchTerm.toLowerCase());
  
        // Filtre par secteur
        const matchesSector = sectorFilter === "all" || 
                            String(d.sector_id) === sectorFilter || 
                            d.sector?.toLowerCase() === sectorFilter.toLowerCase();
  
        // Filtre par localisation
        const locationParts = d.location?.split(',').map((part: string) => part.trim()) || [];
        const city = locationParts.length > 0 ? locationParts[locationParts.length - 1] : '';
        const matchesLocation = locationFilter === "all" || 
                              city.toLowerCase() === locationFilter.toLowerCase();
  
        return matchesSearch && matchesSector && matchesLocation;
      });
      
      setAllDiscounts(filtered);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Error during search");
    }
  };
 
  useEffect(() => {
    handleSearch();
  }, [sectorFilter, locationFilter]);

  if (loading) {
    return (
      <Layout>
        <PremiumBanner
          title="Client Discounts"
          description="Unlock exclusive savings across our client network with Elverra Global client benefits"
          backgroundImage="/3.jpeg"
        />
        <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-gray-600">Loading discounts...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const discountStats = {
    totalDiscounts: allDiscounts.length,
    featuredCount: featuredDiscounts.length,
    sectorsCount: discountSectors.length,
    avgDiscount:
      Math.round(
        allDiscounts.reduce((sum, d) => sum + d.discount_percentage, 0) /
          allDiscounts.length,
      ) || 0,
    clients: "50K+",
  };

  return (
    <MembershipGuard requiredFeature="discounts">
    <Layout>
      <PremiumBanner
        title="Client Discounts"
        description="Unlock exclusive savings across our client network with Elverra Global client benefits"
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search and Filter Section */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search merchants..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {discountSectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.name}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {Array.from(
                        new Set(
                          allDiscounts.map((d) =>
                            d.location.split(",").pop()?.trim(),
                          ),
                        ),
                      ).map((location) => (
                        <SelectItem key={location} value={location || ""}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {discountStats.totalDiscounts}+
                </div>
                <div className="text-gray-600">Total Discounts</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {discountStats.sectorsCount}
                </div>
                <div className="text-gray-600">Discount Sectors</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {discountStats.avgDiscount}%
                </div>
                <div className="text-gray-600">Average Savings</div>
              </Card>
              <Card className="text-center p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {discountStats.clients}
                </div>
                <div className="text-gray-600">Happy Clients</div>
              </Card>
            </div>


          

            {/* All Discounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                All Discounts
              </h2>
              {allDiscounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {allDiscounts.map((discount) => (
                    <Card
                      key={discount.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <img
                          src={
                            discount.image_url ||
                            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                          }
                          alt={discount.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500 text-white px-2 py-1">
                            {discount.discount_percentage}%
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-md mb-1">
                          {discount.title}
                        </h3>
                        <p className="text-xs text-gray-700 font-medium mb-1">
                          {discount.merchant}
                        </p>
                        <Badge variant="outline" className="text-xs mb-2">
                          {discount.sector}
                        </Badge>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {discount.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          {discount.location}
                        </div>
                        {discount.rating && (
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                            {discount.rating}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={(e) => { e.stopPropagation(); navigate(`/discounts/${discount.id}`); }}
                        >
                          View details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No discounts found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Start Saving Today!</h2>
                <p className="text-xl mb-8 opacity-90">
                  Join millions of Elverra Global clients and unlock exclusive
                  discounts across our client network
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => user ? navigate("/dashboard") : navigate("/register")}
                  data-testid="button-become-member"
                >
                  Become a Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
    </MembershipGuard>
  );
};

export default Discounts;
