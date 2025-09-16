import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { verifyPayment } from "@/api/client/billingClient";

type PaymentStatus = 'success' | 'failed' | 'pending' | 'cancelled' | 'canceled';

const isValidStatus = (status: string): status is PaymentStatus => {
  return ['success', 'failed', 'pending', 'cancelled', 'canceled'].includes(status);
};

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

// Composant d'erreur
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-red-700 mb-2">Erreur</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Réessayer
      </button>
    </div>
  </div>
);

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  
  // Récupération des paramètres d'URL avec des valeurs par défaut
  const status = searchParams.get("status") || "pending";
  const reference = searchParams.get("reference") || "";
  const amount = searchParams.get("amount") || "";
  const method = searchParams.get("method") || "";
  const reason = searchParams.get("reason") || "";
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const tab = searchParams.get("tab") || "";

  // Journalisation des paramètres pour le débogage
  useEffect(() => {
    console.log('PaymentStatus - Paramètres URL:', {
      status,
      reference,
      amount,
      method,
      reason,
      returnTo,
      tab
    });
  }, []);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (reference) {
          // Vérifier le statut réel du paiement avec le backend
          const result = await verifyPayment(reference);
          console.log('Résultat de la vérification du paiement:', result);
          
          if (!result || !result.status) {
            throw new Error('Réponse invalide du serveur');
          }
          
          setPaymentStatus(result.status);
          
          // Si le paiement est réussi, on peut rediriger après un délai
          if (result.status === 'success') {
            setTimeout(() => {
              const returnUrl = getReturnUrl();
              console.log('Redirection vers:', returnUrl);
              navigate(returnUrl, { 
                state: { 
                  paymentSuccess: true,
                  paymentReference: reference,
                  amount: amount
                } 
              });
            }, 3000); // Redirige après 3 secondes
          }
        } else {
          // Si pas de référence, on se base sur le statut de l'URL mais avec prudence
          const newStatus = status === "success" ? "pending" : status;
          const validStatus = isValidStatus(newStatus) ? newStatus : 'pending';
          console.log('Utilisation du statut de l\'URL:', validStatus);
          setPaymentStatus(validStatus);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error("Erreur lors de la vérification du paiement:", error);
        setError(`Impossible de vérifier le statut du paiement: ${errorMessage}`);
        setPaymentStatus("failed" as PaymentStatus);
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
    
    // Nettoyage
    return () => {
      // Annuler les timeouts ou abonnements si nécessaire
    };
  }, [reference, status, amount, navigate, returnTo, tab]);

  // Construire l'URL de retour avec l'onglet si spécifié
  const getReturnUrl = () => {
    if (!returnTo) return "/dashboard";
    return tab ? `${returnTo}?tab=${encodeURIComponent(tab)}` : returnTo;
  };

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Paiement Réussi !",
          message: reference 
            ? `Paiement de ${amount || ''} FCFA effectué avec succès. Référence: ${reference}`
            : "Votre paiement a été traité avec succès.",
          buttonText: "Retour",
          buttonAction: () => navigate(getReturnUrl(), { state: { paymentSuccess: true } })
        };
      case "failed":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Paiement Échoué",
          message: reason === "insufficient_funds" 
            ? "Solde insuffisant. Veuillez recharger votre compte et réessayer."
            : "Le paiement n'a pas pu être traité. Veuillez vérifier vos informations et réessayer.",
          buttonText: "Réessayer",
          buttonAction: () => navigate(-1) // Retour à la page précédente
        };
      case "cancelled":
      case "canceled":
        return {
          icon: AlertCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Paiement Annulé",
          message: "Vous avez annulé le paiement. Aucun débit n'a été effectué.",
          buttonText: "Retour",
          buttonAction: () => navigate(-1) // Retour à la page précédente
        };
      case "pending":
      default:
        return {
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Paiement en Attente",
          message: reference
            ? `Votre paiement de ${amount || ''} FCFA est en cours de traitement. Référence: ${reference}`
            : "Votre paiement est en cours de traitement. Vous recevrez une confirmation sous peu.",
          buttonText: "Actualiser",
          buttonAction: () => window.location.reload()
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // Afficher l'erreur si elle existe
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Afficher le chargement
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-4">
                  <StatusIcon className={`w-20 h-20 ${config.color}`} />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {config.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {config.message}
                </p>
                
                {/* Payment Details */}
                {reference && (
                  <div className="bg-white/60 rounded-lg p-6 space-y-3">
                    <h3 className="font-semibold text-gray-900 mb-4">Détails du Paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Référence :</span>
                        <div className="font-mono text-gray-900">{reference}</div>
                      </div>
                      {amount && (
                        <div>
                          <span className="font-medium text-gray-600">Montant :</span>
                          <div className="font-semibold text-gray-900">CFA {parseInt(amount).toLocaleString()}</div>
                        </div>
                      )}
                      {method && (
                        <div>
                          <span className="font-medium text-gray-600">Méthode :</span>
                          <div className="capitalize text-gray-900">
                            {method.replace("_", " ")}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Date :</span>
                        <div className="text-gray-900">
                          {new Date().toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status-specific content */}
                {status === "success" && (
                  <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Prochaines Étapes :</h4>
                    <ul className="text-sm text-green-700 space-y-1 text-left">
                      <li>• Votre carte ZENIKA est maintenant active</li>
                      <li>• Vous recevrez un email de confirmation</li>
                      <li>• Accédez à votre tableau de bord pour explorer vos avantages</li>
                      <li>• Commencez à profiter des réductions chez nos partenaires</li>
                    </ul>
                  </div>
                )}

                {status === "failed" && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Que faire maintenant :</h4>
                    <ul className="text-sm text-red-700 space-y-1 text-left">
                      <li>• Vérifiez le solde de votre compte</li>
                      <li>• Assurez-vous que vos informations sont correctes</li>
                      <li>• Contactez votre opérateur si le problème persiste</li>
                      <li>• Notre support client est disponible pour vous aider</li>
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button
                    onClick={config.buttonAction}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  >
                    {config.buttonText}
                  </Button>
                  
                  {status !== "success" && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/support")}
                      className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3"
                    >
                      Contacter le Support
                    </Button>
                  )}
                </div>

                {/* Additional Help */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Besoin d'aide ? Contactez-nous à{" "}
                    <a href="mailto:support@elverraglobal.com" className="text-purple-600 hover:underline">
                      support@elverraglobal.com
                    </a>{" "}
                    ou appelez le{" "}
                    <a href="tel:+22376543210" className="text-purple-600 hover:underline">
                      +223 76 54 32 10
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentStatus;
