import { Link } from "react-router-dom";
const CardShowcase = () => {
  const cards = [
    {
      tier: "Elite",
      name: "Mariam Koné",
      borderColor: "#22c55e",
      zenikaColor: "#277732",
    },
    {
      tier: "Premium",
      name: "Moussa Ballo",
      borderColor: "#22c55e",
      zenikaColor: "#ffcf08",
    },
    {
      tier: "Essential",
      name: "Ousmane Traoré",
      borderColor: "#3b82f6",
      zenikaColor: "#b4121d",
    },
  ];

  return (
    <div className="py-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-5">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 ">
            Your ZENIKA CARD, Your Identity
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the prestige of ZENIKA cards designed for the clients of
            Elverra Global
          </p>
        </div>
        <div
          className="cards"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            className="flex justify-center"
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src="/lovable-uploads/essential-card.png"
              alt="Essential ZENIKA Card"
              className="w-full max-w-sm object-contain"
            />
          </div>

          <div
            className="flex justify-center"
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src="/lovable-uploads/premium-card.png"
              alt="Premium ZENIKA Card"
              className="w-full max-w-sm object-contain"
            />
          </div>

          <div
            className="flex justify-center"
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src="/lovable-uploads/elite-card.png"
              alt="Elite ZENIKA Card"
              className="w-full max-w-sm object-contain"
            />
          </div>
          <img
            src="/lovable-uploads/Zenika.png"
            alt="Elite ZENIKA Card"
            className="w-[310px] h-[400px] mt-6 max-w-sm object-contain"
          />
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
          <span className="text-gray-600">
            Join the community of fortunate clients and consumers
          </span>
          <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors">
            <Link to="/dashboard">Get Your Card</Link>
          </button>
        </div>
      </div>
    </div>
  );
};
export default CardShowcase;
