import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Share2, 
  Gift,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Play
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Types pour l'onboarding
interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  description: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

const AffiliateSection = () => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [affiliateData, setAffiliateData] = useState<{
    id?: string;
    user_id?: string;
    affiliate_code?: string;
    approved?: boolean;
    created_at?: string;
    totalEarnings?: number;
    totalReferrals?: number;
    monthlyEarnings?: number;
  }>({});
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [referrals, setReferrals] = useState<Array<{
    id: string;
    user_id: string;
    created_at: string;
    status: 'active' | 'inactive' | 'pending';
    amount: number;
  }>>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour l'onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Leçons de l'onboarding
  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Introduction au Programme d'Affiliation",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Découvrez comment fonctionne notre programme d'affiliation et comment gagner de l'argent avec nous.",
      questions: [
        {
          question: "Quel est le pourcentage de commission sur les parrainages ?",
          options: ["5%", "10%", "15%", "20%"],
          correctAnswer: "10%"
        },
        {
          question: "Combien de temps dure la période d'essai ?",
          options: ["7 jours", "14 jours", "30 jours", "Pas de période d'essai"],
          correctAnswer: "14 jours"
        },
        {
          question: "Quand êtes-vous payé pour vos parrainages ?",
          options: ["Immédiatement", "À la fin du mois", "Après 30 jours", "Après approbation manuelle"],
          correctAnswer: "À la fin du mois"
        }
      ]
    },
    {
      id: 1,
      title: "Introduction au Programme d'Affiliation",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      description: "Découvrez comment fonctionne notre programme d'affiliation et comment gagner de l'argent avec nous.",
      questions: [
        {
          question: "Quel est le pourcentage de commission sur les parrainages ?",
          options: ["5%", "10%", "15%", "20%"],
          correctAnswer: "10%"
        },
        {
          question: "Combien de temps dure la période d'essai ?",
          options: ["7 jours", "14 jours", "30 jours", "Pas de période d'essai"],
          correctAnswer: "14 jours"
        },
        {
          question: "Quand êtes-vous payé pour vos parrainages ?",
          options: ["Immédiatement", "À la fin du mois", "Après 30 jours", "Après approbation manuelle"],
          correctAnswer: "À la fin du mois"
        }
      ]
    },
    // Ajoutez d'autres leçons ici
  ];

  // Charger la progression de l'utilisateur
  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    setIsLoadingProgress(true);
    try {
      // Vérifier d'abord si l'utilisateur a déjà une entrée
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
  
      if (error && error.code !== 'PGRST116') throw error;
  
      if (data) {
        setUserProgress(data);
        // Si l'onboarding n'est pas terminé, on l'affiche
        if (!data.onboarding_complete) {
          setShowOnboarding(true);
          setOnboardingStep(data.current_lesson || 0);
        }
      } else {
        // Créer une nouvelle entrée
        const newProgress = {
          user_id: user.id,
          current_lesson: 0,
          completed_lessons: [],
          quiz_passed: false,
          onboarding_complete: false,
          approved: false
        };
  
        const { data: insertedData, error: insertError } = await supabase
          .from('user_progress')
          .insert([newProgress])
          .select()
          .single();
  
        if (insertError) throw insertError;
  
        setUserProgress(insertedData);
        setShowOnboarding(true);
        setOnboardingStep(0);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your progress. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };
  // Mettre à jour la progression de l'utilisateur
  const updateUserProgress = async (updates: any) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProgress(data);
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }
  };

  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    if (!affiliateData.affiliate_code) return;
    
    try {
      await navigator.clipboard.writeText(affiliateData.affiliate_code);
      setCopiedCode(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopiedCode(false), 2000);
      
      toast({
        title: 'Code copié !',
        description: 'Votre code de parrainage a été copié dans le presse-papier.',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le code de parrainage',
        variant: 'destructive',
      });
    }
  };

  // Share referral link
  const shareReferralLink = async () => {
    const shareUrl = `https://elverraglobalml.com/register?ref=${affiliateData.affiliate_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez-moi sur Elverra Global',
          text: 'Découvrez les avantages de la carte Elverra Global avec mon lien de parrainage !',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Lien copié !',
          description: 'Le lien de parrainage a été copié dans votre presse-papier.',
        });
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de copier le lien de parrainage',
          variant: 'destructive',
        });
      }
    }
  };

  // Check affiliate status and load data
  const checkAffiliateStatus = async () => {
    console.log('1. Starting checkAffiliateStatus');
    
    if (!user?.id) {
      console.log('❌ No user ID available');
      return;
    }
    
    console.log('2. Checking status for user ID:', user.id);
    setIsLoading(true);
    
    try {
      // First, check the affiliates table as the source of truth
      console.log('3. Querying affiliates table...');
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affiliateError) {
        console.error('❌ Error fetching from affiliates table:', affiliateError);
        throw affiliateError;
      }

      console.log('4. affiliates table response:', affiliate);
      
      if (affiliate) {
        console.log('5. Found affiliate data in affiliates table, updating state...');
        
        // Format data from affiliates table to match our expected structure
        const affiliateData = {
          ...affiliate,
          id: affiliate.id,
          user_id: affiliate.user_id,
          affiliate_code: affiliate.affiliate_code || null,
          approved: affiliate.approved === true,
          created_at: affiliate.created_at,
          totalEarnings: 0, // These will be calculated separately
          monthlyEarnings: 0,
          totalReferrals: 0
        };
        
        console.log('6. Formatted affiliate data:', affiliateData);
        setAffiliateData(affiliateData);

        if (!affiliate.approved) {
          toast({
            title: 'En attente d\'approbation',
            description: 'Votre demande d\'affiliation est en cours de traitement.',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Bienvenue !',
            description: 'Votre compte d\'affilié est actif.',
            variant: 'default'
          });
        }
        return;
      }
      
      // If no data in affiliates table, check affiliate_profiles as fallback (legacy)
      console.log('7. No data in affiliates table, checking affiliate_profiles...');
      const { data: affiliateProfile, error: profileError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching from affiliate_profiles:', profileError);
        // Continue with empty state
      } else if (affiliateProfile) {
        console.log('8. Found legacy affiliate profile data:', affiliateProfile);
        
        // Migrate data to affiliates table if needed
        if (affiliateProfile.referral_code || affiliateProfile.affiliate_code) {
          console.log('9. Migrating legacy affiliate data to new table...');
          const { data: newAffiliate, error: migrateError } = await supabase
            .from('affiliates')
            .insert([{
              user_id: user.id,
              affiliate_code: affiliateProfile.referral_code || affiliateProfile.affiliate_code,
              approved: true, // Assume approved if they had a profile
              created_at: new Date().toISOString()
            }])
            .select('*')
            .single();
            
          if (!migrateError && newAffiliate) {
            console.log('10. Successfully migrated affiliate data');
            setAffiliateData({
              ...newAffiliate,
              approved: true,
              totalEarnings: 0,
              monthlyEarnings: 0,
              totalReferrals: 0
            });
            return;
          } else if (migrateError) {
            console.error('Error migrating affiliate data:', migrateError);
          }
        }
      }

      // If we get here, no affiliate data was found in either table
      console.log('11. No affiliate data found in any table');
      setAffiliateData({});
      
    } catch (error) {
      console.error('Error checking affiliate status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données d\'affiliation. Veuillez réessayer plus tard.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  // Handle quiz answer submission
  const handleAnswerSubmit = async () => {
    if (!userProgress) return;

    const currentLesson = lessons[onboardingStep];
    
    // Calculate score
    const correctAnswers = currentLesson.questions.filter((q, i) => 
      userAnswers[`${onboardingStep}-${i}`] === q.correctAnswer
    ).length;
    
    const totalQuestions = currentLesson.questions.length;
    const isPassingScore = correctAnswers / totalQuestions >= 0.7; // 70% to pass
    
    // Mise à jour du score localement (pas besoin de state séparé)
    const newScore = {
      correct: correctAnswers,
      total: totalQuestions
    };
    console.log('Score du quiz:', newScore);

    if (isPassingScore) {
      const completedLessons = [...new Set([...userProgress.completed_lessons || [], onboardingStep])];
      const isLastLesson = onboardingStep === lessons.length - 1;

      try {
        await updateUserProgress({
          current_lesson: isLastLesson ? onboardingStep : onboardingStep + 1,
          completed_lessons: completedLessons,
          quiz_passed: true, // Mark quiz as passed
          onboarding_complete: isLastLesson,
          approved: isLastLesson
        });

        if (isLastLesson) {
          setShowOnboarding(false);
          toast({
            title: 'Congratulations! 🎉',
            description: `You've completed the training with a score of ${correctAnswers}/${totalQuestions}. You can now join the affiliate program.`,
            variant: 'default',
            duration: 5000
          });
          // Automatically check affiliate status after successful completion
          checkAffiliateStatus();
        } else {
          setOnboardingStep(onboardingStep + 1);
          setShowQuiz(false);
          setUserAnswers({});
          // Show success message for passing the quiz
          toast({
            title: 'Quiz Passed!',
            description: `Great job! You scored ${correctAnswers} out of ${totalQuestions} correct answers.`,
            variant: 'default'
          });
        }
      } catch (error) {
        console.error('Error updating progress:', error);
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la mise à jour de votre progression.',
          variant: 'destructive'
        });
      }
    } else {
      // Show quiz results with score
      toast({
        title: 'Try Again',
        description: `You got ${correctAnswers} out of ${totalQuestions} correct. You need at least ${Math.ceil(totalQuestions * 0.7)} correct answers to pass.`,
        variant: 'destructive',
        action: (
          <Button variant="outline" onClick={() => {
            setUserAnswers({});
            setShowQuiz(false);
          }}>
            Try Again
          </Button>
        )
      });
    }
  };

  // Gérer l'inscription au programme d'affiliation
  const enrollInAffiliateProgram = async () => {
    console.log('1. Starting enrollment process...');
    
    // Vérifier si l'utilisateur est connecté
    if (!user?.id) {
      console.log('❌ No user ID available');
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour rejoindre le programme d\'affiliation.',
        variant: 'destructive'
      });
      return;
    }

    // Vérifier si la formation est terminée
    if (userProgress && !userProgress.onboarding_complete) {
      console.log('❌ Onboarding not completed');
      toast({
        title: 'Formation requise',
        description: 'Veuvez d\'abord terminer la formation avant de rejoindre le programme d\'affiliation.',
        variant: 'default'
      });
      setShowOnboarding(true);
      return;
    }

    // Vérifier si le quiz est réussi
    if (userProgress && !userProgress.quiz_passed) {
      console.log('❌ Quiz not passed');
      toast({
        title: 'Quiz requis',
        description: 'Veuvez d\'abord réussir le quiz pour rejoindre le programme d\'affiliation.',
        variant: 'destructive'
      });
      setShowOnboarding(true);
      setShowQuiz(true);
      return;
    }

    console.log('2. All checks passed, starting enrollment...');
    setIsEnrolling(true);
    
    try {
      // Vérifier d'abord si l'utilisateur est déjà affilié
      console.log('3. Checking if user is already an affiliate...');
      const { data: existingAffiliate, error: checkError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing affiliate:', checkError);
        throw checkError;
      }
      
      if (existingAffiliate) {
        console.log('4. User is already an affiliate:', existingAffiliate);
        if (existingAffiliate.approved) {
          toast({
            title: 'Déjà inscrit',
            description: 'Vous faites déjà partie du programme d\'affiliation Elverra Global !',
            variant: 'default'
          });
        } else {
          toast({
            title: 'En attente d\'approbation',
            description: 'Votre demande est en cours d\'examen. Vous serez notifié une fois approuvé.',
            variant: 'default'
          });
        }
        return;
      }
      
      // Générer un code de parrainage unique à 5 caractères aléatoires
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let referralCode = 'ELV-';
      for (let i = 0; i < 5; i++) {
        referralCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      console.log('5. Generated referral code:', referralCode);
      
      // Créer un nouveau profil d'affilié dans la table affiliates
      console.log('6. Creating new affiliate in affiliates table...');
      const { data: newAffiliate, error: insertError } = await supabase
        .from('affiliates')
        .insert([{
          user_id: user.id,
          affiliate_code: referralCode,
          approved: false, // Nécessite l'approbation d'un administrateur
          created_at: new Date().toISOString()
          // Ne pas inclure total_earnings et monthly_earnings car ils n'existent pas dans la table
        }])
        .select('*')
        .single();
      
      console.log('7. Insert result:', { newAffiliate, insertError });
  
      if (insertError) {
        console.error('❌ Error creating affiliate:', insertError);
        throw insertError;
      }

      console.log('7. New affiliate created:', newAffiliate);

      // Mettre à jour l'état local avec les valeurs par défaut
      setAffiliateData({
        ...newAffiliate,
        // Ces valeurs sont gérées côté client uniquement
        totalEarnings: 0,
        totalReferrals: 0,
        monthlyEarnings: 0,
        approved: false // Par défaut, non approuvé
      });
      
      console.log('8. Updated affiliate data in state:', affiliateData);
      
      // Afficher un message de succès
      toast({
        title: 'Demande envoyée !',
        description: 'Votre demande d\'adhésion au programme d\'affiliation a été reçue. Vous serez notifié une fois approuvé.',
        variant: 'default',
        duration: 5000
      });
      
      // Vérifier à nouveau le statut pour s'assurer que tout est à jour
      await checkAffiliateStatus();
  
    } catch (error) {
      console.error('Failed to enroll in affiliate program:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Copier le lien de parrainage
  const copyReferralLink = () => {
    if (affiliateData?.affiliate_code) {
      const referralLink = `https://elverraglobal.com/register?ref=${affiliateData.affiliate_code}`;
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: 'Lien copié !',
        description: 'Le lien de parrainage a été copié dans le presse-papier',
      });
    }
  };

  // Fonction pour charger les références
  const loadReferrals = async () => {
    if (!user?.id || !affiliateData.approved) return;
    
    try {
      // Récupérer les commissions qui correspondent à cet affilié
      const { data: commissions, error } = await supabase
        .from('commissions')
        .select(`
          id,
          referred_user_id,
          amount,
          status,
          created_at,
          referred_user:referred_user_id(email)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Vérifier s'il y a des utilisateurs qui ont ce profil comme référent
      const { data: referredUsers, error: refError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .eq('referred_by', user.id);
        
      if (refError) throw refError;
      
      // Si on a des utilisateurs référencés mais pas de commissions
      if ((!commissions || commissions.length === 0) && referredUsers && referredUsers.length > 0) {
        // Créer des entrées de commission pour chaque utilisateur référencé
        for (const referredUser of referredUsers) {
          const { error: insertError } = await supabase
            .from('commissions')
            .upsert(
              {
                referrer_id: user.id,
                referred_user_id: referredUser.id,
                amount: 0,
                status: 'pending',
                created_at: referredUser.created_at || new Date().toISOString()
              },
              { onConflict: 'referrer_id,referred_user_id' }
            );
            
          if (insertError) {
            console.error('Erreur création commission:', insertError);
          }
        }
        
        // Recharger les commissions après création
        return loadReferrals();
      }
      
      // Transformer les données pour l'affichage
      const formattedReferrals = (commissions || []).map(commission => ({
        id: commission.id,
        user_id: commission.referred_user_id || 'inconnu',
        created_at: new Date(commission.created_at).toLocaleDateString(),
        status: commission.status || 'pending',
        amount: commission.amount || 0
      }));
      
      setReferrals(formattedReferrals);
      
      // Mettre à jour le nombre total de références
      if (affiliateData.id) {
        setAffiliateData(prev => ({
          ...prev,
          totalReferrals: (referredUsers || []).length,
          totalEarnings: formattedReferrals.reduce((sum, ref) => sum + (ref.amount || 0), 0)
        }));
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des références:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des parrainages.',
        variant: 'destructive'
      });
    }
  };
  
  // Charger la progression et les données d'affiliation au montage
  useEffect(() => {
    const initialize = async () => {
      if (user?.id) {
        console.log('Initializing component with user:', user.id);
        await loadUserProgress();
        await checkAffiliateStatus();
      }
    };
    
    initialize();
  }, [user]);
  
  // Charger les références quand les données d'affiliation sont mises à jour
  useEffect(() => {
    if (affiliateData.approved) {
      loadReferrals();
    }
  }, [affiliateData.approved]);

  // Si l'utilisateur n'a pas encore terminé l'onboarding
  if (isLoadingProgress) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (userProgress && !userProgress.onboarding_complete) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Training Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Before you start:</h4>
              <p className="text-sm text-gray-700 mb-4">
                To join our affiliate program, you must first complete a short training.
              </p>
              <Button 
                onClick={() => {
                  console.log('Start Training clicked');
                  setShowOnboarding(true);
                }}
                className="w-full"
              >
                Start Training
              </Button>
            </div>
          </CardContent>
        </Card>
  
        {/* Modal d'onboarding */}
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>
                  Affiliate Training - Step {onboardingStep + 1} of {lessons.length}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowOnboarding(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress 
                value={((onboardingStep + (showQuiz ? 0.5 : 0)) / (lessons.length + 0.5)) * 100} 
                className="my-4 h-2" 
              />
            </DialogHeader>
            
            {!showQuiz ? (
              <div className="space-y-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={lessons[onboardingStep]?.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{lessons[onboardingStep]?.title}</h3>
                  <p className="text-sm text-gray-600">{lessons[onboardingStep]?.description}</p>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (onboardingStep > 0) {
                        setOnboardingStep(prev => prev - 1);
                        setShowQuiz(false);
                      } else {
                        setShowOnboarding(false);
                      }
                    }}
                    disabled={onboardingStep === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {onboardingStep === 0 ? 'Close' : 'Previous'}
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('Take Quiz clicked');
                      setShowQuiz(true);
                    }}
                  >
                    Take the Quiz
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Quiz: {lessons[onboardingStep]?.title}</h3>
                
                <div className="space-y-6">
                  {lessons[onboardingStep]?.questions?.map((q, i) => (
                    <div key={i} className="space-y-3">
                      <p className="font-medium">{i + 1}. {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((option, j) => (
                          <Button
                            key={j}
                            variant={
                              userAnswers[`${onboardingStep}-${i}`] === option 
                                ? "default" 
                                : "outline"
                            }
                            onClick={() => {
                              console.log('Answer selected:', { step: onboardingStep, question: i, answer: option });
                              setUserAnswers(prev => ({
                                ...prev,
                                [`${onboardingStep}-${i}`]: option
                              }));
                            }}
                            className="justify-start h-auto py-2 text-left whitespace-normal"
                          >
                            <span className="flex-1">{option}</span>
                            {userAnswers[`${onboardingStep}-${i}`] === option && (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      console.log('Back to video clicked');
                      setShowQuiz(false);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Video
                  </Button>
                  <Button 
                    onClick={async () => {
                      console.log('Submit answers clicked', { userAnswers });
                      await handleAnswerSubmit();
                    }}
                    disabled={
                      !lessons[onboardingStep]?.questions.every((_, i) => 
                        userAnswers[`${onboardingStep}-${i}`]
                      )
                    }
                  >
                    {onboardingStep === lessons.length - 1 ? "Finish" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }
  // Vérifier l'état de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Vérifier si l'utilisateur a des données d'affiliation valides
  // On se base uniquement sur la table affiliates pour la vérification
  const hasAffiliateData = affiliateData && (affiliateData.id || affiliateData.user_id);
  
  // Vérifier si l'utilisateur est approuvé dans la table affiliates
  const isApproved = hasAffiliateData && 
                   affiliateData.approved === true && 
                   affiliateData.affiliate_code && 
                   (affiliateData.affiliate_code.startsWith('ELV-') || 
                    affiliateData.affiliate_code.startsWith('AFF-'));
  
  console.log('Affiliate status:', { 
    hasAffiliateData, 
    isApproved, 
    affiliateData,
    loading: isLoading 
  });
  
  // Si l'utilisateur n'est pas encore inscrit au programme d'affiliation
  if (!hasAffiliateData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rejoindre le Programme d'Affiliation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Avantages du programme :</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Gagnez 10% de commission sur les clients parrainés</li>
              <li>• Soyez payé pour chaque renouvellement et paiement de carte</li>
              <li>• Suivi en temps réel de vos parrainages</li>
              <li>• Processus de retrait simple et rapide</li>
            </ul>
          </div>
          <Button 
            onClick={enrollInAffiliateProgram} 
            disabled={isEnrolling}
            className="w-full"
          >
            {isEnrolling ? 'Traitement...' : 'Rejoindre le Programme d\'Affiliation'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Cette section a été déplacée plus haut dans le code pour une meilleure logique de rendu

  // Si l'utilisateur est dans la table mais pas encore approuvé
  if (hasAffiliateData && !isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            En attente d'approbation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              Votre demande d'adhésion au programme d'affiliation est en cours d'examen. 
              Vous recevrez une notification par e-mail une fois approuvé.
            </p>
            
            {/* Afficher le code de parrainage si disponible */}
         
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vérification finale avant d'afficher le tableau de bord
  if (!isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            En attente d'activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Votre compte d'affiliation est en cours d'activation. Veuillez patienter.</p>
          {affiliateData.affiliate_code ? (
            <p className="mt-2 text-sm text-gray-600">
              Code actuel: {affiliateData.affiliate_code}
            </p>
          ) : (
            <p className="mt-2 text-sm text-yellow-600">
              En attente de génération de votre code d'affiliation.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Modal d'onboarding */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>
                Formation des Affiliés - Étape {onboardingStep + 1} sur {lessons.length}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowOnboarding(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress 
              value={((onboardingStep + (showQuiz ? 0.5 : 0)) / (lessons.length + 0.5)) * 100} 
              className="my-4 h-2" 
            />
          </DialogHeader>
          
          {!showQuiz ? (
            <div className="space-y-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={lessons[onboardingStep].videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{lessons[onboardingStep].title}</h3>
                <p className="text-sm text-gray-600">{lessons[onboardingStep].description}</p>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (onboardingStep > 0) {
                      setOnboardingStep(onboardingStep - 1);
                    } else {
                      setShowOnboarding(false);
                    }
                  }}
                  disabled={onboardingStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {onboardingStep === 0 ? 'Fermer' : 'Précédent'}
                </Button>
                <Button onClick={() => setShowQuiz(true)}>
                  Passer le quiz
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Quiz: {lessons[onboardingStep].title}</h3>
              
              <div className="space-y-6">
                {lessons[onboardingStep].questions.map((q, i) => (
                  <div key={i} className="space-y-3">
                    <p className="font-medium">{i + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options.map((option, j) => (
                        <Button
                          key={j}
                          variant={
                            userAnswers[`${onboardingStep}-${i}`] === option 
                              ? "default" 
                              : "outline"
                          }
                          onClick={() => setUserAnswers(prev => ({
                            ...prev,
                            [`${onboardingStep}-${i}`]: option
                          }))}
                          className="justify-start h-auto py-2 text-left whitespace-normal"
                        >
                          <span className="flex-1">{option}</span>
                          {userAnswers[`${onboardingStep}-${i}`] === option && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuiz(false)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Revoir la vidéo
                </Button>
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={
                    lessons[onboardingStep].questions.some((_, i) => 
                      !userAnswers[`${onboardingStep}-${i}`]
                    )
                  }
                >
                  {onboardingStep === lessons.length - 1 ? "Terminer" : "Suivant"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tableau de bord d'affiliation */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord d'Affiliation</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Actif
          </Badge>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gains Totaux</p>
                <p className="text-2xl font-bold text-green-600">
                  {affiliateData.totalEarnings?.toLocaleString() || '0'} FCFA
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Parrainages Totaux</p>
                <p className="text-2xl font-bold text-blue-600">
                  {affiliateData.totalReferrals || '0'}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce Mois</p>
                <p className="text-2xl font-bold text-purple-600">
                  {affiliateData.monthlyEarnings?.toLocaleString() || '0'} FCFA
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code de parrainage et liens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Votre Code de Parrainage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Code de Parrainage</label>
              <div className="flex gap-2">
                <Input
                  value={affiliateData.affiliate_code || 'Chargement...'}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? 'Copié !' : 'Copier'}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Lien de Parrainage</label>
              <div className="flex gap-2">
                <Input
                  value={
                    affiliateData.affiliate_code 
                      ? `https://elverraglobalml.com/register?ref=${affiliateData.affiliate_code}`
                      : 'Chargement...'
                  }
                  readOnly
                  className="text-sm"
                />
                <Button 
                  onClick={shareReferralLink} 
                  variant="outline" 
                  disabled={!affiliateData.affiliate_code}
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Comment gagner de l'argent :</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Partagez votre code de parrainage avec vos amis</li>
                <li>• Gagnez 10% de commission sur les achats de cartes</li>
                <li>• Soyez payé pour chaque renouvellement</li>
                <li>• Retirez vos gains à tout moment</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Informations de Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Informations sur les Commissions :</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Taux de Commission :</span>
                  <span className="font-semibold">10% sur tous les paiements</span>
                </div>
                <div className="flex justify-between">
                  <span>Types de Paiement :</span>
                  <span>Achats et renouvellements de cartes</span>
                </div>
                <div className="flex justify-between">
                  <span>Paiement :</span>
                  <span>À la fin de chaque mois</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => alert('La fonctionnalité de retrait sera bientôt disponible !')}
            >
              <Gift className="h-5 w-5 mr-2" />
              Demander un Retrait
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Historique des parrainages */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Parrainages ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Date d'adhésion</th>
                    <th className="text-left py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">Utilisateur {referral.user_id}</td>
                      <td className="py-4 px-4">ID: {referral.user_id}</td>
                      <td className="py-4 px-4">{referral.created_at}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={referral.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {referral.status === 'active' ? 'Actif' : 'En attente'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-semibold text-green-600">
                        {referral.amount?.toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Vous n'avez pas encore de parrainages. Partagez votre lien pour commencer à gagner !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;