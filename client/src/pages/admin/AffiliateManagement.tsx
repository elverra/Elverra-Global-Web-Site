import React from 'react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import AffiliateApprovalPanel from '@/components/admin/AffiliateApprovalPanel';

const AffiliateManagement = () => {
  return (
    <Layout>
      <PremiumBanner
        title="Affiliate Management"
        description="Manage agent applications, approvals, and withdrawal requests"
        backgroundImage="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
      />
      
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AffiliateApprovalPanel />
        </div>
      </div>
    </Layout>
  );
};

export default AffiliateManagement;