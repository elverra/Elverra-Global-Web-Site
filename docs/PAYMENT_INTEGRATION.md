# Intégration des Paiements Orange Money

Ce document décrit comment l'intégration des paiements Orange Money a été implémentée dans l'application Elverra Global.

## Configuration requise

### Variables d'environnement

Assurez-vous que les variables d'environnement suivantes sont définies dans votre fichier `.env` :

```env
# Configuration Orange Money
ORANGE_MONEY_BASE_URL=https://api.orange.com/orange-money-webpay/dev/v1
ORANGE_MONEY_MERCHANT_KEY=votre_cle_merchant
ORANGE_MONEY_AUTH_USERNAME=votre_username
ORANGE_MONEY_AUTH_PASSWORD=votre_password
ORANGE_MONEY_WEBHOOK_SECRET=votre_secret_webhook
ORANGE_MONEY_ENV=sandbox # ou 'production' en production
ORANGE_MONEY_CURRENCY=OUV

# URLs de redirection
PAYMENT_SUCCESS_URL=http://localhost:3000/payment/success
PAYMENT_CANCEL_URL=http://localhost:3000/payment/cancel
PAYMENT_WEBHOOK_URL=http://localhost:5000/api/payments/webhook/orange
```

## Flux de paiement

### 1. Initialisation d'un paiement

**Endpoint** : `POST /api/payments/initiate`

**Corps de la requête** :
```json
{
  "amount": 1000,
  "phoneNumber": "221771234567",
  "description": "Abonnement mensuel",
  "metadata": {
    "plan": "monthly",
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Réponse réussie** :
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://payment.orange-money.com/pay/...",
    "paymentId": "123e4567-e89b-12d3-a456-426614174000",
    "orderId": "OM-1234567890"
  }
}
```

### 2. Vérification du statut d'un paiement

**Endpoint** : `GET /api/payments/verify/:paymentId`

**Réponse réussie** :
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "completed",
    "amount": "1000",
    "currency": "OUV",
    "paymentMethod": "orange_money",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "paidAt": "2023-01-01T00:01:30.000Z"
  }
}
```

### 3. Webhook de notification

**Endpoint** : `POST /api/payments/webhook/orange`

**En-têtes** :
```
X-Orange-Signature: signature_hash
Content-Type: application/json
```

**Corps de la requête** :
```json
{
  "order_id": "OM-1234567890",
  "status": "SUCCESS",
  "tx_id": "TX123456789",
  "tx_amount": "1000",
  "tx_currency": "OUV"
}
```

### 4. Annulation d'un abonnement

**Endpoint** : `POST /api/subscriptions/:subscriptionId/cancel`

**Réponse réussie** :
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "123e4567-e89b-12d3-a456-426614174000",
    "cancelledAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Tables de base de données

### 1. payments
- `id` : UUID
- `user_id` : UUID (référence à users.id)
- `amount` : numeric(10,2)
- `currency` : text (défaut: 'OUV')
- `status` : enum ('pending', 'completed', 'failed', 'refunded', 'cancelled')
- `payment_method` : enum ('orange_money', 'sama_money', 'credit_card', 'bank_transfer')
- `payment_reference` : text (unique)
- `external_transaction_id` : text
- `description` : text
- `metadata` : jsonb
- `paid_at` : timestamp
- `refunded_at` : timestamp
- `created_at` : timestamp
- `updated_at` : timestamp

### 2. subscriptions
- `id` : UUID
- `user_id` : UUID (référence à users.id)
- `plan` : enum ('monthly', 'quarterly', 'yearly', 'lifetime')
- `status` : enum ('active', 'pending', 'cancelled', 'expired', 'paused')
- `start_date` : timestamp
- `end_date` : timestamp
- `next_billing_date` : timestamp
- `is_recurring` : boolean
- `payment_method` : enum
- `last_payment_id` : UUID (référence à payments.id)
- `metadata` : jsonb
- `cancelled_at` : timestamp
- `created_at` : timestamp
- `updated_at` : timestamp

### 3. payment_attempts
- `id` : UUID
- `user_id` : UUID (référence à users.id)
- `subscription_id` : UUID (référence à subscriptions.id, optionnel)
- `amount` : numeric(10,2)
- `status` : enum
- `payment_method` : enum
- `error_message` : text
- `metadata` : jsonb
- `processed_at` : timestamp
- `created_at` : timestamp
- `updated_at` : timestamp

## Gestion des erreurs

Toutes les erreurs sont renvoyées avec un code de statut HTTP approprié et un objet JSON contenant les détails de l'erreur :

```json
{
  "success": false,
  "error": "Message d'erreur détaillé",
  "code": "CODE_ERREUR",
  "details": {
    // Détails supplémentaires sur l'erreur
  }
}
```

## Tests

Pour tester l'intégration des paiements, vous pouvez utiliser les commandes suivantes :

```bash
# Tester l'initialisation d'un paiement
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{"amount": 1000, "phoneNumber": "221771234567", "description": "Test"}'

# Tester la vérification d'un paiement
curl -X GET http://localhost:5000/api/payments/verify/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"

# Tester l'annulation d'un abonnement
curl -X POST http://localhost:5000/api/subscriptions/123e4567-e89b-12d3-a456-426614174000/cancel \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## Sécurité

- Toutes les requêtes d'API (sauf les webhooks) nécessitent une authentification JWT valide
- Les webhooks sont sécurisés par une signature HMAC
- Les informations sensibles (clés API, identifiants) sont stockées dans des variables d'environnement
- Les numéros de téléphone sont nettoyés avant d'être envoyés à l'API Orange Money
- Les montants sont validés et arrondis avant traitement

## Maintenance

### Vérification des paiements en attente

Un job planifié devrait être configuré pour vérifier périodiquement le statut des paiements en attente qui n'ont pas été mis à jour par le webhook.

### Journalisation

Toutes les opérations de paiement sont journalisées dans la table `payment_attempts` avec leur statut et les détails de l'erreur en cas d'échec.

### Surveillance

Il est recommandé de mettre en place une surveillance pour :
- Les échecs de paiement répétés
- Les tentatives de fraude
- Les temps de réponse de l'API Orange Money
- Les erreurs de validation des webhooks
