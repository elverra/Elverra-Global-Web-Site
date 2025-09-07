import React, { useState } from 'react';
import { Button, Card, Radio, Space, Typography } from 'antd';
import { CreditCardOutlined, MobileOutlined, BankOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type PaymentMethod = 'card' | 'orange_money' | 'sama_money' | 'wave' | 'moov';

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod) => void;
  loading?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ onSelect, loading }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');

  const paymentMethods = [
    {
      id: 'card',
      name: 'Carte de crédit/débit',
      icon: <CreditCardOutlined style={{ fontSize: '24px' }} />,
      description: 'Paiement sécurisé par carte bancaire',
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: <MobileOutlined style={{ fontSize: '24px', color: '#ff6b00' }} />,
      description: 'Paiement via votre compte Orange Money',
    },
    {
      id: 'sama_money',
      name: 'Sama Money',
      icon: <BankOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      description: 'Paiement via Sama Money',
    },
  ];

  const handleSubmit = () => {
    onSelect(selectedMethod);
  };

  return (
    <div className="payment-method-selector">
      <Title level={4} style={{ marginBottom: 24 }}>Choisissez votre méthode de paiement</Title>
      
      <Radio.Group 
        onChange={(e) => setSelectedMethod(e.target.value)}
        value={selectedMethod}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {paymentMethods.map((method) => (
            <Radio value={method.id} key={method.id} style={{ width: '100%', margin: 0 }}>
              <Card 
                hoverable
                style={{ 
                  width: '100%',
                  marginBottom: 16,
                  border: selectedMethod === method.id ? '1px solid #1890ff' : '1px solid #f0f0f0'
                }}
                bodyStyle={{ display: 'flex', alignItems: 'center', padding: '16px' }}
              >
                <div style={{ marginRight: 16 }}>
                  {method.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{method.name}</div>
                  <Text type="secondary">{method.description}</Text>
                </div>
              </Card>
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Button 
          type="primary" 
          size="large"
          onClick={handleSubmit}
          loading={loading}
        >
          Payer maintenant
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
