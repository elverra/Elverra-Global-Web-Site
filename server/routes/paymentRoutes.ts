import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { z } from 'zod';
import { validateRequest } from 'server/middleware/validateRequest.ts';

const router: Router = Router();

// Routes protégées par authentification
router.use(authMiddleware);

// Schémas de validation
const initiatePaymentSchema = z.object({
  amount: z.number().positive(),
  phoneNumber: z.string().min(10),
  description: z.string().min(5),
  metadata: z.record(z.any()).optional()
});

const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid()
});

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid()
});

// Routes de paiement
router.post(
  '/initiate',
  validateRequest({ body: initiatePaymentSchema }),
  paymentController.initiatePayment
);

router.get(
  '/verify/:paymentId',
  validateRequest({ params: verifyPaymentSchema }),
  paymentController.verifyPayment
);

router.post(
  '/subscriptions/:subscriptionId/cancel',
  validateRequest({ params: cancelSubscriptionSchema }),
  paymentController.cancelSubscription
);

// Routes pour Orange Money
router.post(
  '/initiate-orange-money',
  validateRequest({
    body: z.object({
      amount: z.number().positive(),
      phone: z.string().min(10),
      email: z.string().email(),
      name: z.string(),
      reference: z.string().optional(),
    })
  }),
  paymentController.initiateOrangeMoneyPayment
);

// Callback pour Orange Money (pas d'authentification requise)
router.post('/orange-callback', paymentController.handleOrangeMoneyCallback);

// Webhook (pas d'authentification requise)
router.post('/webhook', paymentController.handleWebhook);

export default router;
