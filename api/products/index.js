import { handleProductCount } from './count';
import { handleInitiatePayment } from './initiate-payment';

export default async function handler(req, res) {
  const { method, url } = req;
  const path = url.split('?')[0];

  try {
    switch (path) {
      case '/api/products/count':
        return await handleProductCount(req, res);
      case '/api/products/initiate-payment':
        return await handleInitiatePayment(req, res);
      default:
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Products API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
