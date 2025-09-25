import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { User } from "lucide-react";

import { Button as ToastButton } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { sendMagicLink, signInWithPassword, checkUserRole } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

// Modifiez la fonction handleSubmit comme suit :
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setStatus(null);
  if (!emailOrPhone) {
    toast({
      title: "Champ manquant",
      description: "Veuillez entrer votre email ou numéro de téléphone.",
      variant: "destructive",
    });
    return;
  }

  if (loading) return;
  setLoading(true);

  try {
    const isEmail = emailOrPhone.includes('@');
    
    if (!password) {
      const msg = 'Veuillez entrer votre mot de passe.';
      toast({ 
        title: 'Mot de passe requis', 
        description: msg, 
        variant: 'destructive' 
      });
      setStatus({ type: 'error', message: msg });
      setLoading(false);
      return;
    }

    const { error, meta } = await signInWithPassword(
      emailOrPhone.trim(), 
      password
    );

    if (error) {
      let friendly = error;
      if (/invalid login credentials/i.test(error)) {
        friendly = 'Email/Numéro ou mot de passe incorrect.';
      } else if (/no account found/i.test(error)) {
        friendly = isEmail 
          ? 'Aucun compte trouvé avec cet email.' 
          : 'Aucun compte trouvé avec ce numéro.';
      } else if (/invalid phone format/i.test(error)) {
        friendly = 'Format du numéro invalide. Utilisez +223XXXXXXXX ou 8 chiffres (Mali).';
      }
      
      toast({ 
        title: 'Erreur de connexion', 
        description: friendly, 
        variant: 'destructive' 
      });
      setStatus({ type: 'error', message: friendly });
      setLoading(false);
      return;
    }

    // Connexion réussie
    await checkUserRole(true);
    toast({ 
      title: 'Connexion réussie', 
      description: 'Redirection en cours...' 
    });
    navigate('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    toast({
      title: 'Erreur',
      description: errorMessage,
      variant: 'destructive',
    });
    setStatus({ type: 'error', message: errorMessage });
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Log in to your account</CardTitle>
        <CardDescription>Access your Elverra client benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="credentials" className="w-full">
          

          <TabsContent value="credentials">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-phone">Email or Phone</Label>
                <Input
                  id="email-phone"
                  type="text"
                  placeholder="john@example.com or +223 XX XX XX XX"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={loading}
                data-testid="button-login"
              >
                {loading
                  ? (emailOrPhone.includes('@') ? 'Sending email...' : 'Signing in...')
                  : 'Continue'}
              </Button>
              {status && (
                <div
                  className={`mt-2 text-sm rounded-md p-3 ${
                    status.type === 'info'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : status.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {status.message}
                </div>
              )}
            </form>
          </TabsContent>

          
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col">
        
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
