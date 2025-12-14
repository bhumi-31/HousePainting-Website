import Layout from "../components/layout/Layout";
import HeroSection from "../components/home/HeroSection";
import StatsSection from "../components/home/StatsSection";
import AboutSection from "../components/home/AboutSection";
import ServicesSection from "../components/home/ServicesSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import InstagramSection from "../components/home/InstagramSection";
import CTASection from "../components/home/CTASection";

const Home = () => {
  return (
    <Layout>
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <TestimonialsSection />
      <InstagramSection variant="home" />
      <CTASection />
    </Layout>
  );
};

export default Home;
