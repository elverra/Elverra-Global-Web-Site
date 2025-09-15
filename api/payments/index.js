import { handleCinetpayWebhook } from './cinetpay-webhook';
import { handleOrangeMoneyPayment } from './initiate-orange-money';
import { handleSamaMoneyPayment } from './initiate-sama-money';
import { handleOrangeMoneyWebhook } from './orange-money-webhook';
import { handlePaymentVerification } from './verify';

export default async function handler(req, res) {
  const { method, url } = req;
  const path = url.split('?')[0];

  try {
    switch (path) {
      case '/api/payments/cinetpay-webhook':
        return await handleCinetpayWebhook(req, res);
      case '/api/payments/initiate-orange-money':
        return await handleOrangeMoneyPayment(req, res);
      case '/api/payments/initiate-sama-money':
        return await handleSamaMoneyPayment(req, res);
      case '/api/payments/orange-money-webhook':
        return await handleOrangeMoneyWebhook(req, res);
      case '/api/payments/verify':
        return await handlePaymentVerification(req, res);
      default:
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
