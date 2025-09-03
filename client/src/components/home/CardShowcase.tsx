import React from "react";

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
    <section className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          style={{
            display: "none",
          }}
        >
          {cards.map((card, index) => (
            <div key={index} className="flex justify-center">
              <div
                className="relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105"
                style={{
                  border: `3px solid ${card.borderColor}`,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  aspectRatio: "1.6/1",
                  width: "300px",
                }}
              >
                {/* Background wave pattern */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 400 250" className="w-full h-full">
                    <path
                      d="M0,150 Q100,100 200,120 T400,110 L400,250 L0,250 Z"
                      fill="rgba(255,255,255,0.1)"
                    />
                  </svg>
                </div>

                {/* Globe and hand logo */}
                <div className="absolute top-4 right-4 w-12 h-12">
                  <div className="relative w-full h-full">
                    {/* Hand */}
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-80"></div>
                    {/* Globe */}
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

                  {/* Member Info */}
                  <div className="mt-auto text-white">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold">{card.name}</h3>
                      <p className="text-sm opacity-90">Status: {card.tier}</p>
                      <p className="text-sm opacity-90">
                        Sokorodji, Bamako, Mali
                      </p>
                    </div>
                    {/* Client Info */}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-90">ID: ML-2025896550</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* QR Code */}
                        <div className="w-8 h-8 bg-white rounded border border-black flex items-center justify-center">
                          <div className="w-6 h-6 grid grid-cols-3 grid-rows-3 gap-0.5">
                            <div className="bg-black"></div>
                            <div className="bg-white"></div>
                            <div className="bg-black"></div>
                            <div className="bg-white"></div>
                            <div className="bg-black"></div>
                            <div className="bg-white"></div>
                            <div className="bg-black"></div>
                            <div className="bg-white"></div>
                            <div className="bg-black"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-8 py-4 shadow-lg">
            <span className="text-gray-600">
              Join the community of fortunate clients and consumers
            </span>
            <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors">
              Get Your Card
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CardShowcase;
