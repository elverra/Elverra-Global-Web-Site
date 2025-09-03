
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  data: string;
  title?: string;
  description?: string;
  size?: number;
  showDownload?: boolean;
  showShare?: boolean;
  showData?: boolean;
  className?: string;
}

const QRCodeGenerator = ({ 
  data, 
  title, 
  description, 
  size = 200, 
  showDownload = true, 
  showShare = true,
  showData = true,
  className = ""
}: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = () => {
    // Using QR Server API for generating QR codes
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&ecc=M`;
    setQrCodeUrl(qrUrl);
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download QR Code');
    }
  };

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'qr-code.png', { type: 'image/png' });
        
        await navigator.share({
          title: title || 'QR Code',
          text: description || 'Scan this QR code',
          files: [file]
        });
      } else {
        // Fallback: copy QR code URL
        await navigator.clipboard.writeText(qrCodeUrl);
        toast.success('QR Code URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share QR Code');
    }
  };

  const copyData = async () => {
    try {
      await navigator.clipboard.writeText(data);
      toast.success('Data copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy data');
    }
  };

  // If no title and buttons are hidden, return just the QR code image
  if (!title && !showDownload && !showShare && !showData) {
    return (
      <div className={className}>
        {qrCodeUrl ? (
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="w-full h-full object-contain"
            style={{ width: size, height: size }}
          />
        ) : (
          <div 
            className="bg-gray-100 flex items-center justify-center rounded"
            style={{ width: size, height: size }}
          >
            <span className="text-gray-400 text-xs">Loading...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="border rounded-lg shadow-sm"
              style={{ width: size, height: size }}
            />
          ) : (
            <div 
              className="border rounded-lg bg-gray-100 flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <span className="text-gray-400">Generating QR Code...</span>
            </div>
          )}
        </div>

        {showData && (
          <div className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded">
            {data}
          </div>
        )}

        <div className="flex justify-center gap-2 flex-wrap">
          {showDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
          
          {showShare && (
            <Button
              variant="outline"
              size="sm"
              onClick={shareQRCode}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
