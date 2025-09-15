import { supabase } from '@/lib/supabaseClient';

export interface CreateSubscriptionData {
  userId: string;
  productId: string | number; // ID du produit dans membership_products (peut être une chaîne ou un nombre)
  cycleMonths: number; // Durée en mois du cycle de facturation
  isChild?: boolean;
  childName?: string;
  childBirthdate?: string;
  holderFullName: string;
  holderCity?: string;
  holderNeighborhood?: string;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: number; // Changé de string à number pour correspondre à la base de données
  status: 'active' | 'paused' | 'cancelled' | 'pending';
  start_date: string;
  end_date: string | null;
  is_recurring: boolean;
  is_child: boolean;
  child_name: string | null;
  child_birthdate: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  membership_card?: MembershipCard;
}

export interface MembershipCard {
  id: string;
  card_identifier: string;
  qr_code: string;
  holder_full_name: string;
  holder_city?: string;
  holder_neighborhood?: string;
  status: 'active' | 'inactive' | 'expired';
  issued_at: string;
  card_expiry_date: string | null;
  qr_data: any;
  qr_version: number;
}

interface MembershipProduct {
  id: number;
  kind: 'adult' | 'child';
  adult_tier?: 'essential' | 'premium' | 'elite';
  name: string;
  features: any;
  is_active: boolean;
}

interface MembershipPricing {
  id: string;
  product_id: number;
  cycle_months: number;
  purchase_price_cfa: number;
  renewal_price_cfa: number;
  fee_cfa: number;
  active: boolean;
}

interface MembershipCycle {
  id: number;
  months: number;
  label: string;
  is_active: boolean;
}

export const createPendingSubscription = async (data: CreateSubscriptionData): Promise<Subscription> => {
  try {
    // Validation des données requises
    if (!data.userId) throw new Error('ID utilisateur manquant');
    if (!data.productId) throw new Error('ID du produit manquant');
    if (!data.holderFullName) throw new Error('Nom du titulaire manquant');

    // Vérifier si l'utilisateur a déjà un abonnement actif du même type
    const { data: existingSub, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', data.userId)
      .eq('status', 'active')
      .eq('is_child', data.isChild || false)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur lors de la vérification des abonnements existants:', checkError);
      throw new Error('Erreur lors de la vérification des abonnements existants');
    }

    if (existingSub) {
      throw new Error(`Vous avez déjà un abonnement ${data.isChild ? 'enfant' : 'adulte'} actif`);
    }

    // Récupérer d'abord le produit par son ID numérique
    const productId = data.productId;
    
    // Vérifier que l'ID du produit est bien un nombre
    const numericProductId = Number(productId);
    if (isNaN(numericProductId)) {
      throw new Error('ID de produit invalide');
    }

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from('membership_products')
      .select('*')
      .eq('id', numericProductId)
      .single();

    if (productError || !product) {
      console.error('Produit non trouvé ou erreur:', productError);
      throw new Error('Le produit sélectionné est introuvable');
    }

    // Démarrer une transaction
    // Préparer les données de l'abonnement selon la structure de la table
    // Préparer les données de l'abonnement avec l'UUID du produit
    const subscriptionData = {
      user_id: data.userId,
      product_id: numericProductId, // Utiliser l'ID numérique du produit
      status: 'pending',
      start_date: new Date().toISOString(),
      end_date: null,
      is_recurring: true,
      is_child: data.isChild || false,
      child_name: data.childName || null,
      child_birthdate: data.childBirthdate || null,
      metadata: {
        ...data.metadata,
        // Toutes les informations supplémentaires vont dans metadata
        cycle_months: data.cycleMonths || 1,
        product_name: product.name,
        holder_full_name: data.holderFullName,
        holder_city: data.holderCity || '',
        holder_neighborhood: data.holderNeighborhood || ''
      },
      // created_at et updated_at sont gérés automatiquement par la base de données
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insérer l'abonnement
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select('*')
      .single();

    if (insertError) {
      console.error('Erreur lors de la création de l\'abonnement:', insertError);
      throw new Error('Erreur lors de la création de l\'abonnement');
    }

    return subscription;
  } catch (error) {
    console.error('Erreur dans createPendingSubscription:', error);
    throw new Error(error instanceof Error ? error.message : 'Une erreur inattendue est survenue');
  }
};

export const activateSubscription = async (subscriptionId: string, paymentId: string): Promise<{ subscription: Subscription; card: MembershipCard }> => {
  try {
    // Récupérer l'abonnement
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) throw new Error('Abonnement non trouvé');
    if (subscription.status === 'active') {
      throw new Error('Cet abonnement est déjà actif');
    }

    // Récupérer les détails du produit
    const { data: product, error: productError } = await supabase
      .from('membership_products')
      .select('*')
      .eq('id', subscription.product_id)
      .single();

    if (productError || !product) throw new Error('Produit non trouvé');

    // Calculer la date de fin
    const endDate = new Date();
    const cycleMonths = subscription.metadata?.cycle_months || 12; // Par défaut 12 mois
    endDate.setMonth(endDate.getMonth() + cycleMonths);

    // Générer un identifiant de carte unique
    const cardIdentifier = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Démarrer une transaction
    const { data: updatedSubscription, error: updateError } = await supabase.rpc('activate_subscription_with_card', {
      p_subscription_id: subscriptionId,
      p_end_date: endDate.toISOString(),
      p_payment_id: paymentId,
      p_card_identifier: cardIdentifier,
      p_qr_code: qrCode,
      p_holder_name: subscription.child_name || subscription.user_id,
      p_is_child: subscription.is_child,
      p_product_id: subscription.product_id
    });

    if (updateError) throw updateError;

    return {
      subscription: updatedSubscription.subscription,
      card: updatedSubscription.card
    };
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de l\'activation de l\'abonnement');
  }
};

export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        membership_card:membership_cards!inner(
          id,
          card_identifier,
          qr_code,
          holder_full_name,
          status,
          issued_at,
          card_expiry_date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return subscriptions || [];
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    throw new Error('Erreur lors de la récupération des abonnements');
  }
};

export const getActiveSubscription = async (userId: string, isChild?: boolean): Promise<Subscription | null> => {
  try {
    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (isChild !== undefined) {
      query = query.eq('is_child', isChild);
    }

    const { data: subscription, error } = await query.limit(1).maybeSingle();
    if (error) throw error;

    // Si on a un abonnement, on récupère la carte associée
    if (subscription) {
      const { data: card } = await supabase
        .from('membership_cards')
        .select('*')
        .eq('subscription_id', subscription.id)
        .maybeSingle();

      return { ...subscription, membership_card: card || null };
    }

    return null;
  } catch (error) {
    console.error('Error in getActiveSubscription:', error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (
  subscriptionId: string, 
  status: 'active' | 'paused' | 'cancelled',
  userId?: string
): Promise<Subscription> => {
  try {
    // Vérifier d'abord que l'utilisateur a le droit de modifier cet abonnement
    if (userId) {
      const { data: existing, error: checkError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('id', subscriptionId)
        .single();

      if (checkError || !existing || existing.user_id !== userId) {
        throw new Error('Non autorisé à modifier cet abonnement');
      }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      metadata: {
        status_updated_at: new Date().toISOString(),
      }
    };

    // Logique spécifique selon le statut
    if (status === 'cancelled') {
      updateData.end_date = new Date().toISOString();
      updateData.metadata.cancelled_at = new Date().toISOString();
      
      // Désactiver aussi la carte
      await supabase
        .from('membership_cards')
        .update({ status: 'inactive' })
        .eq('subscription_id', subscriptionId);
    } else if (status === 'paused') {
      updateData.metadata = {
        ...updateData.metadata,
        paused_at: new Date().toISOString()
      };
    } else if (status === 'active') {
      // Si réactivation, mettre à jour la date de fin
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('end_date, metadata')
        .eq('id', subscriptionId)
        .single();

      if (sub) {
        const metadata = sub.metadata as { paused_at?: string } || {};
        const pausedAt = metadata.paused_at ? new Date(metadata.paused_at) : null;
        const endDate = sub.end_date ? new Date(sub.end_date) : null;
        const remainingTime = endDate ? (endDate.getTime() - (pausedAt?.getTime() || new Date().getTime())) : 0;
        
        if (remainingTime > 0) {
          const newEndDate = new Date();
          newEndDate.setTime(newEndDate.getTime() + remainingTime);
          updateData.end_date = newEndDate.toISOString();
        }
        
        updateData.metadata = {
          ...metadata,
          reactivated_at: new Date().toISOString()
        };
      }
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId)
      .select('*')
      .single();

    if (error) throw error;
    return subscription;
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
  }
};

export const getAvailableProducts = async (): Promise<{
  products: Array<MembershipProduct & { pricing: MembershipPricing[] }>;
  cycles: MembershipCycle[];
}> => {
  try {
    // Récupérer les produits actifs
    const { data: products, error: productsError } = await supabase
      .from('membership_products')
      .select('*')
      .eq('is_active', true);

    if (productsError) throw productsError;

    // Récupérer les tarifs actifs
    const { data: pricing, error: pricingError } = await supabase
      .from('membership_pricing')
      .select('*')
      .eq('active', true);

    if (pricingError) throw pricingError;

    // Récupérer les cycles actifs
    const { data: cycles, error: cyclesError } = await supabase
      .from('membership_cycles')
      .select('*')
      .eq('is_active', true)
      .order('months', { ascending: true });

    if (cyclesError) throw cyclesError;

    // Associer les tarifs aux produits
    const productsWithPricing = (products || []).map(product => ({
      ...product,
      pricing: (pricing || []).filter(p => p.product_id === product.id)
    }));

    return {
      products: productsWithPricing,
      cycles: cycles || []
    };
  } catch (error) {
    console.error('Error fetching available products:', error);
    throw new Error('Erreur lors de la récupération des produits disponibles');
  }
};

// Alias pour la rétrocompatibilité
export const createSubscription = createPendingSubscription;
