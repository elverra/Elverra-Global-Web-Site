import { pgTable, text, uuid, boolean, timestamp, numeric, json, pgEnum, integer, AnyPgColumn } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const agentTypeValues = ['affiliate', 'distributor'] as const;
export type AgentType = typeof agentTypeValues[number];

export const competitionStatusValues = ['active', 'completed', 'cancelled'] as const;
export type CompetitionStatus = typeof competitionStatusValues[number];

export const paymentStatusValues = ['pending', 'completed', 'failed', 'refunded', 'cancelled', 'expired'] as const;
export type PaymentStatus = typeof paymentStatusValues[number];

export const subscriptionStatusValues = ['active', 'pending', 'cancelled', 'expired', 'paused'] as const;
export type SubscriptionStatus = typeof subscriptionStatusValues[number];

export const paymentMethodValues = ['orange_money', 'sama_money', 'credit_card', 'bank_transfer', 'cinetpay'] as const;
export type PaymentMethod = typeof paymentMethodValues[number];

export const subscriptionPlanValues = ['monthly', 'quarterly', 'yearly', 'lifetime', 'one_time', 'semi_annual'] as const;
export type SubscriptionPlan = typeof subscriptionPlanValues[number];

export const rewardTypeValues = ['credit_points', 'commission'] as const;
export type RewardType = typeof rewardTypeValues[number];

export const rewardStatusValues = ['pending', 'awarded', 'cancelled'] as const;
export type RewardStatus = typeof rewardStatusValues[number];

export const agentTypeEnum = pgEnum('agent_type', agentTypeValues);
export const competitionStatusEnum = pgEnum('competition_status', competitionStatusValues);
export const paymentStatusEnum = pgEnum('payment_status', paymentStatusValues);
export const subscriptionStatusEnum = pgEnum('subscription_status', subscriptionStatusValues);
export const paymentMethodEnum = pgEnum('payment_method', paymentMethodValues);
export const subscriptionPlanEnum = pgEnum('subscription_plan', subscriptionPlanValues);


// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  phone: text("phone").unique(),
  address: text("address"),
  city: text("city"),
  bio: text("bio"),
  postalCode: text("postal_code"),
  country: text("country"),
  dateOfBirth: timestamp("date_of_birth"),
  profilePictureUrl: text("profile_picture_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  membershipTier: text("membership_tier"),
  totalCreditsEarned: numeric("total_credits_earned").default('0'),
  totalCreditsSpent: numeric("total_credits_spent").default('0'),
  currentCredits: numeric("current_credits").default('0'),
  isMerchant: boolean("is_merchant").default(false),
  merchantApprovalStatus: text("merchant_approval_status").default('pending'),
  merchantApprovedAt: timestamp("merchant_approved_at"),
  merchantApprovedBy: uuid("merchant_approved_by").references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by").references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  totalCommissionsEarned: numeric("total_commissions_earned").default('0'),
  totalCommissionsPaid: numeric("total_commissions_paid").default('0'),
  availableCommissions: numeric("available_commissions").default('0'),
  refreshToken: text("refresh_token"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  lastLoginAt: timestamp("last_login_at"),
  lastLoginIp: text("last_login_ip"),
  loginCount: integer("login_count").default(0),
  cinetpayAuthToken: text("cinetpay_auth_token"),
  cinetpayTokenExpiresAt: timestamp("cinetpay_token_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references((): AnyPgColumn => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid("subscription_id").references((): AnyPgColumn => subscriptions.id, { onDelete: 'cascade' }),
  paymentAttemptId: uuid("payment_attempt_id").references((): AnyPgColumn => paymentAttempts.id, { onDelete: 'set null' }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('OUV'),
  status: paymentStatusEnum("status").default('pending'),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentReference: text("payment_reference").unique(),
  externalTransactionId: text("external_transaction_id"),
  transactionId: text("transaction_id"),
  description: text("description"),
  metadata: json("metadata"),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment attempts table
export const paymentAttempts = pgTable("payment_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid("subscription_id").references((): AnyPgColumn => subscriptions.id, { onDelete: 'cascade' }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default('OUV'),
  status: paymentStatusEnum("status").default('pending'),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  transactionId: text("transaction_id"),
  error: text("error"),
  errorMessage: text("error_message"),
  metadata: json("metadata"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions tablexporte
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum("plan").notNull(),
  status: subscriptionStatusEnum("status").default('pending'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  isRecurring: boolean("is_recurring").default(true),
  paymentMethod: paymentMethodEnum("payment_method"),
  lastPaymentId: uuid("last_payment_id").references(() => payments.id, { onDelete: 'set null' }),
  metadata: json("metadata"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles table
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agents table
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentType: agentTypeEnum("agent_type").default('affiliate'),
  referralCode: text("referral_code").notNull().unique(),
  qrCode: text("qr_code"),
  totalCommissions: numeric("total_commissions").default('0'),
  commissionsPending: numeric("commissions_pending").default('0'),
  commissionsWithdrawn: numeric("commissions_withdrawn").default('0'),
  isActive: boolean("is_active").default(true),
  approvalStatus: text("approval_status").default('pending'),
  approvedAt: timestamp("approved_at"),
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: 'set null' }),
  rejectionReason: text("rejection_reason"),
  applicationNotes: text("application_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate withdrawals table
export const affiliateWithdrawals = pgTable("affiliate_withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: 'cascade' }),
  withdrawalAmount: numeric("withdrawal_amount").notNull(),
  withdrawalMethod: text("withdrawal_method").notNull(),
  accountDetails: json("account_details"),
  status: text("status").default('pending'),
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: uuid("processed_by").references(() => users.id, { onDelete: 'set null' }),
  transactionReference: text("transaction_reference"),
  processingNotes: text("processing_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
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

// Jobs table
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
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
  postedBy: uuid("posted_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications table
export const jobApplications = pgTable("job_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  applicantId: uuid("applicant_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Competitions table
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

// Competition participants table
export const competitionParticipants = pgTable("competition_participants", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  participantName: text("participant_name").notNull(),
  participantPhone: text("participant_phone").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Competition votes table
export const competitionVotes = pgTable("competition_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionId: uuid("competition_id").notNull().references(() => competitions.id, { onDelete: 'cascade' }),
  participantId: uuid("participant_id").notNull().references(() => competitionParticipants.id, { onDelete: 'cascade' }),
  voterId: uuid("voter_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteDate: timestamp("vote_date").defaultNow(),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Merchants table
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
  sectorId: uuid("sector_id").references(() => discountSectors.id, { onDelete: 'set null' }),
  discountPercentage: numeric("discount_percentage"),
  logoUrl: text("logo_url"),
  description: text("description"),
  website: text("website"),
  rating: numeric("rating").default('4.0'),
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Discount usage table
export const discountUsage = pgTable("discount_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
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
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id, { onDelete: 'cascade' }),
  sectorId: uuid("sector_id").notNull().references(() => discountSectors.id, { onDelete: 'cascade' }),
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

// CMS pages table
export const cmsPages = pgTable("cms_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  pageType: text("page_type").default('page'),
  status: text("status").default('draft'),
  authorId: uuid("author_id").references(() => users.id, { onDelete: 'set null' }),
  lastModifiedBy: uuid("last_modified_by").references(() => users.id, { onDelete: 'set null' }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  featuredImageUrl: text("featured_image_url"),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  publishDate: timestamp("publish_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loan applications table
export const loanApplications = pgTable("loan_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  approvedBy: uuid("approved_by").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment plans table
export const paymentPlans = pgTable("payment_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Distributors table
export const distributors = pgTable("distributors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Referrals table
export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referralCode: text("referral_code").notNull(),
  referralType: text("referral_type").notNull(), // 'member' or 'merchant'
  status: text("status").default('active'), // 'active', 'inactive', 'cancelled'
  firstPaymentDate: timestamp("first_payment_date"),
  lastRenewalDate: timestamp("last_renewal_date"),
  totalCommissionsGenerated: numeric("total_commissions_generated").default('0'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Affiliate rewards table
export const affiliateRewards = pgTable("affiliate_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralId: uuid("referral_id").notNull().references(() => referrals.id, { onDelete: 'cascade' }),
  referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardType: text("reward_type").$type<RewardType>().notNull(),
  creditPointsAwarded: numeric("credit_points_awarded").default('0'),
  commissionPercentage: numeric("commission_percentage").default('0'),
  commissionAmount: numeric("commission_amount").default('0'),
  registrationFee: numeric("registration_fee").default('0'),
  status: text("status").$type<RewardStatus>().default('pending'),
  awardedAt: timestamp("awarded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commissions table
export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralId: uuid("referral_id").notNull().references(() => referrals.id, { onDelete: 'cascade' }),
  referrerId: uuid("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  referredUserId: uuid("referred_user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  commissionType: text("commission_type").notNull(), // 'initial', 'renewal'
  paymentAmount: numeric("payment_amount").notNull(),
  commissionRate: numeric("commission_rate").notNull(),
  commissionAmount: numeric("commission_amount").notNull(),
  paymentReference: text("payment_reference"),
  status: text("status").default('pending'), // 'pending', 'paid', 'cancelled'
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Membership payments table
export const membershipPayments = pgTable("membership_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
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

// Phone OTPs table
export const phoneOtps = pgTable("phone_otps", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product reviews table
export const productReviews = pgTable("product_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  dateOfBirth: z.date().optional().nullable(),
  profilePictureUrl: z.string().optional().nullable(),
  isEmailVerified: z.boolean().optional().default(false),
  isPhoneVerified: z.boolean().optional().default(false),
  membershipTier: z.enum(['essential', 'premium', 'elite']).optional().nullable(),
  totalCreditsEarned: z.string().optional().default('0'),
  totalCreditsSpent: z.string().optional().default('0'),
  currentCredits: z.string().optional().default('0'),
  isMerchant: z.boolean().optional().default(false),
  merchantApprovalStatus: z.enum(['pending', 'approved', 'rejected']).optional().default('pending'),
  merchantApprovedAt: z.date().optional().nullable(),
  merchantApprovedBy: z.string().optional().nullable(),
  referralCode: z.string().optional().nullable(),
  referredBy: z.string().optional().nullable(),
  totalCommissionsEarned: z.string().optional().default('0'),
  totalCommissionsPaid: z.string().optional().default('0'),
  availableCommissions: z.string().optional().default('0'),
  refreshToken: z.string().optional().nullable(),
  refreshTokenExpiresAt: z.date().optional().nullable(),
  lastLoginAt: z.date().optional().nullable(),
  lastLoginIp: z.string().optional().nullable(),
  loginCount: z.number().optional().default(0),
  cinetpayAuthToken: z.string().optional().nullable(),
  cinetpayTokenExpiresAt: z.date().optional().nullable(),
});

// User interface is automatically generated by Drizzle ORM

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().uuid(),
  role: z.string(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  agentType: z.enum(agentTypeValues).default('affiliate'),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  plan: z.enum(subscriptionPlanValues),
  status: z.enum(subscriptionStatusValues).default('pending'),
  paymentMethod: z.enum(paymentMethodValues).optional(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  paymentAttemptId: z.string().uuid().optional(),
  amount: z.number().positive(),
  status: z.enum(paymentStatusValues).default('pending'),
  paymentMethod: z.enum(paymentMethodValues),
});

export const insertPaymentAttemptSchema = createInsertSchema(paymentAttempts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  amount: z.number().positive(),
  status: z.enum(paymentStatusValues).default('pending'),
  paymentMethod: z.enum(paymentMethodValues),
});

export const insertAffiliateWithdrawalSchema = createInsertSchema(affiliateWithdrawals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  agentId: z.string().uuid(),
  withdrawalAmount: z.number().positive(),
  status: z.enum(['pending', 'processed', 'rejected']).default('pending'),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyId: z.string().uuid(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
}).extend({
  jobId: z.string().uuid(),
  applicantId: z.string().uuid(),
  status: z.enum(['pending', 'reviewing', 'interviewing', 'hired', 'rejected']).default('pending'),
});

export const insertCompetitionSchema = createInsertSchema(competitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(competitionStatusValues).default('active'),
});

export const insertMerchantSchema = createInsertSchema(merchants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email().optional(),
  sectorId: z.string().uuid().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  sellerId: z.string().uuid(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  price: z.number().positive(),
});

export const insertDiscountSectorSchema = createInsertSchema(discountSectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const insertDiscountSchema = createInsertSchema(discounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  merchantId: z.string().uuid(),
  sectorId: z.string().uuid(),
  discountPercentage: z.number().min(0).max(100),
  validFrom: z.date().optional(),
  validUntil: z.date().optional().nullable(),
});

export const insertDiscountUsageSchema = createInsertSchema(discountUsage).omit({
  id: true,
  usedAt: true,
}).extend({
  userId: z.string().uuid(),
  merchantId: z.string().uuid(),
  discountPercentage: z.number().min(0).max(100).optional(),
  amountSaved: z.number().min(0).optional(),
});

export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  requestedAmount: z.number().positive(),
  loanType: z.string().min(2, 'Loan type must be specified'),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'disbursed', 'repaid']).default('pending'),
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  referrerId: z.string().uuid(),
  referredUserId: z.string().uuid(),
  referralCode: z.string().min(6, 'Referral code must be at least 6 characters'),
  referralType: z.enum(['signup', 'purchase']).default('signup'),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  referralId: z.string().uuid(),
  referrerId: z.string().uuid(),
  referredUserId: z.string().uuid(),
  commissionType: z.enum(['initial', 'renewal']),
  paymentAmount: z.number().positive(),
  commissionRate: z.number().min(0).max(1),
  commissionAmount: z.number().min(0),
  status: z.enum(['pending', 'paid', 'cancelled']).default('pending'),
});

export const insertMembershipPaymentSchema = createInsertSchema(membershipPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().uuid(),
  membershipTier: z.string().min(1, 'Membership tier is required'),
  paymentType: z.enum(['initial', 'renewal']),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
  paymentMethod: z.enum(paymentMethodValues),
  paymentReference: z.string().optional(),
  expiresAt: z.date().optional(),
});

export const insertAffiliateRewardSchema = createInsertSchema(affiliateRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  referralId: z.string().uuid(),
  referrerId: z.string().uuid(),
  referredUserId: z.string().uuid(),
  rewardType: z.enum(rewardTypeValues),
  creditPointsAwarded: z.number().min(0).optional(),
  commissionPercentage: z.number().min(0).max(1).optional(),
  commissionAmount: z.number().min(0).optional(),
  registrationFee: z.number().min(0).optional(),
  status: z.enum(rewardStatusValues).default('pending'),
});

export const insertPhoneOtpSchema = createInsertSchema(phoneOtps).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().min(1, 'Phone number is required'),
  otp: z.string().min(4, 'OTP must be at least 4 characters'),
  expiresAt: z.date(),
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  productId: z.string().uuid(),
  userId: z.string().uuid(),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
});

// Select Schemas
export const selectUserSchema = createSelectSchema(users);
export const selectUserRoleSchema = createSelectSchema(userRoles);
export const selectAgentSchema = createSelectSchema(agents);
export const selectSubscriptionSchema = createSelectSchema(subscriptions);
export const selectPaymentSchema = createSelectSchema(payments);
export const selectPaymentAttemptSchema = createSelectSchema(paymentAttempts);
export const selectAffiliateWithdrawalSchema = createSelectSchema(affiliateWithdrawals);
export const selectJobSchema = createSelectSchema(jobs);
export const selectJobApplicationSchema = createSelectSchema(jobApplications);
export const selectCompetitionSchema = createSelectSchema(competitions);
export const selectMerchantSchema = createSelectSchema(merchants);
export const selectProductSchema = createSelectSchema(products);
export const selectDiscountSectorSchema = createSelectSchema(discountSectors);
export const selectDiscountSchema = createSelectSchema(discounts);
export const selectDiscountUsageSchema = createSelectSchema(discountUsage);
export const selectLoanApplicationSchema = createSelectSchema(loanApplications);
export const selectCmsPageSchema = createSelectSchema(cmsPages);
export const selectReferralSchema = createSelectSchema(referrals);
export const selectCommissionSchema = createSelectSchema(commissions);
export const selectMembershipPaymentSchema = createSelectSchema(membershipPayments);
export const selectAffiliateRewardSchema = createSelectSchema(affiliateRewards);
export const selectPhoneOtpSchema = createSelectSchema(phoneOtps);
export const selectProductReviewSchema = createSelectSchema(productReviews);

// TypeScript Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type PaymentAttempt = typeof paymentAttempts.$inferSelect;
export type InsertPaymentAttempt = typeof paymentAttempts.$inferInsert;
export type AffiliateWithdrawal = typeof affiliateWithdrawals.$inferSelect;
export type InsertAffiliateWithdrawal = typeof affiliateWithdrawals.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = typeof jobApplications.$inferInsert;
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = typeof competitions.$inferInsert;
export type Merchant = typeof merchants.$inferSelect;
export type InsertMerchant = typeof merchants.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type DiscountSector = typeof discountSectors.$inferSelect;
export type InsertDiscountSector = typeof discountSectors.$inferInsert;
export type Discount = typeof discounts.$inferSelect;
export type InsertDiscount = typeof discounts.$inferInsert;
export type DiscountUsage = typeof discountUsage.$inferSelect;
export type InsertDiscountUsage = typeof discountUsage.$inferInsert;
export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;
export type CmsPage = typeof cmsPages.$inferSelect;
export type InsertCmsPage = typeof cmsPages.$inferInsert;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
export type MembershipPayment = typeof membershipPayments.$inferSelect;
export type InsertMembershipPayment = typeof membershipPayments.$inferInsert;
export type AffiliateReward = typeof affiliateRewards.$inferSelect;
export type InsertAffiliateReward = typeof affiliateRewards.$inferInsert;
export type PhoneOtp = typeof phoneOtps.$inferSelect;
export type InsertPhoneOtp = typeof phoneOtps.$inferInsert;
export type ProductReview = typeof productReviews.$inferSelect;
export type InsertProductReview = typeof productReviews.$inferInsert;

// Extended interfaces with relations
export interface AffiliateRewardWithRelations extends AffiliateReward {
  referrer?: User;
  referredUser?: User;
  referral?: Referral;
}

export interface PaymentWithRelations extends Payment {
  user?: User;
  subscription?: Subscription;
  paymentAttempt?: PaymentAttempt;
}

export interface SubscriptionWithRelations extends Subscription {
  user?: User;
  payments?: Payment[];
  lastPayment?: Payment | null;
}

export interface PaymentAttemptWithRelations extends PaymentAttempt {
  user?: User;
  subscription?: Subscription | null;
  payment?: Payment | null;
}

// Ô Secours Tables
export const secoursSubscriptions = pgTable("secours_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionType: text("subscription_type").notNull(), // 'motors', 'telephone', 'auto', 'cata_catanis', 'school_fees'
  tokenBalance: integer("token_balance").default(0),
  isActive: boolean("is_active").default(true),
  subscriptionDate: timestamp("subscription_date").defaultNow(),
  lastRescueClaimDate: timestamp("last_rescue_claim_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const secoursTransactions = pgTable("secours_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => secoursSubscriptions.id, { onDelete: 'cascade' }),
  transactionType: text("transaction_type").notNull(), // 'purchase', 'usage'
  tokenAmount: integer("token_amount").notNull(),
  tokenValueFcfa: numeric("token_value_fcfa", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"), // 'orange_money', 'sama_money', 'bank_card', etc.
  transactionReference: text("transaction_reference"),
  status: text("status").default('pending'), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const secoursRescueRequests = pgTable("secours_rescue_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  subscriptionId: uuid("subscription_id").notNull().references(() => secoursSubscriptions.id, { onDelete: 'cascade' }),
  requestDescription: text("request_description").notNull(),
  rescueValueFcfa: numeric("rescue_value_fcfa", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default('pending'), // 'pending', 'approved', 'completed', 'rejected'
  requestDate: timestamp("request_date").defaultNow(),
  processedDate: timestamp("processed_date"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for Ô Secours
export const insertSecoursSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  subscriptionType: z.enum(['motors', 'telephone', 'auto', 'cata_catanis', 'school_fees']),
  tokenBalance: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const insertSecoursTransactionSchema = z.object({
  subscriptionId: z.string().uuid(),
  transactionType: z.enum(['purchase', 'usage']),
  tokenAmount: z.number().int().positive(),
  tokenValueFcfa: z.number().positive(),
  paymentMethod: z.string().optional(),
  transactionReference: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
});

export const insertSecoursRescueRequestSchema = z.object({
  subscriptionId: z.string().uuid(),
  requestDescription: z.string().min(10),
  rescueValueFcfa: z.number().positive(),
  status: z.enum(['pending', 'approved', 'completed', 'rejected']).default('pending'),
});

// TypeScript types
export type SecoursSubscription = typeof secoursSubscriptions.$inferSelect;
export type InsertSecoursSubscription = typeof secoursSubscriptions.$inferInsert;
export type SecoursTransaction = typeof secoursTransactions.$inferSelect;
export type InsertSecoursTransaction = typeof secoursTransactions.$inferInsert;
export type SecoursRescueRequest = typeof secoursRescueRequests.$inferSelect;
export type InsertSecoursRescueRequest = typeof secoursRescueRequests.$inferInsert;