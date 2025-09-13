import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

type TranslationKey = string;
type TranslationValue = string | Record<string, string | Record<string, string>>;
type Translations = Record<string, Record<string, string>>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, values?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.about.us': 'About Us',
    'nav.about.contact': 'Contact',
    'nav.about.projects': 'Projects',
    'nav.about.partners': 'Partners',
    'nav.about.news': 'News',
    'nav.about.team': 'Team Members',
    'nav.about.empowerment': 'Empowerment and Progress',
    'nav.services': 'Services',
    'nav.services.jobs': 'Job Centre',
    'nav.services.shop': 'Shop',
    'nav.services.payday': 'Payday Loans',
    'nav.services.hire': 'Hire Purchase',
    'nav.services.ebooks': 'E-Book Library',
    'nav.services.competition': 'Competition',
    'nav.services.discounts': 'Discounts',
    'nav.services.osecours': 'Ô Secours',
    'nav.account': 'My Account',
    'nav.dashboard': 'Dashboard',
    'nav.signout': 'Sign Out',
    'nav.login': 'Login',
    'nav.register': 'Join Now',
    'nav.terms': 'Terms of Use',
    'nav.privacy': 'Privacy Policy',
    
    // Country/Language Selector
    'selector.country': 'Select Country',
    'selector.language': 'Language',
    'selector.mali': 'Mali',
    'selector.french': 'French',
    'selector.english': 'English',
    'error_invalid_amount': 'Amount must be between {{min}} and {{max}} tokens',
    'selector.not_available': 'Country Not Available',
    'selector.not_available_desc': 'This country is not yet available. Currently, only Mali and International are active.',
    
    // Common buttons
    'button.continue': 'Continue',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.submit': 'Submit',
    'button.close': 'Close',
    'button.back': 'Back',
    'button.next': 'Next',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome',
    'dashboard.overview': 'Overview',
    
    // Affiliate
    'affiliate.dashboard': 'Affiliate Dashboard',
    'affiliate.earnings': 'Total Earnings',
    'affiliate.referrals': 'Total Referrals',
    'affiliate.code': 'Referral Code',
    'affiliate.program': 'Affiliate Program',
    
    // Membership
    'membership.basic': 'Basic',
    'membership.premium': 'Premium',
    'membership.enterprise': 'Enterprise',
    
    // Forms
    'form.email': 'Email',
    'form.password': 'Password',
    'form.name': 'Full Name',
    'form.phone': 'Phone Number',
    'form.required': 'Required',
    
    // Dashboard specific
    'nav.settings': 'Settings',
    'dashboard.spending_limits': 'Spending Limits',
    'dashboard.daily_limit': 'Daily Transaction Limit',
    'dashboard.card_info': 'Card Info',
    'dashboard.active_card': 'Active Card Details',
    'dashboard.transactions': 'Transactions',
    'dashboard.print': 'Print',
    'dashboard.share': 'Share',
    'dashboard.history': 'History',
    'dashboard.top_up': 'Top-Up',
    'dashboard.upgrade_now': 'Upgrade Now',
    'dashboard.see_details': 'See Details',
    'dashboard.show_all': 'Show All My Transactions',
    
    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.loading': 'Loading...',
    'message.welcome': 'Welcome to Elverra Global',

    // Ô Secours
    'osecours_services': 'Ô Secours Services',
    'active': 'Active',
    'inactive': 'Inactive',
    'help': 'Help',
    'your_subscription': 'Your Subscription',
    'subscription_description': 'Manage your Ô Secours subscription and token balances.',
    'status': 'Status',
    'available_services': 'Available Services',
    'avg_response_time': 'Average Response Time',
    '15_min': '15 minutes',
    'satisfaction': 'Satisfaction',
    '128_reviews': '128 reviews',
    'renewal_date': 'Renewal date: {{date}}',
    'monthly_usage': 'Monthly Usage',
    'services': 'Services',
    'my_requests': 'My Requests',
    'history': 'History',
    'my_tokens': 'My Tokens',
    'purchase': 'Purchase',
    'current_requests': 'Current Requests',
    'request_id': 'Request ID',
    'amount': 'Amount',
    'provider': 'Provider',
    'estimated_completion': 'Estimated Completion',
    'track_request': 'Track Request',
    'contact_provider': 'Contact Provider',
    'no_active_requests': 'No active requests',
    'service_history': 'Service History',
    'date': 'Date',
    'transaction_history': 'Transaction History',
    'track_transactions': 'Track your purchases and usages',
    'your_token_balances': 'Your Token Balances',
    'manage_tokens': 'Manage your tokens',
    'buy_tokens': 'Buy Tokens',
    'buy_tokens_description': 'Purchase tokens for your selected service',
    'price_per_token': 'Price per token',
    'current_balance': 'Current balance',
    'usage_this_month': 'Usage this month',
    'request_service': 'Request Service',
    'buy_more': 'Buy More',
    'remaining_tokens': 'Remaining tokens: {{count}}',
    'no_tokens': 'No tokens yet. Buy some to get started.',
    'no_transactions': 'No transactions to show',
    'no_service_history': 'No service history yet',
    'service': 'Service',
    'completed': 'Completed',
    'in_progress': 'In Progress',
    'pending': 'Pending',
    'cancelled': 'Cancelled',
    'error_fetch_data': 'Failed to fetch data',
    'error_select_token_amount_phone': 'Please select a token, amount and enter your phone number',
    
    'purchase_success_message': 'Purchase successful ({{amount}} tokens)!',
    'error_purchase': 'Failed to process purchase',
    'error_unauthorized': 'You must be logged in',
    'error_service_not_found': 'Service not found',
    'service_request_success_message': 'Request created for {{service}}',
    'error_service_request': 'Failed to create request',
    'error_insufficient_balance': 'Insufficient token balance',
    // Request dialog
    'describe_service_request': 'Describe your service request',
    'select_service': 'Select service',
    'tokens_to_use': 'Tokens to use',
    'available': 'Available',
    'description': 'Description',
    'describe_need': 'Describe your need...',
    'justification_attachment': 'Justification (optional)',
    'cancel': 'Cancel',
    'submit_request': 'Submit Request',
    'error': 'Error',
    'submitting': 'Submitting...'
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.about.us': 'À propos de nous',
    'nav.about.contact': 'Contact',
    'nav.about.projects': 'Projets',
    'nav.about.partners': 'Partenaires',
    'nav.about.news': 'Actualités',
    'nav.about.team': 'Membres de l\'équipe',
    'nav.about.empowerment': 'Autonomisation et Progrès',
    'nav.services': 'Services',
    'nav.services.jobs': 'Centre d\'emploi',
    'nav.services.shop': 'Boutique',
    'nav.services.payday': 'Prêts sur salaire',
    'nav.services.hire': 'Achat à tempérament',
    'nav.services.ebooks': 'Bibliothèque numérique',
    'nav.services.competition': 'Concours',
    'nav.services.discounts': 'Réductions',
    'nav.services.osecours': 'Ô Secours',
    'nav.account': 'Mon compte',
    'nav.dashboard': 'Tableau de bord',
    'nav.signout': 'Se déconnecter',
    'nav.login': 'Connexion',
    'nav.register': 'Rejoindre',
    'nav.terms': 'Conditions d\'utilisation',
    'nav.privacy': 'Politique de confidentialité',
    
    // Country/Language Selector
    'selector.country': 'Sélectionner le pays',
    'selector.language': 'Langue',
    'selector.mali': 'Mali',
    'selector.french': 'Français',
    'selector.english': 'Anglais',
    'error_invalid_amount': 'Le montant doit être compris entre {{min}} et {{max}} jetons',
    'selector.not_available': 'Pays non disponible',
    'selector.not_available_desc': 'Ce pays n\'est pas encore disponible. Actuellement, seuls le Mali et International sont actifs.',
    
    // Common buttons
    'button.continue': 'Continuer',
    'button.cancel': 'Annuler',
    'button.save': 'Enregistrer',
    'button.submit': 'Soumettre',
    'button.close': 'Fermer',
    'button.back': 'Retour',
    'button.next': 'Suivant',
    
    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bienvenue',
    'dashboard.overview': 'Aperçu',
    
    // Affiliate
    'affiliate.dashboard': 'Tableau de bord d\'affiliation',
    'affiliate.earnings': 'Gains totaux',
    'affiliate.referrals': 'Parrainages totaux',
    'affiliate.code': 'Code de parrainage',
    'affiliate.program': 'Programme d\'affiliation',
    
    // Membership
    'membership.basic': 'Basique',
    'membership.premium': 'Premium',
    'membership.enterprise': 'Entreprise',
    
    // Forms
    'form.email': 'Email',
    'form.password': 'Mot de passe',
    'form.name': 'Nom complet',
    'form.phone': 'Numéro de téléphone',
    'form.required': 'Requis',
    
    // Dashboard specific
    'nav.settings': 'Paramètres',
    'dashboard.spending_limits': 'Limites de dépenses',
    'dashboard.daily_limit': 'Limite de transaction quotidienne',
    'dashboard.card_info': 'Informations de carte',
    'dashboard.active_card': 'Détails de carte active',
    'dashboard.transactions': 'Transactions',
    'dashboard.print': 'Imprimer',
    'dashboard.share': 'Partager',
    'dashboard.history': 'Historique',
    'dashboard.top_up': 'Recharger',
    'dashboard.upgrade_now': 'Mettre à niveau',
    'dashboard.see_details': 'Voir les détails',
    'dashboard.show_all': 'Afficher toutes mes transactions',
    
    // Messages
    'message.success': 'Succès',
    'message.error': 'Erreur',
    'message.loading': 'Chargement...',
    'message.welcome': 'Bienvenue chez Elverra Global',

    // Ô Secours
    'osecours_services': 'Services Ô Secours',
    'active': 'Actif',
    'inactive': 'Inactif',
    'help': 'Aide',
    'your_subscription': 'Votre abonnement',
    'subscription_description': 'Gérez votre abonnement Ô Secours et vos soldes de jetons.',
    'status': 'Statut',
    'available_services': 'Services disponibles',
    'avg_response_time': 'Temps de réponse moyen',
    '15_min': '15 minutes',
    'satisfaction': 'Satisfaction',
    '128_reviews': '128 avis',
    'renewal_date': 'Date de renouvellement : {{date}}',
    'monthly_usage': 'Utilisation mensuelle',
    'services': 'Services',
    'my_requests': 'Mes demandes',
    'history': 'Historique',
    'my_tokens': 'Mes jetons',
    'purchase': 'Achat',
    'current_requests': 'Demandes en cours',
    'request_id': 'ID Demande',
    'amount': 'Montant',
    'provider': 'Prestataire',
    'estimated_completion': 'Fin estimée',
    'track_request': 'Suivre la demande',
    'contact_provider': 'Contacter le prestataire',
    'no_active_requests': 'Aucune demande en cours',
    'service_history': 'Historique des services',
    'date': 'Date',
    'transaction_history': 'Historique des transactions',
    'track_transactions': 'Suivez vos achats et utilisations',
    'your_token_balances': 'Vos soldes de jetons',
    'manage_tokens': 'Gérez vos jetons',
    'buy_tokens': 'Acheter des jetons',
    'buy_tokens_description': 'Achetez des jetons pour le service sélectionné',
    'price_per_token': 'Prix par jeton',
    'current_balance': 'Solde actuel',
    'usage_this_month': 'Utilisation ce mois',
    'request_service': 'Demander le service',
    'buy_more': 'Acheter plus',
    'remaining_tokens': 'Jetons restants : {{count}}',
    'no_tokens': 'Aucun jeton. Achetez-en pour commencer.',
    'no_transactions': 'Aucune transaction à afficher',
    'no_service_history': 'Aucun historique de service',
    'service': 'Service',
    'completed': 'Terminé',
    'in_progress': 'En cours',
    'pending': 'En attente',
    'cancelled': 'Annulé',
    'error_fetch_data': 'Échec de récupération des données',
    'error_select_token_amount_phone': 'Veuillez sélectionner un type, un montant et saisir votre numéro de téléphone',
    
    'purchase_success_message': 'Achat réussi ({{amount}} jetons) !',
    'error_purchase': "Échec du traitement de l'achat",
    'error_unauthorized': 'Vous devez être connecté',
    'error_service_not_found': 'Service introuvable',
    'service_request_success_message': 'Demande créée pour {{service}}',
    'error_service_request': 'Échec de création de la demande',
    'error_insufficient_balance': 'Solde de jetons insuffisant',
    // Request dialog
    'describe_service_request': 'Décrivez votre demande de service',
    'select_service': 'Sélectionner le service',
    'tokens_to_use': 'Jetons à utiliser',
    'available': 'Disponible',
    'description': 'Description',
    'describe_need': 'Décrivez votre besoin...',
    'justification_attachment': 'Justificatif (optionnel)',
    'cancel': 'Annuler',
    'submit_request': 'Soumettre la demande',
    'error': 'Erreur',
    'submitting': 'Envoi...'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, values?: Record<string, any>): string => {
    const translation: any = translations[language];

    // 1) Prefer direct flat key lookup (supports dotted keys stored flat)
    if (Object.prototype.hasOwnProperty.call(translation, key)) {
      let direct: any = translation[key];
      if (typeof direct !== 'string') {
        console.warn(`Translation value is not a string for key: ${key}`);
        return key;
      }
      if (values) {
        Object.keys(values).forEach(k => {
          direct = direct.replace(new RegExp(`{{${k}}}`, 'g'), String(values[k]));
        });
      }
      return direct;
    }

    // 2) Fallback: nested traversal if translations are structured hierarchically
    const keys = key.split('.');
    let value: any = translation;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }
    let result = value;
    if (values) {
      Object.keys(values).forEach(k => {
        result = result.replace(new RegExp(`{{${k}}}`, 'g'), String(values[k]));
      });
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};