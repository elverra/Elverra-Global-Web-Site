# 🚀 Guide de Déploiement Vercel - Elverra Global

## ✅ Corrections Appliquées

### 1. **Détection de Plateforme**
- Code modifié pour détecter automatiquement Replit vs autres plateformes
- Utilisation de `process.env.REPL_ID` pour la détection

### 2. **Configuration Google Cloud Storage**
- **Replit** : Utilise les credentials sidecar
- **Vercel** : Utilise les credentials standard GCS

### 3. **Signature d'URLs**
- **Replit** : Via sidecar endpoint
- **Vercel** : Via Google Cloud Storage SDK natif

## 🔧 Configuration Vercel

### Variables d'Environnement Requises

```bash
# Base de données
DATABASE_URL=postgresql://user:pass@host:port/db

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=/tmp/gcs-key.json

# Chemins de stockage
PUBLIC_OBJECT_SEARCH_PATHS=/bucket/public
PRIVATE_OBJECT_DIR=/bucket/private

# Passerelles de paiement
ORANGE_CLIENT_ID=your_orange_client_id
ORANGE_CLIENT_SECRET=your_orange_client_secret
ORANGE_MERCHANT_KEY=your_orange_merchant_key

SAMA_MERCHANT_CODE=your_sama_merchant_code
SAMA_PUBLIC_KEY=your_sama_public_key
SAMA_TRANSACTION_KEY=your_sama_transaction_key
SAMA_USER_ID=your_sama_user_id

# Service email
SENDGRID_API_KEY=your_sendgrid_api_key

# URL frontend
FRONTEND_URL=https://your-app.vercel.app
```

### Configuration Google Cloud Storage

1. **Créer un Service Account** dans Google Cloud Console
2. **Télécharger la clé JSON** du service account
3. **Encoder en Base64** : `base64 -i key.json`
4. **Ajouter sur Vercel** :
   ```bash
   GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY=base64_encoded_key
   ```

### Script de Build Vercel

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "vercel-build": "npm run build && npm run build:server"
  }
}
```

## 🚀 Étapes de Déploiement

### 1. **Préparer le Repository**
```bash
git add .
git commit -m "Fix: Rendre compatible avec Vercel"
git push
```

### 2. **Connecter à Vercel**
- Aller sur [vercel.com](https://vercel.com)
- Importer le repository GitHub
- Configurer les variables d'environnement

### 3. **Configuration Build**
- **Build Command** : `npm run vercel-build`
- **Output Directory** : `client/dist`
- **Install Command** : `npm install`

### 4. **Variables d'Environnement**
Copier toutes les variables de `.env.vercel` dans Vercel Dashboard

## 🔍 Vérifications Post-Déploiement

### Endpoints à Tester
- `GET /` - Page d'accueil
- `GET /api/health` - Health check
- `POST /api/auth/register` - Inscription
- `POST /api/payments/initiate-orange-money` - Paiement Orange

### Logs à Surveiller
- Erreurs de connexion base de données
- Erreurs Google Cloud Storage
- Erreurs passerelles de paiement

## 🛠️ Dépannage

### Erreur "REPLIT_SIDECAR_ENDPOINT not found"
✅ **Résolu** - Code modifié pour détecter la plateforme

### Erreur Google Cloud Storage
- Vérifier `GOOGLE_CLOUD_PROJECT_ID`
- Vérifier la clé de service account
- Vérifier les permissions du bucket

### Erreur Base de Données
- Vérifier `DATABASE_URL`
- Vérifier la connectivité réseau
- Vérifier les migrations

## 📊 Monitoring

### Métriques à Surveiller
- Temps de réponse API
- Taux d'erreur
- Utilisation mémoire
- Connexions base de données

### Alertes Recommandées
- Erreur rate > 5%
- Temps de réponse > 2s
- Échecs de paiement

## 🔒 Sécurité

### Variables Sensibles
- Toutes les clés API en variables d'environnement
- Pas de secrets dans le code
- Rotation régulière des clés

### HTTPS
- Activé automatiquement sur Vercel
- Certificats SSL gérés automatiquement
