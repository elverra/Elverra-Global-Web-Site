import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as membershipController from '../controllers/membershipController';

const router = Router();

// Get membership for current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.params.userId = userId;
    await membershipController.getMembershipByUserId(req, res);
  } catch (error) {
    console.error('Error in membership route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get membership by user ID (admin only)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    // Add admin check here if needed
    await membershipController.getMembershipByUserId(req, res);
  } catch (error) {
    console.error('Error in membership route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new membership
router.post('/', authenticateToken, async (req, res) => {
  try {
    await membershipController.createMembership(req, res);
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update membership
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await membershipController.updateMembership(req, res);
  } catch (error) {
    console.error('Error updating membership:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get membership access
router.get('/:userId/access', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const access = await membershipController.getMembershipAccess(userId);
    res.json(access);
  } catch (error) {
    console.error('Error getting membership access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
