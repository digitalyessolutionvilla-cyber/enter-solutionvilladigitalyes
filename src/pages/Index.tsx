import PageLayout from "@/components/layout/PageLayout";
import { useSeo } from "@/hooks/useSeo";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import StatsSection from "@/components/home/StatsSection";
import PortfolioPreview from "@/components/home/PortfolioPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogPreview from "@/components/home/BlogPreview";
import CTASection from "@/components/home/CTASection";

export default function Index() {
  useSeo("/");
  return (
    <PageLayout>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <PortfolioPreview />
      <TestimonialsSection />
      <BlogPreview />
      <CTASection />
    </PageLayout>
  );
}
