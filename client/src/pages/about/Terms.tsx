
import React from "react";
import Layout from "@/components/layout/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-club66-purple">
          Terms of Use
        </h1>
        
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-gray-500">Last updated: May 23, 2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Elverra website, mobile application, or any Elverra services, you agree to be bound by these Terms of Use. If you do not agree to all of these terms, you may not access or use our services.
          </p>
          
          <h2>2. Client Services</h2>
          <p>
            Elverra offers different client tiers with varying benefits as described on our website. By becoming a client, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete information during registration</li>
            <li>Pay all fees associated with your chosen client tier</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept that client services are valid for one year and subject to renewal</li>
          </ul>
          
          <h3>2.1 Client Tiers</h3>
          <p>
            Elverra offers three Clients tiers with different benefits and fees:
          </p>
          <ul>
            <li><strong>Essential:</strong> CFA 10,000/year + 1,000/month → 5% discount at Elverra owned businesses</li>
            <li><strong>Premium:</strong> CFA 10,000/year + 2,000/month → 10% discount at Elverra owned businesses</li>
            <li><strong>Elite (VIP):</strong> CFA 10,000/year + 5,000/month → 20% discount at Elverra owned businesses</li>
          </ul>
          <p>All tiers receive equal discount access with partner merchants.</p>
          
          <h3>2.2 Client Duration and Renewal</h3>
          <p>
            Your client status is valid for one year from the date of activation. Monthly subscription fees will be charged automatically on the same day each month. You will be notified before your annual renewal date, and the annual fee will be charged automatically unless you choose to cancel your client status.
          </p>
          
          <h2>3. Payment Terms</h2>
          <p>
            Client fees consist of an annual registration fee and monthly subscription fees as specified for your client tier. You authorize Elverra to charge the payment method you provide for these fees.
          </p>
          <p>
            Monthly fees will be automatically charged on the same day each month. Failure to pay monthly fees may result in suspension of client benefits until payment is made.
          </p>
          
          <h3>3.1 Payment Methods</h3>
          <p>
            Elverra Global accepts the following payment methods:
          </p>
          <ul>
            <li>Mobile Money: Orange, Moov, Wave</li>
            <li>Credit/Debit Cards via Stripe or PayPal</li>
          </ul>
          <p>You agree to keep your payment information up-to-date.</p>
          
          <h2>4. Client Card</h2>
          <p>
            Your digital client card is personal to you and may not be transferred or shared with others. Any misuse of the client card may result in termination of your client without refund.
          </p>
          <p>
            Physical cards can be requested for an additional fee and will be delivered to the address provided during registration.
          </p>
          
          <h2>5. Discounts and Benefits</h2>
          <p>
            Discounts offered through Elverra are subject to the terms set by each participating merchant. Elverra does not guarantee the availability of specific discounts and reserves the right to modify the discount program at any time.
          </p>
          
          <h2>6. Intellectual Property</h2>
          <p>
            All content on Elverra platforms, including but not limited to text, graphics, logos, and software, is the property of Elverra or its content suppliers and protected by intellectual property laws.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            Elverra shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
          </p>
          
          <h2>8. Governing Law</h2>
          <p>
            These Terms of Use shall be governed by and construed in accordance with the laws of Mali, without regard to its conflict of law provisions.
          </p>
          
          <h2>9. Changes to Terms</h2>
          <p>
            Elverra reserves the right to modify these Terms of Use at any time. We will notify members of significant changes via email or through our website.
          </p>
          
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Use, please contact us at:
          </p>
          <p>
            Email: legal@elverraglobal.com<br />
            Phone: +223 44 94 38 44<br />
            Address: Faladiè-Sema, Carrefour IJA, Rue 801, Bamako, MALI.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
