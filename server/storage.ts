import { eq, and, desc, like } from "drizzle-orm";
import { db } from "./db.js";
import { 
  users, userRoles, agents, jobs, jobApplications, competitions, competitionParticipants,
  products, merchants, cmsPages, loanApplications, paymentPlans, companies, affiliateWithdrawals,
  distributors, discountUsage, competitionVotes, referrals, commissions, membershipPayments, affiliateRewards,
  productReviews,
  type User, type InsertUser, type Agent, type Job, type JobApplication, type Competition, 
  type Product, type LoanApplication, type CmsPage, type Referral, type Commission, 
  type MembershipPayment, type InsertReferral, type InsertCommission, type InsertMembershipPayment,
  type AffiliateReward, type InsertAffiliateReward, type ProductReview, type InsertProductReview
} from "../shared/schema.js";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // User roles
  getUserRoles(userId: string): Promise<string[]>;
  assignRole(userId: string, role: string): Promise<void>;
  
  // Agent operations
  getAgent(userId: string): Promise<Agent | undefined>;
  createAgent(agent: any): Promise<Agent>;
  updateAgentCommissions(agentId: string, commissions: any): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerId: string): Promise<Referral[]>;
  getReferralByCode(referralCode: string): Promise<Referral | undefined>;
  updateReferral(id: string, updates: Partial<Referral>): Promise<Referral | undefined>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<Commission>;
  getCommissionsByReferrer(referrerId: string): Promise<Commission[]>;
  updateCommission(id: string, updates: Partial<Commission>): Promise<Commission | undefined>;
  
  // Membership payment operations
  createMembershipPayment(payment: InsertMembershipPayment): Promise<MembershipPayment>;
  getMembershipPaymentsByUser(userId: string): Promise<MembershipPayment[]>;
  updateMembershipPayment(id: string, updates: Partial<MembershipPayment>): Promise<MembershipPayment | undefined>;
  
  // Merchant operations
  getMerchantApplications(): Promise<User[]>;
  approveMerchant(userId: string, approvedBy: string): Promise<void>;
  rejectMerchant(userId: string, reason: string): Promise<void>;
  
  // Affiliate program operations
  generateReferralCode(userId: string): Promise<string>;
  processReferralCommission(paymentData: any): Promise<void>;
  
  // Affiliate reward operations
  createAffiliateReward(reward: InsertAffiliateReward): Promise<AffiliateReward>;
  getAffiliateRewardsByReferrer(referrerId: string): Promise<AffiliateReward[]>;
  updateAffiliateReward(id: string, updates: Partial<AffiliateReward>): Promise<AffiliateReward | undefined>;
  processReferralReward(referralId: string, registrationFee: number): Promise<AffiliateReward>;
  
  // Job operations
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: any): Promise<Job>;
  updateJob(id: string, job: any): Promise<Job | undefined>;
  
  // Job applications
  getJobApplications(jobId?: string): Promise<JobApplication[]>;
  createJobApplication(application: any): Promise<JobApplication>;
  updateJobApplicationStatus(id: string, status: string): Promise<void>;
  
  // Competition operations
  getCompetitions(): Promise<Competition[]>;
  getCompetition(id: string): Promise<Competition | undefined>;
  createCompetition(competition: any): Promise<Competition>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  createProduct(product: any): Promise<Product>;
  updateProduct(id: string, product: any): Promise<Product | undefined>;
  
  // Product review operations
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  getProductReviews(productId: string): Promise<ProductReview[]>;
  
  // Loan operations
  createLoanApplication(loan: any): Promise<LoanApplication>;
  getLoanApplications(userId?: string): Promise<LoanApplication[]>;
  updateLoanApplication(id: string, loan: any): Promise<LoanApplication | undefined>;
  
  // CMS operations
  getCmsPages(): Promise<CmsPage[]>;
  getCmsPage(slug: string): Promise<CmsPage | undefined>;
  createCmsPage(page: any): Promise<CmsPage>;
  updateCmsPage(id: string, page: any): Promise<CmsPage | undefined>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, profile: any): Promise<any>;
  
  // Additional user data
  getUserApplications(userId: string): Promise<any[]>;
  getUserBookmarks(userId: string): Promise<any[]>;
  
  // Database export
  exportDatabase(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // User roles
  async getUserRoles(userId: string): Promise<string[]> {
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return result.map(role => role.role);
  }

  async assignRole(userId: string, role: string): Promise<void> {
    await db.insert(userRoles).values({ userId, role });
  }

  // Agent operations
  async getAgent(userId: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.userId, userId));
    return result[0];
  }

  async createAgent(agent: any): Promise<Agent> {
    const result = await db.insert(agents).values(agent).returning();
    return result[0];
  }

  async updateAgentCommissions(agentId: string, commissions: any): Promise<void> {
    await db.update(agents).set(commissions).where(eq(agents.id, agentId));
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async createJob(job: any): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, job: any): Promise<Job | undefined> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  // Job applications
  async getJobApplications(jobId?: string): Promise<JobApplication[]> {
    if (jobId) {
      return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
    }
    return await db.select().from(jobApplications);
  }

  async createJobApplication(application: any): Promise<JobApplication> {
    const result = await db.insert(jobApplications).values(application).returning();
    return result[0];
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<void> {
    await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id));
  }

  // Competition operations
  async getCompetitions(): Promise<Competition[]> {
    return await db.select().from(competitions).orderBy(desc(competitions.createdAt));
  }

  async getCompetition(id: string): Promise<Competition | undefined> {
    const result = await db.select().from(competitions).where(eq(competitions.id, id));
    return result[0];
  }

  async createCompetition(competition: any): Promise<Competition> {
    const result = await db.insert(competitions).values(competition).returning();
    return result[0];
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async createProduct(product: any): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: any): Promise<Product | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  // Product review operations
  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const result = await db.insert(productReviews).values(review).returning();
    return result[0];
  }

  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return await db.select().from(productReviews).where(eq(productReviews.productId, productId)).orderBy(desc(productReviews.createdAt));
  }

  // Loan operations
  async createLoanApplication(loan: any): Promise<LoanApplication> {
    const result = await db.insert(loanApplications).values(loan).returning();
    return result[0];
  }

  async getLoanApplications(userId?: string): Promise<LoanApplication[]> {
    if (userId) {
      return await db.select().from(loanApplications).where(eq(loanApplications.userId, userId));
    }
    return await db.select().from(loanApplications);
  }

  async updateLoanApplication(id: string, loan: any): Promise<LoanApplication | undefined> {
    const result = await db.update(loanApplications).set(loan).where(eq(loanApplications.id, id)).returning();
    return result[0];
  }

  // CMS operations
  async getCmsPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).where(eq(cmsPages.status, 'published')).orderBy(desc(cmsPages.createdAt));
  }

  async getCmsPage(slug: string): Promise<CmsPage | undefined> {
    const result = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return result[0];
  }

  async createCmsPage(page: any): Promise<CmsPage> {
    const result = await db.insert(cmsPages).values(page).returning();
    return result[0];
  }

  async updateCmsPage(id: string, page: any): Promise<CmsPage | undefined> {
    const result = await db.update(cmsPages).set(page).where(eq(cmsPages.id, id)).returning();
    return result[0];
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<any> {
    try {
      const result = await db.select().from(users).where(eq(users.id, userId));
      if (result[0]) {
        const { password, ...profile } = result[0];
        return profile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profile: any): Promise<any> {
    try {
      const result = await db.update(users).set(profile).where(eq(users.id, userId)).returning();
      if (result[0]) {
        const { password, ...updatedProfile } = result[0];
        return updatedProfile;
      }
      return null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  // Additional user data
  async getUserApplications(userId: string): Promise<any[]> {
    try {
      const result = await db.select().from(jobApplications).where(eq(jobApplications.applicantId, userId));
      return result || [];
    } catch (error) {
      console.error('Error getting user applications:', error);
      return [];
    }
  }

  async getUserBookmarks(userId: string): Promise<any[]> {
    try {
      // For now, return empty array as bookmarks table may not exist
      return [];
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      return [];
    }
  }

  // Database export
  async exportDatabase(): Promise<any> {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        tables: {
          users: await db.select().from(users),
          userRoles: await db.select().from(userRoles),
          agents: await db.select().from(agents),
          affiliateWithdrawals: await db.select().from(affiliateWithdrawals),
          companies: await db.select().from(companies),
          jobs: await db.select().from(jobs),
          jobApplications: await db.select().from(jobApplications),
          competitions: await db.select().from(competitions),
          competitionParticipants: await db.select().from(competitionParticipants),
          competitionVotes: await db.select().from(competitionVotes),
          merchants: await db.select().from(merchants),
          products: await db.select().from(products),
          discountUsage: await db.select().from(discountUsage),
          cmsPages: await db.select().from(cmsPages),
          loanApplications: await db.select().from(loanApplications),
          paymentPlans: await db.select().from(paymentPlans),
          distributors: await db.select().from(distributors),
          referrals: await db.select().from(referrals),
          commissions: await db.select().from(commissions),
          membershipPayments: await db.select().from(membershipPayments),
        }
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting database:', error);
      throw new Error('Failed to export database');
    }
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const result = await db.insert(referrals).values(referral).returning();
    return result[0];
  }

  async getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async getReferralByCode(referralCode: string): Promise<Referral | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.referralCode, referralCode));
    return result[0];
  }

  async updateReferral(id: string, updates: Partial<Referral>): Promise<Referral | undefined> {
    const result = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return result[0];
  }

  // Commission operations
  async createCommission(commission: InsertCommission): Promise<Commission> {
    const result = await db.insert(commissions).values(commission).returning();
    return result[0];
  }

  async getCommissionsByReferrer(referrerId: string): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.referrerId, referrerId));
  }

  async updateCommission(id: string, updates: Partial<Commission>): Promise<Commission | undefined> {
    const result = await db.update(commissions).set(updates).where(eq(commissions.id, id)).returning();
    return result[0];
  }

  // Membership payment operations
  async createMembershipPayment(payment: InsertMembershipPayment): Promise<MembershipPayment> {
    const result = await db.insert(membershipPayments).values(payment).returning();
    return result[0];
  }

  async getMembershipPaymentsByUser(userId: string): Promise<MembershipPayment[]> {
    return await db.select().from(membershipPayments).where(eq(membershipPayments.userId, userId));
  }

  async updateMembershipPayment(id: string, updates: Partial<MembershipPayment>): Promise<MembershipPayment | undefined> {
    const result = await db.update(membershipPayments).set(updates).where(eq(membershipPayments.id, id)).returning();
    return result[0];
  }

  // Merchant operations
  async getMerchantApplications(): Promise<User[]> {
    return await db.select().from(users).where(
      and(
        eq(users.isMerchant, true),
        eq(users.merchantApprovalStatus, 'pending')
      )
    );
  }

  async approveMerchant(userId: string, approvedBy: string): Promise<void> {
    await db.update(users).set({
      merchantApprovalStatus: 'approved',
      merchantApprovedAt: new Date(),
      merchantApprovedBy: approvedBy
    }).where(eq(users.id, userId));
  }

  async rejectMerchant(userId: string, reason: string): Promise<void> {
    await db.update(users).set({
      merchantApprovalStatus: 'rejected'
    }).where(eq(users.id, userId));
  }

  // Affiliate program operations
  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate a unique referral code
    const baseCode = user.fullName ? 
      user.fullName.substring(0, 3).toUpperCase() + userId.substring(0, 6).toUpperCase() :
      'REF' + userId.substring(0, 8).toUpperCase();
    
    // Update user with referral code
    await db.update(users).set({ referralCode: baseCode }).where(eq(users.id, userId));
    
    return baseCode;
  }

  async processReferralCommission(paymentData: any): Promise<void> {
    const { userId, amount, paymentType, referralCode } = paymentData;
    
    // Find the referrer based on referral code
    const user = await this.getUser(userId);
    if (!user || !user.referredBy) {
      return; // No referrer, nothing to process
    }

    const referrer = await this.getUser(user.referredBy);
    if (!referrer) {
      return; // Referrer not found
    }

    // Find the referral record
    const referralResult = await db.select().from(referrals).where(
      and(
        eq(referrals.referrerId, referrer.id),
        eq(referrals.referredUserId, userId)
      )
    );

    if (referralResult.length === 0) {
      return; // No referral record found
    }

    const referral = referralResult[0];

    // Calculate commission (10%)
    const commissionRate = 0.10;
    const commissionAmount = Number(amount) * commissionRate;

    // Create commission record
    await this.createCommission({
      referralId: referral.id,
      referrerId: referrer.id,
      referredUserId: userId,
      commissionType: paymentType === 'initial' ? 'initial' : 'renewal',
      paymentAmount: amount.toString(),
      commissionRate: commissionRate.toString(),
      commissionAmount: commissionAmount.toString(),
      paymentReference: paymentData.paymentReference || '',
      status: 'pending'
    });

    // Update referrer's commission totals
    const newTotalEarned = Number(referrer.totalCommissionsEarned || 0) + commissionAmount;
    const newAvailable = Number(referrer.availableCommissions || 0) + commissionAmount;

    await db.update(users).set({
      totalCommissionsEarned: newTotalEarned.toString(),
      availableCommissions: newAvailable.toString()
    }).where(eq(users.id, referrer.id));

    // Update referral record
    const updateData: any = {
      totalCommissionsGenerated: (Number(referral.totalCommissionsGenerated || 0) + commissionAmount).toString(),
      updatedAt: new Date()
    };

    if (paymentType === 'initial') {
      updateData.firstPaymentDate = new Date();
    } else {
      updateData.lastRenewalDate = new Date();
    }

    await this.updateReferral(referral.id, updateData);
  }

  // Affiliate reward operations
  async createAffiliateReward(reward: InsertAffiliateReward): Promise<AffiliateReward> {
    const [newReward] = await db
      .insert(affiliateRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  async getAffiliateRewardsByReferrer(referrerId: string): Promise<AffiliateReward[]> {
    return await db
      .select()
      .from(affiliateRewards)
      .where(eq(affiliateRewards.referrerId, referrerId))
      .orderBy(desc(affiliateRewards.createdAt));
  }

  async updateAffiliateReward(id: string, updates: Partial<AffiliateReward>): Promise<AffiliateReward | undefined> {
    const [updatedReward] = await db
      .update(affiliateRewards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliateRewards.id, id))
      .returning();
    return updatedReward;
  }

  async processReferralReward(referralId: string, registrationFee: number): Promise<AffiliateReward> {
    // Get the referral information
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));
    
    if (!referral) {
      throw new Error('Referral not found');
    }

    // Decide reward type: credit points (1000 CFs) OR 10% commission
    const rewardType = registrationFee > 0 ? 'commission' : 'credit_points';
    const creditPointsAwarded = rewardType === 'credit_points' ? 1000 : 0;
    const commissionPercentage = rewardType === 'commission' ? 10 : 0;
    const commissionAmount = rewardType === 'commission' ? registrationFee * 0.10 : 0;

    // Create the reward record
    const reward: InsertAffiliateReward = {
      referralId: referralId,
      referrerId: referral.referrerId,
      referredUserId: referral.referredUserId,
      rewardType,
      creditPointsAwarded: creditPointsAwarded.toString(),
      commissionPercentage: commissionPercentage.toString(),
      commissionAmount: commissionAmount.toString(),
      registrationFee: registrationFee.toString(),
      status: 'awarded',
      awardedAt: new Date()
    };

    const [newReward] = await db
      .insert(affiliateRewards)
      .values(reward)
      .returning();

    // Update user's credits or commissions
    if (rewardType === 'credit_points') {
      // Get current user data to avoid SQL string concatenation issues
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, referral.referrerId));
      
      if (currentUser) {
        const currentCredits = parseFloat(currentUser.currentCredits?.toString() || '0');
        const totalCreditsEarned = parseFloat(currentUser.totalCreditsEarned?.toString() || '0');
        
        await db
          .update(users)
          .set({
            currentCredits: (currentCredits + creditPointsAwarded).toString(),
            totalCreditsEarned: (totalCreditsEarned + creditPointsAwarded).toString()
          })
          .where(eq(users.id, referral.referrerId));
      }
    } else {
      // Get current user data to avoid SQL string concatenation issues
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, referral.referrerId));
      
      if (currentUser) {
        const availableCommissions = parseFloat(currentUser.availableCommissions?.toString() || '0');
        const totalCommissionsEarned = parseFloat(currentUser.totalCommissionsEarned?.toString() || '0');
        
        await db
          .update(users)
          .set({
            availableCommissions: (availableCommissions + commissionAmount).toString(),
            totalCommissionsEarned: (totalCommissionsEarned + commissionAmount).toString()
          })
          .where(eq(users.id, referral.referrerId));
      }
    }

    return newReward;
  }
}

export const storage = new DatabaseStorage();
