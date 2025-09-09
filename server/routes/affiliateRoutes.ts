import { Router } from 'express';
import { db } from '../db.js';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { 
  agents, 
  users, 
  referrals, 
  affiliateRewards,
  selectUserSchema,
  selectReferralSchema,
  selectAffiliateRewardSchema,
  type User,
  type Agent,
  type Referral,
  type AffiliateReward
} from '../../shared/schema.js';
import { authenticateToken } from '../middleware/auth.js';

// Create the router
const affiliateRouter = Router();

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Get affiliate stats
affiliateRouter.get('/:userId/stats', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user matches the userId or is an admin
    if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get affiliate data
    const [affiliate] = await db
      .select({
        id: agents.id,
        referralCode: agents.referralCode,
        totalCommissions: agents.totalCommissions,
        pendingCommissions: agents.commissionsPending,
        totalReferrals: sql<number>`count(${referrals.id})`,
      })
      .from(agents)
      .leftJoin(referrals, eq(referrals.referrerId, agents.userId))
      .where(eq(agents.userId, userId))
      .groupBy(agents.id, agents.referralCode, agents.totalCommissions, agents.commissionsPending);

    if (!affiliate) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    // Get recent rewards
    const recentRewards = await db
      .select({
        id: affiliateRewards.id,
        amount: sql<number>`COALESCE(${affiliateRewards.creditPointsAwarded}::numeric, 0)`,
        status: affiliateRewards.status,
        createdAt: affiliateRewards.createdAt
      })
      .from(affiliateRewards)
      .where(eq(affiliateRewards.referrerId, userId))
      .orderBy(desc(affiliateRewards.createdAt))
      .limit(5);

    // Format response
    const response = {
      referralCode: affiliate?.referralCode || '',
      totalReferrals: Number(affiliate?.totalReferrals) || 0,
      totalEarnings: Number(affiliate?.totalCommissions) || 0,
      pendingEarnings: Number(affiliate?.pendingCommissions) || 0,
      recentRewards: recentRewards.map(r => ({
        id: r.id,
        amount: Number(r.amount) || 0,
        status: r.status,
        createdAt: r.createdAt
      })),
      // Default values for the frontend
      monthlyEarnings: 0,
      nextPayoutDate: null,
      pendingPayouts: 0
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ error: 'Failed to fetch affiliate stats' });
  }
});

// Get affiliate's referrals
affiliateRouter.get('/:userId/referrals', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the requesting user matches the userId or is an admin
    if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const referralsList = await db
      .select({
        id: referrals.id,
        referredUser: {
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          createdAt: users.createdAt
        },
        status: referrals.status,
        createdAt: referrals.createdAt,
        reward: {
          id: affiliateRewards.id,
          creditPointsAwarded: affiliateRewards.creditPointsAwarded,
          status: affiliateRewards.status,
          awardedAt: affiliateRewards.awardedAt
        }
      })
      .from(referrals)
      .leftJoin(users, eq(users.id, referrals.referredUserId))
      .leftJoin(affiliateRewards, eq(affiliateRewards.referralId, referrals.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));

    res.json(referralsList);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get affiliate leaderboard
affiliateRouter.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    // Get top 10 affiliates by total commissions
    const leaderboard = await db
      .select({
        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          profilePictureUrl: users.profilePictureUrl
        },
        totalCommissions: sql<number>`COALESCE(SUM(CAST(${affiliateRewards.creditPointsAwarded} AS NUMERIC)), 0)`,
        totalReferrals: sql<number>`count(distinct ${referrals.id})`
      })
      .from(agents)
      .leftJoin(users, eq(users.id, agents.userId))
      .leftJoin(referrals, eq(referrals.referrerId, agents.userId))
      .leftJoin(affiliateRewards, and(
        eq(affiliateRewards.referrerId, agents.userId),
        eq(affiliateRewards.status, 'awarded')
      ))
      .groupBy(agents.userId, users.id, users.fullName, users.email, users.profilePictureUrl)
      .orderBy(desc(sql<number>`COALESCE(SUM(CAST(${affiliateRewards.creditPointsAwarded} AS NUMERIC)), 0)`))
      .limit(10);

    res.json(leaderboard.map(item => {
      // Handle null user case
      const user = item.user || {
        id: 'unknown',
        fullName: 'Anonymous',
        email: 'unknown@example.com',
        profilePictureUrl: null
      };
      
      return {
        ...item,
        user: {
          id: user.id,
          fullName: user.fullName || 'Anonymous',
          email: user.email,
          avatar: user.profilePictureUrl
        },
        totalCommissions: Number(item.totalCommissions) || 0,
        totalReferrals: Number(item.totalReferrals) || 0
      };
    }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Export the router as a named export
// Export the router
export { affiliateRouter };
