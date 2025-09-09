import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import PremiumBanner from "@/components/layout/PremiumBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { Check, Star, Heart, Crown } from "lucide-react";

const MembershipSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCard, setSelectedCard] = useState<"child" | "adult" | null>(null);
  const [selectedTier, setSelectedTier] = useState<"essential" | "premium" | "elite">("essential");
  const [selectedDuration, setSelectedDuration] = useState<"1" | "3" | "6" | "12">("1");

  // Handle URL parameters for preselection
  useEffect(() => {
    const preselect = searchParams.get('preselect');
    const tier = searchParams.get('tier');
    
    if (preselect === 'child') {
      setSelectedCard('child');
    } else if (preselect === 'adult') {
      setSelectedCard('adult');
      if (tier && ['essential', 'premium', 'elite'].includes(tier)) {
        setSelectedTier(tier as "essential" | "premium" | "elite");
      }
    }
  }, [searchParams]);

  const childCard = {
    name: "Carte Enfant ELVERRA",
    description: "Carte unique pour les enfants de 6 à 17 ans",
    icon: Heart,
    color: "bg-pink-500",
    benefits: [
      "Réductions de 10% dans les magasins de jouets",
      "Accès prioritaire aux événements familiaux",
      "Programmes éducatifs complets",
      "Assistance parentale 24/7",
      "Carte physique personnalisée incluse",
      "Activités exclusives enfants",
      "Support communautaire"
    ],
    pricing: {
      registration: 5000,
      monthly: 500
    }
  };

  const adultTiers = {
    essential: {
      name: "Essential",
      description: "Parfait pour débuter",
      icon: Check,
      color: "bg-blue-500",
      discount: 5,
      benefits: [
        "5% de réduction chez nos partenaires",
        "Accès au centre d'emploi",
        "Bibliothèque en ligne gratuite",
        "Support client standard"
      ]
    },
    premium: {
      name: "Premium",
      description: "Pour les utilisateurs réguliers",
      icon: Star,
      color: "bg-purple-500",
      discount: 10,
      benefits: [
        "10% de réduction chez nos partenaires",
        "Accès prioritaire aux offres d'emploi",
        "Bibliothèque en ligne + formations",
        "Support client prioritaire",
        "Événements exclusifs"
      ]
    },
    elite: {
      name: "Elite",
      description: "Avantages maximum et accès exclusif",
      icon: Crown,
      color: "bg-gold-500",
      discount: 20,
      benefits: [
        "20% de réduction chez nos partenaires",
        "Accès VIP aux offres d'emploi",
        "Formations premium illimitées",
        "Support client dédié 24/7",
        "Événements VIP exclusifs",
        "Concierge personnel"
      ]
    }
  };

  const durationOptions = {
    "1": { label: "1 mois", discount: 0 },
    "3": { label: "3 mois", discount: 0 },
    "6": { label: "6 mois", discount: 0 },
    "12": { label: "12 mois", discount: 0 }
  };

  const getAdultPricing = () => {
    const basePrices = {
      essential: { registration: 10000, monthly: 1000 },
      premium: { registration: 10000, monthly: 2000 },
      elite: { registration: 10000, monthly: 5000 }
    };

    const base = basePrices[selectedTier];
    const duration = parseInt(selectedDuration);
    const durationDiscount = durationOptions[selectedDuration].discount;
    
    const monthlyPrice = base.monthly * (1 - durationDiscount / 100);
    const totalMonthly = monthlyPrice * duration;
    
    return {
      registration: base.registration,
      monthly: monthlyPrice,
      total: base.registration + totalMonthly,
      savings: duration > 1 ? (base.monthly * duration - totalMonthly) : 0
    };
  };

  const handleContinue = () => {
    if (selectedCard === "child") {
      navigate(`/membership/payment?type=child&duration=${selectedDuration}`);
    } else if (selectedCard === "adult") {
      navigate(`/membership-payment?tier=${selectedTier}&duration=${selectedDuration}`);
    }
  };

  const pricing = selectedCard === "adult" ? getAdultPricing() : null;

  return (
    <Layout>
      <PremiumBanner
        title="Choisissez Votre Carte ZENIKA"
        description="Sélectionnez le type de carte qui vous convient et profitez d'avantages exclusifs"
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />

      <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Card Type Selection */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center mb-8">Type de Carte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Child Card */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedCard === "child" 
                      ? "ring-4 ring-pink-500 bg-pink-50" 
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedCard("child")}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-full ${childCard.color}`}>
                        {React.createElement(childCard.icon, { className: "h-6 w-6 text-white" })}
                      </div>
                      <h3 className="text-xl font-semibold">{childCard.name}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{childCard.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">Avantages inclus:</h4>
                      {childCard.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Frais d'inscription</p>
                        <p className="text-2xl font-bold text-gray-900">{childCard.pricing.registration} CFA</p>
                        <p className="text-sm text-gray-600 mt-1">+ {childCard.pricing.monthly} CFA/mois</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Adult Card */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedCard === "adult" 
                      ? "ring-4 ring-purple-500 bg-purple-50" 
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedCard("adult")}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Carte Adulte ZENIKA</CardTitle>
                    <CardDescription>Plusieurs niveaux d'avantages disponibles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">Choisissez votre niveau :</div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {Object.entries(adultTiers).map(([key, tier]) => (
                          <Button
                            key={key}
                            variant={selectedTier === key ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTier(key as "essential" | "premium" | "elite");
                            }}
                            className="text-xs"
                          >
                            {tier.name}
                          </Button>
                        ))}
                      </div>
                      <Badge className="mb-4 bg-purple-500">
                        {adultTiers[selectedTier].discount}% de réduction
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Duration Selection for Adult Cards */}
            {selectedCard === "adult" && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-center mb-6">Durée de Paiement</h3>
                <div className="max-w-md mx-auto">
                  <Select value={selectedDuration} onValueChange={(value: "1" | "3" | "6" | "12") => setSelectedDuration(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(durationOptions).map(([value, option]) => (
                        <SelectItem key={value} value={value}>
                          {option.label}
                          {option.discount > 0 && (
                            <span className="ml-2 text-green-600">
                              (-{option.discount}%)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}


            {/* Selected Card Details */}
            {selectedCard && (
              <div className="mb-12">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {selectedCard === "child" ? childCard.name : `Carte Adulte - ${adultTiers[selectedTier].name}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCard === "child" ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold">Frais d'inscription</div>
                            <div className="text-2xl font-bold text-pink-600">
                              CFA {childCard.pricing.registration.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">
                              Mensuel ({durationOptions[selectedDuration].label})
                            </div>
                            <div className="text-2xl font-bold text-green-600">CFA {childCard.pricing.monthly.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold">Total à payer</div>
                            <div className="text-3xl font-bold text-purple-600">
                              CFA {(childCard.pricing.registration + (childCard.pricing.monthly * parseInt(selectedDuration))).toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Inscription + {selectedDuration} mois d'abonnement
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : pricing && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold">Frais d'inscription</div>
                            <div className="text-xl font-bold">
                              CFA {pricing.registration.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">
                              Mensuel ({durationOptions[selectedDuration].label})
                            </div>
                            <div className="text-xl font-bold">
                              CFA {Math.round(pricing.monthly).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold mb-2">Total à payer</div>
                            <div className="text-3xl font-bold text-purple-600">
                              CFA {Math.round(pricing.total).toLocaleString()}
                            </div>
                            {pricing.savings > 0 && (
                              <div className="text-green-600 font-medium">
                                Économie : CFA {Math.round(pricing.savings).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
                      >
                        Procéder au Paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Benefits Display */}
            {selectedCard && (
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8">Vos Avantages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(selectedCard === "child" ? childCard.benefits : adultTiers[selectedTier].benefits).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSelection;
