
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Building, HandHeart } from 'lucide-react';

interface UserTypeSelectorProps {
  onSelect: (userType: string) => void;
  selectedType: string;
}

const UserTypeSelector = ({ onSelect, selectedType }: UserTypeSelectorProps) => {
  const userTypes = [
    {
      type: 'member',
      icon: User,
      title: 'Regular Client',
      description: 'Access discounts, benefits, and community features',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      type: 'employee',
      icon: Briefcase,
      title: 'Job Seeker / Employee',
      description: 'Find jobs, apply to positions, and manage your career',
      color: 'bg-green-50 border-green-200'
    },
    {
      type: 'employer',
      icon: Building,
      title: 'Employer / Company',
      description: 'Post jobs, find candidates, and manage recruitment',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      type: 'partner',
      icon: HandHeart,
      title: 'Business Partner',
      description: 'Join our network, offer discounts, and grow your business',
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Your Account Type</h3>
        <p className="text-gray-600 text-sm">Choose the option that best describes you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userTypes.map((userType) => {
          const Icon = userType.icon;
          const isSelected = selectedType === userType.type;
          
          return (
            <Card 
              key={userType.type}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-purple-500 border-purple-500' 
                  : 'hover:shadow-md'
              } ${userType.color}`}
              onClick={() => onSelect(userType.type)}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2">
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                </div>
                <CardTitle className="text-lg">{userType.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <CardDescription className="text-sm">
                  {userType.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeSelector;
