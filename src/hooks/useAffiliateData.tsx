import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ReferredUser {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  created_at?: string;  // Rendre ce champ optionnel
  membership_tier?: string;
  is_verified: boolean;
  referral_code?: string;
}

export interface ReferralData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  status: 'Active' | 'Pending';
  earnings: number;
  rewardType?: string;
  membershipTier?: string;
  isVerified: boolean;
  userDetails?: ReferredUser;
}

interface ReferrerData {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  phone?: string;
  created_at?: string;
  membership_tier?: string;
  is_verified?: boolean;
  referred_by?: string;
  referrer_affiliate_code?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  order_number: number;
  created_at: string;
  questions?: Question[];
}

interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  options: string[];
  correct_answer: string;
  points: number;
}

interface UserProgress {
  id: string;
  user_id: string;
  current_lesson: number;
  completed_lessons: number[];
  quiz_passed: boolean;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  is_correct: boolean;
  created_at: string;
}

interface AffiliateStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals?: number;
  referralTarget: number;
  totalEarnings: number;
  pendingEarnings: number;
  referralHistory: ReferralData[];
  progress: number;
  creditPoints?: number;
  commissions?: number;
  referrer?: ReferrerData | null;
  onboardingStatus: {
    currentLesson: number;
    completedLessons: number[];
    quizPassed: boolean;
    approved: boolean;
    totalLessons: number;
  };
  lessons: Lesson[];
  userAnswers: Record<string, string>;
}

export const useAffiliateData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: affiliateData, isLoading: loading, error, refetch: refreshData } = useQuery({
    queryKey: ['affiliate-dashboard', user?.id],
    queryFn: async () => {
      console.log('Début du chargement des données d\'affiliation...');
      if (!user?.id) {
        console.error('Erreur: Utilisateur non authentifié');
        throw new Error('User not authenticated');
      }

      console.log('Récupération du profil d\'affiliation pour l\'utilisateur:', user.id);
      // Fetch affiliate data from Supabase
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      console.log('Profil d\'affiliation récupéré:', !!affiliateProfile);

      if (profileError) {
        console.error('Erreur lors de la récupération du profil d\'affiliation:', profileError);
        if (profileError.code !== 'PGRST116') { // PGRST116 = Aucune ligne trouvée
          throw profileError;
        }
        console.log('Aucun profil d\'affiliation trouvé, création d\'un nouveau profil...');
      }

      // Récupérer d'abord le code de parrainage de l'utilisateur actuel
      console.log('Récupération du code de parrainage pour l\'utilisateur:', user.id);
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('referral_code, email, full_name')
        .eq('id', user.id)
        .single();
        
      console.log('Données utilisateur récupérées:', { hasReferralCode: !!currentUser?.referral_code, email: currentUser?.email });
      
      if (userError) {
        console.error('Erreur lors de la récupération des données utilisateur:', userError);
        throw userError;
      }
      
      if (!currentUser?.referral_code) {
        console.log('Aucun code de parrainage trouvé, génération d\'un nouveau code...');
        // Générer un nouveau code de parrainage s'il n'en existe pas
        const newReferralCode = `ELV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        console.log('Nouveau code généré:', newReferralCode);
        
        // Mettre à jour l'utilisateur avec le nouveau code
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_code: newReferralCode })
          .eq('id', user.id);
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour du code de parrainage:', updateError);
          throw updateError;
        }
        
        // Mettre à jour currentUser avec le nouveau code
        currentUser.referral_code = newReferralCode;
        console.log('Nouveau code de parrainage enregistré avec succès');
      }

      // Récupérer les utilisateurs qui ont été parrainés par l'utilisateur actuel
      console.log('Récupération des utilisateurs parrainés...');
      console.log('ID utilisateur actuel:', user.id);
      console.log('Code de parrainage actuel:', currentUser.referral_code);
      
      let referredUsers: any[] = [];
      let errorById = null;
      let errorByCode = null;
      
      try {
        // Essayer d'abord avec referred_by (ID utilisateur)
        console.log('Recherche des utilisateurs par referred_by...');
        const { data: referredById, error: refByIdError } = await supabase
          .from('users')
          .select('*')
          .eq('referred_by', user.id);
          
        if (refByIdError) {
          console.error('Erreur lors de la recherche par referred_by:', refByIdError);
          errorById = refByIdError;
        } else if (referredById && referredById.length > 0) {
          console.log(`${referredById.length} utilisateurs trouvés par referred_by`);
          referredUsers = [...referredUsers, ...referredById];
        }
        
        // Essayer avec referrer_affiliate_code si un code de parrainage existe
        if (currentUser.referral_code) {
          console.log('Recherche des utilisateurs par referrer_affiliate_code...');
          const { data: referredByCode, error: refByCodeError } = await supabase
            .from('users')
            .select('*')
            .eq('referrer_affiliate_code', currentUser.referral_code);
            
          if (refByCodeError) {
            console.error('Erreur lors de la recherche par referrer_affiliate_code:', refByCodeError);
            errorByCode = refByCodeError;
          } else if (referredByCode && referredByCode.length > 0) {
            console.log(`${referredByCode.length} utilisateurs trouvés par referrer_affiliate_code`);
            // Fusionner les tableaux en éliminant les doublons
            referredUsers = [...referredUsers, ...referredByCode.filter(
              (user: any) => !referredUsers.some(u => u.id === user.id)
            )];
          }
        }
        
        console.log(`Total des utilisateurs parrainés uniques trouvés: ${referredUsers.length}`);
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs parrainés:', err);
        // Continuer avec un tableau vide au lieu d'échouer complètement
        referredUsers = [];
      }

      // Récupérer les informations du référent (si l'utilisateur a été parrainé)
      const { data: userData, error: currentUserError } = await supabase
        .from('users')
        .select('referred_by, referrer_affiliate_code, is_verified')
        .eq('id', user.id)
        .single();

      if (currentUserError) {
        console.error('Erreur lors de la récupération des informations du référent:', currentUserError);
        throw currentUserError;
      }

      let referrerData = null;
      
      // Vérifier d'abord referred_by (ID utilisateur)
      if (userData?.referred_by) {
        const { data: refData, error: refError } = await supabase
          .from('users')
          .select('id, full_name, email, phone, referral_code, created_at, is_verified')
          .eq('id', userData.referred_by)
          .maybeSingle();
          
        if (!refError && refData) {
          referrerData = refData;
        } else if (refError) {
          console.error('Erreur lors de la récupération du référent par ID:', refError);
        }
      } 
      // Si referred_by n'est pas défini, essayer avec referrer_affiliate_code
      else if (userData?.referrer_affiliate_code) {
        const { data: refData, error: refError } = await supabase
          .from('users')
          .select('id, full_name, email, phone, referral_code, created_at, is_verified')
          .eq('referral_code', userData.referrer_affiliate_code)
          .maybeSingle();
          
        if (!refError && refData) {
          referrerData = refData;
        } else if (refError) {
          console.error('Erreur lors de la récupération du référent par code:', refError);
        }
      }

      // Récupérer les données des commissions depuis la table affiliate_referrals
      const { data: referralCommissions, error: commissionsError } = await supabase
        .from('affiliate_referrals')
        .select('referred_id, status, commission_earned, created_at')
        .eq('referrer_id', user.id);

      if (commissionsError) throw commissionsError;

      // Créer un map pour un accès rapide aux commissions par ID d'utilisateur
      const commissionMap = new Map<
        string, 
        { status: 'Active' | 'Pending'; earnings: number; date: string }
      >(
        referralCommissions?.map(rc => [
          rc.referred_id,
          {
            status: rc.status === 'confirmed' ? 'Active' : 'Pending',
            earnings: rc.commission_earned || 0,
            date: new Date(rc.created_at).toLocaleDateString('fr-FR')
          }
        ]) || []
      );

      // Calculer les statistiques
      const activeReferrals = referredUsers.filter(u => 
        commissionMap.get(u.id)?.status === 'Active'
      ).length;
      
      const pendingReferrals = referredUsers.filter(u => 
        commissionMap.get(u.id)?.status === 'Pending' || !commissionMap.has(u.id)
      ).length;
      
      const totalEarnings = referralCommissions?.reduce(
        (sum, rc) => sum + (rc.commission_earned || 0), 0
      ) || 0;
      
      const pendingEarnings = referralCommissions?.filter(
        rc => rc.status !== 'confirmed'
      ).reduce((sum, rc) => sum + (rc.commission_earned || 0), 0) || 0;

      // Créer l'historique des parrainages
      const referralHistory: ReferralData[] = referredUsers.map(user => {
        const commission = commissionMap.get(user.id);
        return {
          id: user.id,
          name: user.full_name || 'Utilisateur anonyme',
          email: user.email || '',
          phone: user.phone || null,
          date: commission?.date || (user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'),
          status: commission?.status || 'Pending',
          earnings: commission?.earnings || 0,
          membershipTier: user.membership_tier || 'Aucun',
          isVerified: user.is_verified || false,
          userDetails: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || null,
            created_at: user.created_at,
            membership_tier: user.membership_tier,
            is_verified: user.is_verified || false,
            referral_code: user.referral_code
          }
        };
      }) || [];

      // Créer l'objet avec les données d'affiliation
      const affiliateStats: AffiliateStats = {
        // Propriétés de base
        referralCode: currentUser.referral_code || 'N/A',
        totalReferrals: referredUsers.length,
        pendingReferrals: pendingReferrals,
        referralTarget: 10, // Cible par défaut
        totalEarnings: totalEarnings,
        pendingEarnings: pendingEarnings,
        referralHistory: referralHistory,
        progress: Math.min(100, Math.round((referredUsers.length / 10) * 100)),
        creditPoints: affiliateProfile?.credit_points || 0,
        commissions: totalEarnings,
        
        // Informations sur le référent (si l'utilisateur a été parrainé)
        referrer: referrerData || null,
        
        // État d'onboarding
        onboardingStatus: {
          currentLesson: 1,
          completedLessons: [],
          quizPassed: false,
          approved: true, // Par défaut à true pour permettre l'accès
          totalLessons: 5
        },
        
        // Propriétés requises par l'interface
      
        lessons: [],
        userAnswers: {}
      };
      
      console.log('Statistiques d\'affiliation générées:', { 
        referralCode: affiliateStats.referralCode,
        totalReferrals: affiliateStats.totalReferrals,
        progress: affiliateStats.progress + '%',
        totalEarnings: affiliateStats.totalEarnings
      });
      
      return affiliateStats;
    },
    enabled: !!user?.id,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch all affiliate lessons
  const { data: lessons = [], isLoading: isLoadingLessons } = useQuery({
    queryKey: ['affiliate-lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_lessons')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!user?.id,
  });

  // Fetch user progress
  const { data: userProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['affiliate-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('affiliate_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Initialize progress if it doesn't exist
      if (!data) {
        const { data: newProgress, error: createError } = await supabase
          .from('affiliate_progress')
          .insert([{
            user_id: user.id,
            current_lesson: 1,
            completed_lessons: [],
            quiz_passed: false,
            approved: false,
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        return newProgress as UserProgress;
      }
      
      return data as UserProgress;
    },
    enabled: !!user?.id,
  });

  // Fetch user answers
  const { data: userAnswers = {} } = useQuery({
    queryKey: ['affiliate-user-answers', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      const { data, error } = await supabase
        .from('affiliate_answers')
        .select('question_id, answer')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching user answers:', error);
        return {};
      }
      
      return data.reduce((acc, { question_id, answer }) => ({
        ...acc,
        [question_id]: answer
      }), {} as Record<string, string>);
    },
    enabled: !!user?.id,
  });

  // Mutation to update lesson progress
  const updateLessonProgress = useMutation({
    mutationFn: async (newLessonNumber: number) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const currentProgress = userProgress || {
        user_id: user.id,
        current_lesson: 1,
        completed_lessons: [] as number[],
        quiz_passed: false,
        approved: false,
      };
      
      // If already completed, don't update
      if (currentProgress.completed_lessons.includes(newLessonNumber)) {
        return currentProgress;
      }
      
      const updatedProgress = {
        ...currentProgress,
        current_lesson: Math.max(currentProgress.current_lesson, newLessonNumber),
        completed_lessons: [...new Set([...currentProgress.completed_lessons, newLessonNumber])],
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('affiliate_progress')
        .upsert(updatedProgress, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data as UserProgress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-progress', user?.id] });
    },
  });

  // Mutation to submit quiz answers
  const submitQuizAnswers = useMutation({
    mutationFn: async (params: { lessonId: string; answers: Record<string, string> }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First, get the correct answers
      const { data: questions, error: questionsError } = await supabase
        .from('affiliate_questions')
        .select('id, correct_answer')
        .eq('lesson_id', params.lessonId);
      
      if (questionsError) throw questionsError;
      
      // Check answers
      const results = questions.map(question => ({
        question_id: question.id,
        user_id: user.id,
        answer: params.answers[question.id] || '',
        is_correct: params.answers[question.id] === question.correct_answer,
        created_at: new Date().toISOString(),
      }));
      
      // Save all answers
      const { error: insertError } = await supabase
        .from('affiliate_answers')
        .upsert(results, { onConflict: 'user_id,question_id' });
      
      if (insertError) throw insertError;
      
      // Check if all answers are correct
      const allCorrect = results.every(r => r.is_correct);
      
      // If this is the final lesson's quiz and all answers are correct, mark as passed
      if (allCorrect) {
        const currentLesson = lessons.find(l => l.id === params.lessonId);
        const isFinalLesson = currentLesson?.order_number === Math.max(...lessons.map(l => l.order_number));
        
        if (isFinalLesson) {
          await supabase
            .from('affiliate_progress')
            .update({ quiz_passed: true })
            .eq('user_id', user.id);
        }
      }
      
      return { success: allCorrect };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-user-answers', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['affiliate-progress', user?.id] });
    },
  });

  // Combine all data
  const combinedData = {
    ...affiliateData,
    onboardingStatus: {
      currentLesson: userProgress?.current_lesson || 1,
      completedLessons: userProgress?.completed_lessons || [],
      quizPassed: userProgress?.quiz_passed || false,
      approved: userProgress?.approved || false,
      totalLessons: lessons.length,
    },
    lessons,
    userAnswers,
  };

  return { 
    affiliateData: combinedData, 
    loading: loading || isLoadingLessons, 
    error: error ? (error as Error).message : null, 
    refreshData,
    updateLessonProgress,
    submitQuizAnswers,
    refetchProgress,
  };
};