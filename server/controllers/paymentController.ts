import { Request, Response } from 'express';
import { orangeMoneyService } from '../services/payment/orangeMoneyService';
import { AuthRequest } from '../middleware/authMiddleware';
import { db } from '../db';
import { payments, paymentAttempts, subscriptions } from '../../shared/schema';
import { and, eq } from 'drizzle-orm';
import { OrangeMoneyPaymentResponse } from '../../shared/types/orangeMoney';
import { z } from 'zod';

class PaymentController {
  /**
   * Initie un nouveau paiement
   */
  async initiatePayment(req: AuthRequest, res: Response) {
    try {
      const { amount, phoneNumber, description, metadata = {} } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Vérifier si l'utilisateur a un abonnement actif
      const [activeSubscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.userId, userId),
            eq(subscriptions.status, 'active')
          )
        )
        .limit(1);

      if (activeSubscription) {
        return res.status(400).json({
          error: 'User already has an active subscription',
          subscription: activeSubscription,
        });
      }

      // Démarrer le processus de paiement
      const payment = await orangeMoneyService.initiatePayment({
        userId,
        amount,
        phoneNumber,
        description,
        metadata: {
          ...metadata,
          type: 'subscription_payment',
        },
      }) as OrangeMoneyPaymentResponse;

      return res.json({
        success: true,
        data: {
          paymentUrl: payment.paymentUrl,
          paymentId: payment.paymentId,
          orderId: payment.orderId,
        },
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate payment',
      });
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Vérifier que l'utilisateur a le droit de voir ce paiement
      const [payment] = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.id, paymentId),
            eq(payments.userId, userId)
          )
        );

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      // Vérifier le statut du paiement
      const verification = await orangeMoneyService.verifyPayment(payment.id);
      
      return res.json({
        success: true,
        data: verification,
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify payment',
      });
    }
  }

  /**
   * Gère les webhooks de paiement
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-orange-signature'] as string;
      const payload = req.body;
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      // Valider le schéma du payload
      const webhookSchema = z.object({
        order_id: z.string(),
        status: z.string(),
        tx_id: z.string().optional(),
        tx_amount: z.string().optional(),
        tx_currency: z.string().optional(),
        tx_reference: z.string().optional(),
      });

      const validationResult = webhookSchema.safeParse(payload);
      if (!validationResult.success) {
        console.error('Invalid webhook payload:', validationResult.error);
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // Traiter le webhook avec le service Orange Money
      await orangeMoneyService.handleWebhook(validationResult.data, signature);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing webhook',
      });
    }
  }

  /**
   * Annule un abonnement récurrent
   */
  async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Vérifier que l'abonnement existe et appartient à l'utilisateur
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.id, subscriptionId),
            eq(subscriptions.userId, userId)
          )
        )
        .limit(1);

      if (!subscription) {
        return res.status(404).json({ 
          success: false,
          error: 'Subscription not found or access denied'
        });
      }

      // Vérifier que l'abonnement peut être annulé
      if (subscription.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Subscription is already cancelled'
        });
      }

      // Annuler l'abonnement via l'API Orange Money
      const result = await orangeMoneyService.cancelRecurringPayment(subscriptionId);
      
      // Mettre à jour le statut de l'abonnement dans la base de données
      await db
        .update(subscriptions)
        .set({ 
          status: 'cancelled',
          cancelledAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            ...(subscription.metadata || {}),
            cancellationDate: new Date().toISOString()
          }
        })
        .where(eq(subscriptions.id, subscriptionId));

      return res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: {
          subscriptionId,
          cancelledAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to cancel subscription',
      });
    }
  }

  /**
   * Initie un paiement Orange Money
   */
  async initiateOrangeMoneyPayment(req: Request, res: Response) {
    try {
      const { amount, phone, email, name, reference } = req.body as {
        amount: number;
        phone: string;
        email: string;
        name: string;
        reference?: string;
      };
      
      // Créer une référence de paiement si non fournie
      const paymentReference = reference || `OM-${Date.now()}`;
      
      // Enregistrer la tentative de paiement
      const [paymentAttempt] = await db
        .insert(paymentAttempts)
        .values({
          userId: 'system', // Utilisateur système pour les paiements non authentifiés
          amount: amount.toString(),
          status: 'pending',
          paymentMethod: 'orange_money',
          metadata: {
            phone,
            email,
            name,
            reference: paymentReference,
          },
          currency: 'OUV',
          processedAt: new Date(),
        } as any) // Type assertion pour éviter les erreurs de type
        .returning();

      // Préparer la requête pour Orange Money
      const paymentData = {
        amount,
        phone: phone.replace(/\D/g, ''), // Nettoyer le numéro de téléphone
        email,
        name,
        reference: paymentReference,
        callbackUrl: `${process.env.API_URL}/api/payments/orange-callback`,
      };

      // Appeler le service Orange Money
      const paymentResponse = await orangeMoneyService.initiatePayment({
        userId: 'system', // Utilisateur système pour les paiements non authentifiés
        amount,
        phoneNumber: paymentData.phone,
        description: `Paiement pour ${name}`,
        metadata: {
          email,
          reference: paymentReference,
          paymentAttemptId: paymentAttempt.id,
        },
      });

      // Vérifier que la réponse contient bien l'URL de paiement
      if (!paymentResponse || !('paymentUrl' in paymentResponse)) {
        throw new Error('Invalid response from Orange Money service');
      }

      // Retourner la réponse avec l'URL de paiement
      res.json({
        success: true,
        paymentUrl: (paymentResponse as any).paymentUrl,
        reference: paymentReference,
        paymentAttemptId: paymentAttempt.id,
      });
    } catch (error) {
      console.error('Error initiating Orange Money payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to initiate Orange Money payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Gère le callback d'Orange Money
   */
  async handleOrangeMoneyCallback(req: Request, res: Response) {
    try {
      const { reference, status, transaction_id: transactionId } = req.body as {
        reference: string;
        status: string;
        transaction_id?: string;
      };
      
      if (!reference) {
        return res.status(400).json({ success: false, error: 'Reference is required' });
      }
      
      // Récupérer la tentative de paiement existante
      const [existingPayment] = await db
        .select()
        .from(paymentAttempts)
        .where(eq(paymentAttempts.id, reference));
      
      if (!existingPayment) {
        console.warn(`Payment attempt not found: ${reference}`);
        return res.status(404).json({ success: false, error: 'Payment not found' });
      }
      
      // Mettre à jour le statut du paiement dans la base de données
      const [payment] = await db
        .update(paymentAttempts)
        .set({
          status: status === 'SUCCESS' ? 'completed' : 'failed',
          transactionId: transactionId || null,
          updatedAt: new Date(),
        })
        .where(eq(paymentAttempts.id, reference))
        .returning();
      
      if (!payment) {
        console.warn(`Failed to update payment attempt: ${reference}`);
        return res.status(500).json({ success: false, error: 'Failed to update payment' });
      }
      
      // Si le paiement est réussi, mettre à jour l'abonnement si nécessaire
      if (status === 'SUCCESS') {
        // Vérifier si metadata existe et contient subscriptionId
        const metadata = existingPayment.metadata as Record<string, any> | null;
        const subscriptionId = metadata?.subscriptionId;
        
        if (subscriptionId && typeof subscriptionId === 'string') {
          try {
            await db
              .update(subscriptions)
              .set({
                status: 'active',
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.id, subscriptionId));
          } catch (updateError) {
            console.error('Error updating subscription status:', updateError);
          }
        } else {
          console.log('No subscriptionId found in payment metadata or invalid format');
        }
      }
      
      // Retourner une réponse à Orange Money
      res.json({ success: true, message: 'Callback processed' });
    } catch (error) {
      console.error('Error processing Orange Money callback:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process callback',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const paymentController = new PaymentController();
