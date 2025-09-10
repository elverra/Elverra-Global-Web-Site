import { Request, Response } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { samaMoneyService } from '../../services/payment/samaMoneyService';
import { db } from '../../db';
import { payments } from '@/shared/schema';

// Type definitions for Sama Money API responses
interface SamaMoneyPaymentResponse {
  status: number;
  msg: string;
  idCommande?: string;
  transNumber?: string;
  [key: string]: any;
}

interface SamaMoneyTransactionInfo {
  status: number;
  idCommande: string;
  numTransacSAMA: string;
  montant: string;
  date: string;
  [key: string]: any;
}

// Define payment status and method enums locally to avoid module resolution issues
const PaymentStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  EXPIRED: 'expired'
} as const;

type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

const PaymentMethod = {
  ORANGE_MONEY: 'orange_money',
  SAMA_MONEY: 'sama_money',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  CINETPAY: 'cinetpay'
} as const;

type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Define a basic payment interface for type safety
interface Payment {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  reference: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  error?: string | null;
  description?: string | null;
}

// Zod schema for payment initiation
const phoneNumberRegex = /^(?:(?:\+223|00223|223)?[76]\d{7}|(?:\+221|00221|221)?[0-9]{10})$/;

const initiatePaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(14, 'Phone number is too long')
    .refine(val => phoneNumberRegex.test(val), {
      message: 'Please enter a valid phone number. Format: 7XXXXXXXX (Senegal) or 0XXXXXXXXX (Côte d\'Ivoire)'
    }),
  description: z.string().optional(),
  orderId: z.string().uuid('Invalid order ID format')
});

export const samaMoneyController = {
  /**
   * Initiate a Sama Money payment
   */
  async initiatePayment(req: Request, res: Response) {
    try {
      // Validate request body
      const validation = initiatePaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: validation.error.errors
        });
      }

      const { amount, phoneNumber, description, orderId } = validation.data;

      // Check if payment already exists
      const existingPayment = await db.query.payments.findFirst({
        where: (payments, { eq }) => eq(payments.id, orderId)
      });

      if (existingPayment) {
        return res.status(400).json({
          success: false,
          error: 'Payment with this order ID already exists'
        });
      }

      // Format phone number if needed (remove spaces, +, etc.)
      const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
      
      // Ensure we have a valid phone number before proceeding
      if (!formattedPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required for Sama Money payment'
        });
      }

      // Log the payment attempt
      console.log('Initiating Sama Money payment', { 
        amount, 
        phoneNumber: formattedPhone,
        orderId 
      });

      // Initiate payment with Sama Money
      let paymentResponse;
      try {
        paymentResponse = await samaMoneyService.initiatePayment({
          amount,
          phoneNumber: formattedPhone,
          description: description || `Payment for order ${orderId}`,
          orderId
        });
        
        console.log('Sama Money payment initiated successfully', { 
          orderId,
          reference: paymentResponse.idCommande 
        });
      } catch (error: any) {
        console.error('Sama Money service error:', error);
        throw new Error(`Failed to process payment with Sama Money: ${error?.message || 'Unknown error'}`);
      }

      // Save payment record
      const paymentData = {
        id: orderId,
        userId: req.user?.id || 'system', // Fallback to 'system' if no user
        amount: amount.toString(),
        currency: 'XOF',
        status: 'pending' as PaymentStatus,
        paymentMethod: 'sama_money' as PaymentMethod,
        reference: paymentResponse.idCommande || orderId,
        metadata: {
          description,
          phoneNumber,
          samaResponse: paymentResponse,
          orderId,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.insert(payments).values(paymentData);

      return res.json({
        success: true,
        data: paymentResponse
      });
    } catch (error) {
      console.error('Sama Money payment initiation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate Sama Money payment',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  },

  /**
   * Handle Sama Money payment callback
   */
  async handleCallback(req: Request, res: Response) {
    try {
      const { status, idCommande, transNumber, message, montant } = req.body;

      if (!idCommande) {
        return res.status(400).json({
          success: false,
          error: 'Missing order ID in callback'
        });
      }

      // Update payment status in database
      const payment = await db.query.payments.findFirst({
        where: (payments, { eq }) => eq(payments.id as any, idCommande)
      });

      if (!payment) {
        console.error(`Payment not found for ID: ${idCommande}`);
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      const updatedMetadata = {
        ...(payment.metadata || {}),
        callbackData: req.body,
        updatedAt: new Date().toISOString()
      };

      const paymentStatus = status === 1 ? 'completed' : 'failed';
      
      await db
        .update(payments)
        .set({
          status: paymentStatus,
          paymentReference: transNumber || idCommande,
          metadata: updatedMetadata,
          updatedAt: new Date()
        })
        .where(eq(payments.id, idCommande));

      // TODO: Trigger any post-payment actions (email notifications, etc.)

      return res.json({
        success: true,
        message: 'Callback processed successfully'
      });
    } catch (error) {
      console.error('Sama Money callback error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to process callback'
      });
    }
  },

  /**
   * Check payment status
   */
  async checkStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'Order ID is required'
        });
      }

      // Check local database first
      const payment = await db.query.payments.findFirst({
        where: (payments, { eq }) => eq(payments.id as any, orderId)
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // If payment is already completed or failed, return the status
      if (payment.status && ['completed', 'failed', 'cancelled'].includes(payment.status)) {
        return res.json({
          success: true,
          data: {
            status: payment.status,
            reference: payment.id, // Using id as reference if reference is not available
            amount: payment.amount,
            currency: payment.currency || 'XOF',
            metadata: payment.metadata || {}
          }
        });
      }

      // If payment is pending, check with Sama Money
      const status = await samaMoneyService.checkTransactionStatus(orderId);

      // Update local database with latest status
      if (status.status === 1) {
        const updatedMetadata = {
          ...(payment.metadata || {}),
          lastStatusCheck: new Date().toISOString(),
          samaStatus: status
        };

        await db
          .update(payments)
          .set({
            status: 'completed',
            updatedAt: new Date(),
            metadata: {
              ...updatedMetadata,
              reference: status.numTransacSAMA || null
            }
          })
          .where(eq(payments.id, orderId));
      }

      return res.json({
        success: true,
        data: {
          status: status.status === 1 ? 'completed' : 'pending',
          reference: status.numTransacSAMA || orderId || '',
          amount: status.montant,
          currency: 'XOF',
          date: status.date,
          metadata: status
        }
      });
    } catch (error) {
      console.error('Sama Money status check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to check payment status',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
};

export default samaMoneyController;
