# Instructions pour configurer Supabase Storage

Le script SQL ne fonctionne pas car les politiques Storage doivent être créées via l'interface Supabase Dashboard.

## Étapes à suivre :

### 1. Créer le bucket
- Allez sur [supabase.com](https://supabase.com) → Votre projet
- **Storage** → **New Bucket**
- Nom : `lawyer-audio`
- **Public bucket** : ✅ COCHÉ (très important)
- Cliquez **Create bucket**

### 2. Configurer les politiques RLS
- Cliquez sur le bucket `lawyer-audio`
- Onglet **Policies**
- **New Policy**

#### Policy 1 - Upload anonyme :
- **Policy name** : `Allow anonymous uploads`
- **Allowed operation** : `INSERT`
- **Target roles** : `anon`, `authenticated`
- **Policy definition** : `true`
- **Save policy**

#### Policy 2 - Lecture publique :
- **Policy name** : `Allow public reads`
- **Allowed operation** : `SELECT`
- **Target roles** : `anon`, `authenticated`, `public`
- **Policy definition** : `true`
- **Save policy**

### 3. Tester
Une fois configuré, l'upload audio fonctionnera dans l'application.

## Alternative rapide
Si les politiques ne fonctionnent pas, vous pouvez temporairement désactiver RLS pour ce bucket :
- Storage → lawyer-audio → Settings → **Disable RLS**
