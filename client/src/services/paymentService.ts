import { PaymentGateway, PaymentRequest, PaymentResponse } from '@/types/payment';

class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Traite un paiement via la passerelle spécifiée
   * @param gateway La passerelle de paiement à utiliser
   * @param request Les détails de la demande de paiement
   * @returns Une promesse résolue avec la réponse du paiement
   */
  async processPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Valider la requête
      if (!request.serviceId) {
        throw new Error('L\'ID du service est requis pour le paiement');
      }

      // Préparer les données de la requête
      const payload: PaymentRequest = {
        serviceId: request.serviceId,
        amount: request.amount,
        currency: request.currency || 'OUV',
        description: request.description || 'Paiement de service',
        paymentMethod: gateway.id,
        returnUrl: `${window.location.origin}/payment/callback/${gateway.id}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        ...(request.customerInfo && { customerInfo: request.customerInfo }),
        ...(request.metadata && { metadata: request.metadata })
      };

      // Envoyer la requête au backend
      const response = await fetch(`/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors du traitement du paiement');
      }

      const data = await response.json();

      // Si une URL de redirection est fournie, rediriger l'utilisateur
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }

      return {
        success: true,
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
        gatewayResponse: data
      };
    } catch (error) {
      console.error('Erreur de traitement du paiement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors du traitement du paiement'
      };
    }
  }

  /**
   * Vérifie le statut d'un paiement existant
   * @param transactionId L'identifiant de la transaction
   * @returns Une promesse résolue avec le statut du paiement
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`/api/payments/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Impossible de vérifier le statut du paiement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }
}

// Export d'une instance unique du service
export const paymentService = PaymentService.getInstance();

export default paymentService;
