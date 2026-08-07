import HeroSection from "./components/HeroSection";
import StatsGrid from "./components/StatsGrid";
import DashboardGrid from "./components/DashboardGrid";
import PageContainer from "@/components/layout/PageContainer";

export default function DashboardPage() {
  return (
    <PageContainer>
      <HeroSection />
      <StatsGrid />
      <DashboardGrid />
    </PageContainer>
  );
}