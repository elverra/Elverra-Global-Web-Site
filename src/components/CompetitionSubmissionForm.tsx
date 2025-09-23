import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { MediaUploader } from './MediaUploader';
import { supabase } from '@/lib/supabaseClient';

const submissionFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  mediaUrls: z.array(z.string()).min(1, 'Veuillez télécharger au moins un fichier'),
});

type SubmissionFormValues = z.infer<typeof submissionFormSchema>;

interface CompetitionSubmissionFormProps {
  eventId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  maxFiles?: number;
  mediaTypes?: Array<'image' | 'video' | 'document' | 'audio'>;
}

export function CompetitionSubmissionForm({
  eventId,
  userId,
  onSuccess,
  onCancel,
  maxFiles = 5,
  mediaTypes = ['image', 'video'],
}: CompetitionSubmissionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      title: '',
      description: '',
      mediaUrls: [],
    },
  });

  const handleMediaUpload = async (mediaUrls: string[]) => {
    form.setValue('mediaUrls', mediaUrls, { shouldValidate: true });
  };

  const onSubmit = async (data: SubmissionFormValues) => {
    if (isSubmitting || isUploading) return;
    
    try {
      setIsSubmitting(true);
      
      // 1. Créer la soumission
      const { data: submission, error: submissionError } = await supabase
        .from('competition_submissions')
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            title: data.title,
            description: data.description,
            status: 'pending',
          },
        ])
        .select('*')
        .single();

      if (submissionError) throw submissionError;

      // 2. Enregistrer les médias
      const mediaRecords = data.mediaUrls.map((url, index) => ({
        submission_id: submission.id,
        file_url: url,
        file_name: url.split('/').pop() || `media-${Date.now()}-${index}`,
        file_type: url.split('.').pop() || '',
        media_type: url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 
                   url.match(/\.(mp4|webm|ogg)$/i) ? 'video' :
                   url.match(/\.(mp3|wav|ogg)$/i) ? 'audio' : 'document',
        is_primary: index === 0,
      }));

      const { error: mediaError } = await supabase
        .from('submission_media')
        .insert(mediaRecords);

      if (mediaError) throw mediaError;

      // 3. Mettre à jour le compteur de participants
      const { error: eventError } = await supabase.rpc('increment_event_participants', {
        event_id: eventId,
      });

      if (eventError) console.error("Erreur lors de la mise à jour du compteur de participants:", eventError);

      toast({
        title: 'Participation enregistrée',
        description: 'Votre participation a été soumise avec succès !',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de votre participation.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de votre participation</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Donnez un titre à votre participation" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre participation en détail..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mediaUrls"
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel>Médias</FormLabel>
              <FormControl>
                <MediaUploader
                  onUploadComplete={handleMediaUpload}
                  maxFiles={maxFiles}
                  mediaTypes={mediaTypes}
                  disabled={isSubmitting}
                />
              </FormControl>
              {fieldState.error && (
                <p className="text-sm font-medium text-destructive">
                  {fieldState.error.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Téléchargez vos photos, vidéos ou documents (max {maxFiles} fichiers)
              </p>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Soumettre ma participation'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
