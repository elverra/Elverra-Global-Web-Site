import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { samaMoneyController } from '../controllers/payment/samaMoneyController';

const router = Router();

/**
 * @route   POST /api/payments/sama/initiate
 * @desc    Initiate a Sama Money payment
 * @access  Private
 */
router.post('/initiate', authenticateToken, samaMoneyController.initiatePayment);

/**
 * @route   POST /api/payments/sama/callback
 * @desc    Handle Sama Money payment callback
 * @access  Public (called by Sama Money)
 */
router.post('/callback', samaMoneyController.handleCallback);

/**
 * @route   GET /api/payments/sama/status/:orderId
 * @desc    Check payment status
 * @access  Private
 */
router.get('/status/:orderId', authenticateToken, samaMoneyController.checkStatus);

export default router;
