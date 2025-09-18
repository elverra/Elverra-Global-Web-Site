import React, { useState } from 'react';
import { Card, Steps, Typography, Result, Button } from 'antd';
import { PaymentMethodSelector } from '../payment/PaymentMethodSelector';
import { PaymentRequest } from '../../types/payment';

const { Step } = Steps;
const { Title, Text } = Typography;

type PaymentStep = 'select_method' | 'processing' | 'success' | 'error';

interface RegistrationPaymentStepProps {
  onSuccess: () => void;
  onBack: () => void;
  amount: number;
  currency?: string;
  serviceId: string;
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

const getGatewayName = (method: string): string => {
  const gatewayNames: Record<string, string> = {
    'orange_money': 'Orange Money',
    'sama_money': 'Sama Money',
    'wave': 'Wave',
    'moov': 'Moov Money',
    'stripe': 'Carte de crédit',
    'bank_transfer': 'Virement bancaire'
  };
  return gatewayNames[method] || method;
};

export const RegistrationPaymentStep: React.FC<RegistrationPaymentStepProps> = ({
  onSuccess,
  onBack,
  amount,
  currency = 'OUV',
  serviceId,
  customerInfo
}) => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select_method');
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async (method: string) => {
    setCurrentStep('processing');
    setError(null);

    try {
      const gateway = {
        id: method,
        name: getGatewayName(method)
      };

      const paymentRequest: PaymentRequest = {
        serviceId,
        amount,
        currency,
        description: `Paiement de l'inscription`,
        customerInfo,
        metadata: {
          type: 'registration',
        }
      };

      const response = await paymentService.processPayment(method as any, paymentRequest);
      
      if (response.success) {
        setCurrentStep('success');
        // Attendre 2 secondes avant d'appeler onSuccess
        setTimeout(onSuccess, 2000);
      } else {
        throw new Error(response.error || 'Erreur lors du traitement du paiement');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setCurrentStep('error');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select_method':
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4}>
                Finalisez votre inscription pour {amount.toLocaleString()} {currency}
              </Title>
              <Text type="secondary">
                Choisissez votre méthode de paiement préférée pour compléter votre inscription
              </Text>
            </div>
            <PaymentMethodSelector 
              onSelect={handlePayment} 
              loading={currentStep === 'processing' as PaymentStep}
            />
          </div>
        );
      
      case 'processing':
        return (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="animate-pulse">
              <div className="h-16 w-16 bg-blue-100 rounded-full mx-auto"></div>
            </div>
            <Title level={4} style={{ marginTop: 24 }}>Traitement du paiement en cours</Title>
            <Text type="secondary">Veuillez patienter pendant que nous traitons votre paiement...</Text>
          </div>
        );
      
        case 'success':
          return (
            <Result
              status="success"
              title="Welcome to Elverra Global!"
              subTitle="Your payment was successful, and your clients subscription is now active. Welcome t o our community!"
              extra={[
                <Button type="primary" key="dashboard" onClick={onSuccess}>
                  Go to Dashboard
                </Button>,
              ]}
            />
          );
      case 'error':
        return (
          <Result
            status="error"
            title="Erreur de paiement"
            subTitle={error || 'Une erreur est survenue lors du traitement de votre paiement.'}
            extra={[
              <Button type="primary" key="retry" onClick={() => setCurrentStep('select_method')}>
                Réessayer
              </Button>,
              <Button key="back" style={{ marginLeft: 8 }} onClick={onBack}>
                Retour
              </Button>,
            ]}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Card 
      style={{ maxWidth: 600, margin: '0 auto' }}
      bodyStyle={{ padding: 24 }}
    >
      <Steps current={currentStep === 'error' ? 1 : 0} style={{ marginBottom: 40 }}>
        <Step title="Méthode de paiement" />
        <Step title="Confirmation" />
      </Steps>
      
      {renderStepContent()}
    </Card>
  );
};

export default RegistrationPaymentStep;
