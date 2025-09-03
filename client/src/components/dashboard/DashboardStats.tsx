
import { CreditCard, Users, ShoppingBag, Calendar } from 'lucide-react';

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-club66-purple/10 mr-4">
            <CreditCard className="h-6 w-6 text-club66-purple" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Membership Status</p>
            <h4 className="text-xl font-bold text-gray-700">Active</h4>
            <p className="text-xs text-gray-500">Until Jan 2024</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-50 mr-4">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Referrals</p>
            <h4 className="text-xl font-bold text-gray-700">5 Members</h4>
            <p className="text-xs text-green-500">+2 this month</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-50 mr-4">
            <ShoppingBag className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Discounts Used</p>
            <h4 className="text-xl font-bold text-gray-700">12 Times</h4>
            <p className="text-xs text-gray-500">Saved: CFA 45,000</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-50 mr-4">
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Next Payment</p>
            <h4 className="text-xl font-bold text-gray-700">15 Dec 2023</h4>
            <p className="text-xs text-gray-500">CFA 2,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
