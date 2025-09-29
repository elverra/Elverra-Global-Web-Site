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

// Types for onboarding
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
    full_name: String;
  }>>([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // Onboarding lessons
  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Introduction to the Affiliate Program",
      videoUrl: "https://www.youtube.com/embed/IlhVuGv0zcM",
      description: "Discover how our affiliate program works and how to earn money with us.",
      questions: [
        {
          question: "What is the name of the card offered by Elverra Global?",
          options: ["African Card", "ZENIKA Card", "Elverra Card", "Progress Card"],
          correctAnswer: "Elverra Card"
        },
        {
          question: "What are the benefits of the ZENIKA card?",
          options: ["Discounts only", "Special privileges only", "Discounts and special privileges", "No benefits"],
          correctAnswer: "Discounts and special privileges"
        },
        {
          question: "What is the main goal of Elverra Global?",
          options: ["Provide financial services", "Provide financial services", "Promote empowerment and progress", "Offer jobs"],
          correctAnswer: "Promote empowerment and progress"
        }
      ]
    },
    {
      id: 2,
      title: "Introduction to the Affiliate Program",
      videoUrl: "https://www.youtube.com/embed/cxvlO0NCG9g",
      description: "Discover how our affiliate program works and how to earn money with us.",
      questions: [
        {
          question: "What services are offered by Elverra Global?",
          options: ["Employment center, short-term loans, online store", "Free online library, Ô Secours", "All the services mentioned above", "None of the services mentioned above"],
          correctAnswer: "All the services mentioned above"
        },
        {
          question: "How long is the trial period?",
          options: ["7 days", "14 days", "30 days", "No trial period"],
          correctAnswer: "14 days"
        },
        {
          question: "When are you paid for your referrals?",
          options: ["Immediately", "At the end of the month", "After 30 days", "After manual approval"],
          correctAnswer: "At the end of the month"
        }
      ]
    },
    {
      id: 3,
      title: "Introduction to the Affiliate Program",
      videoUrl: "https://www.youtube.com/embed/Pgd4bfipIKk",
      description: "Discover how our affiliate program works and how to earn money with us.",
      questions: [
        {
          question: "What is the commission percentage on referrals?",
          options: ["5%", "10%", "15%", "20%"],
          correctAnswer: "10%"
        },
        {
          question: "How long is the trial period?",
          options: ["7 days", "14 days", "30 days", "No trial period"],
          correctAnswer: "14 days"
        },
        {
          question: "When are you paid for your referrals?",
          options: ["Immediately", "At the end of the month", "After 30 days", "After manual approval"],
          correctAnswer: "At the end of the month"
        }
      ]
    },
    
  ];

  // Load user progress
  const loadUserProgress = async () => {
    if (!user?.id) return;
    
    setIsLoadingProgress(true);
    try {
      // First check if the user already has an entry
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
  
      if (error && error.code !== 'PGRST116') throw error;
  
      if (data) {
        setUserProgress(data);
        // If onboarding is not completed, show it
        if (!data.onboarding_complete) {
          setShowOnboarding(true);
          setOnboardingStep(data.current_lesson || 0);
        }
      } else {
        // Create a new entry
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
  // Update user progress
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
      console.error('Error updating progress:', error);
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
        title: 'Code copied!',
        description: 'Your referral code has been copied to the clipboard.',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: 'Error',
        description: 'Unable to copy the referral code',
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
          title: 'Join me on Elverra Global',
          text: 'Discover the benefits of the Elverra Global card with my referral link!',
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
          title: 'Link copied!',
          description: 'The referral link has been copied to your clipboard.',
        });
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast({
          title: 'Error',
          description: 'Unable to copy the referral link',
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
            title: 'Pending Approval',
            description: 'Your affiliate application is being processed.',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Welcome!',
            description: 'Your affiliate account is active.',
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
        title: 'Error',
        description: 'Unable to load affiliate data. Please try again later.',
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
    
    // Update score locally (no need for separate state)
    const newScore = {
      correct: correctAnswers,
      total: totalQuestions
    };
    console.log('Quiz score:', newScore);

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
          title: 'Error',
          description: 'An error occurred while updating your progress.',
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

  // Handle enrollment in affiliate program
  const enrollInAffiliateProgram = async () => {
    console.log('1. Starting enrollment process...');
    
    // Check if the user is logged in
    if (!user?.id) {
      console.log('❌ No user ID available');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to join the affiliate program.',
        variant: 'destructive'
      });
      return;
    }

    // Check if training is completed
    if (userProgress && !userProgress.onboarding_complete) {
      console.log('❌ Onboarding not completed');
      toast({
        title: 'Training Required',
        description: 'Please complete the training first before joining the affiliate program.',
        variant: 'default'
      });
      setShowOnboarding(true);
      return;
    }

    // Check if quiz is passed
    if (userProgress && !userProgress.quiz_passed) {
      console.log('❌ Quiz not passed');
      toast({
        title: 'Quiz Required',
        description: 'Please pass the quiz first to join the affiliate program.',
        variant: 'destructive'
      });
      setShowOnboarding(true);
      setShowQuiz(true);
      return;
    }

    console.log('2. All checks passed, starting enrollment...');
    setIsEnrolling(true);
    
    try {
      // First check if the user is already an affiliate
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
            title: 'Already Enrolled',
            description: 'You are already part of the Elverra Global affiliate program!',
            variant: 'default'
          });
        } else {
          toast({
            title: 'Pending Approval',
            description: 'Your application is under review. You will be notified once approved.',
            variant: 'default'
          });
        }
        return;
      }
      
      // Generate a unique 5-character random referral code
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let referralCode = 'ELV-';
      for (let i = 0; i < 5; i++) {
        referralCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      console.log('5. Generated referral code:', referralCode);
      
      // Create a new affiliate profile in the affiliates table
      console.log('6. Creating new affiliate in affiliates table...');
      const { data: newAffiliate, error: insertError } = await supabase
        .from('affiliates')
        .insert([{
          user_id: user.id,
          affiliate_code: referralCode,
          approved: false, // Requires admin approval
          created_at: new Date().toISOString()
          // Do not include total_earnings and monthly_earnings as they do not exist in the table
        }])
        .select('*')
        .single();
      
      console.log('7. Insert result:', { newAffiliate, insertError });
  
      if (insertError) {
        console.error('❌ Error creating affiliate:', insertError);
        throw insertError;
      }

      console.log('7. New affiliate created:', newAffiliate);

      // Update local state with default values
      setAffiliateData({
        ...newAffiliate,
        // These values are handled client-side only
        totalEarnings: 0,
        totalReferrals: 0,
        monthlyEarnings: 0,
        approved: false // Default not approved
      });
      
      console.log('8. Updated affiliate data in state:', affiliateData);
      
      // Show success message
      toast({
        title: 'Application Sent!',
        description: 'Your application to join the affiliate program has been received. You will be notified once approved.',
        variant: 'default',
        duration: 5000
      });
      
      // Check status again to ensure everything is up to date
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

  // Copy referral link
  const copyReferralLink = () => {
    if (affiliateData?.affiliate_code) {
      const referralLink = `https://elverraglobal.com/register?ref=${affiliateData.affiliate_code}`;
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({
        title: 'Link copied!',
        description: 'The referral link has been copied to the clipboard',
      });
    }
  };

  const loadReferrals = async () => {
    if (!user?.id || !affiliateData.approved) return;
    
    try {
      // Get the affiliate_code of the current user
      const { data: currentUserData, error: userError } = await supabase
        .from('profiles')
        .select('affiliate_code')
        .eq('id', user.id)
        .single();
        
      if (userError || !currentUserData) {
        throw userError || new Error('User profile not found');
      }
      
      // Get users who have this user as referrer
      // Either by referred_by or referrer_affiliate_code
      const { data: referredUsers, error: refError } = await supabase
        .from('profiles')
        .select('id, created_at, full_name, phone, referrer_affiliate_code')
        .or(`referrer_affiliate_code.eq.${currentUserData.affiliate_code},referred_by.eq.${user.id}`);
  
      if (refError) throw refError;
  
      // For each referred user, ensure they have an entry in the commissions table
      if (referredUsers && referredUsers.length > 0) {
        const commissionsToInsert = referredUsers.map(user => ({
          referrer_id: user.id,
          referred_user_id: user.id,
          amount: 0,
          status: 'pending',
          created_at: user.created_at || new Date().toISOString()
        }));
  
        // Use upsert to avoid duplicates
        const { error: upsertError } = await supabase
          .from('commissions')
          .upsert(commissionsToInsert, {
            onConflict: 'referrer_id,referred_user_id'
          });
  
        if (upsertError) {
          console.error('Error creating commissions:', upsertError);
        }
      }
  
      // Now, get all commissions for display
     const { data: commissions, error } = await supabase
  .from('commissions')
  .select('id, referred_user_id, amount, status, created_at')
  .eq('referrer_id', user.id)
  .order('created_at', { ascending: false });

if (error) throw error;

// Get corresponding profiles
const userIds = commissions.map(c => c.referred_user_id);

const { data: profiles, error: profileError } = await supabase
  .from('profiles')
  .select("*")
  .in('id', userIds);

if (profileError) throw profileError;

// Merge
const formattedReferrals = commissions.map(c => {
  const profile = profiles.find(p => p.id === c.referred_user_id);
  return {
    id: c.id,
    user_id: c.referred_user_id,
    full_name: profile ? `${profile.full_name}` : 'Unknown',
    phone: profile?.phone || 'N/A',
    created_at: new Date(c.created_at).toLocaleDateString(),
    status: c.status,
    amount: c.amount
  };
});

setReferrals(formattedReferrals);
      
      // Update total referrals count
      if (affiliateData.id) {
        setAffiliateData(prev => ({
          ...prev,
          totalReferrals: formattedReferrals.length,
          totalEarnings: formattedReferrals.reduce((sum, ref) => sum + (ref.amount || 0), 0)
        }));
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
      toast({
        title: 'Error',
        description: 'Unable to load the referrals list.',
        variant: 'destructive',
      });
    }
  };
  
  // Load progress and affiliate data on mount
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
  
  // Load referrals when affiliate data is updated
  useEffect(() => {
    if (affiliateData.approved) {
      loadReferrals();
    }
  }, [affiliateData.approved]);

  // If the user has not yet completed onboarding
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
  
        {/* Onboarding modal */}
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
  // Check loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Check if the user has valid affiliate data
  // We rely solely on the affiliates table for verification
  const hasAffiliateData = affiliateData && (affiliateData.id || affiliateData.user_id);
  
  // Check if the user is approved in the affiliates table
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
  
  // If the user is not yet enrolled in the affiliate program
  if (!hasAffiliateData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Join the Affiliate Program
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Program Benefits:</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>• Earn 10% commission on referred clients</li>
              <li>• Get paid for every renewal and card payment</li>
              <li>• Real-time tracking of your referrals</li>
              <li>• Simple and fast withdrawal process</li>
            </ul>
          </div>
          <Button 
            onClick={enrollInAffiliateProgram} 
            disabled={isEnrolling}
            className="w-full"
          >
            {isEnrolling ? 'Processing...' : 'Join the Affiliate Program'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // This section has been moved higher in the code for better rendering logic

  // If the user is in the table but not yet approved
  if (hasAffiliateData && !isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              Your application to join the affiliate program is under review. 
              You will receive an email notification once approved.
            </p>
            
            {/* Display the referral code if available */}
         
          </div>
        </CardContent>
      </Card>
    );
  }

  // Final check before displaying the dashboard
  if (!isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Activation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your affiliate account is being activated. Please wait.</p>
          {affiliateData.affiliate_code ? (
            <p className="mt-2 text-sm text-gray-600">
              Current code: {affiliateData.affiliate_code}
            </p>
          ) : (
            <p className="mt-2 text-sm text-yellow-600">
              Waiting for your affiliate code to be generated.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Onboarding modal */}
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
                  {onboardingStep === 0 ? 'Close' : 'Previous'}
                </Button>
                <Button onClick={() => setShowQuiz(true)}>
                  Take the Quiz
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
                  Review Video
                </Button>
                <Button 
                  onClick={handleAnswerSubmit}
                  disabled={
                    lessons[onboardingStep].questions.some((_, i) => 
                      !userAnswers[`${onboardingStep}-${i}`]
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

      {/* Affiliate dashboard */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
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
                <p className="text-sm text-gray-600">Total Referrals</p>
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
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {affiliateData.monthlyEarnings?.toLocaleString() || '0'} FCFA
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral code and links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={affiliateData.affiliate_code || 'Loading...'}
                  readOnly
                  className="font-mono"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={
                    affiliateData.affiliate_code 
                      ? `https://elverraglobalml.com/register?ref=${affiliateData.affiliate_code}`
                      : 'Loading...'
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
                  Share
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">How to Earn Money:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Share your referral code with friends</li>
                <li>• Earn 10% commission on card purchases</li>
                <li>• Get paid for every renewal</li>
                <li>• Withdraw your earnings at any time</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Commission Information:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Commission Rate:</span>
                  <span className="font-semibold">10% on all payments</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Types:</span>
                  <span>Purchases and card renewals</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span>At the end of each month</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => alert('The withdrawal feature will be available soon!')}
            >
              <Gift className="h-5 w-5 mr-2" />
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Referrals history */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">ID</th>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">{referral.user_id}</td>
                      <td className="py-4 px-4 font-medium">{referral.full_name}</td>
                      <td className="py-4 px-4">{referral.created_at}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={referral.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                          {referral.status === 'active' ? 'Active' : 'Pending'}
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
              <p>You have no referrals yet. Share your link to start earning!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateSection;