// storage.ts
import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import {
  productReviews,
  users,
  userRoles,
  agents,
  jobs,
  jobApplications,
  competitions,
  products,
  merchants,
  cmsPages,
  loanApplications,
  referrals,
  affiliateRewards,
  commissions,
  membershipPayments,
  subscriptions,
  type User,
  type InsertUser,
  type Referral,
  type InsertReferral,
  type AffiliateReward,
  type InsertAffiliateReward,
  type Commission,
  type InsertCommission,
  type MembershipPayment,
  type InsertMembershipPayment,
  type UserRole,
  type InsertUserRole,
  type Agent,
  type InsertAgent,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type Competition,
  type InsertCompetition,
  type Merchant,
  type InsertMerchant,
  type Product,
  type InsertProduct,
  type CmsPage,
  type InsertCmsPage,
  type LoanApplication,
  type InsertLoanApplication,
  type PhoneOtp,
  type InsertPhoneOtp,
  type ProductReview,
  type InsertProductReview,
  type RewardType
} from '../shared/schema';

// Alias types for backward compatibility
type UserBase = User;
type ReferralBase = Referral;
type AffiliateRewardBase = AffiliateReward;
type CommissionBase = Commission;
type MembershipPaymentBase = MembershipPayment;

export interface IStorage {
  // User operations
  getUser(id: string): Promise<UserBase | undefined>;
  getUserById(id: string): Promise<UserBase | undefined>;
  getUserByEmail(email: string): Promise<UserBase | undefined>;
  createUser(user: InsertUser): Promise<UserBase>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<UserBase | undefined>;
  
  // Role operations
  getUserRoles(userId: string): Promise<string[]>;
  assignRole(userId: string, role: string): Promise<void>;
  
  // Agent operations
  getAgent(userId: string): Promise<any | undefined>;
  createAgent(agent: any): Promise<any>;
  updateAgentCommissions(agentId: string, commissions: any): Promise<void>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<ReferralBase>;
  getReferralsByReferrer(referrerId: string): Promise<ReferralBase[]>;
  getReferralByCode(referralCode: string): Promise<ReferralBase | undefined>;
  updateReferral(id: string, updates: Partial<ReferralBase>): Promise<ReferralBase | undefined>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<CommissionBase>;
  getCommissionsByReferrer(referrerId: string): Promise<CommissionBase[]>;
  updateCommission(id: string, updates: Partial<CommissionBase>): Promise<CommissionBase | undefined>;
  
  // Membership payment operations
  createMembershipPayment(payment: InsertMembershipPayment): Promise<MembershipPaymentBase>;
  getMembershipPaymentsByUser(userId: string): Promise<MembershipPaymentBase[]>;
  updateMembershipPayment(id: string, updates: Partial<MembershipPaymentBase>): Promise<MembershipPaymentBase | undefined>;
  
  // Affiliate reward operations
  createAffiliateReward(reward: InsertAffiliateReward): Promise<AffiliateRewardBase>;
  getAffiliateRewardsByReferrer(referrerId: string): Promise<AffiliateRewardBase[]>;
  updateAffiliateReward(id: string, updates: Partial<AffiliateRewardBase>): Promise<AffiliateRewardBase | undefined>;
  processReferralReward(referralId: string, registrationFee: number): Promise<AffiliateRewardBase>;
  getJobs(): Promise<any[]>;
  getJob(id: string): Promise<any | undefined>;
  createJob(job: any): Promise<any>;
  updateJob(id: string, job: any): Promise<any | undefined>;
  getJobApplications(jobId?: string): Promise<any[]>;
  createJobApplication(application: any): Promise<any>;
  updateJobApplicationStatus(id: string, status: string): Promise<void>;
  getCompetitions(): Promise<any[]>;
  getCompetition(id: string): Promise<any | undefined>;
  createCompetition(competition: any): Promise<any>;
  getProducts(): Promise<any[]>;
  createProduct(product: any): Promise<any>;
  updateProduct(id: string, product: any): Promise<any | undefined>;
  createProductReview(review: any): Promise<any>;
  getProductReviews(productId: string): Promise<any[]>;
  createLoanApplication(loan: any): Promise<any>;
  getLoanApplications(userId?: string): Promise<any[]>;
  updateLoanApplication(id: string, loan: any): Promise<any | undefined>;
  getCmsPages(): Promise<any[]>;
  getCmsPage(slug: string): Promise<any | undefined>;
  createCmsPage(page: any): Promise<any>;
  updateCmsPage(id: string, page: any): Promise<any | undefined>;
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, profile: any): Promise<any>;
  getUserApplications(userId: string): Promise<any[]>;
  getUserBookmarks(userId: string): Promise<any[]>;
  exportDatabase(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<UserBase | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<UserBase | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<UserBase | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<UserBase> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<UserBase | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return result.map(role => role.role);
  }

  async assignRole(userId: string, role: string): Promise<void> {
    await db.insert(userRoles).values({ userId, role });
  }

  async getAgent(userId: string): Promise<any | undefined> {
    const result = await db.select().from(agents).where(eq(agents.userId, userId));
    return result[0];
  }

  async createAgent(agent: any): Promise<any> {
    const result = await db.insert(agents).values(agent).returning();
    return result[0];
  }

  async updateAgentCommissions(agentId: string, commissions: any): Promise<void> {
    await db.update(agents).set(commissions).where(eq(agents.id, agentId));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [created] = await db.insert(referrals).values({
      referrerId: referral.referrerId,
      referredUserId: referral.referredUserId,
      referralCode: referral.referralCode,
      referralType: referral.referralType,
      status: referral.status || 'pending',
      firstPaymentDate: referral.firstPaymentDate,
      lastRenewalDate: referral.lastRenewalDate,
      totalCommissionsGenerated: referral.totalCommissionsGenerated || '0',
    }).returning();
    return created;
  }

  async getReferralsByReferrer(referrerId: string): Promise<ReferralBase[]> {
    return await db.select().from(referrals).where(eq(referrals.referrerId, referrerId));
  }

  async getReferralByCode(referralCode: string): Promise<ReferralBase | undefined> {
    const result = await db.select().from(referrals).where(eq(referrals.referralCode, referralCode));
    return result[0];
  }

  async updateReferral(id: string, updates: Partial<ReferralBase>): Promise<ReferralBase | undefined> {
    const result = await db.update(referrals).set(updates).where(eq(referrals.id, id)).returning();
    return result[0];
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [created] = await db.insert(commissions).values({
      referralId: commission.referralId,
      referrerId: commission.referrerId,
      referredUserId: commission.referredUserId,
      commissionType: commission.commissionType,
      paymentAmount: commission.paymentAmount,
      commissionRate: commission.commissionRate,
      commissionAmount: commission.commissionAmount,
      paymentReference: commission.paymentReference,
      status: commission.status || 'pending',
      paidAt: commission.paidAt,
    }).returning();
    return created;
  }

  async getCommissionsByReferrer(referrerId: string): Promise<CommissionBase[]> {
    return await db.select().from(commissions).where(eq(commissions.referrerId, referrerId));
  }

  async updateCommission(id: string, updates: Partial<CommissionBase>): Promise<CommissionBase | undefined> {
    const result = await db.update(commissions).set(updates).where(eq(commissions.id, id)).returning();
    return result[0];
  }

  async createMembershipPayment(payment: InsertMembershipPayment): Promise<MembershipPayment> {
    const [created] = await db.insert(membershipPayments).values({
      userId: payment.userId,
      membershipTier: payment.membershipTier,
      paymentType: payment.paymentType,
      amount: payment.amount,
      status: payment.status || 'pending',
      paymentMethod: payment.paymentMethod,
      paymentReference: payment.paymentReference,
      expiresAt: payment.expiresAt,
    }).returning();
    return created;
  }

  async getMembershipPaymentsByUser(userId: string): Promise<MembershipPaymentBase[]> {
    return await db.select().from(membershipPayments).where(eq(membershipPayments.userId, userId));
  }

  async updateMembershipPayment(id: string, updates: Partial<MembershipPaymentBase>): Promise<MembershipPaymentBase | undefined> {
    const result = await db.update(membershipPayments).set(updates).where(eq(membershipPayments.id, id)).returning();
    return result[0];
  }

  async getMerchantApplications(): Promise<UserBase[]> {
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
      merchantApprovedBy: approvedBy,
    }).where(eq(users.id, userId));
  }

  async rejectMerchant(userId: string, reason: string): Promise<void> {
    await db.update(users).set({
      merchantApprovalStatus: 'rejected',
    }).where(eq(users.id, userId));
  }

  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const baseCode = user.fullName
      ? `${user.fullName.substring(0, 3).toUpperCase()}${userId.substring(0, 6).toUpperCase()}`
      : `REF${userId.substring(0, 8).toUpperCase()}`;

    await db.update(users).set({ referralCode: baseCode }).where(eq(users.id, userId));
    return baseCode;
  }

  async processReferralCommission(paymentData: {
    userId: string;
    amount: number;
    paymentType: 'initial' | 'renewal';
    referralCode: string;
    paymentReference?: string;
  }): Promise<void> {
    const { userId, amount, paymentType, paymentReference } = paymentData;

    // Vérifier que le montant est valide
    if (amount <= 0) {
      console.warn(`Montant de commission invalide: ${amount}`);
      return;
    }

    // Récupérer l'utilisateur et vérifier qu'il a un parrain
    const user = await this.getUser(userId);
    if (!user || !user.referredBy) {
      console.log(`Utilisateur ${userId} non trouvé ou sans parrain`);
      return;
    }

    // Récupérer le parrain
    const referrer = await this.getUser(user.referredBy);
    if (!referrer) {
      console.error(`Parrain non trouvé pour l'utilisateur ${userId}`);
      return;
    }

    // Trouver le référencement correspondant
    const referralResult = await db.select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, referrer.id),
          eq(referrals.referredUserId, userId)
        )
      );

    if (referralResult.length === 0) {
      console.warn(`Aucun référencement trouvé pour le parrain ${referrer.id} et l'utilisateur ${userId}`);
      return;
    }

    const referral = referralResult[0];
    const commissionRate = 0.10; // 10% de commission
    const commissionAmount = amount * commissionRate;

    try {
      // Créer la commission
      await this.createCommission({
        referralId: referral.id,
        referrerId: referrer.id,
        referredUserId: userId,
        commissionType: paymentType,
        paymentAmount: amount.toFixed(2),
        commissionRate: commissionRate.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        paymentReference: paymentReference || '',
        status: 'pending',
      });

      // Mettre à jour les totaux du parrain
      const newTotalEarned = parseFloat(referrer.totalCommissionsEarned || '0') + commissionAmount;
      const newAvailable = parseFloat(referrer.availableCommissions || '0') + commissionAmount;

      await db.update(users)
        .set({
          totalCommissionsEarned: newTotalEarned.toFixed(2),
          availableCommissions: newAvailable.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(users.id, referrer.id));

      // Mettre à jour le référencement
      const updateData: Partial<ReferralBase> = {
        totalCommissionsGenerated: (parseFloat(referral.totalCommissionsGenerated || '0') + commissionAmount).toFixed(2),
        updatedAt: new Date(),
      };

      if (paymentType === 'initial') {
        updateData.firstPaymentDate = new Date();
      } else {
        updateData.lastRenewalDate = new Date();
      }

      await this.updateReferral(referral.id, updateData);
      
      console.log(`Commission de ${commissionAmount} traitée pour le parrain ${referrer.id}`);
    } catch (error) {
      console.error('Erreur lors du traitement de la commission:', error);
      throw error; // Propager l'erreur pour une gestion ultérieure
    }
  }

  async createAffiliateReward(reward: InsertAffiliateReward): Promise<AffiliateReward> {
    const [created] = await db.insert(affiliateRewards).values({
      referralId: reward.referralId,
      referrerId: reward.referrerId,
      referredUserId: reward.referredUserId,
      rewardType: reward.rewardType,
      creditPointsAwarded: reward.creditPointsAwarded || '0',
      commissionPercentage: reward.commissionPercentage || '0',
      commissionAmount: reward.commissionAmount || '0',
      registrationFee: reward.registrationFee || '0',
      status: reward.status || 'pending',
      awardedAt: reward.awardedAt,
    }).returning();
    return created;
  }

  async getAffiliateRewardsByReferrer(referrerId: string): Promise<AffiliateRewardBase[]> {
    return await db
      .select()
      .from(affiliateRewards)
      .where(eq(affiliateRewards.referrerId, referrerId))
      .orderBy(desc(affiliateRewards.createdAt));
  }

  async updateAffiliateReward(id: string, updates: Partial<AffiliateRewardBase>): Promise<AffiliateRewardBase | undefined> {
    const [updatedReward] = await db
      .update(affiliateRewards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliateRewards.id, id))
      .returning();
    return updatedReward;
  }

  async processReferralReward(referralId: string, registrationFee: number): Promise<AffiliateReward> {
    const [referral] = await db.select().from(referrals).where(eq(referrals.id, referralId));
    if (!referral) {
      throw new Error('Referral not found');
    }

    const rewardType: RewardType = registrationFee > 0 ? 'commission' : 'credit_points';
    const creditPointsAwarded = rewardType === 'credit_points' ? 1000 : 0;
    const commissionPercentage = rewardType === 'commission' ? 10 : 0;
    const commissionAmount = rewardType === 'commission' ? registrationFee * 0.10 : 0;

    const reward: InsertAffiliateReward = {
      referralId,
      referrerId: referral.referrerId,
      referredUserId: referral.referredUserId,
      rewardType,
      creditPointsAwarded: creditPointsAwarded.toString(),
      commissionPercentage: commissionPercentage.toString(),
      commissionAmount: commissionAmount.toString(),
      registrationFee: registrationFee.toString(),
      status: 'awarded' as const,
      awardedAt: new Date(),
    };

    const [newReward] = await db.insert(affiliateRewards).values(reward).returning();

    // Mettre à jour les crédits ou commissions de l'utilisateur
    const [currentUser] = await db.select().from(users).where(eq(users.id, referral.referrerId));
    if (currentUser) {
      if (rewardType === 'credit_points') {
        const currentCredits = parseFloat(currentUser.currentCredits || '0');
        const totalCreditsEarned = parseFloat(currentUser.totalCreditsEarned || '0');
        await db
          .update(users)
          .set({
            currentCredits: (currentCredits + creditPointsAwarded).toString(),
            totalCreditsEarned: (totalCreditsEarned + creditPointsAwarded).toString(),
          })
          .where(eq(users.id, referral.referrerId));
      } else {
        const availableCommissions = parseFloat(currentUser.availableCommissions || '0');
        const totalCommissionsEarned = parseFloat(currentUser.totalCommissionsEarned || '0');
        await db
          .update(users)
          .set({
            availableCommissions: (availableCommissions + commissionAmount).toString(),
            totalCommissionsEarned: (totalCommissionsEarned + commissionAmount).toString(),
          })
          .where(eq(users.id, referral.referrerId));
      }
    }

    return newReward;
  }

  async getJobs(): Promise<any[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<any | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async createJob(job: any): Promise<any> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, job: any): Promise<any | undefined> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async getJobApplications(jobId?: string): Promise<any[]> {
    if (jobId) {
      return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
    }
    return await db.select().from(jobApplications);
  }

  async createJobApplication(application: any): Promise<any> {
    const result = await db.insert(jobApplications).values(application).returning();
    return result[0];
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<void> {
    await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id));
  }

  async getCompetitions(): Promise<any[]> {
    return await db.select().from(competitions).orderBy(desc(competitions.createdAt));
  }

  async getCompetition(id: string): Promise<any | undefined> {
    const result = await db.select().from(competitions).where(eq(competitions.id, id));
    return result[0];
  }

  async createCompetition(competition: any): Promise<any> {
    const result = await db.insert(competitions).values(competition).returning();
    return result[0];
  }

  async getProducts(): Promise<any[]> {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async createProduct(product: any): Promise<any> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: any): Promise<any | undefined> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async createProductReview(review: any): Promise<any> {
    const result = await db.insert(productReviews).values(review).returning();
    return result[0];
  }

  async getProductReviews(productId: string): Promise<any[]> {
    return await db.select().from(productReviews).where(eq(productReviews.productId, productId)).orderBy(desc(productReviews.createdAt));
  }

  async createLoanApplication(loan: any): Promise<any> {
    const result = await db.insert(loanApplications).values(loan).returning();
    return result[0];
  }

  async getLoanApplications(userId?: string): Promise<any[]> {
    if (userId) {
      return await db.select().from(loanApplications).where(eq(loanApplications.userId, userId));
    }
    return await db.select().from(loanApplications);
  }

  async updateLoanApplication(id: string, loan: any): Promise<any | undefined> {
    const result = await db.update(loanApplications).set(loan).where(eq(loanApplications.id, id)).returning();
    return result[0];
  }

  async getCmsPages(): Promise<any[]> {
    return await db.select().from(cmsPages).where(eq(cmsPages.status, 'published')).orderBy(desc(cmsPages.createdAt));
  }

  async getCmsPage(slug: string): Promise<any | undefined> {
    const result = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return result[0];
  }

  async createCmsPage(page: any): Promise<any> {
    const result = await db.insert(cmsPages).values(page).returning();
    return result[0];
  }

  async updateCmsPage(id: string, page: any): Promise<any | undefined> {
    const result = await db.update(cmsPages).set(page).where(eq(cmsPages.id, id)).returning();
    return result[0];
  }

  async getUserProfile(userId: string): Promise<any> {
    const result = await db.select().from(users).where(eq(users.id, userId));
    if (result[0]) {
      const { password, ...profile } = result[0];
      return profile;
    }
    return null;
  }

  async updateUserProfile(userId: string, profile: any): Promise<any> {
    const result = await db.update(users).set(profile).where(eq(users.id, userId)).returning();
    if (result[0]) {
      const { password, ...updatedProfile } = result[0];
      return updatedProfile;
    }
    return null;
  }

  async getUserApplications(userId: string): Promise<any[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.applicantId, userId));
  }

  async getUserBookmarks(userId: string): Promise<any[]> {
    return [];
  }

  async exportDatabase(): Promise<any> {
    const exportData = {
      exportedAt: new Date().toISOString(),
      tables: {
        users: await db.select().from(users),
        userRoles: await db.select().from(userRoles),
        agents: await db.select().from(agents),
        jobs: await db.select().from(jobs),
        jobApplications: await db.select().from(jobApplications),
        competitions: await db.select().from(competitions),
        products: await db.select().from(products),
        merchants: await db.select().from(merchants),
        cmsPages: await db.select().from(cmsPages),
        loanApplications: await db.select().from(loanApplications),
        referrals: await db.select().from(referrals),
        affiliateRewards: await db.select().from(affiliateRewards),
        commissions: await db.select().from(commissions),
        membershipPayments: await db.select().from(membershipPayments),
      },
    };
    return exportData;
  }
}

export const storage = new DatabaseStorage();