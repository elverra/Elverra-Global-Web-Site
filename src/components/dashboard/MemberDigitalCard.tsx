import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeGenerator from '@/components/utilities/QRCodeGenerator';

interface MemberDigitalCardProps {
  memberName: string;
  memberID: string; // This is the card_identifier for display
  userID: string; // This is the user ID for QR code
  qrData?: string; // Optional QR code data
  expiryDate: string;
  membershipTier: 'Essential' | 'Premium' | 'Elite' | 'Child';
  profileImage?: string;
  address?: string;
  city?: string;
  serialNumber?: string;
  isPaymentComplete?: boolean;
  subscriptionStatus?: 'active' | 'expired' | 'pending';
}

type PositionStyles = {
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  transform?: string;
  marginTop?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  marginBottom?: string | number;
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right' | 'justify';
  width?: string | number;
  position?: 'absolute' | 'relative' | 'fixed' | 'sticky' | 'static';
};

type CardStyles = {
  container: PositionStyles;
  content: PositionStyles;
  name: PositionStyles;
  details: PositionStyles;
  qrCode: PositionStyles;
};


const MemberDigitalCard = ({ 
  memberName, 
  memberID, 
  userID,
  expiryDate, 
  membershipTier,
  profileImage,
  address,
  city,
  serialNumber,
  isPaymentComplete = true,
  subscriptionStatus = 'active'
}: MemberDigitalCardProps) => {
  const [showQR, setShowQR] = useState(false);
  
  // Generate serial number if not provided
  const cardSerialNumber = serialNumber || `ELV-${membershipTier.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  
  // Create QR data containing the user ID (not card_identifier)
  const qrData = userID;
  
  // Debug: Log the data being used
  console.log('MemberDigitalCard Debug:', {
    memberName,
    memberID, // This is the card_identifier for display
    userID, // This is the user ID for QR code
    qrData,
    membershipTier,
    address,
    city
  });

  // Don't show card if payment is not complete
  if (!isPaymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">Your Digital Value Card</h3>
          <p className="text-sm text-gray-500">Complete payment to access your membership card</p>
        </div>
        
        <div className="bg-gray-200 rounded-xl p-8 mb-4 text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">🔒</span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Card Locked</h3>
          <p className="text-sm text-gray-500">
            Your membership card will be available after payment completion
          </p>
          <Button onClick={() => window.location.href = '/membership-payment'} className="mt-4">
            Complete Payment
          </Button>
        </div>
        </CardContent>
      </Card>
    );
  }

  // Function to download card as image
  const handleDownload = () => {
    try {
      // Determine which image to use based on membership tier
      let imageName = '';
      switch (membershipTier) {
        case 'Essential':
          imageName = 'Carte 1.png';
          break;
        case 'Premium':
          imageName = 'Carte2.png';
          break;
        case 'Elite':
          imageName = 'Carte3.png';
          break;
        case 'Child':
          imageName = 'kiddies2.png';
          break;
        default:
          alert('No card available for this membership type.');
          return;
      }

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = `/lovable-uploads/${imageName}`;
      link.download = `${memberName.replace(/\s+/g, '_')}_${membershipTier}_card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading card:', error);
      alert('Error downloading card. Please try again or contact support.');
    }
  };

  // Mock function to share card
  const handleShare = () => {
    alert('Card sharing functionality would be implemented here.');
  };

  // Get the appropriate card image based on hip tier
  const getCardImage = () => {
    switch (membershipTier) {
      case 'Essential':
        return '/lovable-uploads/Carte 1.png';
      case 'Premium':
        return '/lovable-uploads/Carte2.png';
      case 'Elite':
        return '/lovable-uploads/Carte3.png';
      case 'Child':
        return '/lovable-uploads/kiddies2.png';
      default:
        return '';
    }
  };
  const getCardStyles = (tier: string) => {
    const baseStyles = {
      container: {
        aspectRatio: '1.6/1',
        width: '100%',
        maxWidth: '480px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const,
        color: 'white',
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
      },
      content: {
        position: 'relative' as const,
        padding: '1.25rem',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const
      }
    };
  
    switch (tier) {
      case 'Child':
        return {
          ...baseStyles,
          name: { 
            position: 'absolute' as const,
            top: '45%',
            left: '8rem',
            transform: 'translateY(-50%)'
          },
          details: { 
            position: 'absolute' as const,
            bottom: '3rem',
            left: '8rem',
            width: 'calc(100% - 3rem)'
          },
          qrCode: { 
            position: 'absolute' as const,
            bottom: '1.5rem',
            right: '1.5rem'
          }
        };
      case 'Premium':
        return {
          ...baseStyles,
          name: { 
            marginTop: '4rem',
            textAlign: 'center' as const
          },
          details: { 
            marginTop: 'auto',
            marginBottom: '2rem',
            textAlign: 'end' as const
          },
          qrCode: { 
            position: 'absolute' as const,
            bottom: '1.5rem',
            right: '1.5rem'
          }
        };
      case 'Elite':
        return {
          ...baseStyles,
          name: { 
            marginTop: '3rem',
            marginLeft: '2rem',
            marginBottom: '1rem'
          },
          details: { 
            marginLeft: '2rem',
            marginBottom: '2rem'
          },
          qrCode: { 
            position: 'absolute' as const,
            bottom: '1.5rem',
            right: '1.5rem'
          }
        };
      default: // Essential
        return {
          ...baseStyles,
          name: { 
            marginTop: '6rem',
            textAlign: 'start' as const
          },
          details: { 
            marginTop: '1rem',
            textAlign: 'center' as const,
            marginBottom: '2rem'
          },
          qrCode: { 
            position: 'absolute' as const,
            bottom: '1.5rem',
            right: '1.5rem'
          }
        };
    }
  };
  const cardImage = getCardImage();

  // Format date as DD/MM/YY
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day}/${month}/${year}`;
  };
  const cardStyles = getCardStyles(membershipTier);


  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-gray-900">Your Digital Value Card</h3>
        <p className="text-sm text-gray-500">Present this at participating merchants for discounts</p>
      </div>
      
      <div 
        id="member-card"
        className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
        style={{
          ...cardStyles.container,
          backgroundImage: `url('${cardImage}')`
        }}
      >
        <div className="relative p-5 h-full flex flex-col" style={cardStyles.content}>
          {/* Member Name and Status */}
          <div style={cardStyles.name}>
            <h2 className="text-2xl font-bold mb-1">{memberName}</h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                {membershipTier}
              </span>
            </div>
          </div>
  
          {/* Member Details */}
          <div style={cardStyles.details} className="space-y-2 text-sm">
            {city && (
              <div className="flex items-center">
                <span>{city}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="w-10 font-medium">ID:</span>
              <span className="font-mono">{memberID || 'N/A'}</span>
            </div>
            
            <div className="flex gap-4">
              <span className="font-medium">Exp:</span>
              <span>{formatDate(expiryDate)}</span>
            </div>
          </div>
          
          {/* QR Code */}
          <div style={cardStyles.qrCode} className="bg-white p-1.5 rounded">
            <QRCodeGenerator
              data={qrData}
              size={60}
              showDownload={false}
              showShare={false}
              showData={false}
            />
          </div>
        </div>
      </div>
      
     
    </div>
  );
  
};

export default MemberDigitalCard;