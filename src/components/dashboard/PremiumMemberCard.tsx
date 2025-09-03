import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Share2, QrCode, User, Smartphone } from 'lucide-react';
import QRCodeGenerator from '@/components/utilities/QRCodeGenerator';

interface PremiumMemberCardProps {
  memberName: string;
  memberID: string;
  expiryDate: string;
  membershipTier: 'Essential' | 'Premium' | 'Elite';
  profileImage?: string;
  phoneNumber?: string;
  email?: string;
}

const PremiumMemberCard = ({ 
  memberName, 
  memberID, 
  expiryDate, 
  membershipTier,
  profileImage,
  phoneNumber,
  email
}: PremiumMemberCardProps) => {
  const [showQR, setShowQR] = useState(false);
  
  // Create QR data for verification
  const qrData = JSON.stringify({
    memberID,
    name: memberName,
    tier: membershipTier,
    expiry: expiryDate,
    phone: phoneNumber,
    email: email,
    verified: true
  });

  // Get card styling based on membership tier
  const getCardDesign = () => {
    switch (membershipTier) {
      case 'Essential':
        return {
          background: 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300',
          accent: 'bg-slate-400',
          textPrimary: 'text-slate-900',
          textSecondary: 'text-slate-600',
          chipColor: 'bg-slate-300'
        };
      case 'Premium':
        return {
          background: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
          accent: 'bg-blue-400',
          textPrimary: 'text-white',
          textSecondary: 'text-blue-100',
          chipColor: 'bg-blue-300'
        };
      case 'Elite':
        return {
          background: 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600',
          accent: 'bg-yellow-300',
          textPrimary: 'text-gray-900',
          textSecondary: 'text-gray-700',
          chipColor: 'bg-yellow-200'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
          accent: 'bg-blue-400',
          textPrimary: 'text-white',
          textSecondary: 'text-blue-100',
          chipColor: 'bg-blue-300'
        };
    }
  };

  const cardDesign = getCardDesign();

  const downloadCard = () => {
    // Implementation for downloading card as image
    console.log('Downloading card...');
  };

  const shareCard = () => {
    // Implementation for sharing card
    console.log('Sharing card...');
  };

  if (showQR) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="bg-white p-6">
              <div className="text-center mb-4">
                <h3 className="font-bold text-xl text-gray-900 mb-2">
                  {membershipTier} Membership
                </h3>
                <p className="text-sm text-gray-600">
                  Scan this QR code for verification and benefits
                </p>
              </div>
              
              <QRCodeGenerator
                data={qrData}
                size={250}
                className="border-0 shadow-none"
                showDownload={false}
                showShare={false}
              />
              
              <div className="mt-6 space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member ID:</span>
                    <span className="font-medium">{memberID}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valid Until:</span>
                    <span className="font-medium">{expiryDate}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowQR(false)}
                  variant="outline"
                  className="w-full"
                >
                  Show Card Front
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ZENIKA Card Design */}
      <div 
        className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl"
        style={{
          border: '3px solid #22c55e',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          aspectRatio: '1.6/1',
          width: '100%'
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
              <p className="text-sm opacity-90">Sokorodji, Bamako, Mali</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">ID: {memberID}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold">{expiryDate}</span>
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

      {/* Card Actions */}
      <div className="flex space-x-2 mt-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={downloadCard}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={shareCard}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default PremiumMemberCard;