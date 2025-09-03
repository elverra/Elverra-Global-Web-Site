
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CompetitionParticipationFormProps {
  competitionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CompetitionParticipationForm = ({ competitionId, onClose, onSuccess }: CompetitionParticipationFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    participant_name: '',
    participant_phone: '',
    profile_picture: null as File | null
  });

  const participateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('Please login to participate');

      let profilePictureUrl = null;

      // Upload profile picture if provided
      if (data.profile_picture) {
        const fileExt = data.profile_picture.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const mockUploadResult = { data: null, error: null }; // TODO: Replace with API call
        const { error: uploadError } = mockUploadResult;

        if (uploadError) throw uploadError;

        const mockPublicUrlResult = { data: { publicUrl: null } }; // TODO: Replace with API call
        const { data: { publicUrl } } = mockPublicUrlResult;

        profilePictureUrl = publicUrl;
      }

      const mockParticipantResult = { data: null, error: null }; // TODO: Replace with API call
      const { data: participantData, error } = mockParticipantResult;

      if (error) throw error;

      // Update competition entries count using direct SQL
      const mockUpdateResult = { data: null, error: null }; // TODO: Replace with API call
      const { data: updateData, error: updateError } = mockUpdateResult;

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success('Successfully registered for competition!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Participation error:', error);
      if (error.code === '23505') {
        toast.error('You have already participated in this competition');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participant_name || !formData.participant_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    participateMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, profile_picture: file }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Competition</DialogTitle>
          <DialogDescription>
            Fill in your details to participate in this competition
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="participant_name">Full Name *</Label>
            <Input
              id="participant_name"
              value={formData.participant_name}
              onChange={(e) => setFormData(prev => ({ ...prev, participant_name: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="participant_phone">Phone Number *</Label>
            <Input
              id="participant_phone"
              value={formData.participant_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, participant_phone: e.target.value }))}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <Label htmlFor="profile_picture">Profile Picture (Optional)</Label>
            <Input
              id="profile_picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            <p className="text-sm text-gray-500 mt-1">Maximum file size: 2MB</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={participateMutation.isPending}>
              {participateMutation.isPending ? 'Submitting...' : 'Join Competition'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitionParticipationForm;
