
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface MembershipTiersProps {
  selectedTier: string;
  onSelectTier: (tier: string) => void;
  compact?: boolean;
}

const MembershipTiers = ({ selectedTier, onSelectTier, compact = false }: MembershipTiersProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const tiers = [
    {
      id: 'child',
      name: 'Carte Enfant',
      price: '5,000',
      monthly: '500',
      discount: '10%',
      color: 'bg-pink-100',
      textColor: 'text-pink-900',
      isChild: true,
      features: [
        'Réductions de 10% dans les magasins de jouets',
        'Accès prioritaire aux événements familiaux',
        'Programmes éducatifs complets',
        'Assistance parentale 24/7',
        'Carte physique personnalisée incluse',
        'Activités exclusives enfants',
        'Support communautaire',
      ],
    },
    {
      id: 'essential',
      name: 'Essential',
      price: '10,000',
      monthly: '1,000',
      discount: '5%',
      color: 'bg-gray-100',
      textColor: 'text-gray-900',
      features: [
        '5% discount at Elverra businesses',
        'Digital value card',
        'Access to partner discounts',
        'Client community access',
        'Payday loans (8% flat interest)',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '10,000',
      monthly: '2,000',
      discount: '10%',
      color: 'gold-gradient',
      textColor: 'text-gray-900',
      features: [
        '10% discount at Elverra businesses',
        'Digital value card',
        'Access to partner discounts',
        'Client community access',
        'Payday loans (8% flat interest)',
        'Priority customer support',
        'Exclusive event invitations',
      ],
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '10,000',
      monthly: '5,000',
      discount: '20%',
      color: 'card-gradient',
      textColor: 'text-white',
      features: [
        '20% discount at Elverra businesses',
        'Digital value card',
        'Access to partner discounts',
        'Client community access',
        'Payday loans (5% flat interest)',
        'Priority customer support',
        'Exclusive event invitations',
        'Free business training',
        'Investment opportunities',
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (user) {
      // User is logged in, go directly to payment with plan selected
      navigate(`/client-payment?plan=${planId}`);
    } else {
      // User not logged in, redirect to register with plan info
      navigate(`/register?plan=${planId}`);
    }
  };

  // Compact version shows minimal information suitable for forms
  if (compact) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {tiers.map((tier) => (
          <div 
            key={tier.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTier === tier.id 
                ? 'ring-2 ring-purple-600 border-purple-600' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectTier(tier.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">{tier.name}</h3>
                <div className="flex items-baseline mt-1">
                  <span className="text-2xl font-bold">CFA {tier.monthly}</span>
                  <span className="text-sm text-gray-600 ml-1">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">+ CFA {tier.price} registration fee</p>
              </div>
              <div className={`${tier.color} p-2 rounded-md ${tier.textColor}`}>
                <span className="font-bold">{tier.discount}</span>
                <span className="text-sm"> discount</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <Check className="text-green-500 h-4 w-4" />
                <span className="text-sm">
                  {tier.features[0]}
                </span>
              </div>
              {/* No need for other features in compact mode */}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full version shows all details
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <div 
          key={tier.id}
          className={`border rounded-lg overflow-hidden shadow transition-all ${
            selectedTier === tier.id 
              ? 'ring-2 ring-club66-purple border-club66-purple transform scale-[1.02]' 
              : 'hover:shadow-md'
          }`}
        >
          <div className={`${tier.color} p-4 ${tier.textColor}`}>
            <h3 className="font-bold text-xl">{tier.name}</h3>
            <p>{tier.discount} discount on Elverra Global services</p>
          </div>
          <div className="p-4">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">Annual Fee</p>
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold">CFA {tier.price}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">+ CFA {tier.monthly} monthly</p>
            </div>
            
            <ul className="space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full mt-4 py-2 px-4 rounded transition-colors ${
                selectedTier === tier.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => {
                onSelectTier(tier.id);
                if (!compact) {
                  handleSelectPlan(tier.id);
                }
              }}
            >
              {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MembershipTiers;
