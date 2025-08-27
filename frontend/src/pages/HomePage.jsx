import MainLayout from '../components/layout/MainLayout';
import BannerSearch from '../components/homepage/BannerSearch';
import StatsPanel from '../components/homepage/StatsPanel';
import RegisterBox from '../components/homepage/RegisterBox';
import PlatformSteps from '../components/homepage/PlatformSteps';
import FeaturedJobs from '../components/homepage/FeaturedJobs';
import FeaturedCompanies from '../components/homepage/FeaturedCompanies';

export default function HomePage() {
  const role = 'guest';

  return (
    <MainLayout role={role}>
      <BannerSearch />
      <StatsPanel />
      <RegisterBox />
      <PlatformSteps />
      <FeaturedJobs />
      <FeaturedCompanies />
    </MainLayout>
  );
}