import express, { Request, Response, Router } from 'express';
import { paymentController } from 'server/controllers/paymentController';
import { authMiddleware } from 'server/middleware/authMiddleware';
import { validateRequest } from 'server/middleware/validateRequest';
import { z } from 'zod';

const router: Router = Router();
const authRouter: Router = Router();

// Apply auth middleware to all routes that need it
authRouter.use(authMiddleware);

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

// Protected payment routes
authRouter.post(
  '/initiate',
  validateRequest({ body: initiatePaymentSchema }),
  paymentController.initiatePayment
);

authRouter.get(
  '/verify/:paymentId',
  validateRequest({ params: verifyPaymentSchema }),
  paymentController.verifyPayment
);

authRouter.post(
  '/subscriptions/:subscriptionId/cancel',
  validateRequest({ params: cancelSubscriptionSchema }),
  paymentController.cancelSubscription
);

// Orange Money routes
authRouter.post(
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

// CinetPay routes
authRouter.post(
  '/initiate-cinetpay',
  validateRequest({
    body: z.object({
      amount: z.number().positive(),
      membershipTier: z.enum(['essential', 'premium', 'elite']),
      description: z.string().optional(),
    })
  }),
  paymentController.initiateCinetPayPayment
);

// Mount all authenticated routes
router.use(authRouter);

// Configure JSON body parser for webhooks
const jsonParser = express.json({
  verify: (req: Request & { rawBody?: string }, res: Response, buf: Buffer) => {
    req.rawBody = buf.toString('utf-8');
  }
});

// Public endpoints (no auth required)
router.post('/orange-callback', jsonParser, paymentController.handleOrangeMoneyCallback);
router.post('/cinetpay-webhook', jsonParser, paymentController.handleCinetPayWebhook);
router.post('/webhook', jsonParser, paymentController.handleWebhook);

export default router;
