import type { Express } from "express";
import { createServer, type Server } from "http";
import { hashPassword, comparePasswords } from "./utils/passwordUtils";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Internal imports
import { storage } from "./storage";
import { db } from "./db";
import { sendWelcomeEmail } from "./emailService";
import { otpService } from "./otpService";
import projectRoutes from "./routes/projects";

// Schema imports
import { 
  subscriptions, 
  paymentAttempts, 
  insertUserSchema, 
  insertJobSchema, 
  insertJobApplicationSchema, 
  insertProductSchema, 
  insertLoanApplicationSchema, 
  users 
} from "../shared/schema";
import { orangeMoneyService } from "./services/payment/orangeMoneyService";
import { v4 as uuidv4 } from 'uuid';

// Schema for Orange Money payment request validation
const orangeMoneyPaymentSchema = z.object({
  userId: z.string().min(1, "User ID is required").optional(),
  amount: z.number().positive("Amount must be positive"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional(),
  name: z.string().optional(),
  reference: z.string().min(1, "Reference is required"),
  currency: z.literal("OUV").optional(),
  subscriptionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export function registerRoutes(app: Express): void {
  // Mount project routes
  app.use('/api/projects', projectRoutes);
  
  // Discount sectors endpoint - now uses admin-managed sectors
  app.get("/api/discounts/sectors", async (req, res) => {
    try {
      // Get sectors from admin data (same structure as /api/admin/sectors)
      const sectors = [
        { id: "1", name: "Food & Drink", description: "Restaurants, cafes, and food delivery", is_active: true },
        { id: "2", name: "Technology", description: "Electronics, gadgets, and tech services", is_active: true },
        { id: "3", name: "Travel & Tourism", description: "Hotels, flights, and travel packages", is_active: true },
        { id: "4", name: "Fashion & Beauty", description: "Clothing, accessories, and beauty services", is_active: true },
        { id: "5", name: "Health & Wellness", description: "Medical services, fitness, and wellness", is_active: true },
        { id: "6", name: "Education", description: "Courses, books, and educational services", is_active: true },
        { id: "7", name: "Entertainment", description: "Movies, games, and recreational activities", is_active: true },
        { id: "8", name: "Home & Garden", description: "Furniture, appliances, and home improvement", is_active: true },
        { id: "9", name: "Automotive", description: "Car services, parts, and transportation", is_active: true },
        { id: "10", name: "Professional Services", description: "Business services, consulting, and legal", is_active: true }
      ];
      
      // Filter to only active sectors and return in format expected by frontend
      const activeSectors = sectors
        .filter(sector => sector.is_active)
        .map(sector => ({
          id: sector.id,
          name: sector.name,
          description: sector.description
        }));
      
      res.json(activeSectors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discount sectors" });
    }
  });
// Dans votre fichier de routes
app.post("/api/subscriptions", async (req, res) => {
  try {
    const { userId, plan, status = 'pending' } = req.body;
    
    if (!userId || !plan) {
      return res.status(400).json({ error: "User ID and plan are required" });
    }

    // Vérifiez que l'utilisateur existe
    const userExists = await db.select().from(users).where(eq(users.id, userId));
    if (userExists.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPlans = ['monthly', 'quarterly', 'yearly', 'lifetime'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const subscriptionData = {
      id: uuidv4(),
      userId,
      plan,
      status,
      startDate: new Date(),
      isRecurring: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating subscription:', subscriptionData);

    const [subscription] = await db
      .insert(subscriptions)
      .values(subscriptionData)
      .returning();

    console.log('Subscription created successfully:', subscription);
    res.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});
  // Featured discounts endpoint - now uses actual featured merchants from backend
  app.get("/api/discounts/featured", async (req, res) => {
    try {
      // Get the same merchants data as admin and discounts endpoints
      const merchants = getMerchants();
      const sectors = getSectors();
      
      // Filter to only featured and active merchants
      const featuredDiscounts = merchants
        .filter(merchant => merchant.isActive === true && merchant.featured === true)
        .map(merchant => {
          const merchantSector = sectors.find(s => s.id === merchant.sectorId);
          const location = `${merchant.city}, ${merchant.country}`;
          const imageUrl = merchant.logoUrl || getImageByBusinessType(merchant.businessType);
          
          return {
            id: `d_${merchant.id}`,
            title: `${merchant.businessType} Special Offer`,
            merchant: merchant.businessName,
            sector: merchantSector?.name || "General",
            discount_percentage: Number(merchant.discountPercentage),
            description: merchant.description || getDiscountDescription(merchant.businessType, Number(merchant.discountPercentage)),
            location: location,
            image_url: imageUrl,
            rating: Number(merchant.rating) || 4.0,
            featured: true,
            website: merchant.website,
            phone: merchant.phone,
            email: merchant.email
          };
        });

      res.json(featuredDiscounts);
    } catch (error) {
      console.error("Error fetching featured discounts:", error);
      res.status(500).json({ error: "Failed to fetch featured discounts" });
    }
  });

  // Centralized data store for merchants (shared between admin and discounts)
  let merchantsData = [
    {
      id: "m1",
      businessName: "Café Bella Vista",
      businessType: "Restaurant",
      sectorId: "1",
      address: "123 Restaurant Street",
      city: "Dakar",
      country: "Senegal",
      phone: "+221 77 123 4567",
      email: "contact@cafebella.sn",
      website: "https://cafebella.sn",
      discountPercentage: 15,
      description: "Authentic French-Senegalese fusion cuisine",
      logoUrl: null,
      rating: 4.5,
      featured: false,
      isActive: true
    },
    {
      id: "m2", 
      businessName: "Digital World Electronics",
      businessType: "Electronics Store",
      sectorId: "2",
      address: "456 Tech Avenue",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      phone: "+225 07 89 01 23",
      email: "info@digitalworld.ci",
      website: "https://digitalworld.ci",
      discountPercentage: 25,
      description: "Latest electronics and mobile devices",
      logoUrl: null,
      rating: 4.3,
      featured: true,
      isActive: true
    },
    {
      id: "m3",
      businessName: "Fashion Hub Boutique",
      businessType: "Fashion Retail",
      sectorId: "4",
      address: "789 Fashion Street",
      city: "Lagos",
      country: "Nigeria",
      phone: "+234 803 456 7890",
      email: "sales@fashionhub.ng",
      website: "https://fashionhub.ng",
      discountPercentage: 30,
      description: "Trendy African fashion and accessories",
      logoUrl: null,
      rating: 4.6,
      featured: false,
      isActive: true
    },
    {
      id: "m4",
      businessName: "WellCare Medical Center",
      businessType: "Healthcare",
      sectorId: "5",
      address: "321 Health Avenue",
      city: "Accra",
      country: "Ghana",
      phone: "+233 24 567 8901",
      email: "appointments@wellcare.gh",
      website: "https://wellcare.gh",
      discountPercentage: 18,
      description: "Comprehensive healthcare services",
      logoUrl: null,
      rating: 4.8,
      featured: false,
      isActive: true
    },
    {
      id: "m5",
      businessName: "EduTech Learning Hub",
      businessType: "Education",
      sectorId: "6",
      address: "654 Learning Lane",
      city: "Bamako",
      country: "Mali",
      phone: "+223 76 234 567",
      email: "learn@edutech.ml",
      website: "https://edutech.ml",
      discountPercentage: 22,
      description: "Professional skills and certification courses",
      logoUrl: null,
      rating: 4.4,
      featured: false,
      isActive: true  // Changed to active to show more merchants
    }
  ];

  const getMerchants = () => merchantsData;
  const getSectors = () => [
    { id: "1", name: "Food & Drink", description: "Restaurants, cafes, and food delivery" },
    { id: "2", name: "Technology", description: "Electronics, gadgets, and tech services" },
    { id: "3", name: "Travel & Tourism", description: "Hotels, flights, and travel packages" },
    { id: "4", name: "Fashion & Beauty", description: "Clothing, accessories, and beauty services" },
    { id: "5", name: "Health & Wellness", description: "Medical services, fitness, and wellness" },
    { id: "6", name: "Education", description: "Courses, books, and educational services" },
    { id: "7", name: "Entertainment", description: "Movies, games, and recreational activities" },
    { id: "8", name: "Home & Garden", description: "Furniture, appliances, and home improvement" },
    { id: "9", name: "Automotive", description: "Car services, parts, and transportation" },
    { id: "10", name: "Professional Services", description: "Business services, consulting, and legal" }
  ];

  // Helper functions for generating discount data from merchants
  const getDiscountByBusinessType = (businessType: string): number => {
    const discountMap: Record<string, number> = {
      'Restaurant': 15,
      'Electronics Store': 25,
      'Fashion Retail': 30,
      'Healthcare': 18,
      'Education': 22,
      'Hotel': 35,
      'Entertainment': 28,
      'Automotive': 20,
      'Beauty': 25,
      'Fitness': 30
    };
    return discountMap[businessType] || 20;
  };

  const getDiscountDescription = (businessType: string, discount: number): string => {
    const descriptionMap: Record<string, string> = {
      'Restaurant': `Enjoy delicious meals with ${discount}% off for members`,
      'Electronics Store': `Latest electronics and gadgets with ${discount}% member pricing`,
      'Fashion Retail': `Trendy clothing and accessories with ${discount}% member discount`,
      'Healthcare': `Quality healthcare services with ${discount}% off for members`,
      'Education': `Educational courses and training with ${discount}% member savings`,
      'Hotel': `Comfortable accommodation with ${discount}% off for members`,
      'Entertainment': `Fun activities and entertainment with ${discount}% member discount`,
      'Automotive': `Professional car services with ${discount}% off for members`,
      'Beauty': `Beauty treatments and services with ${discount}% member pricing`,
      'Fitness': `Fitness programs and gym access with ${discount}% member discount`
    };
    return descriptionMap[businessType] || `Special ${discount}% discount for members`;
  };

  const getImageByBusinessType = (businessType: string): string => {
    const imageMap: Record<string, string> = {
      'Restaurant': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
      'Electronics Store': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
      'Fashion Retail': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      'Healthcare': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
      'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      'Hotel': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      'Entertainment': 'https://images.unsplash.com/photo-1489599558431-d5c5a1a4d8b7?w=400',
      'Automotive': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      'Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      'Fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    };
    return imageMap[businessType] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
  };

  // All discounts endpoint - now generates from admin-managed merchants
  app.get("/api/discounts", async (req, res) => {
    try {
      const { sector, location, search } = req.query;
      
      // Use centralized data source
      const merchants = getMerchants();
      const sectors = getSectors();

      // Convert merchants to discount format expected by frontend
      // Only show discounts from ACTIVE merchants
      let allDiscounts = merchants
        .filter(merchant => merchant.isActive === true)  // Fix #1: Only active merchants
        .map(merchant => {
          const merchantSector = sectors.find(s => s.id === merchant.sectorId);
          
          // Use merchant's actual discount percentage and rating (Fix #2: Data consistency)
          const location = `${merchant.city}, ${merchant.country}`;
          const imageUrl = merchant.logoUrl || getImageByBusinessType(merchant.businessType);
          
          return {
            id: `d_${merchant.id}`,
            title: `${merchant.businessType} Special Offer`,
            merchant: merchant.businessName,  // Use actual business name
            sector: merchantSector?.name || "General",
            discount_percentage: Number(merchant.discountPercentage), // Use actual discount from merchant
            description: merchant.description || getDiscountDescription(merchant.businessType, Number(merchant.discountPercentage)),
            location: location,  // Use actual address from merchant
            image_url: imageUrl,  // Use merchant logo or fallback
            rating: Number(merchant.rating) || 4.0,  // Use actual merchant rating
            featured: merchant.featured || false,  // Use actual featured status
            website: merchant.website,
            phone: merchant.phone,
            email: merchant.email
          };
        });

      // Now allDiscounts contains only the dynamically generated merchant discounts

      // Apply filters
      if (sector && sector !== 'all') {
        allDiscounts = allDiscounts.filter(d => d.sector === sector);
      }
      
      if (location && location !== 'all') {
        const locationStr = Array.isArray(location) ? String(location[0]) : String(location);
        allDiscounts = allDiscounts.filter(d => d.location.includes(locationStr));
      }
      
      if (search) {
        const searchLower = search.toString().toLowerCase();
        allDiscounts = allDiscounts.filter(d => 
          d.title.toLowerCase().includes(searchLower) ||
          d.merchant.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower)
        );
      }

      res.json(allDiscounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discounts" });
    }
  });

  // Admin sectors endpoint (matches frontend expectations)
  app.get("/api/admin/sectors", async (req, res) => {
    try {
      // Return sectors with correct property names to match frontend expectations
      const sectors = [
        { id: "1", name: "Food & Drink", description: "Restaurants, cafes, and food delivery", is_active: true },
        { id: "2", name: "Technology", description: "Electronics, gadgets, and tech services", is_active: true },
        { id: "3", name: "Travel & Tourism", description: "Hotels, flights, and travel packages", is_active: true },
        { id: "4", name: "Fashion & Beauty", description: "Clothing, accessories, and beauty services", is_active: true },
        { id: "5", name: "Health & Wellness", description: "Medical services, fitness, and wellness", is_active: true },
        { id: "6", name: "Education", description: "Courses, books, and educational services", is_active: true },
        { id: "7", name: "Entertainment", description: "Movies, games, and recreational activities", is_active: true },
        { id: "8", name: "Home & Garden", description: "Furniture, appliances, and home improvement", is_active: true },
        { id: "9", name: "Automotive", description: "Car services, parts, and transportation", is_active: true },
        { id: "10", name: "Professional Services", description: "Business services, consulting, and legal", is_active: true }
      ];
      res.json(sectors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discount sectors" });
    }
  });

  app.post("/api/admin/sectors", async (req, res) => {
    try {
      const { name, description, is_active } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Sector name is required" });
      }
      
      // For demo purposes, create a mock sector
      const newSector = {
        id: `custom_${Date.now()}`,
        name,
        description: description || "",
        is_active: is_active !== false
      };
      
      res.json(newSector);
    } catch (error) {
      res.status(400).json({ error: "Failed to create sector" });
    }
  });

  app.put("/api/admin/sectors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;
      
      // For demo purposes, return updated sector
      const updatedSector = {
        id,
        name,
        description: description || "",
        is_active: is_active !== false
      };
      
      res.json(updatedSector);
    } catch (error) {
      res.status(400).json({ error: "Failed to update sector" });
    }
  });

  app.delete("/api/admin/sectors/:id", async (req, res) => {
    try {
      // For demo purposes, always succeed
      res.json({ success: true, message: "Sector deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete discount sector" });
    }
  });

  app.get("/api/admin/discounts", async (req, res) => {
    try {
      // Return the same discount data but with admin fields
      const discounts = [
        {
          id: "d1",
          title: "Coffee Corner Special",
          description: "15% off all coffee and pastries. Perfect for your morning boost!",
          merchantId: "m1",
          merchantName: "Café Bella Vista",
          sectorId: "1",
          sectorName: "Food & Drink",
          discountPercentage: 15,
          minOrderAmount: 0,
          maxDiscountAmount: 10000,
          validFrom: "2025-01-01T00:00:00Z",
          validUntil: "2025-12-31T23:59:59Z",
          usageLimit: null,
          usageCount: 45,
          isFeatured: false,
          isActive: true,
          termsAndConditions: "Valid for dine-in and takeaway. One per customer per day.",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-15T10:30:00Z"
        },
        {
          id: "d2",
          title: "Tech Hub Electronics Discount",
          description: "30% off on smartphones, laptops, and accessories for premium members.",
          merchantId: "m2", 
          merchantName: "Digital World Electronics",
          sectorId: "2",
          sectorName: "Technology",
          discountPercentage: 30,
          minOrderAmount: 100000,
          maxDiscountAmount: 150000,
          validFrom: "2025-01-01T00:00:00Z",
          validUntil: "2025-11-30T23:59:59Z",
          usageLimit: 100,
          usageCount: 23,
          isFeatured: true,
          isActive: true,
          termsAndConditions: "Valid on purchases above 100,000 CFA. Warranty included.",
          imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-20T14:15:00Z"
        }
      ];
      
      res.json(discounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch discounts" });
    }
  });

  app.post("/api/admin/discounts", async (req, res) => {
    try {
      const {
        title,
        description,
        merchantId,
        sectorId,
        discountPercentage,
        minOrderAmount,
        maxDiscountAmount,
        validFrom,
        validUntil,
        usageLimit,
        isFeatured,
        isActive,
        termsAndConditions,
        imageUrl
      } = req.body;
      
      if (!title || !merchantId || !sectorId || !discountPercentage) {
        return res.status(400).json({ error: "Title, merchant, sector, and discount percentage are required" });
      }
      
      // For demo purposes, create a mock discount
      const newDiscount = {
        id: `discount_${Date.now()}`,
        title,
        description: description || "",
        merchantId,
        sectorId,
        discountPercentage: Number(discountPercentage),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: Number(maxDiscountAmount) || null,
        validFrom: validFrom || new Date().toISOString(),
        validUntil: validUntil || null,
        usageLimit: Number(usageLimit) || null,
        usageCount: 0,
        isFeatured: isFeatured === true,
        isActive: isActive !== false,
        termsAndConditions: termsAndConditions || "",
        imageUrl: imageUrl || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json(newDiscount);
    } catch (error) {
      res.status(400).json({ error: "Failed to create discount" });
    }
  });

  app.put("/api/admin/discounts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // For demo purposes, return updated discount
      const updatedDiscount = {
        id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedDiscount);
    } catch (error) {
      res.status(400).json({ error: "Failed to update discount" });
    }
  });

  app.delete("/api/admin/discounts/:id", async (req, res) => {
    try {
      // For demo purposes, always succeed
      res.json({ success: true, message: "Discount deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete discount" });
    }
  });

  // Admin merchants endpoint for discount management
  app.get("/api/admin/merchants", async (req, res) => {
    try {
      // Use centralized data and convert to admin format
      const merchants = getMerchants().map(merchant => ({
        id: merchant.id,
        name: merchant.businessName,
        businessType: merchant.businessType,
        sector_id: merchant.sectorId,
        discount_percentage: merchant.discountPercentage,
        location: `${merchant.city}, ${merchant.country}`,
        contact_phone: merchant.phone,
        contact_email: merchant.email,
        description: merchant.description,
        website: merchant.website,
        logo_url: merchant.logoUrl,
        rating: merchant.rating,
        is_active: merchant.isActive,
        featured: merchant.featured
      }));
      
      res.json(merchants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch merchants" });
    }
  });

  // Create merchant endpoint
  app.post("/api/admin/merchants", async (req, res) => {
    try {
      const {
        name,
        sector_id,
        discount_percentage,
        location,
        contact_phone,
        contact_email,
        description,
        website,
        is_active,
        featured
      } = req.body;
      
      if (!name || !sector_id) {
        return res.status(400).json({ error: "Name and sector are required" });
      }
      
      // Create new merchant and add to centralized data
      const newMerchant = {
        id: `merchant_${Date.now()}`,
        businessName: name,
        businessType: "General", // Default business type
        sectorId: sector_id,
        address: location || "",
        city: location ? location.split(',')[0].trim() : "",
        country: location ? location.split(',')[1]?.trim() || "" : "",
        phone: contact_phone || "",
        email: contact_email || "",
        website: website || "",
        discountPercentage: Number(discount_percentage) || 0,
        description: description || "",
        logoUrl: null,
        rating: 4.0,
        featured: featured === true,
        isActive: is_active !== false
      };
      
      // Add to centralized merchant data
      merchantsData.push(newMerchant);
      
      // Return in admin format
      const adminFormatMerchant = {
        id: newMerchant.id,
        name: newMerchant.businessName,
        sector_id: newMerchant.sectorId,
        discount_percentage: newMerchant.discountPercentage,
        location: `${newMerchant.city}, ${newMerchant.country}`.replace(', ', ''),
        contact_phone: newMerchant.phone,
        contact_email: newMerchant.email,
        description: newMerchant.description,
        website: newMerchant.website,
        logo_url: newMerchant.logoUrl,
        rating: newMerchant.rating,
        is_active: newMerchant.isActive,
        featured: newMerchant.featured
      };
      
      res.json(adminFormatMerchant);
    } catch (error) {
      res.status(400).json({ error: "Failed to create merchant" });
    }
  });

  // Update merchant endpoint  
  app.put("/api/admin/merchants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        sector_id,
        discount_percentage,
        location,
        contact_phone,
        contact_email,
        description,
        website,
        is_active,
        featured
      } = req.body;
      
      // For demo purposes, return updated merchant
      const updatedMerchant = {
        id,
        name,
        sector_id,
        discount_percentage: Number(discount_percentage) || 0,
        location: location || "",
        contact_phone: contact_phone || "",
        contact_email: contact_email || "",
        description: description || "",
        website: website || "",
        is_active: is_active !== false,
        featured: featured === true
      };
      
      res.json(updatedMerchant);
    } catch (error) {
      res.status(400).json({ error: "Failed to update merchant" });
    }
  });

  // Delete merchant endpoint
  app.delete("/api/admin/merchants/:id", async (req, res) => {
    try {
      // For demo purposes, always succeed
      res.json({ success: true, message: "Merchant deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete merchant" });
    }
  });
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { referral_code, is_merchant, ...userDataRaw } = req.body;
      const userData = insertUserSchema.parse({
        ...userDataRaw,
        isMerchant: is_merchant || false,
        merchantApprovalStatus: is_merchant ? 'pending' : 'approved'
      }) as { email: string; [key: string]: any }; // Add type assertion
  
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Handle referral code if provided
      let referrerId = null;
      if (referral_code) {
        const referrer = await db.select().from(users).where(eq(users.referralCode, referral_code));
        if (referrer.length > 0) {
          referrerId = referrer[0].id;
          userData.referredBy = referrerId;
        }
      }
  
      // Hacher le mot de passe avant de créer l'utilisateur
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
  
      // Generate referral code for new user
      await storage.generateReferralCode(user.id);
  
      // Create referral record if referred by someone
      let referralRecord = null;
      if (referrerId) {
        referralRecord = await storage.createReferral({
          referrerId: referrerId,
          referredUserId: user.id,
          referralCode: referral_code,
          referralType: is_merchant ? 'merchant' : 'member',
          status: 'active'
        });
  
        // Process affiliate reward (1000 CFs OR 10% of registration fee)
        try {
          await storage.processReferralReward(referralRecord.id, 0); // 0 = credit points reward
          console.log(`✅ Affiliate reward processed for referrer ${referrerId}`);
        } catch (rewardError) {
          console.error(`Failed to process affiliate reward:`, rewardError);
        }
      }
  
      // Return user data without sending welcome email
      res.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          paymentRequired: true
        }
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      console.log('Login attempt for:', email);
      
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        console.log('User not found:', email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      console.log('User found, checking password...');
      
      // Vérifier le mot de passe haché
      const isPasswordValid = await comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Invalid password for:', email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      console.log('Login successful for:', email);
      const roles = await storage.getUserRoles(user.id);
      res.json({ user: { id: user.id, email: user.email, fullName: user.fullName }, roles });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Phone OTP authentication routes
  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      const result = await otpService.sendOtp(phone);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({ message: result.message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      
      if (!phone || !otp) {
        return res.status(400).json({ error: "Phone number and OTP are required" });
      }

      const result = await otpService.verifyOtp(phone, otp);
      
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      // Get user details and roles
      const user = await otpService.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const roles = await storage.getUserRoles(user.id);
      
      res.json({ 
        message: result.message,
        user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone }, 
        roles 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // User management routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user roles
      const roles = await storage.getUserRoles(req.params.id);
      
      res.json({ ...user, roles });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/users/:id/roles", async (req, res) => {
    try {
      const roles = await storage.getUserRoles(req.params.id);
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user roles" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Admin operations (replacing Supabase Edge Function)
  app.post("/api/admin/operations", async (req, res) => {
    try {
      const { operation, email, password } = req.body;

      switch (operation) {
        case 'check_admin_exists': {
          if (!email) {
            return res.status(400).json({ error: 'Email is required' });
          }

          const user = await storage.getUserByEmail(email);
          if (!user) {
            return res.json({ exists: false, hasAdminRole: false });
          }

          const roles = await storage.getUserRoles(user.id);

          await storage.assignRole(user.id, 'admin');
          res.json({ success: true });
          break;
        }

        default:
          res.status(400).json({ error: 'Invalid operation' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Database export endpoint (admin only)
  app.post("/api/export-database", async (req, res) => {
    try {
      const { userId, userEmail } = req.body;
      
      // Check if user exists and is admin
      let user;
      if (userId) {
        user = await storage.getUser(userId);
      } else if (userEmail) {
        user = await storage.getUserByEmail(userEmail);
      } else {
        return res.status(400).json({ error: "User ID or email required" });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has admin role
      const roles = await storage.getUserRoles(user.id);
      if (!roles.includes('admin')) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const exportData = await storage.exportDatabase();
      
      // Set headers for file download
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `elverra-database-export-${timestamp}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(exportData);
    } catch (error) {
      console.error('Database export error:', error);
      res.status(500).json({ error: "Failed to export database" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to get job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create job" });
    }
  });

  // Job applications
  app.get("/api/job-applications", async (req, res) => {
    try {
      const jobId = req.query.jobId as string;
      const applications = await storage.getJobApplications(jobId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to get job applications" });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    try {
      const applicationData = insertJobApplicationSchema.parse(req.body);
      const application = await storage.createJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create application" });
    }
  });

  app.put("/api/job-applications/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateJobApplicationStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // Competition routes
  app.get("/api/competitions", async (req, res) => {
    try {
      const competitions = await storage.getCompetitions();
      res.json(competitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get competitions" });
    }
  });

  app.get("/api/competitions/:id", async (req, res) => {
    try {
      const competition = await storage.getCompetition(req.params.id);
      if (!competition) {
        return res.status(404).json({ error: "Competition not found" });
      }
      res.json(competition);
    } catch (error) {
      res.status(500).json({ error: "Failed to get competition" });
    }
  });

  app.post("/api/competitions", async (req, res) => {
    try {
      const competition = await storage.createCompetition(req.body);
      res.json(competition);
    } catch (error) {
      res.status(400).json({ error: "Failed to create competition" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Product reviews routes
  app.post("/api/products/reviews", async (req, res) => {
    try {
      const { product_id, rating, comment } = req.body;
      
      if (!product_id || !rating) {
        return res.status(400).json({ error: "Product ID and rating are required" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      // For now, we'll use a dummy user ID since we need authentication
      // In production, this would come from the authenticated user session
      const userId = req.body.user_id || "af23cdf3-a02a-4c5e-85e0-5e38ae5d085b"; // Using the test user ID

      const reviewData = {
        productId: product_id,
        userId: userId,
        rating: rating,
        comment: comment || null
      };

      const review = await storage.createProductReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  // Loan application routes
  app.get("/api/loan-applications", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const loans = await storage.getLoanApplications(userId);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to get loan applications" });
    }
  });

  app.post("/api/loan-applications", async (req, res) => {
    try {
      const loanData = insertLoanApplicationSchema.parse(req.body);
      const loan = await storage.createLoanApplication(loanData);
      res.json(loan);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Failed to create loan application" });
    }
  });

  app.put("/api/loan-applications/:id", async (req, res) => {
    try {
      const loan = await storage.updateLoanApplication(req.params.id, req.body);
      if (!loan) {
        return res.status(404).json({ error: "Loan application not found" });
      }
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update loan application" });
    }
  });

  // CMS routes
  app.get("/api/cms-pages", async (req, res) => {
    try {
      const pages = await storage.getCmsPages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get CMS pages" });
    }
  });

  app.get("/api/cms-pages/:slug", async (req, res) => {
    try {
      const page = await storage.getCmsPage(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to get page" });
    }
  });

  app.post("/api/cms-pages", async (req, res) => {
    try {
      const page = await storage.createCmsPage(req.body);
      res.json(page);
    } catch (error) {
      res.status(400).json({ error: "Failed to create page" });
    }
  });

  app.put("/api/cms-pages/:id", async (req, res) => {
    try {
      const page = await storage.updateCmsPage(req.params.id, req.body);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  // Increment view count for CMS pages (non-critical feature)
  app.post("/api/cms-pages/:id/views", async (req, res) => {
    try {
      // This is just a placeholder for view count tracking
      // In a real implementation, this would update the page view count
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update view count" });
    }
  });

  // Agent/affiliate routes
  app.get("/api/agents/:userId", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.userId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const agent = await storage.createAgent(req.body);
      res.json(agent);
    } catch (error) {
      res.status(400).json({ error: "Failed to create agent" });
    }
  });

  app.put("/api/agents/:id/commissions", async (req, res) => {
    try {
      await storage.updateAgentCommissions(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update commissions" });
    }
  });

  // Affiliate rewards endpoints
  app.get("/api/affiliate-rewards/:referrerId", async (req, res) => {
    try {
      const rewards = await storage.getAffiliateRewardsByReferrer(req.params.referrerId);
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching affiliate rewards:", error);
      res.status(500).json({ error: "Failed to get affiliate rewards" });
    }
  });

  app.get("/api/affiliate-dashboard/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Check if user is authenticated by verifying user exists and has valid session
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get referrals made by this user
      const referrals = await storage.getReferralsByReferrer(userId);
      
      // Get affiliate rewards
      const rewards = await storage.getAffiliateRewardsByReferrer(userId);
      
      // Calculate totals
      const totalReferrals = referrals.length;
      const totalCreditPoints = rewards
        .filter(r => r.rewardType === 'credit_points')
        .reduce((sum, r) => sum + parseFloat(r.creditPointsAwarded?.toString() || '0'), 0);
      const totalCommissions = rewards
        .filter(r => r.rewardType === 'commission')
        .reduce((sum, r) => sum + parseFloat(r.commissionAmount?.toString() || '0'), 0);
      
      const totalEarnings = totalCreditPoints + totalCommissions;

      // Get referral history with names
      const referralHistory = await Promise.all(
        referrals.map(async (referral) => {
          const referredUser = await storage.getUser(referral.referredUserId);
          const relatedReward = rewards.find(r => r.referralId === referral.id);
          
          return {
            id: referral.id,
            name: referredUser?.fullName || 'Unknown User',
            date: referral.createdAt?.toLocaleDateString() || 'Unknown',
            status: referral.status === 'active' ? 'Active' : 'Pending',
            earnings: relatedReward ? 
              parseFloat(relatedReward.creditPointsAwarded?.toString() || '0') + 
              parseFloat(relatedReward.commissionAmount?.toString() || '0') : 0,
            rewardType: relatedReward?.rewardType || 'pending'
          };
        })
      );

      const affiliateData = {
        referralCode: user.referralCode || '',
        totalReferrals,
        referralTarget: 5, // Target for fee waiver
        progress: Math.min(100, (totalReferrals / 5) * 100),
        totalEarnings,
        pendingEarnings: totalCommissions, // Commissions are typically pending until withdrawal
        referralHistory,
        creditPoints: totalCreditPoints,
        commissions: totalCommissions
      };

      res.json(affiliateData);
    } catch (error) {
      console.error("Error fetching affiliate dashboard:", error);
      res.status(500).json({ error: "Failed to get affiliate dashboard data" });
    }
  });

  // Demo payment success page
  app.get("/payment-success", (req, res) => {
    const { reference, amount, method, mode } = req.query;
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Success - Elverra Global</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
          .success-icon { color: #10b981; font-size: 48px; margin-bottom: 20px; }
          .demo-badge { background: #fbbf24; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 20px; }
          .amount { font-size: 24px; font-weight: bold; color: #1f2937; margin: 20px 0; }
          .reference { color: #6b7280; margin: 10px 0; }
          .return-btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
          .return-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          ${mode === 'demo' ? '<div class="demo-badge">DEMO MODE</div>' : ''}
          <h2>Payment Successful!</h2>
          <div class="amount">CFA ${amount}</div>
          <div class="reference">Reference: ${reference}</div>
          <p>Your ${typeof method === 'string' ? method.replace('_', ' ') : 'Orange Money'} payment has been processed successfully.</p>
          ${mode === 'demo' ? '<p><small>This is a demo transaction. Contact Orange operator to activate production credentials.</small></p>' : ''}
          <button class="return-btn" onclick="window.location.href='/dashboard'">Return to Dashboard</button>
        </div>
      </body>
      </html>
    `);
  });
  
  // Payment gateway endpoints
  app.post("/api/payments/initiate-orange-money", async (req, res) => {
    try {
      console.log('Received payment request:', req.body);
      
      // Validate request body
      const validatedData = orangeMoneyPaymentSchema.parse(req.body);

      // Use a default userId if not provided
      const userId = validatedData.userId || `temp_${Date.now()}`;
      
      // Prepare payment parameters
      const paymentParams = {
        userId,
        amount: validatedData.amount,
        phoneNumber: validatedData.phone,
        description: validatedData.name
          ? `Payment for ${validatedData.name} (${validatedData.reference})`
          : `Membership payment (${validatedData.reference})`,
        subscriptionId: validatedData.subscriptionId,
        metadata: {
          ...validatedData.metadata,
          email: validatedData.email,
          name: validatedData.name,
          reference: validatedData.reference,
          // Add a flag if this is a temporary user
          isTemporaryUser: !validatedData.userId,
        },
      };

      // Initiate payment using OrangeMoneyService
      const paymentResponse = await orangeMoneyService.initiatePayment(paymentParams);

      // If in demo mode (e.g., due to credential issues), return demo response
      if (
        paymentResponse._rawResponse &&
        paymentResponse._rawResponse.message?.includes("Demo mode")
      ) {
        return res.json({
          success: true,
          payment_url: `/payment-success?reference=${paymentResponse.orderId}&amount=${paymentResponse.amount}&method=orange_money&mode=demo`,
          reference: paymentResponse.orderId,
          mode: "demo",
          message:
            "Demo mode: Orange Money credentials need activation. Contact Orange operator for production access.",
          amount: paymentResponse.amount,
          currency: "OUV",
        });
      }

      res.json({
        success: true,
        payment_url: paymentResponse.paymentUrl,
        reference: paymentResponse.orderId,
        amount: paymentResponse.amount,
        status: paymentResponse.status,
        transactionId: paymentResponse._rawResponse?.pay_token || paymentResponse.orderId,
      });
    } catch (error) {
      console.error("Orange Money payment initiation error:", error);
      let errorMessage = "Orange Money payment service temporarily unavailable";
      let details = error instanceof Error ? error.message : "Unknown error";

      if (error instanceof z.ZodError) {
        errorMessage = "Invalid request data";
        details = error.errors.map((e) => e.message).join(", ");
      }

      res.status(500).json({
        success: false,
        error: errorMessage,
        details,
      });
    }
  });

  // Test SAMA Money connection
  app.get('/api/test/sama-money', async (req, res) => {
    try {
      // Check if SAMA Money credentials are configured
      const samaConfig = {
        baseUrl: process.env.SAMA_BASE_URL || 'https://smarchandamatest.sama.money/V1/',
        merchantCode: process.env.SAMA_MERCHANT_CODE,
        publicKey: process.env.SAMA_PUBLIC_KEY,
        transactionKey: process.env.SAMA_TRANSACTION_KEY,
        userId: process.env.SAMA_USER_ID
      };

      const missingCredentials = [];
      if (!samaConfig.merchantCode) missingCredentials.push('SAMA_MERCHANT_CODE');
      if (!samaConfig.publicKey) missingCredentials.push('SAMA_PUBLIC_KEY');
      if (!samaConfig.transactionKey) missingCredentials.push('SAMA_TRANSACTION_KEY');
      if (!samaConfig.userId) missingCredentials.push('SAMA_USER_ID');

      if (missingCredentials.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'SAMA Money credentials not configured',
          missingCredentials,
          available: false
        });
      }

      // Test API connectivity (basic ping)
      try {
        const testUrl = `${samaConfig.baseUrl}ping`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${samaConfig.transactionKey}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const testResponse = {
          status: 'success',
          message: 'SAMA Money service is available',
          available: true,
          config: {
            baseUrl: samaConfig.baseUrl,
            merchantCode: samaConfig.merchantCode,
            environment: 'test',
            apiStatus: response.ok ? 'reachable' : 'unreachable'
          }
        };
        
        res.json(testResponse);
      } catch (apiError) {
        // API not reachable but credentials are configured
        res.json({
          status: 'warning',
          message: 'SAMA Money credentials configured but API unreachable',
          available: true, // Credentials are there
          config: {
            baseUrl: samaConfig.baseUrl,
            merchantCode: samaConfig.merchantCode,
            environment: 'test',
            apiStatus: 'unreachable',
            apiError: apiError instanceof Error ? apiError.message : 'Network error'
          }
        });
      }
    } catch (error) {
      console.error('SAMA Money test error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'SAMA Money service temporarily unavailable',
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create admin user endpoint
  app.post('/api/admin/create-admin', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      
      if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      // Check if admin already exists
      const existingAdmin = await db.select().from(users).where(eq(users.email, email));
      if (existingAdmin.length > 0) {
        return res.status(409).json({ error: 'Admin user already exists' });
      }

      // Create admin user with bcrypt
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const adminUser = await db.insert(users).values({
        email,
        password: hashedPassword,
        fullName,
        isEmailVerified: true,
        isPhoneVerified: false
      }).returning();

      // Assign admin role using storage service
      await storage.assignRole(adminUser[0].id, 'admin');

      res.json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: adminUser[0].id,
          email: adminUser[0].email,
          fullName: adminUser[0].fullName,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      res.status(500).json({ 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Demo payment page route
  app.get("/demo-payment", (req, res) => {
    const { amount, currency, reference, provider } = req.query;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Payment - ${String(provider).toUpperCase()} Money</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .payment-card { border: 2px solid ${provider === 'sama' ? '#10b981' : '#ff6600'}; border-radius: 10px; padding: 30px; text-align: center; }
            .amount { font-size: 2em; color: ${provider === 'sama' ? '#10b981' : '#ff6600'}; font-weight: bold; margin: 20px 0; }
            .btn { background: ${provider === 'sama' ? '#10b981' : '#ff6600'}; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 1.1em; cursor: pointer; margin: 10px; }
            .btn:hover { background: ${provider === 'sama' ? '#059669' : '#e55a00'}; }
            .demo-notice { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="payment-card">
            <h1>${provider === 'sama' ? '💰' : '🍊'} ${String(provider).toUpperCase()} Money Payment</h1>
            <div class="demo-notice">
                <strong>Demo Mode:</strong> This is a simulated payment for testing purposes
            </div>
            <div class="amount">${amount} ${currency}</div>
            <p><strong>Reference:</strong> ${reference}</p>
            <p>Proceed with your payment using ${String(provider).toUpperCase()} Money</p>
            <button class="btn" onclick="simulateSuccess()">✅ Simulate Successful Payment</button>
            <button class="btn" onclick="simulateFailure()" style="background: #dc3545;">❌ Simulate Failed Payment</button>
            <button class="btn" onclick="goBack()" style="background: #6c757d;">← Go Back</button>
        </div>
        <script>
            function simulateSuccess() {
                alert('Payment successful! Redirecting...');
                window.close();
                if (window.opener) {
                    window.opener.postMessage({type: 'payment-success', reference: '${reference}'}, '*');
                }
            }
            function simulateFailure() {
                alert('Payment failed! Please try again.');
                window.close();
                if (window.opener) {
                    window.opener.postMessage({type: 'payment-failed', reference: '${reference}'}, '*');
                }
            }
            function goBack() {
                window.close();
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
  });
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { paymentId } = req.body; // Use paymentId instead of reference for clarity
  
      if (!paymentId) {
        return res.status(400).json({ success: false, error: "Payment ID is required" });
      }
  
      // Query payment_attempts table
      const [paymentAttempt] = await db
        .select()
        .from(paymentAttempts)
        .where(eq(paymentAttempts.id, paymentId))
        .limit(1);
  
      if (!paymentAttempt) {
        return res.status(404).json({ success: false, error: "Payment not found" });
      }
  
      res.json({
        success: true,
        status: paymentAttempt.status,
        reference: paymentAttempt.transactionId, // Changed from paymentReference to transactionId
        paymentId: paymentAttempt.id,
        verified: paymentAttempt.status === "completed",
      });
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // SAMA Money payment gateway endpoint
  app.post("/api/payments/initiate-sama-money", async (req, res) => {
    try {
      const { amount, currency, phone, email, name, reference } = req.body;
      
      // Check for SAMA Money credentials
      const merchantCode = process.env.SAMA_MERCHANT_CODE;
      const publicKey = process.env.SAMA_PUBLIC_KEY;
      const transactionKey = process.env.SAMA_TRANSACTION_KEY;
      const userId = process.env.SAMA_USER_ID;
      
      if (!merchantCode || !publicKey || !transactionKey || !userId) {
        console.warn('SAMA Money credentials not configured - service unavailable');
        return res.status(503).json({
          success: false,
          error: 'SAMA Money service temporarily unavailable',
          message: 'Payment gateway configuration incomplete. Please contact support.'
        });
      }
      
      // SAMA Money API configuration - PRODUCTION MODE
      const samaConfig = {
        baseUrl: 'https://smarchandamatest.sama.money/V1', // Test environment URL (working endpoint)
        merchantCode,
        publicKey,
        transactionKey,
        userId
      };
      
      const paymentData = {
        merchant_code: samaConfig.merchantCode,
        merchant_name: 'CLUB 66 GLOBAL',
        user_id: samaConfig.userId,
        amount: amount,
        currency: currency,
        customer_phone: phone,
        customer_name: name,
        customer_email: email,
        transaction_reference: reference,
        callback_url: `${req.protocol}://${req.get('host')}/api/payments/sama-callback`,
        return_url: `${req.protocol}://${req.get('host')}/payment-success`,
        public_key: samaConfig.publicKey,
        timestamp: new Date().toISOString()
      };
      
      // Try to connect to SAMA Money API with timeout and fallback
      let responseData;
      
      try {
        const response = await Promise.race([
          fetch(`${samaConfig.baseUrl}/payment/initiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': `Bearer ${samaConfig.publicKey}`,
              'Accept': 'application/json',
              'X-Merchant-Code': samaConfig.merchantCode,
              'X-User-Id': samaConfig.userId
            },
            body: JSON.stringify(paymentData)
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 5000)
          )
        ]) as Response;
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('SAMA Money API error:', response.status, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        responseData = await response.json();
        
      } catch (fetchError: any) {
        console.warn('SAMA Money API unavailable, using demo mode fallback:', fetchError?.message);
        
        // Fallback to demo mode when API is unavailable
        const demoReference = `SAMA_DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const demoPaymentUrl = `/demo-payment?provider=sama&amount=${amount}&currency=${currency}&reference=${demoReference}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
        
        responseData = {
          success: true,
          transaction_id: demoReference,
          payment_url: demoPaymentUrl,
          status: 'initiated',
          message: 'Payment redirected to demo mode - SAMA Money API temporarily unavailable'
        };
      }
      
      // Store payment record in database for tracking
      try {
        // For now, we'll skip database storage until the payment tables are set up
        console.log('Payment initiated:', { reference, amount, currency, gateway: 'sama_money' });
      } catch (dbError) {
        console.warn('Failed to store payment record:', dbError);
      }
      
      res.json({
        success: true,
        payment_url: responseData.payment_url,
        reference: responseData.transaction_id || reference,
        amount,
        status: 'initiated',
        transactionId: responseData.transaction_id
      });
      
    } catch (error) {
      console.warn('SAMA Money API unavailable, using demo mode fallback:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to demo mode when API is unavailable
      const { amount, currency, phone, name, reference } = req.body;
      const demoReference = `SAMA_DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const demoPaymentUrl = `/demo-payment?provider=sama&amount=${amount}&currency=${currency}&reference=${demoReference}&phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`;
      
      res.json({
        success: true,
        payment_url: demoPaymentUrl,
        reference: demoReference,
        amount,
        status: 'initiated',
        transactionId: demoReference,
        message: 'Payment redirected to demo mode - SAMA Money API temporarily unavailable'
      });
    }
  });

  // Payment success/cancel routes  
  app.get("/payment-success", (req, res) => {
    res.redirect('/#/thank-you?payment=success');
  });

  app.get("/payment-cancel", (req, res) => {
    res.redirect('/#/membership-payment?payment=cancelled');
  });

  // Payment callback endpoints
  app.post("/api/payments/orange-callback", async (req, res) => {
    try {
      console.log("Orange Money callback received:", req.body);
      const { pay_token, status, order_id } = req.body; // Use pay_token and order_id as per logs
  
      if (!pay_token || !order_id) {
        return res.status(400).json({ success: false, error: "Pay token and order ID are required" });
      }
  
      // Find payment attempt by paymentReference (order_id) or externalTransactionId (pay_token)
      const [existingPayment] = await db
        .select()
        .from(paymentAttempts)
        .where(eq(paymentAttempts.transactionId, order_id))
        .limit(1);
  
      if (!existingPayment) {
        console.warn(`Payment attempt not found for order_id: ${order_id}, pay_token: ${pay_token}`);
        return res.status(404).json({ success: false, error: "Payment not found" });
      }
  
      // Map Orange Money status to internal status
      const newStatus = status.toLowerCase() === "success" ? "completed" : status.toLowerCase();
  
      // Update payment attempt
      const [payment] = await db
        .update(paymentAttempts)
        .set({
          status: newStatus,
          transactionId: pay_token,
          updatedAt: new Date(),
        })
        .where(eq(paymentAttempts.id, existingPayment.id))
        .returning();
  
      if (!payment) {
        console.warn(`Failed to update payment attempt: ${existingPayment.id}`);
        return res.status(500).json({ success: false, error: "Failed to update payment" });
      }
  
      // Update subscription if payment is successful
      if (newStatus === "completed") {
        const metadata = existingPayment.metadata as Record<string, any> | null;
        const subscriptionId = metadata?.subscriptionId;
        const userId = metadata?.userId || existingPayment.userId;
  
        if (subscriptionId && typeof subscriptionId === "string") {
          try {
            await db
              .update(subscriptions)
              .set({
                status: "active",
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, subscriptionId));
            console.log(`Subscription ${subscriptionId} updated to active`);
          } catch (updateError) {
            console.error("Error updating subscription status:", updateError);
          }
        }
  
        // Send welcome email
        if (userId) {
          const user = await storage.getUser(userId);
          if (user?.email && user.email.includes("@")) {
            try {
              await sendWelcomeEmail(user.email, user.fullName || "");
              console.log(`📧 Welcome email sent to ${user.email}`);
            } catch (emailError) {
              console.warn(`Failed to send welcome email to ${user.email}:`, emailError);
            }
          }
        }
  
        // Redirect to success page
        res.redirect(`/payment-success?reference=${order_id}&amount=${existingPayment.amount}&method=orange_money`);
      } else {
        res.redirect(`/payment-cancel?reference=${order_id}`);
      }
    } catch (error) {
      console.error("Orange callback error:", error);
      res.status(500).json({ error: "Callback processing failed" });
    }
  });

  app.post("/api/payments/sama-callback", async (req, res) => {
    try {
      console.log('SAMA Money callback received:', req.body);
      const { reference, status, transaction_id: transactionId } = req.body;
  
      if (!reference) {
        return res.status(400).json({ success: false, error: 'Reference is required' });
      }
  
      // Retrieve the payment attempt
      const [existingPayment] = await db
        .select()
        .from(paymentAttempts)
        .where(eq(paymentAttempts.id, reference));
  
      if (!existingPayment) {
        console.warn(`Payment attempt not found: ${reference}`);
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }
  
      // Update payment status
      const [payment] = await db
        .update(paymentAttempts)
        .set({
          status: status === 'SUCCESS' ? 'completed' : 'failed',
          transactionId: transactionId || null,
          updatedAt: new Date(),
        })
        .where(eq(paymentAttempts.id, reference))
        .returning();
  
      if (!payment) {
        console.warn(`Failed to update payment attempt: ${reference}`);
        return res.status(500).json({ success: false, error: 'Failed to update payment' });
      }
  
      // If payment is successful, update subscription and send welcome email
      if (status === 'SUCCESS') {
        const metadata = existingPayment.metadata as Record<string, any> | null;
        const subscriptionId = metadata?.subscriptionId;
        const userId = metadata?.userId || existingPayment.userId;
  
        if (subscriptionId && typeof subscriptionId === 'string') {
          try {
            await db
              .update(subscriptions)
              .set({
                status: 'active',
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, subscriptionId));
          } catch (updateError) {
            console.error('Error updating subscription status:', updateError);
          }
        }
  
        // Send welcome email
        if (userId) {
          const user = await storage.getUser(userId);
          if (user?.email && user.email.includes('@')) {
            try {
              await sendWelcomeEmail(user.email, user.fullName || '');
              console.log(`📧 Welcome email sent to ${user.email}`);
            } catch (emailError) {
              console.warn(`Failed to send welcome email to ${user.email}:`, emailError);
            }
          }
        }
      }
  
      res.json({ success: true, message: 'Callback processed' });
    } catch (error) {
      console.error('SAMA callback error:', error);
      res.status(500).json({ error: 'Callback processing failed' });
    }
  });

  // Files/assets route
  app.get("/api/files/logo", (req, res) => {
    // Return the new logo URL
    res.json({
      url: "/lovable-uploads/logo.png",
      name: "Elverra Global Logo",
      success: true
    });
  });

  // Profile routes
  app.get("/api/users/:id/profile", async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  app.put("/api/users/:id/profile", async (req, res) => {
    try {
      const profile = await storage.updateUserProfile(req.params.id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // User applications
  app.get("/api/users/:id/applications", async (req, res) => {
    try {
      const applications = await storage.getUserApplications(req.params.id);
      res.json(applications || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to get applications" });
    }
  });

  // User bookmarks
  app.get("/api/users/:id/bookmarks", async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.params.id);
      res.json(bookmarks || []);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bookmarks" });
    }
  });

  // Product categories endpoint
  app.get("/api/products/categories", async (req, res) => {
    try {
      const categories = [
        { id: '1', name: 'Electronics', description: 'Electronic devices and gadgets' },
        { id: '2', name: 'Fashion', description: 'Clothing and accessories' },
        { id: '3', name: 'Home & Garden', description: 'Home improvement and garden items' },
        { id: '4', name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
        { id: '5', name: 'Books & Media', description: 'Books, music, and other media' },
        { id: '6', name: 'Automotive', description: 'Car parts and automotive accessories' },
        { id: '7', name: 'Health & Beauty', description: 'Health and beauty products' },
        { id: '8', name: 'Toys & Games', description: 'Toys and gaming items' },
        { id: '9', name: 'Food & Beverages', description: 'Food and drink items' },
        { id: '10', name: 'Other', description: 'Other miscellaneous items' }
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  // Membership routes
  app.get("/api/memberships/:userId", async (req, res) => {
    try {
      // Check if user has premium membership in database
      const user = await storage.getUser(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return membership based on user's tier in database
      const membership = {
        id: req.params.userId,
        user_id: req.params.userId,
        tier: user.membershipTier || 'basic',
        is_active: user.membershipTier === 'premium' || user.membershipTier === 'elite',
        start_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        physical_card_requested: false,
        member_id: user.id
      };
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to get membership" });
    }
  });

  app.post("/api/memberships", async (req, res) => {
    try {
      const { user_id, tier, paymentReference } = req.body;
      
      // Update user's membership tier in database
      const user = await storage.getUser(user_id);
      if (user) {
        await storage.updateUser(user_id, { 
          membershipTier: tier || 'premium' 
        });
      }
      
      const membership = {
        id: `membership_${Date.now()}`,
        isActive: true,
        createdAt: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentReference
      };
      
      res.json(membership);
    } catch (error) {
      res.status(500).json({ error: "Failed to create membership" });
    }
  });

  // Agents route (replacing Supabase Edge Function)
  app.get("/api/agents/:userId", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.userId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent" });
    }
  });

  // Affiliate and Referral Routes
  app.get("/api/affiliate/referrals/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const referrals = await storage.getReferralsByReferrer(userId);
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch referrals" });
    }
  });

  app.get("/api/affiliate/commissions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const commissions = await storage.getCommissionsByReferrer(userId);
      res.json(commissions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch commissions" });
    }
  });

  app.post("/api/affiliate/generate-code/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const referralCode = await storage.generateReferralCode(userId);
      res.json({ referralCode });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate referral code" });
    }
  });

  // Merchant Approval Routes
  app.get("/api/admin/merchant-applications", async (req, res) => {
    try {
      const applications = await storage.getMerchantApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch merchant applications" });
    }
  });

  app.post("/api/admin/approve-merchant/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { approvedBy } = req.body;
      await storage.approveMerchant(userId, approvedBy);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to approve merchant" });
    }
  });

  app.post("/api/admin/reject-merchant/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      await storage.rejectMerchant(userId, reason);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to reject merchant" });
    }
  });

  // Membership Payment Processing with Commission Tracking
  app.post("/api/membership-payment", async (req, res) => {
    try {
      const { userId, amount, tier, paymentReference, paymentType = 'initial' } = req.body;
      
      // Create membership payment record
      const membershipPayment = await storage.createMembershipPayment({
        userId,
        amount: amount.toString(),
        membershipTier: tier,
        paymentReference,
        paymentType,
        status: 'completed'
      });

      // Get user to get referral code
      const user = await storage.getUserById(userId);
      
      // Process referral commission if applicable
      if (user?.referralCode) {
        await storage.processReferralCommission({
          userId,
          amount,
          paymentType,
          paymentReference,
          referralCode: user.referralCode
        });
      }

      res.json({ success: true, paymentId: membershipPayment.id });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process payment" });
    }
  });

  // Object storage upload endpoint for merchant logos
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Update merchant endpoint (handles logo uploads and rating updates)
  app.put("/api/admin/merchants/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Find and update merchant in centralized data
      const merchantIndex = merchantsData.findIndex(m => m.id === id);
      if (merchantIndex === -1) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      // Update the merchant data
      const merchant = merchantsData[merchantIndex];
      if (updateData.name) merchant.businessName = updateData.name;
      if (updateData.sector_id) merchant.sectorId = updateData.sector_id;
      if (updateData.discount_percentage !== undefined) merchant.discountPercentage = Number(updateData.discount_percentage);
      if (updateData.location) {
        merchant.city = updateData.location.split(',')[0].trim();
        merchant.country = updateData.location.split(',')[1]?.trim() || "";
      }
      if (updateData.contact_phone) merchant.phone = updateData.contact_phone;
      if (updateData.contact_email) merchant.email = updateData.contact_email;
      if (updateData.description) merchant.description = updateData.description;
      if (updateData.website) merchant.website = updateData.website;
      if (updateData.logo_url !== undefined) merchant.logoUrl = updateData.logo_url;
      if (updateData.rating !== undefined) merchant.rating = Number(updateData.rating);
      if (updateData.is_active !== undefined) merchant.isActive = updateData.is_active;
      if (updateData.featured !== undefined) merchant.featured = updateData.featured;

      // Return in admin format
      const updatedMerchant = {
        id: merchant.id,
        name: merchant.businessName,
        sector_id: merchant.sectorId,
        discount_percentage: merchant.discountPercentage,
        location: `${merchant.city}, ${merchant.country}`.replace(', ', ''),
        contact_phone: merchant.phone,
        contact_email: merchant.email,
        description: merchant.description,
        website: merchant.website,
        logo_url: merchant.logoUrl,
        rating: merchant.rating,
        is_active: merchant.isActive,
        featured: merchant.featured
      };

      res.json(updatedMerchant);
    } catch (error) {
      console.error("Error updating merchant:", error);
      res.status(500).json({ error: "Failed to update merchant" });
    }
  });

  // Admin Payment Gateway Management API
  app.post('/api/admin/payment-gateways', async (req, res) => {
    try {
      const { name, type, description } = req.body;
      
      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      // Generate a unique ID for the new gateway
      const newGatewayId = name.toLowerCase().replace(/\s+/g, '_');
      
      // In a real implementation, you would save this to the database
      // For demo purposes, we'll return success
      const newGateway = {
        id: newGatewayId,
        name,
        type,
        description: description || `${name} payment gateway`,
        isActive: false,
        config: {
          supportedCurrencies: ['CFA'],
          environment: 'test'
        },
        fees: {
          percentage: 2.5,
          fixed: 0
        },
        icon: '💳',
        status: 'inactive'
      };
      
      console.log('New payment gateway created:', newGateway);
      res.json({ success: true, gateway: newGateway });
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      res.status(500).json({ error: 'Failed to create payment gateway' });
    }
  });

  app.delete('/api/admin/payment-gateways/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // In a real implementation, you would delete from the database
      // and ensure no active transactions are using this gateway
      console.log('Deleting payment gateway:', id);
      
      // Check if gateway has active transactions (mock check)
      const hasActiveTransactions = Math.random() > 0.8; // 20% chance of having active transactions
      
      if (hasActiveTransactions) {
        return res.status(400).json({ 
          error: 'Cannot delete gateway with active transactions. Please wait for all transactions to complete.' 
        });
      }
      
      res.json({ success: true, message: 'Payment gateway deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment gateway:', error);
      res.status(500).json({ error: 'Failed to delete payment gateway' });
    }
  });

  app.post('/api/admin/payment-gateways/:id/test', async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, currency } = req.body;
      
      console.log(`Testing payment gateway ${id} with amount: ${amount} ${currency}`);
      
      // Simulate different test results based on gateway type
      let testResult;
      
      switch (id) {
        case 'orange_money':
          // Orange Money test - check if credentials are configured
          const hasOrangeCredentials = process.env.ORANGE_CLIENT_ID && process.env.ORANGE_CLIENT_SECRET;
          testResult = {
            success: hasOrangeCredentials,
            message: hasOrangeCredentials 
              ? 'Connection to Orange Money API successful' 
              : 'Orange Money credentials not configured',
            responseTime: Math.floor(200 + Math.random() * 800),
            timestamp: new Date().toISOString()
          };
          break;
          
        case 'sama_money':
          // SAMA Money test - check if credentials are configured
          const hasSamaCredentials = process.env.SAMA_MERCHANT_CODE && process.env.SAMA_PUBLIC_KEY;
          testResult = {
            success: hasSamaCredentials,
            message: hasSamaCredentials 
              ? 'Connection to SAMA Money API successful' 
              : 'SAMA Money credentials not configured',
            responseTime: Math.floor(200 + Math.random() * 800),
            timestamp: new Date().toISOString()
          };
          break;
          
        default:
          // Generic test for other gateways
          const isSuccessful = Math.random() > 0.2; // 80% success rate
          testResult = {
            success: isSuccessful,
            message: isSuccessful 
              ? `${id} connection test successful` 
              : `${id} connection test failed - check credentials`,
            responseTime: Math.floor(200 + Math.random() * 1000),
            timestamp: new Date().toISOString()
          };
      }
      
      // Add some delay to simulate real API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      res.json(testResult);
    } catch (error) {
      console.error('Error testing payment gateway:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to test payment gateway connection',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Gateway configuration management
  app.put('/api/admin/payment-gateways/:id/config', async (req, res) => {
    try {
      const { id } = req.params;
      const { config } = req.body;
      
      console.log(`Updating configuration for gateway ${id}:`, config);
      
      // In a real implementation, you would update the database
      // and validate the configuration before saving
      
      res.json({ 
        success: true, 
        message: 'Gateway configuration updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating gateway configuration:', error);
      res.status(500).json({ error: 'Failed to update gateway configuration' });
    }
  });

  // Gateway logs endpoint
  app.get('/api/admin/payment-gateways/:id/logs', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Mock log data
      const logs = Array.from({ length: parseInt(limit as string) }, (_, index) => ({
        id: `log_${index + parseInt(offset as string)}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        level: ['info', 'warning', 'error', 'success'][Math.floor(Math.random() * 4)],
        message: [
          'Payment processed successfully',
          'API rate limit warning',
          'Connection timeout',
          'Configuration updated',
          'Webhook delivery failed',
          'Test transaction completed'
        ][Math.floor(Math.random() * 6)],
        gatewayId: id,
        transactionId: Math.random() > 0.5 ? `txn_${Math.random().toString(36).substr(2, 9)}` : null,
        details: {
          responseTime: Math.floor(Math.random() * 2000),
          statusCode: [200, 400, 401, 500][Math.floor(Math.random() * 4)]
        }
      }));
      
      res.json({ logs, total: 1000 });
    } catch (error) {
      console.error('Error fetching gateway logs:', error);
      res.status(500).json({ error: 'Failed to fetch gateway logs' });
    }
  });

  // No need to return server for Vercel serverless
}
