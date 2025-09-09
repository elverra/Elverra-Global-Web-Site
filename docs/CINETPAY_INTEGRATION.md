# Intégration CinetPay - Elverra Global

## Vue d'ensemble

CinetPay a été intégré comme option de paiement pour l'achat de cartes d'adhésion dans l'application Elverra Global. Cette intégration permet aux utilisateurs de payer via Mobile Money en utilisant l'API CinetPay.

## Configuration requise

### Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```bash
CINETPAY_API_KEY=your_cinetpay_api_key_here
CINETPAY_SITE_ID=your_cinetpay_site_id_here
```

### Migration de base de données

Exécutez la migration pour ajouter 'cinetpay' aux méthodes de paiement :

```sql
-- Migration 0006_add_cinetpay_payment_method.sql
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'cinetpay';
```

## Endpoints API

### 1. Initier un paiement CinetPay

**POST** `/api/payments/initiate-cinetpay`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**
```json
{
  "amount": 15000,
  "membershipTier": "premium",
  "description": "Abonnement Premium - Elverra Global"
}
```

**Réponse:**
```json
{
  "success": true,
  "paymentUrl": "https://checkout.cinetpay.com/...",
  "transactionId": "ELVERRA-1234567890",
  "paymentAttemptId": "uuid"
}
```

### 2. Webhook CinetPay

**POST** `/api/payments/cinetpay-webhook`

Endpoint pour recevoir les notifications de CinetPay après paiement.

**Body attendu:**
```json
{
  "transaction_id": "ELVERRA-1234567890",
  "status": "ACCEPTED",
  "metadata": "..."
}
```

## Flow de paiement

1. **Sélection du plan** : L'utilisateur choisit son tier d'adhésion
2. **Sélection de CinetPay** : L'utilisateur sélectionne CinetPay comme méthode de paiement
3. **Initiation** : Appel à `/api/payments/initiate-cinetpay`
4. **Redirection** : L'utilisateur est redirigé vers la page de paiement CinetPay
5. **Paiement** : L'utilisateur effectue le paiement via Mobile Money
6. **Callback** : CinetPay envoie une notification au webhook
7. **Activation** : L'abonnement est activé et l'utilisateur est mis à jour

## Composants modifiés

### Backend

- **`paymentController.ts`** : Ajout des méthodes `initiateCinetPayPayment` et `handleCinetPayWebhook`
- **`paymentRoutes.ts`** : Ajout des routes CinetPay
- **`schema.ts`** : Ajout de 'cinetpay' aux méthodes de paiement

### Frontend

- **`PaymentMethodSelector.tsx`** : Ajout de CinetPay comme option
- **`UnifiedPaymentWindow.tsx`** : Support pour les paiements CinetPay
- **`paymentService.ts`** : Méthode `initiateCinetPayPayment`

## Configuration CinetPay

### Paramètres de l'API

```javascript
const payload = {
  apikey: process.env.CINETPAY_API_KEY,
  site_id: process.env.CINETPAY_SITE_ID,
  transaction_id: `ELVERRA-${Date.now()}`,
  amount: amount,
  currency: "XOF",
  description: "Abonnement - Elverra Global",
  return_url: `${process.env.CLIENT_URL}/my-account?payment=success`,
  notify_url: `${process.env.API_URL}/api/payments/cinetpay-webhook`,
  channels: "MOBILE_MONEY",
  customer_id: userId,
  customer_name: "Client Name"
};
```

### URLs de retour

- **Succès** : `/my-account?payment=success`
- **Webhook** : `/api/payments/cinetpay-webhook`

## Gestion des erreurs

### Erreurs communes

1. **API Key invalide** : Vérifiez `CINETPAY_API_KEY`
2. **Site ID invalide** : Vérifiez `CINETPAY_SITE_ID`
3. **Transaction non trouvée** : Le webhook ne trouve pas la transaction dans la base

### Logs de débogage

```javascript
console.log('CinetPay API Error:', data);
console.warn(`Payment attempt not found for transaction: ${transaction_id}`);
```

## Test de l'intégration

### 1. Test en mode développement

```bash
# Démarrer le serveur
npm run dev

# Tester l'endpoint
curl -X POST http://localhost:3000/api/payments/initiate-cinetpay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"amount": 15000, "membershipTier": "premium"}'
```

### 2. Test du webhook

Utilisez un outil comme ngrok pour exposer votre webhook local :

```bash
ngrok http 3000
# Utilisez l'URL ngrok comme notify_url
```

## Sécurité

- Les clés API sont stockées dans les variables d'environnement
- Validation des données entrantes dans le webhook
- Vérification de l'authenticité des transactions

## Support

Pour toute question sur l'intégration CinetPay :

1. Consultez la [documentation officielle CinetPay](https://docs.cinetpay.com)
2. Vérifiez les logs du serveur pour les erreurs
3. Testez les endpoints avec des outils comme Postman

## Statuts de paiement

- **PENDING** : Paiement en cours
- **ACCEPTED/SUCCESS** : Paiement réussi
- **FAILED** : Paiement échoué
- **CANCELLED** : Paiement annulé
