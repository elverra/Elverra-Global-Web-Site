import { handleRequests } from './requests';
import { handleSubscriptions } from './subscriptions';
import { handleTransactions } from './transactions';

export default async function handler(req, res) {
  const { method, url } = req;
  const path = url.split('?')[0];

  try {
    switch (path) {
      case '/api/secours/requests':
        return await handleRequests(req, res);
      case '/api/secours/subscriptions':
        return await handleSubscriptions(req, res);
      case '/api/secours/transactions':
        return await handleTransactions(req, res);
      default:
        res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Secours API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
