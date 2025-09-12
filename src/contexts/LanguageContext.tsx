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