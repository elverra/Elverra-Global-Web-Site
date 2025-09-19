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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus(null);
    if (!emailOrPhone) {
      toast({
        title: "Missing identifier",
        description: "Please enter your email or phone number.",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);

    try {
      const isEmail = emailOrPhone.includes('@');
      if (isEmail) {
        // Always use magic link for email, show clear status to the user
        const { error } = await sendMagicLink(emailOrPhone.trim(), '/dashboard');
        if (error) {
          toast({ title: 'Email not sent', description: error, variant: 'destructive' });
          setStatus({ type: 'error', message: error });
          setLoading(false);
          return;
        }
        toast({ title: 'Confirmation email sent', description: `We sent a login link to ${emailOrPhone.trim()}. Please check your inbox.` });
        setStatus({ type: 'info', message: `Veuillez vérifier votre email (${emailOrPhone.trim()}) et cliquer sur le lien pour vous connecter.` });
      } else {
        // Validate phone format: require country code. If user typed local 8 digits, ask them to add +223
        const rawPhone = emailOrPhone.trim().replace(/\s|-/g, '');
        if (/^\d{8}$/.test(rawPhone)) {
          const msg = `Ajoutez l'indicatif pays: +223${rawPhone} (ex: +223 ${rawPhone.slice(0,2)} ${rawPhone.slice(2,4)} ${rawPhone.slice(4,6)} ${rawPhone.slice(6)})`;
          toast({ title: 'Numéro incomplet', description: msg, variant: 'destructive' });
          setStatus({ type: 'error', message: msg });
          setLoading(false);
          return;
        }
        if (!password) {
          const msg = 'Veuillez entrer votre mot de passe pour vous connecter avec un numéro de téléphone.';
          toast({ title: 'Mot de passe requis', description: msg, variant: 'destructive' });
          setStatus({ type: 'error', message: msg });
          setLoading(false);
          return;
        }
        const { error, meta } = await signInWithPassword(emailOrPhone.trim(), password);
        if (error) {
          // Map common backend errors to user-friendly French messages
          let friendly = error;
          if (/invalid login credentials/i.test(error)) {
            friendly = 'Identifiant ou mot de passe incorrect.';
          } else if (/no account found for this phone/i.test(error)) {
            friendly = 'Aucun compte trouvé pour ce numéro. Veuillez utiliser votre email ou vérifier le numéro saisi.';
          } else if (/invalid phone format/i.test(error)) {
            friendly = 'Format du numéro invalide. Utilisez +223XXXXXXXX ou 8 chiffres (Mali).';
          }
       
       
          setStatus({ type: 'error', message: friendly });
          setLoading(false);
          return;
        }
        // Force refresh role so header/dashboard reflects correct paths immediately
        await checkUserRole(true);
        toast({ title: 'Login successful', description: 'Redirecting to your dashboard...' });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    setLoading(false);
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
