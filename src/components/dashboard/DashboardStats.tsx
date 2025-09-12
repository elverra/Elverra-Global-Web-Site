
import { CreditCard, Users, ShoppingBag, Calendar } from 'lucide-react';

interface StatsProps {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedJobs: number;
}

const DashboardStats = ({ stats }: { stats: StatsProps }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-club66-purple/10 mr-4">
            <CreditCard className="h-6 w-6 text-club66-purple" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Applications</p>
            <h4 className="text-xl font-bold text-gray-700">{stats.totalApplications}</h4>
            <p className="text-xs text-gray-500">Applications submitted</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-50 mr-4">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pending Applications</p>
            <h4 className="text-xl font-bold text-gray-700">{stats.pendingApplications}</h4>
            <p className="text-xs text-yellow-500">Awaiting review</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-50 mr-4">
            <ShoppingBag className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Interviews Scheduled</p>
            <h4 className="text-xl font-bold text-gray-700">{stats.interviewsScheduled}</h4>
            <p className="text-xs text-blue-500">Upcoming interviews</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-50 mr-4">
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Saved Jobs</p>
            <h4 className="text-xl font-bold text-gray-700">{stats.savedJobs}</h4>
            <p className="text-xs text-gray-500">Saved opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
