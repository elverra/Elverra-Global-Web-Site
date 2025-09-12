import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const status = searchParams.get("status") || "pending";
  const reference = searchParams.get("reference");
  const amount = searchParams.get("amount");
  const method = searchParams.get("method");
  const reason = searchParams.get("reason");

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Paiement Réussi !",
          message: "Votre paiement a été traité avec succès. Votre carte ZENIKA est maintenant active.",
          buttonText: "Accéder au Tableau de Bord",
          buttonAction: () => navigate("/dashboard")
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
          buttonText: "Réessayer le Paiement",
          buttonAction: () => navigate("/membership/selection")
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          color: "text-orange-500",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Paiement Annulé",
          message: "Vous avez annulé le paiement. Vous pouvez reprendre le processus à tout moment.",
          buttonText: "Reprendre le Paiement",
          buttonAction: () => navigate("/membership/selection")
        };
      case "pending":
      default:
        return {
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Paiement en Attente",
          message: "Votre paiement est en cours de traitement. Vous recevrez une confirmation sous peu.",
          buttonText: "Vérifier le Statut",
          buttonAction: () => window.location.reload()
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification du statut du paiement...</p>
          </div>
        </div>
      </Layout>
    );
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
