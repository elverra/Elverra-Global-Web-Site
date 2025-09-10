import { Request, Response } from 'express';
import { db } from '../db';
import { subscriptions, subscriptionStatusEnum, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export const getMembershipByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const membership = await db.query.subscriptions.findFirst({
      where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
    });

    if (!membership) {
      return res.status(404).json({ message: 'No membership found for this user' });
    }

    res.json(membership);
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ error: 'Failed to fetch membership' });
  }
};

export const createMembership = async (req: Request, res: Response) => {
  try {
    const { userId, tier, startDate, expiryDate, physicalCardRequested } = req.body as {
      userId: string;
      tier: string;
      startDate: string;
      expiryDate: string;
      physicalCardRequested?: boolean;
    };
    
    if (!userId || !tier || !startDate || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Création de l'abonnement avec les champs valides
    const [newMembership] = await db.insert(subscriptions).values({
      userId,
      plan: 'yearly', // ou une autre valeur valide de subscriptionPlanEnum
      status: 'active',
      startDate: new Date(startDate),
      endDate: new Date(expiryDate),
      isRecurring: true,
      paymentMethod: 'credit_card', // ou une autre valeur valide de paymentMethodEnum
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Mise à jour du tier de l'utilisateur
    await db.update(users)
      .set({ 
        membershipTier: tier as 'essential' | 'premium' | 'elite' // Assure le typage correct
      })
      .where(eq(users.id, userId));

    res.status(201).json(newMembership);
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: 'Failed to create membership' });
  }
};

export const updateMembership = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tier, status, expiryDate, physicalCardRequested } = req.body;
    
    const [updatedMembership] = await db
     .update(subscriptions)
      .set({
        ...(tier && { tier }),
        ...(status && { status }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(physicalCardRequested !== undefined && { physicalCardRequested }),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updatedMembership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json(updatedMembership);
  } catch (error) {
    console.error('Error updating membership:', error);
    res.status(500).json({ error: 'Failed to update membership' });
  }
};

export const getMembershipAccess = async (userId: string) => {
  try {
    const membership = await db.query.subscriptions.findFirst({
      where: (subscriptions, { eq }) => eq(subscriptions.userId, userId),
    });

    if (!membership || membership.status !== 'active') {
      return {
        hasActiveMembership: false,
        membershipTier: null,
        canAccessDiscounts: false,
        canAccessJobs: false,
        canAccessAffiliates: false,
        canAccessOSecours: false,
        canAccessShop: false,
        canPostJobs: false,
        canPostProducts: false,
        maxJobApplications: 0,
        maxProductListings: 0,
        discountLevel: 0,
      };
    }

    // Define access based on membership tier
    const accessRules = {
      essential: {
        canAccessDiscounts: true,
        canAccessJobs: true,
        canAccessAffiliates: true,
        canAccessOSecours: true,
        canAccessShop: true,
        canPostJobs: false,
        canPostProducts: false,
        maxJobApplications: 5,
        maxProductListings: 0,
        discountLevel: 5,
      },
      premium: {
        canAccessDiscounts: true,
        canAccessJobs: true,
        canAccessAffiliates: true,
        canAccessOSecours: true,
        canAccessShop: true,
        canPostJobs: true,
        canPostProducts: true,
        maxJobApplications: 20,
        maxProductListings: 10,
        discountLevel: 10,
      },
      elite: {
        canAccessDiscounts: true,
        canAccessJobs: true,
        canAccessAffiliates: true,
        canAccessOSecours: true,
        canAccessShop: true,
        canPostJobs: true,
        canPostProducts: true,
        maxJobApplications: 50,
        maxProductListings: 50,
        discountLevel: 20,
      },
    };

    return {
      hasActiveMembership: true,
      membershipTier: membership.plan,
      ...accessRules[membership.plan as keyof typeof accessRules],
    };
  } catch (error) {
    console.error('Error getting membership access:', error);
    throw error;
  }
};
