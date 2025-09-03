import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumBannerProps {
  title: string;
  description: string;
  children?: ReactNode;
  backgroundImage?: string;
  showBackButton?: boolean;
  backUrl?: string;
  variant?: 'default' | 'compact';
}

const PremiumBanner = ({ 
  title, 
  description, 
  children, 
  backgroundImage, 
  showBackButton, 
  backUrl,
  variant = 'default'
}: PremiumBannerProps) => {
  const defaultBgImage = 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
  
  const heightClasses = variant === 'compact' ? 'py-12 md:py-16' : 'py-20 md:py-32';
  
  return (
    <section className={`relative ${heightClasses} bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 overflow-hidden`}>
      <div className="absolute inset-0 opacity-40">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage || defaultBgImage}')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          {showBackButton && backUrl && (
            <div className="mb-6">
              <Button asChild variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to={backUrl}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
            </div>
          )}
          <h1 className={`font-bold mb-6 leading-tight ${variant === 'compact' ? 'text-3xl md:text-4xl' : 'text-4xl md:text-6xl'}`}>
            {title}
          </h1>
          <p className={`text-gray-200 mb-8 leading-relaxed ${variant === 'compact' ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default PremiumBanner;