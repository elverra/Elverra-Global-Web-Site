import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCodeGenerator from "@/components/utilities/QRCodeGenerator";

interface MemberDigitalCardProps {
  memberName: string;
  memberID: string;
  userID: string;
  expiryDate?: string;
  membershipTier: "Essential" | "Premium" | "Elite" | "Child";
  city?: string;
  isPaymentComplete?: boolean;
}

const tierAccent: Record<MemberDigitalCardProps["membershipTier"], string> = {
  Essential: "text-red-600 border-blue-600",   // contour bleu, ZENIKA rouge
  Premium: "text-orange-500 border-green-600", // contour vert, ZENIKA orange
  Elite: "text-green-600 border-orange-500",   // contour orange, ZENIKA vert
  Child: "text-red-600 border-blue-600",       // contour bleu, ZENIKA Kiddies rouge
};

const MemberDigitalCard = ({
  memberName,
  memberID,
  userID,
  expiryDate,
  membershipTier,
  city,
  isPaymentComplete = true,
}: MemberDigitalCardProps) => {
  const qrData = userID;

  if (!isPaymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-4 sm:p-6 text-center">
          <h3 className="font-bold text-[clamp(0.9rem,2vw,1.2rem)] text-gray-900">
            Your Digital Value Card
          </h3>
          <p className="text-[clamp(0.7rem,1.5vw,0.9rem)] text-gray-500">
            Complete payment to access your membership card
          </p>
          <div className="bg-gray-200 rounded-xl p-4 sm:p-6 my-4">
            <span className="text-gray-500 text-[clamp(1.5rem,4vw,2.2rem)]">🔒</span>
            <p className="mt-2 text-gray-600 text-[clamp(0.8rem,1.5vw,1rem)]">Card Locked</p>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/membership-payment")}
            >
              Complete Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Child Card ---
  if (membershipTier === "Child") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div
          className={`relative rounded-2xl shadow-2xl bg-white border-4 ${tierAccent[membershipTier]} flex flex-col`}
          style={{ aspectRatio: "1.6/1" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-3 sm:px-4 pt-3 sm:pt-4">
            <span className={`font-bold leading-tight ${tierAccent[membershipTier]} text-[clamp(1rem,3vw,1.6rem)]`}>
              ZENIKA <span className="block text-[clamp(0.7rem,2vw,1.1rem)]">Kiddies</span>
            </span>
            <img
              src="/lovable-uploads/logo.png"
              alt="Logo Globe"
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
            />
          </div>

          {/* Icons côté gauche */}
          <div className="flex flex-col items-start space-y-2 sm:space-y-3 px-4 sm:px-6 mt-4 sm:mt-6">
            <img
              src="/lovable-uploads/image.png"
              alt="Swing"
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20"
            />
          </div>

          {/* Infos enfant */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-gray-700 text-[clamp(0.65rem,1.5vw,0.9rem)]">
            <p className="font-bold">{memberName}</p>
            <p>ID: <span className="font-mono">{memberID}</span></p>
            <p>
              Exp:{" "}
              {expiryDate && !isNaN(new Date(expiryDate).getTime())
                ? (() => {
                    const d = new Date(expiryDate);
                    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                  })()
                : "N/A"}
            </p>

            {/* QR Code */}
            <div className="mt-2 bg-white p-1.5 rounded">
              <QRCodeGenerator
                data={qrData}
                size={40}
                showDownload={false}
                showShare={false}
                showData={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Default Cards ---
  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white border-4 ${tierAccent[membershipTier]}`}
        style={{ aspectRatio: "1.6/1" }}
      >
        {/* Bande blanche */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-white rounded-b-[40%] flex justify-between items-center px-4 sm:px-6">
          <span className={`font-bold leading-tight ${tierAccent[membershipTier]} text-[clamp(1rem,3vw,1.6rem)]`}>
            ZENIKA
          </span>
          <img
            src="/lovable-uploads/logo.png"
            alt="Logo Globe"
            className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16"
          />
        </div>

        {/* Infos principales */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6">
          <h2 className="font-bold mt-10 sm:mt-12 text-[clamp(1rem,3vw,1.6rem)]">{memberName}</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-white bg-opacity-30 rounded-full font-medium text-[clamp(0.6rem,1.5vw,0.8rem)]">
              {membershipTier}
            </span>
          </div>

          {/* Infos */}
          <div className="mt-4 sm:mt-6 space-y-1 text-[clamp(0.65rem,1.5vw,0.9rem)]">
            {city && <p>{city}</p>}
            <p>ID: <span className="font-mono">{memberID}</span></p>
            <p>
              Exp:{" "}
              {expiryDate && !isNaN(new Date(expiryDate).getTime())
                ? (() => {
                    const d = new Date(expiryDate);
                    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
                  })()
                : "N/A"}
            </p>
          </div>

          {/* QR Code */}
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white p-1.5 rounded">
            <QRCodeGenerator
              data={qrData}
              size={45}
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
