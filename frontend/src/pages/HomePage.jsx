import MainLayout from '../components/layout/MainLayout';
import BannerSearch from '../components/homepage/BannerSearch';
import StatsPanel from '../components/homepage/StatsPanel';
import RegisterBox from '../components/homepage/RegisterBox';
import PlatformSteps from '../components/homepage/PlatformSteps';
import FeaturedJobs from '../components/homepage/FeaturedJobs';
import FeaturedCompanies from '../components/homepage/FeaturedCompanies';
import Loading from '../components/common/loading/Loading';
import { useState } from 'react';

export default function HomePage() {
  const role = 'guest';
  const [statsLoading, setStatsLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const isLoading = statsLoading || jobsLoading || companiesLoading;

  


  return (
    <MainLayout role={role} hasSidebar={false}>
       {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white bg-opacity-100">
          <Loading />
        </div>
      )}
      <BannerSearch />
      <StatsPanel setIsLoading={setStatsLoading} />
      <RegisterBox />
      <PlatformSteps />
      <FeaturedJobs setIsLoading={setJobsLoading} />
      <FeaturedCompanies setIsLoading={setCompaniesLoading} />
    </MainLayout>
  );
}