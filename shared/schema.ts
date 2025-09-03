import { pgTable, text, serial, integer, boolean, timestamp, uuid, numeric, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const agentTypeEnum = pgEnum('agent_type', ['affiliate', 'distributor']);
export const competitionStatusEnum = pgEnum('competition_status', ['active', 'completed', 'cancelled']);

// Core user tables
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone").unique(),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  dateOfBirth: timestamp("date_of_birth"),
  profilePictureUrl: text("profile_picture_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  membershipTier: text("membership_tier").default('basic'),
  totalCreditsEarned: numeric("total_credits_earned").default('0'),
  totalCreditsSpent: numeric("total_credits_spent").default('0'),
  currentCredits: numeric("current_credits").default('0'),
  isMerchant: boolean("is_merchant").default(false),
  merchantApprovalStatus: text("merchant_approval_status").default('pending'),
  merchantApprovedAt: timestamp("merchant_approved_at"),
  merchantApprovedBy: uuid("merchant_approved_by"),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by"),
  totalCommissionsEarned: numeric("total_commissions_earned").default('0'),
  totalCommissionsPaid: numeric("total_commissions_paid").default('0'),
  availableCommissions: numeric("available_commissions").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent and affiliate tables
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  agentType: agentTypeEnum("agent_type").default('affiliate'),
  referralCode: text("referral_code").notNull().unique(),
  qrCode: text("qr_code"),
  totalCommissions: numeric("total_commissions").default('0'),
  commissionsPending: numeric("commissions_pending").default('0'),
  commissionsWithdrawn: numeric("commissions_withdrawn").default('0'),
  isActive: boolean("is_active").default(true),
  approvalStatus: text("approval_status").default('pending'),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by"),
  rejectionReason: text("rejection_reason"),
  applicationNotes: text("application_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const affiliateWithdrawals = pgTable("affiliate_withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id),
  withdrawalAmount: numeric("withdrawal_amount").notNull(),
  withdrawalMethod: text("withdrawal_method").notNull(),
  accountDetails: json("account_details"),
  status: text("status").default('pending'),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: uuid("processed_by"),
  transactionReference: text("transaction_reference"),
  processingNotes: text("processing_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company and job tables
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  logoUrl: text("logo_url"),
  industry: text("industry"),
  size: text("size"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  benefits: text("benefits"),
  salaryMin: numeric("salary_min"),
  salaryMax: numeric("salary_max"),
  location: text("location"),
  jobType: text("job_type"),
  experienceLevel: text("experience_level"),
  skills: text("skills").array(),
  isRemote: boolean("is_remote").default(false),
  isActive: boolean("is_active").default(true),
  applicationDeadline: timestamp("application_deadline"),
  postedBy: uuid("posted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id),
  applicantId: uuid("applicant_id").notNull().references(() => users.id),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  coverLetter: text("cover_letter"),
  skills: text("skills").array(),
  experienceYears: integer("experience_years"),
  education: text("education"),
  workExperience: text("work_experience"),
  portfolioUrl: text("portfolio_url"),
  expectedSalary: numeric("expected_salary"),
  availableFrom: timestamp("available_from"),
  status: text("status").default('pending'),
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Competition tables
export const competitions = pgTable("competitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  prize: text("prize"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxEntries: integer("max_entries"),
  currentEntries: integer("current_entries").default(0),
  location: text("location"),
  status: competitionStatusEnum("status").default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const competitionParticipants = pgTable("competition_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  participantName: text("participant_name").notNull(),
  participantPhone: text("participant_phone").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitionVotes = pgTable("competition_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id),
  participantId: uuid("participant_id").notNull().references(() => competitionParticipants.id),
  voterId: uuid("voter_id").notNull().references(() => users.id),
  voteDate: timestamp("vote_date").defaultNow(),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Merchant and product tables
export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  businessType: text("business_type"),
  sectorId: text("sector_id"),
  discountPercentage: numeric("discount_percentage"),
  logoUrl: text("logo_url"),
  description: text("description"),
  website: text("website"),
  rating: numeric("rating").default('4.0'), // Star rating 1-5
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  category: text("category"),
  condition: text("condition"),
  location: text("location"),
  images: text("images").array(),
  contactInfo: text("contact_info"),
  isActive: boolean("is_active").default(true),
  featured: boolean("featured").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const discountUsage = pgTable("discount_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  discountPercentage: numeric("discount_percentage"),
  amountSaved: numeric("amount_saved"),
  usedAt: timestamp("used_at").defaultNow(),
});

// Discount sectors table
export const discountSectors = pgTable("discount_sectors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discounts table  
export const discounts = pgTable("discounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  sectorId: uuid("sector_id").notNull().references(() => discountSectors.id),
  discountPercentage: numeric("discount_percentage").notNull(),
  minOrderAmount: numeric("min_order_amount").default('0'),
  maxDiscountAmount: numeric("max_discount_amount"),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  termsAndConditions: text("terms_and_conditions"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CMS and content tables
export const cmsPages = pgTable("cms_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  pageType: text("page_type").default('page'),
  status: text("status").default('draft'),
  authorId: uuid("author_id").references(() => users.id),
  lastModifiedBy: uuid("last_modified_by").references(() => users.id),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  featuredImageUrl: text("featured_image_url"),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  publishDate: timestamp("publish_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial tables
export const loanApplications = pgTable("loan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  loanType: text("loan_type").notNull(),
  requestedAmount: numeric("requested_amount").notNull(),
  monthlyIncome: numeric("monthly_income"),
  employmentStatus: text("employment_status"),
  employmentDuration: text("employment_duration"),
  purpose: text("purpose"),
  collateral: text("collateral"),
  status: text("status").default('pending'),
  applicationDate: timestamp("application_date").defaultNow(),
  processingNotes: text("processing_notes"),
  approvedAmount: numeric("approved_amount"),
  interestRate: numeric("interest_rate"),
  termMonths: integer("term_months"),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  productName: text("product_name").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  downPayment: numeric("down_payment").default('0'),
  monthlyPayment: numeric("monthly_payment").notNull(),
  numberOfPayments: integer("number_of_payments").notNull(),
  interestRate: numeric("interest_rate").default('0'),
  status: text("status").default('active'),
  startDate: timestamp("start_date").defaultNow(),
  nextPaymentDate: timestamp("next_payment_date"),
  completedPayments: integer("completed_payments").default(0),
  totalPaid: numeric("total_paid").default('0'),
  remainingBalance: numeric("remaining_balance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const distributors = pgTable("distributors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  businessName: text("business_name"),
  businessRegistrationNumber: text("business_registration_number"),
  distributorType: text("distributor_type").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  territoryCoverage: text("territory_coverage"),
  productsDistributed: text("products_distributed").array(),
  commissionRate: numeric("commission_rate"),
  totalSales: numeric("total_sales").default('0'),
  totalCommissionEarned: numeric("total_commission_earned").default('0'),
  commissionPending: numeric("commission_pending").default('0'),
  commissionWithdrawn: numeric("commission_withdrawn").default('0'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral and Commission tracking tables
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id),
  referralCode: text("referral_code").notNull(),
  referralType: text("referral_type").notNull(), // 'member' or 'merchant'
  status: text("status").default('active'), // 'active', 'inactive', 'cancelled'
  firstPaymentDate: timestamp("first_payment_date"),
  lastRenewalDate: timestamp("last_renewal_date"),
  totalCommissionsGenerated: numeric("total_commissions_generated").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const affiliateRewards = pgTable("affiliate_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralId: uuid("referral_id").notNull().references(() => referrals.id),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id),
  rewardType: text("reward_type").notNull(), // 'credit_points' or 'commission'
  creditPointsAwarded: numeric("credit_points_awarded").default('0'), // 1000 CFs per referral
  commissionPercentage: numeric("commission_percentage").default('0'), // 10% commission rate
  commissionAmount: numeric("commission_amount").default('0'), // Actual commission amount
  registrationFee: numeric("registration_fee").default('0'), // Fee paid by referred user
  status: text("status").default('pending'), // 'pending', 'awarded', 'cancelled'
  awardedAt: timestamp("awarded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralId: uuid("referral_id").notNull().references(() => referrals.id),
  referrerId: uuid("referrer_id").notNull().references(() => users.id),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id),
  commissionType: text("commission_type").notNull(), // 'initial', 'renewal'
  paymentAmount: numeric("payment_amount").notNull(),
  commissionRate: numeric("commission_rate").notNull(), // 0.10 for 10%
  commissionAmount: numeric("commission_amount").notNull(),
  paymentReference: text("payment_reference"),
  status: text("status").default('pending'), // 'pending', 'paid', 'cancelled'
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const membershipPayments = pgTable("membership_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  membershipTier: text("membership_tier").notNull(),
  paymentType: text("payment_type").notNull(), // 'initial', 'renewal'
  amount: numeric("amount").notNull(),
  currency: text("currency").default('CFA'),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  status: text("status").default('pending'), // 'pending', 'completed', 'failed'
  paidAt: timestamp("paid_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OTP verification table
export const phoneOtps = pgTable("phone_otps", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompetitionSchema = createInsertSchema(competitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMembershipPaymentSchema = createInsertSchema(membershipPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateRewardSchema = createInsertSchema(affiliateRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhoneOtpSchema = createInsertSchema(phoneOtps).omit({
  id: true,
  createdAt: true,
});

// Discount schemas
export const insertDiscountSectorSchema = createInsertSchema(discountSectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountSchema = createInsertSchema(discounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountUsageSchema = createInsertSchema(discountUsage).omit({
  id: true,
  usedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type CmsPage = typeof cmsPages.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type MembershipPayment = typeof membershipPayments.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type InsertMembershipPayment = z.infer<typeof insertMembershipPaymentSchema>;
export type PhoneOtp = typeof phoneOtps.$inferSelect;
export type DiscountSector = typeof discountSectors.$inferSelect;
export type InsertDiscountSector = z.infer<typeof insertDiscountSectorSchema>;
export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = z.infer<typeof insertDiscountSchema>;
export type DiscountUsage = typeof discountUsage.$inferSelect;
export type InsertDiscountUsage = z.infer<typeof insertDiscountUsageSchema>;
export type InsertPhoneOtp = z.infer<typeof insertPhoneOtpSchema>;
export type AffiliateReward = typeof affiliateRewards.$inferSelect;
export type InsertAffiliateReward = z.infer<typeof insertAffiliateRewardSchema>;
