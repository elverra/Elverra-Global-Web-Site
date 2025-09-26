import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ChevronLeft, ChevronRight, Loader2, Play, XCircle } from 'lucide-react';
import { useAffiliateData } from '@/hooks/useAffiliateData';
import { toast } from 'sonner';

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  quiz?: {
    questions: Array<{
      id: string;
      text: string;
      type: 'multiple_choice' | 'true_false';
      options: string[];
      correctAnswer: string;
    }>;
  };
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { affiliateData, updateLessonProgress, submitQuizAnswers } = useAffiliateData();
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer les leçons depuis les données d'affiliation
  const lessons = affiliateData?.lessons || [];
  const currentLesson = lessons.find(lesson => lesson.order_number === currentStep);
  const progress = affiliateData?.onboardingStatus || {
    currentLesson: 1,
    completedLessons: [],
    quizPassed: false,
    approved: false,
    totalLessons: 3
  };

  // Initialiser l'étape actuelle
  useEffect(() => {
    if (progress.currentLesson) {
      setCurrentStep(progress.currentLesson);
    }
  }, [progress.currentLesson]);

  const handleNext = async () => {
    if (!videoWatched && !showQuiz) {
      setShowQuiz(true);
      return;
    }

    if (showQuiz) {
      if (!currentLesson) return;
      
      setIsSubmitting(true);
      try {
        const result = await submitQuizAnswers.mutateAsync({
          lessonId: currentLesson.id,
          answers
        });

        if (result.success) {
          toast.success('Quiz réussi !');
          setShowQuiz(false);
          setVideoWatched(false);
          setAnswers({});
          
          // Mettre à jour la progression
          await updateLessonProgress.mutateAsync(currentStep + 1);
          
          // Si c'est la dernière étape, terminer l'onboarding
          if (currentStep >= progress.totalLessons) {
            onComplete();
          } else {
            setCurrentStep(prev => prev + 1);
          }
        } else {
          toast.error('Certaines réponses sont incorrectes. Veuillez réessayer.');
        }
      } catch (error) {
        console.error('Erreur lors de la soumission du quiz:', error);
        toast.error('Une erreur est survenue. Veuillez réessayer.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Si ce n'est pas un quiz, passer à l'étape suivante
    if (currentStep < progress.totalLessons) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (showQuiz) {
      setShowQuiz(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setVideoWatched(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleVideoEnded = () => {
    setVideoWatched(true);
  };

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const progressValue = (currentStep / progress.totalLessons) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {currentStep} sur {progress.totalLessons}
          </span>
          <span className="text-sm font-medium text-orange-600">
            {Math.round(progressValue)}% complété
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {showQuiz ? 'Quiz de validation' : currentLesson.title}
          </CardTitle>
          {!showQuiz && (
            <p className="text-gray-600">{currentLesson.description}</p>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {showQuiz ? (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">
                Répondez correctement pour valider cette leçon
              </h3>
              
              {currentLesson.questions?.map((question) => (
                <div key={question.id} className="space-y-3">
                  <p className="font-medium">{question.question_text}</p>
                  <div className="space-y-2">
                    {question.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type={question.question_type === 'multiple_choice' ? 'radio' : 'checkbox'}
                          id={`${question.id}-${index}`}
                          name={question.id}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <label 
                          htmlFor={`${question.id}-${index}`}
                          className="text-gray-700 cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6 bg-black bg-opacity-50 rounded-full">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              <video
                src={currentLesson.video_url}
                className="w-full h-full object-cover"
                controls
                onEnded={handleVideoEnded}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50 p-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1 && !showQuiz}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="flex items-center space-x-2">
            {showQuiz && (
              <Button 
                variant="outline" 
                onClick={() => setShowQuiz(false)}
                disabled={isSubmitting}
              >
                Revoir la vidéo
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              disabled={!videoWatched && !showQuiz || (showQuiz && Object.keys(answers).length === 0) || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : showQuiz ? (
                'Valider les réponses'
              ) : currentStep < progress.totalLessons ? (
                'Continuer'
              ) : (
                'Terminer la formation'
              )}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
