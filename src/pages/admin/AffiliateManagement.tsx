import React from 'react';
import Layout from '@/components/layout/Layout';
import PremiumBanner from '@/components/layout/PremiumBanner';
import AffiliateApprovalPanel from '@/components/admin/AffiliateApprovalPanel';

const AffiliateManagement = () => {
  return (
    <Layout>
    
      
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <AffiliateApprovalPanel />
        </div>
      </div>
    </Layout>
  );
};

export default AffiliateManagement;