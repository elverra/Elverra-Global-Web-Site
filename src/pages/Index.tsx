
import Layout from '@/components/layout/Layout';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import Benefits from '@/components/home/Benefits';
import MembershipPlans from '@/components/home/MembershipPlans';
import DigitalCard from '@/components/home/DigitalCard';
import CardShowcase from '@/components/home/CardShowcase';
import SocialBenefits from '@/components/home/SocialBenefits';
import AffiliateProgram from '@/components/home/AffiliateProgram';
import CTA from '@/components/home/CTA';


const Home = () => {
 
  return (
    <Layout>
      {/* Hero Slider Section */}
      <HeroSlider  />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Benefits Section */}
      <Benefits  />
      
      {/* Membership Plans Section */}
      <MembershipPlans />
      
      {/* Digital Card Section */}
      <DigitalCard />
      
      {/* Card Showcase Section */}
      <CardShowcase />
      
      {/* Social Benefits Section */}
      <SocialBenefits />
      
      {/* Affiliate Program Section */}
      <AffiliateProgram />
      
      {/* Call to Action Section */}
      <CTA />
    </Layout>
  );
};

export default Home;