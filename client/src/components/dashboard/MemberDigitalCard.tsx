import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import QRCodeGenerator from '@/components/utilities/QRCodeGenerator';

interface MemberDigitalCardProps {
  memberName: string;
  memberID: string;
  expiryDate: string;
  membershipTier: 'Essential' | 'Premium' | 'Elite' | 'Child';
  profileImage?: string;
  address?: string;
  city?: string;
  serialNumber?: string;
  isPaymentComplete?: boolean;
  subscriptionStatus?: 'active' | 'expired' | 'pending';
}

const MemberDigitalCard = ({ 
  memberName, 
  memberID, 
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
  
  // Create comprehensive QR data for the card
  const qrData = JSON.stringify({
    memberID,
    name: memberName,
    tier: membershipTier,
    expiry: expiryDate,
    serialNumber: cardSerialNumber,
    city: city || 'N/A',
    address: address || 'N/A',
    subscriptionStatus,
    isActive: subscriptionStatus === 'active',
    issueDate: new Date().toISOString().split('T')[0],
    cardType: membershipTier === 'Child' ? 'child' : 'adult'
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

  // Get card styling based on membership tier
  const getTierColors = () => {
    switch (membershipTier) {
      case 'Essential':
        return {
          background: 'bg-white',
          statusColor: 'text-gray-800',
          border: 'border-gray-200'
        };
      case 'Premium':
        return {
          background: 'bg-gradient-to-br from-blue-600 to-blue-800',
          statusColor: 'text-white',
          border: 'border-blue-600'
        };
      case 'Elite':
        return {
          background: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          statusColor: 'text-gray-900',
          border: 'border-yellow-400'
        };
      case 'Child':
        return {
          background: 'bg-gradient-to-br from-pink-400 to-purple-500',
          statusColor: 'text-white',
          border: 'border-pink-400'
        };
      default:
        return {
          background: 'bg-white',
          statusColor: 'text-gray-800',
          border: 'border-gray-200'
        };
    }
  };

  const colors = getTierColors();

  // Function to download card as image
  const handleDownload = async () => {
    try {
      const cardElement = document.getElementById('member-card');
      if (!cardElement) return;

      // Use html2canvas to capture the card
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${memberName.replace(' ', '_')}_membership_card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
      // Fallback: show alert
      alert('Download feature requires html2canvas library. Please contact support.');
    }
  };

  // Mock function to share card
  const handleShare = () => {
    alert('Card sharing functionality would be implemented here.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg text-gray-900">Your Digital Value Card</h3>
        <p className="text-sm text-gray-500">Present this at participating merchants for discounts</p>
      </div>
      
      {/* ZENIKA Card Design */}
      <div 
        id="member-card"
        className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
        style={{
          border: '3px solid #22c55e',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          aspectRatio: '1.6/1',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        {/* Background wave pattern */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 400 250" className="w-full h-full">
            <path d="M0,150 Q100,100 200,120 T400,110 L400,250 L0,250 Z" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
        
        {/* Globe and hand logo */}
        <div className="absolute top-4 right-4 w-12 h-12">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-80"></div>
            <div className="absolute top-1 right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full opacity-90"></div>
            </div>
          </div>
        </div>

        <div className="relative p-4 h-full flex flex-col">
          {/* ZENIKA Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-wider text-green-500">
              ZENIKA
            </h2>
          </div>

          {/* Client Info */}
          <div className="mt-auto text-white">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{memberName}</h3>
              <p className="text-sm opacity-90">Status: {membershipTier}</p>
              {city && (
                <p className="text-sm opacity-90">{city}</p>
              )}
              {address && (
                <p className="text-sm opacity-90">{address}</p>
              )}
              <p className="text-xs opacity-75">Serial: {cardSerialNumber}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">ID: {memberID}</p>
                <p className="text-xs opacity-75">
                  {subscriptionStatus === 'active' ? '✅ Active' : 
                   subscriptionStatus === 'expired' ? '❌ Expired' : '⏳ Pending'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">
                  {new Date(expiryDate).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                </span>
                {/* QR Code */}
                <div className="w-8 h-8 bg-white rounded border border-black flex items-center justify-center">
                  <QRCodeGenerator
                    data={qrData}
                    size={28}
                    showDownload={false}
                    showShare={false}
                    showData={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-2 mt-4">
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 text-sm"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default MemberDigitalCard;