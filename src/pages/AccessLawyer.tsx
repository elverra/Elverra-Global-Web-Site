
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Scale, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Shield, 
  FileText,
  CheckCircle,
  Star,
  Mic,
  Square,
  Play,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

const AccessLawyer = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state with default empty values
  const [formData, setFormData] = useState({
    message: '',
    email: user?.email || '',
    phone: '',
    caseType: ''
  });

  // Initialize phone number with profile value if available
  const [userPhone, setUserPhone] = useState(profile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<'form' | 'voice'>('form');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(profileData);

        // Update form with user data
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          phone: profileData?.phone || ''
        }));

        // Update phone number for WhatsApp
        if (profileData?.phone) {
          setUserPhone(profileData.phone);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Functions for voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Error accessing microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording completed');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation based on request type
      if (requestType === 'voice') {
        if (!audioBlob) {
          toast.error('Please record a voice message');
          setIsSubmitting(false);
          return;
        }
        if (!userPhone) {
          toast.error('Phone number not found. Please ensure your profile contains a valid phone number.');
          setIsSubmitting(false);
          return;
        }
      }
      
      if (requestType === 'form' && !formData.message.trim()) {
        toast.error('Please enter your message');
        setIsSubmitting(false);
        return;
      }

      let uploadedAudioUrl = '';
      
      // Upload audio file to Supabase Storage
      if (requestType === 'voice' && audioBlob) {
        try {
          const fileName = `lawyer-request-${Date.now()}.wav`;
          const filePath = `audio/${fileName}`;
          
          // Upload to 'lawyer-audio' bucket
          const { error: uploadError } = await supabase.storage
            .from('lawyer-audio')
            .upload(filePath, audioBlob, {
              contentType: 'audio/wav',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Error uploading audio file');
          }

          // Get public URL of the file
          const { data: urlData } = supabase.storage
            .from('lawyer-audio')
            .getPublicUrl(filePath);

          uploadedAudioUrl = urlData.publicUrl;
          console.log('Audio file uploaded:', uploadedAudioUrl);
          
        } catch (error) {
          console.error('Audio upload error:', error);
          toast.error('Error uploading audio file');
          setIsSubmitting(false);
          return;
        }
      }

      // Save request to Supabase
      const { data: lawyerRequest, error: dbError } = await supabase
        .from('lawyer_requests')
        .insert([
          {
            name: null, // Name field removed from form
            email: null, // Email is optional
            phone: userPhone, // Use profile phone
            case_type: requestType === 'form' ? formData.caseType : null,
            message: requestType === 'form' ? formData.message : 'Voice message',
            audio_url: uploadedAudioUrl || null,
            request_type: requestType,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Error saving your request');
        throw new Error('Error saving request');
      }

      // Send notifications
      const emailContent = requestType === 'voice' ? 
        `🎤 NEW VOICE LEGAL ASSISTANCE REQUEST\n\n📱 Phone: ${userPhone}\n🎵 Audio file: ${uploadedAudioUrl || 'Not available'}\n\n⚠️ VOICE REQUEST - Listen to the audio message for details\n\nID: ${lawyerRequest.id}\nDate: ${new Date().toLocaleString('en-US')}` :
        `📝 NEW WRITTEN LEGAL ASSISTANCE REQUEST\n\n📱 Phone: ${userPhone}\n\n💬 Message:\n${formData.message}\n\nID: ${lawyerRequest.id}\nDate: ${new Date().toLocaleString('en-US')}`;

      // Send emails
      const emails = ['oladokunefi123@gmail.com', 'ifiboysbeat1@gmail.com'];
      
      try {
        const emailPromises = emails.map(email => 
          fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              subject: `New legal assistance request #${lawyerRequest.id}`,
              text: emailContent,
              html: emailContent.replace(/\n/g, '<br/>')
            })
          })
        );
        
        await Promise.all(emailPromises);
        console.log('📧 Emails sent successfully');
        
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Continue even if email sending fails
      }
      
      // Try sending WhatsApp notifications if voice request
      if (userPhone && requestType === 'voice' && uploadedAudioUrl) {
        try {
          const whatsappNumbers = ['+22373402073', '+22376104155'];
          console.log('📱 Attempting to send WhatsApp to:', whatsappNumbers);
          
          const whatsappPromises = whatsappNumbers.map(number => 
            fetch('/api/send-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: number,
                message: `New voice legal assistance request #${lawyerRequest.id}`,
                audioUrl: uploadedAudioUrl
              })
            })
          );
          
          await Promise.all(whatsappPromises);
          console.log('📱 WhatsApp notifications sent');
          
        } catch (whatsappError) {
          console.error('WhatsApp error:', whatsappError);
          toast.warning('WhatsApp notifications could not be sent, but your request was successfully recorded.');
        }
      }

      // Reset form
      setFormData(prev => ({
        ...prev,
        message: ''
      }));
      setAudioBlob(null);
      setAudioUrl('');
      
      // Show success message
      toast.success('Your request has been sent successfully!');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const legalServices = [
    {
      title: "Business Law",
      description: "Company registration, contracts, and commercial disputes",
      icon: FileText,
      popular: true
    },
    {
      title: "Family Law",
      description: "Marriage, divorce, child custody, and inheritance matters",
      icon: Shield,
      popular: false
    },
    {
      title: "Property Law",
      description: "Real estate transactions, land disputes, and property rights",
      icon: Scale,
      popular: true
    },
    {
      title: "Employment Law",
      description: "Workplace disputes, contracts, and labor rights",
      icon: MessageCircle,
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How quickly can I connect with a lawyer?",
      answer: "Most legal consultations are scheduled within 24-48 hours. For urgent matters, same-day consultations may be available."
    },
    {
      question: "What are the consultation fees?",
      answer: "Initial consultations start from CFA 25,000. Complex cases may require different fee structures which will be discussed upfront."
    },
    {
      question: "Do you handle cases outside Mali?",
      answer: "Our network includes legal experts across West Africa. We can assist with cross-border legal matters and international business law."
    },
    {
      question: "Can I get legal advice remotely?",
      answer: "Yes, we offer video consultations and phone-based legal advice for many types of cases. Physical meetings can be arranged when necessary."
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Scale className="h-16 w-16 mx-auto mb-6 text-white/90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Access Legal Experts</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with qualified lawyers and legal professionals across West Africa
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Licensed Professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Expert Consultations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Legal Consultation Request</CardTitle>
                  <CardDescription>
                    Choose your communication method: written form or voice message
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Request type selector */}
                  <div className="mb-6">
                    <Label className="text-base font-medium">Communication Method</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        type="button"
                        variant={requestType === 'form' ? 'default' : 'outline'}
                        onClick={() => setRequestType('form')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Written Form
                      </Button>
                      <Button
                        type="button"
                        variant={requestType === 'voice' ? 'default' : 'outline'}
                        onClick={() => setRequestType('voice')}
                        className="flex items-center gap-2"
                      >
                        <Mic className="h-4 w-4" />
                        Voice Message
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Information */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={profile?.full_name || "Not provided"}
                          disabled
                          className="bg-white"
                          data-testid="input-fullname"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={formData.email || "Not provided"}
                          disabled
                          className="bg-white"
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <Label>Phone Number *</Label>
                        <Input
                          value={formData.phone || "Not provided"}
                          disabled
                          className="bg-white"
                          data-testid="input-phone"
                        />
                        {!formData.phone && (
                          <p className="text-sm text-red-500 mt-1">
                            Please add a phone number to your profile to use this feature
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form content based on request type */}
                    {requestType === 'form' ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Case Type *</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.caseType || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, caseType: e.target.value }))
                            }
                            required
                            data-testid="select-case-type"
                          >
                            <option value="">Select a case type</option>
                            <option value="family">Family Law</option>
                            <option value="criminal">Criminal Law</option>
                            <option value="corporate">Corporate Law</option>
                            <option value="immigration">Immigration</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="message">Describe your situation *</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, message: e.target.value }))
                            }
                            required
                            placeholder="Describe your situation in detail..."
                            rows={5}
                            className="min-h-[150px]"
                            data-testid="textarea-message"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">
                            Record a voice message detailing your request. Our team will listen and contact you.
                          </p>
                          <div className="flex items-center gap-4">
                            {!isRecording ? (
                              <Button
                                type="button"
                                onClick={startRecording}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                disabled={!formData.phone}
                              >
                                <Mic className="h-4 w-4" />
                                {audioUrl ? 'Re-record' : 'Start Recording'}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                onClick={stopRecording}
                                variant="destructive"
                                className="flex items-center gap-2"
                              >
                                <Square className="h-4 w-4" />
                                Stop Recording
                              </Button>
                            )}
                            {audioUrl && (
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  onClick={isPlaying ? pauseAudio : playAudio}
                                  variant="outline"
                                  size="sm"
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                  <span className="ml-2">
                                    {isPlaying ? 'Pause' : 'Listen'}
                                  </span>
                                </Button>
                                <audio
                                  ref={audioRef}
                                  src={audioUrl}
                                  onEnded={() => setIsPlaying(false)}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                          {audioUrl && (
                            <p className="text-sm text-green-600 mt-2">
                              Voice message recorded successfully
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={isSubmitting || (requestType === 'voice' && !audioUrl)}
                      data-testid="button-submit-consultation"
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+223 44 94 38 44</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">info@elverraglobalml.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Office Hours</p>
                      <p className="text-gray-600">Mon-Fri: 8AM-5PM</p>
                      <p className="text-gray-600">Emergency: 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Why Choose Our Legal Services?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Licensed and experienced lawyers</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Affordable legal consultations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Multiple language support</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-sm">Remote and in-person consultations</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Services */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Legal Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {legalServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="relative">
                    {service.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-orange-500">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center">
                      <Icon className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccessLawyer;
