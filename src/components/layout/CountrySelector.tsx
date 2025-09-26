import { useState } from 'react';
import { Check, Globe, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';

interface Country {
  id: string;
  name: string;
  code: string;
  active: boolean;
  url?: string;
}

interface Language {
  id: string;
  name: string;
  nameEn: string;
  nameFr: string;
  code: string;
  active: boolean;
}

interface CountrySelectorProps {
  onClose?: () => void;
}

const CountrySelector = ({ onClose }: CountrySelectorProps) => {
  const { language, setLanguage, t } = useLanguage();

  const countries: Country[] = [
    { id: '1', name: 'Mali', code: 'ML', active: true},
   
  ];

 
  const [selectedCountry, setSelectedCountry] = useState<string>('Mali');
  const [open, setOpen] = useState(false);



  const handleCountrySelect = (country: Country) => {
    if (!country.active) {
      toast.error(t('selector.not_available_desc'));
      return;
    }
    
    // Update selected country
    setSelectedCountry(country.name);
    setOpen(false);
    
    // Handle country redirection
    if (country.url && country.name !== 'International' && window.location.hostname !== country.url) {
      const shouldRedirect = window.confirm(`You are about to be redirected to ${country.url}. Continue?`);
      if (shouldRedirect) {
        window.location.href = country.url;
      }
    }
    
    if (onClose) onClose();
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang.code as 'en' | 'fr');
    setOpen(false);
    if (onClose) onClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>{selectedCountry}</span>
          <span className="text-xs">|</span>
          <Languages className="h-3 w-3" />
          
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="max-h-80 overflow-y-auto">
      

          {/* Country Selection */}
          <div className="p-2">
            <h3 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {t('selector.country')}
            </h3>
            <div className="space-y-1">
              {countries.map((country) => (
                <div
                  key={country.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    country.active ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
                  } ${selectedCountry === country.name ? 'bg-blue-50' : ''}`}
                  onClick={() => handleCountrySelect(country)}
                >
                  <div className="flex-1">
                    <span className="text-sm">
                      {country.name}
                      {!country.active && (
                        <span className="text-xs ml-2 text-gray-400">(Coming Soon)</span>
                      )}
                    </span>
                  </div>
                  {selectedCountry === country.name && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelector;