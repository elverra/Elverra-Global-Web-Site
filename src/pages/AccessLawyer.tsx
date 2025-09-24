import React, { useState, useRef } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    caseType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<'form' | 'voice'>('form');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation selon le type de demande
      if (requestType === 'voice') {
        if (!audioBlob) {
          toast.error('Veuillez enregistrer un message vocal');
          setIsSubmitting(false);
          return;
        }
        if (!formData.phone.trim()) {
          toast.error('Veuillez saisir votre numéro de téléphone');
          setIsSubmitting(false);
          return;
        }
      }
      
      if (requestType === 'form') {
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.caseType.trim()) {
          toast.error('Veuillez remplir tous les champs obligatoires');
          setIsSubmitting(false);
          return;
        }
        if (!formData.message.trim()) {
          toast.error('Veuillez saisir votre message');
          setIsSubmitting(false);
          return;
        }
      }

      let uploadedAudioUrl = '';
      
      // Upload du fichier audio vers Supabase Storage
      if (requestType === 'voice' && audioBlob) {
        try {
          const fileName = `lawyer-request-${Date.now()}.wav`;
          const filePath = `audio/${fileName}`;
          
          // Upload vers le bucket 'lawyer-audio'
          const { error: uploadError } = await supabase.storage
            .from('lawyer-audio')
            .upload(filePath, audioBlob, {
              contentType: 'audio/wav',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Erreur lors de l\'upload du fichier audio');
          }

          // Obtenir l'URL publique du fichier
          const { data: urlData } = supabase.storage
            .from('lawyer-audio')
            .getPublicUrl(filePath);

          uploadedAudioUrl = urlData.publicUrl;
          console.log('Fichier audio uploadé:', uploadedAudioUrl);
          
        } catch (error) {
          console.error('Erreur upload audio:', error);
          toast.error('Erreur lors de l\'upload du fichier audio');
          setIsSubmitting(false);
          return;
        }
      }

      // Enregistrement direct dans Supabase
      const { data: lawyerRequest, error: dbError } = await supabase
        .from('lawyer_requests')
        .insert([
          {
            name: requestType === 'form' ? formData.name : null,
            email: requestType === 'form' ? formData.email : null,
            phone: formData.phone,
            case_type: requestType === 'form' ? formData.caseType : null,
            message: requestType === 'form' ? formData.message : null,
            audio_url: uploadedAudioUrl || null,
            request_type: requestType,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Erreur lors de l\'enregistrement');
      }

      // Envoi des notifications
      const emailContent = requestType === 'voice' ? 
        `🎤 NOUVELLE DEMANDE VOCALE D'ASSISTANCE JURIDIQUE\n\n📱 Téléphone: ${formData.phone}\n🎵 Fichier audio: ${uploadedAudioUrl}\n\n⚠️ DEMANDE VOCALE - Écoutez le message audio pour connaître les détails\n\nID: ${lawyerRequest.id}\nDate: ${new Date().toLocaleString('fr-FR')}` :
        `📝 NOUVELLE DEMANDE ÉCRITE D'ASSISTANCE JURIDIQUE\n\n👤 Nom: ${formData.name}\n📧 Email: ${formData.email}\n📱 Téléphone: ${formData.phone}\n⚖️ Type d'affaire: ${formData.caseType}\n\n💬 Message:\n${formData.message}\n\nID: ${lawyerRequest.id}\nDate: ${new Date().toLocaleString('fr-FR')}`;

      // Simulation d'envoi d'emails
      const emails = ['oladokunefi123@gmail.com', 'ifiboysbeat1@gmail.com'];
      const whatsappNumbers = ['+22373402073', '+22376104155'];

      console.log('📧 Emails à envoyer à:', emails);
      console.log('📧 Contenu:', emailContent);
      
      console.log('📱 WhatsApp à envoyer à:', whatsappNumbers);
      console.log('📱 Message WhatsApp:', emailContent);

      // Appel backend pour envoi WhatsApp réel (mode vocal uniquement)
      if (requestType === 'voice' && uploadedAudioUrl) {
        try {
          const resp = await fetch('http://localhost:3001/api/notifications/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId: lawyerRequest.id,
              audioUrl: uploadedAudioUrl,
              phones: whatsappNumbers,
            })
          });
          const json = await resp.json();
          if (!resp.ok) {
            console.error('WhatsApp backend error:', json);
            toast.error("L'envoi WhatsApp a échoué");
          } else {
            console.log('WhatsApp backend response:', json);
          }
        } catch (err) {
          console.error('WhatsApp backend call failed:', err);
          toast.error("Erreur lors de l'envoi WhatsApp");
        }
      }

      toast.success('Votre demande a été envoyée avec succès! Un expert juridique vous contactera bientôt.');
      
      // Reset du formulaire
      setFormData({
        name: '',
        email: '',
        phone: '',
        caseType: '',
        message: ''
      });
      setAudioBlob(null);
      setAudioUrl('');
      setRequestType('form');
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
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
        {/* Fields depending on request type */}
        {requestType === 'form' ? (
          // Form mode: all fields required
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="Your full name"
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="your.email@example.com"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  placeholder="+223 XX XX XX XX"
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="caseType">Case Type *</Label>
                <Input
                  id="caseType"
                  value={formData.caseType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, caseType: e.target.value }))
                  }
                  required
                  placeholder="e.g., Business Law, Family Law"
                  data-testid="input-case-type"
                />
              </div>
            </div>
          </>
        ) : (
          // Voice mode: only phone number
          <div className="max-w-md">
            <Label htmlFor="phone-voice">Your Phone Number *</Label>
            <Input
              id="phone-voice"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              required
              placeholder="+223 XX XX XX XX"
              className="text-lg p-4"
              data-testid="input-phone-voice"
            />
            <p className="text-sm text-gray-600 mt-2">
              We will contact you on this number after reviewing your voice
              message
            </p>
          </div>
        )}

        {/* Message Section */}
        {requestType === 'form' ? (
          <div>
            <Label htmlFor="message">Describe your legal issue *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              required
              placeholder="Please provide details about your legal matter..."
              rows={5}
              data-testid="textarea-message"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Label>Voice Recording of Your Request *</Label>

            {/* Recording Controls */}
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <Button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700"
                >
                  <Square className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}

              {isRecording && (
                <div className="flex items-center gap-2 text-red-600">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span>Recording in progress...</span>
                </div>
              )}
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="space-y-2">
                <Label>Your Recording:</Label>
                <div className="flex items-center gap-4">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  {!isPlaying ? (
                    <Button
                      type="button"
                      onClick={playAudio}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Play
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={pauseAudio}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}

                  <span className="text-sm text-gray-600">
                    Recording ready to be sent
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isSubmitting}
          data-testid="button-submit-consultation"
        >
          {isSubmitting ? 'Submitting Request...' : 'Request Consultation'}
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