import React from "react";
import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-club66-purple">
          Privacy Policy
        </h1>
        
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-gray-500">Last updated: May 23, 2025</p>
          
          <p>
            Elverra ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, or any Elverra services.
          </p>
          
          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Name, email address, phone number, and postal address</li>
            <li>Payment information</li>
            <li>Profile photo (if provided)</li>
            <li>Government-issued identification (for certain services)</li>
          </ul>
          
          <h3>Usage Information</h3>
          <ul>
            <li>Information about your interactions with our services</li>
            <li>Device information including IP address and browser type</li>
            <li>Location information when you use our mobile application</li>
          </ul>
          
          <h2>2. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To process payments and manage your account</li>
            <li>To verify your identity and prevent fraud</li>
            <li>To send you member updates and promotional materials</li>
            <li>To improve and personalize your experience</li>
            <li>To respond to your inquiries and provide customer support</li>
          </ul>
          
          <h2>3. Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li>Service providers who help us deliver our services</li>
            <li>Partner merchants (limited to verification of Clients status)</li>
            <li>Legal authorities when required by law</li>
            <li>Other third parties with your consent</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
          
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2>5. Your Rights</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Request transfer of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          
          <h2>6. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>
          
          <h2>7. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
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

export default Privacy;